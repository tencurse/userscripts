// ==UserScript==
// @name         Ao3 Only Show Primary Pairing (Auto)
// @namespace    tencurse
// @version      1.12
// @description  Hides works where specified pairing isn't the first listed.
// @author       tencurse
// @match        *://archiveofourown.org/*
// @match        *://www.archiveofourown.org/*
// @grant        none
// @license      MIT
// ==/UserScript==

(async function () {
    'use strict';

    // Configuration variables
    const detectPrimaryCharacter = false;
    const relpad = 1; // Minimum relationships to check
    const charpad = 5; // Minimum characters to check
    const relationships = []; // Relationship tags to check
    const characters = []; // Character tags to check

    const fandomLink = document.querySelector("h2.heading a")?.href;
    const tagName = document.querySelector("h2.heading a")?.innerText;

    // Check if the tag is a relationship tag
    if (tagName.includes("/") || tagName.includes("&")) {
        relationships.push(tagName);
    } else if (detectPrimaryCharacter) {
        const fandomName = document.querySelector("div.header.module > h5.fandoms > a.tag")?.innerText;
        if (tagName !== fandomName) {
            characters.push(tagName);
        }
    }

    // Early exit if no relevant tags are provided
    if (!relationships.length && !characters.length) {
        return;
    }

    const processedFandomLink = fandomLink?.slice(fandomLink.indexOf("tags"));

    // Fetch the fandom page
    const fandomData = await fetchFandomData(processedFandomLink);
    if (!fandomData) return; // Early exit if no fandom

    // Now perform the DOM manipulation
    processTags(relationships, characters);

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

    // Function to manipulate the DOM based on fetched fandom data
    function processTags(relationships, characters) {
        const blurbs = document.querySelectorAll(".index .blurb");
        blurbs.forEach((work) => {
            const tags = work.querySelector("ul.tags");
            const relTags = tags.querySelectorAll(".relationships li").length > relpad;
            const charTags = tags.querySelectorAll(".characters li").length > charpad;

            const relMatch = Array.from(tags.querySelectorAll(".relationships li")).some(li => relationships.includes(li.innerText));
            const charMatch = Array.from(tags.querySelectorAll(".characters li")).some(li => characters.includes(li.innerText));

            if (!relMatch && !charMatch) {
                work.style.display = "none";
                const button = document.createElement("div");
                button.setAttribute("class", "workhide");
                button.innerHTML =
                    '<div class="left">This work does not prioritize your preferred tags.</div><div class="right"><button type="button" class="showwork">Show Work</button></div>';
                work.after(button);
            }
        });

        // Show work button functionality
        document.addEventListener('click', function (event) {
            if (event.target.classList.contains('showwork')) {
                const blurb = event.target.closest(".workhide").previousElementSibling;
                blurb.style.display = ''; // Show the work
                event.target.closest(".workhide").remove(); // Remove the button
            }
        });
    }
})();
