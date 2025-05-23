## Overview

As per the title, this script will show works that have the primary ship in the first tag. The difference between this and Neeve's script is that it automatically detects the primary pairing, little to no configuration needed. (See details below on the specifics.)

**New in v1.2:** The script now works with tag synonyms as well as subtags! (Looking at you, Dragon Age ship subtags...) Primary character tag detection is also enabled by default.

## How it works

### Primary pairing

Navigate to a ship tag on AO3, for example: [Astarion/Wyll (Baldur's Gate)](<https://archiveofourown.org/tags/Astarion*s*Wyll%20(Baldur's%20Gate)/works>). The script will automatically detect the primary ship as "Astarion/Wyll" and will hide all other works where the ship tag is not the first listed.

If you want to change it so it shows works where the ship is in the first three, change the `relpad` variable in the code to `3`.

The autodetection feature will *not* work if the current page is not a ship tag, ie, a fandom tag: *Baldur's Gate (Video Games)*, or a character tag: *Wyll (Baldur's Gate)*, or any other tag that is not a ship tag. The script *will* work on both "/" and "&" types of relationship tag.

To work with Neeve's original script behaviour of manually adding tags, see [Advanced configuration](#advanced-configuration) section below.

### Primary characters

The script will only display works that includes the current character tag in the first five tags. To change this behaviour, modify the value of the variable `charpad`.

To disable this feature, change the value of  the variable `detectPrimaryCharacter` from `true` to `false`.

To work with Neeve's original script behaviour of manually adding tags, see [Advanced configuration](#advanced-configuration) section below.

## Advanced configuration

To make the primary pairing feature work on a non-ship tag page, add the ship names in the `relationships` variable array, separated by commas, like so:

```js
var relationships = ["Himeko/Kafka (Honkai: Star Rail)", "Lucina/Serena | Severa"];
```

To make the primary character feature work on a non-chracter tag page, add the ship names in the `characters` variable array, separated by commas, like so:

```js
var characters = ["Wyll (Baldur's Gate)", "Tartaglia | Childe (Genshin Impact)"];
```

Both manual configurations will work in tandem with auto-detection features (if enabled). Primary character autodetection does not need to be enabled to use manual configuration for characters.

**Make sure to have a back up of these lines of code on your local files, as the entire script will be overwritten if you update it.**

## Credits

See Neeve's original script [here](https://greasyfork.org/en/scripts/377386-ao3-only-show-primary-pairing).

## To do

- [x] Rewrite code to use vanilla JS, no jQuery
- [x] Edit primary ship to recognize ones that don't include the fandom name
- [x] Edit primary characters to recognize ones that don't include the fandom name
- [x] Change button to toggle functionality
- [x] Make button mobile friendly
- [ ] Use local storage + add UI in AO3 to remove the need for manual code editing
