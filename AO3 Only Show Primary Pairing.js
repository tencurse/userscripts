// ==UserScript==
// @name         Ao3 Only Show Primary Pairing (Auto)
// @namespace    tencurse
// @version      1.13
// @description  Hides works where specified pairing isn't the first listed.
// @author       tencurse
// @match        *://archiveofourown.org/*
// @match        *://www.archiveofourown.org/*
// @grant        none
// @license      MIT
// ==/UserScript==

/* START CONFIG */
const detectPrimaryCharacter = false; // enable auto-detection for primary characters
const relpad = 1; // at least one relationship within this many relationship tags
const charpad = 5; // at least one character within this many character tags

// MANUAL CONFIGURATION
const relationships = []; // add relationship tags here
const characters = []; // add character tags here
/* END CONFIG */

(async function () {
    const style = document.createElement("style");
    style.textContent = `
        .workhide {
            border: 1px solid rgb(221, 221, 221);
            margin: 0.643em 0em;
            padding: 0.429em 0.75em;
            height: 29px;
        }
        .workhide .left {
            float: left;
            padding-top: 5px;
        }
        .workhide .right {
            float: right;
        }
    `;
    document.head.appendChild(style);

    const fandomLinkElement = document.querySelector("h2.heading a");
    const fandomLink = fandomLinkElement.href;
    const tagName = fandomLinkElement.innerText;

    // Determine if the tag is a relationship tag or character tag
    if (tagName.includes("/") || tagName.includes("&")) {
        relationships.push(tagName);
    } else if (detectPrimaryCharacter) {
        const fandomName = document.querySelector("div.header.module > h5.fandoms > a.tag").innerText;
        if (tagName !== fandomName) {
            characters.push(tagName);
        }
    }

    if (!detectPrimaryCharacter && !characters.length && !relationships.length) {
        return; // Terminate if no relevant tags are provided
    }

    const processedFandomLink = fandomLink?.slice(fandomLink.indexOf("tags"));

    // Fetch the fandom page
    const fandomData = await fetchFandomData(processedFandomLink);
    if (!fandomData) return; // Early exit if no fandom

    // Function to fetch fandom data
    async function fetchFandomData(link) {
        try {
            const response = await fetch("/" + link + " .parent");
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const ul = doc.querySelector("ul");

            // Check if there is a fandom
            return ul && ul.textContent.trim() !== "No Fandom";
        } catch (error) {
            console.error('Error fetching fandom data:', error);
            return false; // Indicate failure
        }
    }

    // Directly work with the existing blurbs in the DOM
    const blurbs = document.querySelectorAll(".index .blurb");
    blurbs.forEach((blurb) => {
        const tags = blurb.querySelector("ul.tags");
        const relTags = Array.from(tags.querySelectorAll(".relationships")).slice(0, relpad);
        const charTags = Array.from(tags.querySelectorAll(".characters")).slice(0, charpad);

        const temprel = relTags.map(el => el.innerText);
        const tempchar = charTags.map(el => el.innerText);

        const relmatch = temprel.filter(tag => relationships.includes(tag));
        const charmatch = tempchar.filter(tag => characters.includes(tag));

        if (!relmatch.length && !charmatch.length) {
            blurb.style.display = "none"; // Hide the work
            const buttonDiv = document.createElement("div");
            buttonDiv.className = "workhide";
            buttonDiv.innerHTML = `
                <div class="left">This work does not prioritize your preferred tags.</div>
                <div class="right"><button type="button" class="showwork">Show Work</button></div>
            `;
            blurb.insertAdjacentElement("afterend", buttonDiv);
        }
    });

    // Show work functionality
    document.addEventListener("click", function (event) {
        if (event.target.matches(".showwork")) {
            const blurb = event.target.closest(".workhide").previousElementSibling;
            blurb.style.display = ""; // Show the work
            event.target.closest(".workhide").remove();
        }
    });
})();
