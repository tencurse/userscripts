// ==UserScript==
// @name         Ao3 Only Show Primary Pairing (Auto)
// @namespace    tencurse
// @version      1.24
// @description  Hides works where specified pairing isn't the first listed
// @author       tencurse
// @match        *://archiveofourown.org/*
// @match        *://www.archiveofourown.org/*
// @grant        none
// @license      MIT
// ==/UserScript==

/* START CONFIG */
const detectPrimaryCharacter = true; // Enable auto-detection for primary characters
const relpad = 1; // At least one relationship within this many relationship tags
const charpad = 5; // At least one character within this many character tags

// MANUAL CONFIGURATION
const relationships = []; // Add relationship tags here
const characters = []; // Add character tags here
/* END CONFIG */

(async function () {
    // Add CSS styles for hidden work items
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

    // Identify tag type and add it to relevant arrays if needed
    const fandomLinkElement = document.querySelector("h2.heading a");
    const fandomLink = fandomLinkElement.href;
    const tagName = fandomLinkElement.innerText;
    const isCharacterTag = !(tagName.includes("/") || tagName.includes("&"));

    if (isCharacterTag && detectPrimaryCharacter) {
        characters.push(tagName);
    } else if (!isCharacterTag) {
        relationships.push(tagName);
    }

    // If no tags are configured and character detection is disabled, exit early
    if (!detectPrimaryCharacter && !characters.length && !relationships.length) {
        return;
    }

    // Processed link for fetching data
    const processedFandomLink = fandomLink.slice(fandomLink.indexOf("tags"));
    const fandomDataAvailable = await fetchFandomData(processedFandomLink, isCharacterTag);

    if (!fandomDataAvailable) return; // Exit if no fandom data is found

    // Filter and hide works based on configured tags
    document.querySelectorAll(".index .blurb").forEach((blurb) => {
        const tags = blurb.querySelector("ul.tags");
        const relTags = Array.from(tags.querySelectorAll(".relationships")).slice(0, relpad).map(el => el.innerText);
        const charTags = Array.from(tags.querySelectorAll(".characters")).slice(0, charpad).map(el => el.innerText);

        const relmatch = relTags.some(tag => relationships.includes(tag));
        const charmatch = detectPrimaryCharacter && charTags.some(tag => characters.includes(tag));

        if (!relmatch && !charmatch) {
            blurb.style.display = "none";
            const buttonDiv = document.createElement("div");
            buttonDiv.className = "workhide";
            buttonDiv.innerHTML = `
                <div class="left">This work does not prioritize your preferred tags.</div>
                <div class="right"><button type="button" class="showwork">Show Work</button></div>
            `;
            blurb.insertAdjacentElement("afterend", buttonDiv);
        }
    });

    // Show work functionality: removes the button after showing the work
    document.addEventListener("click", (event) => {
        if (event.target.matches(".showwork")) {
            const blurb = event.target.closest(".workhide").previousElementSibling;
            blurb.style.display = ""; // Show the work
            event.target.closest(".workhide").remove(); // Remove the button
        }
    });

    // Function to fetch fandom data and add synonyms to tags
    async function fetchFandomData(link, isCharacterTag) {
        try {
            const response = await fetch("/" + link + " .parent");
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Check for the 3rd or 4th <p> element and exit if it contains "Additional Tags Category"
            const pElements = doc.querySelectorAll("p");
            if ((pElements[2] && pElements[2].textContent.includes("Additional Tags Category")) ||
                (pElements[3] && pElements[3].textContent.includes("Additional Tags Category"))) {
                return false;
            }

            // Get synonyms from <ul> elements with specified classes
            const synonymSources = [
                ...doc.querySelectorAll("ul.tags.commas.index.group"),
                ...doc.querySelectorAll("ul.tags.tree.index")
            ];

            synonymSources.forEach((ul, index) => {
                if (index === 0 && ul.textContent.trim() === "No Fandom") {
                    return false; // Exit if no fandom
                }
                ul.querySelectorAll("li").forEach(li => {
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

            return true;
        } catch (error) {
            console.error('Error fetching fandom data:', error);
            return false;
        }
    }
})();
