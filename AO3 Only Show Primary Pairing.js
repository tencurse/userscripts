// ==UserScript==
// @name         Ao3 Only Show Primary Pairing (Auto)
// @namespace    tencurse
// @version      1.19
// @description  Hides works where specified pairing isn't the first listed.
// @author       tencurse
// @match        *://archiveofourown.org/*
// @match        *://www.archiveofourown.org/*
// @grant        none
// @license      MIT
// ==/UserScript==

/* START CONFIG */
const detectPrimaryCharacter = false; // Enable auto-detection for primary characters
const relpad = 1; // At least one relationship within this many relationship tags
const charpad = 5; // At least one character within this many character tags

// MANUAL CONFIGURATION
const relationships = []; // Add relationship tags here
const characters = []; // Add character tags here
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
    const isCharacterTag = !(tagName.includes("/") || tagName.includes("&"));

    if (isCharacterTag && detectPrimaryCharacter) {
        characters.push(tagName);
    } else {
        relationships.push(tagName);
    }

    if (!detectPrimaryCharacter && !characters.length && !relationships.length) {
        return; // Terminate if no relevant tags are provided
    }

    const processedFandomLink = fandomLink.slice(fandomLink.indexOf("tags"));

    // Fetch the fandom page and check for synonyms
    const fandomDataAvailable = await fetchFandomData(processedFandomLink, isCharacterTag);
    if (!fandomDataAvailable) return; // Early exit if no fandom

    // Directly work with the existing blurbs in the DOM
    const blurbs = document.querySelectorAll(".index .blurb");
    blurbs.forEach((blurb) => {
        const tags = blurb.querySelector("ul.tags");
        const relTags = Array.from(tags.querySelectorAll(".relationships")).slice(0, relpad);
        const charTags = Array.from(tags.querySelectorAll(".characters")).slice(0, charpad);

        const temprel = relTags.map(el => el.innerText);
        const tempchar = charTags.map(el => el.innerText);

        const relmatch = temprel.filter(tag => relationships.includes(tag));
        const charmatch = tempchar.filter(tag => detectPrimaryCharacter ? characters.includes(tag) : false);

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

    // Function to fetch fandom data and check for synonyms
    async function fetchFandomData(link, isCharacterTag) {
        try {
            const response = await fetch("/" + link + " .parent");
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Attempt to find the specified <ul> element with all classes
            let ulElements = doc.querySelectorAll("ul.tags.commas.index.group");
            if (!ulElements[0] || ulElements[0].textContent.trim() === "No Fandom") {
                return false; // Early exit if no fandom
            }

            // Check for synonyms in the second <ul> if present
            if (ulElements[1]) {
                ulElements[1].querySelectorAll("li").forEach(li => {
                    const synonym = li.textContent.trim();
                    if (synonym) {
                        if (isCharacterTag && detectPrimaryCharacter) {
                            characters.push(synonym);
                        } else if (!isCharacterTag) {
                            relationships.push(synonym);
                        }
                    }
                });
            }

            // Check for additional synonyms in any nested "ul.tags.tree.index" elements
            const treeElements = doc.querySelectorAll("ul.tags.tree.index");
            treeElements.forEach((treeUl) => {
                treeUl.querySelectorAll("li").forEach((li) => {
                    const synonym = li.textContent.trim();
                    if (synonym) {
                        if (isCharacterTag && detectPrimaryCharacter) {
                            characters.push(synonym);
                        } else if (!isCharacterTag) {
                            relationships.push(synonym);
                        }
                    }
                });
            });

            return true; // Fandom data and synonyms processed successfully
        } catch (error) {
            console.error('Error fetching fandom data:', error);
            return false; // Indicate failure
        }
    }
})();
