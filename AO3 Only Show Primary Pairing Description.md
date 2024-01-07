## Overview

As per the title, this script will show works that have the primary ship in the first tag. The difference between this and Neeve's script is that it automatically detects the primary pairing, little to no configuration needed. (See details below on the specifics.)

## How it works

Navigate to a ship tag on AO3, for example: [Astarion/Wyll (Baldur's Gate)](<https://archiveofourown.org/tags/Astarion*s*Wyll%20(Baldur's%20Gate)/works>). The script will automatically detect the primary ship as "Astarion/Wyll" and will hide all other works where the ship tag is not the first listed.

If you want to change it so it shows works where the ship is in the the first three, change the `relpad` variable in the code to `3`.

This script will *not* work if the current page is not a ship tag, ie, a fandom tag: *Baldur's Gate (Video Games)*, or a character tag: *Wyll (Baldur's Gate)*, or any other tag that is not a ship tag. The script *will* work on both "/" and "&" type of relationship tag.

## Credits

See Neeve's original script [here](https://greasyfork.org/en/scripts/377386-ao3-only-show-primary-pairing).
