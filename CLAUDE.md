# Page Fright: notes for Claude

<!-- shared-preferences:start -->
## David's preferences (shared across all of David's apps)

This section is the same in every one of David's app repos. If David states a new general preference
(not specific to this app), add it here, in this file, and commit it. David's Mac copies it to the other repos.

**Who David is.** A guitar teacher and gigging guitarist (he/him) who builds personal and teaching apps with Claude.
Comfortable with tech but not a programmer: explain in plain words, skip jargon, keep replies short and
concrete. Likes to see things working: verify before saying "done".

**How the apps are built and hosted**
- Public web apps on GitHub Pages under the **davyrockett** GitHub account (never an Artifact or a hosted
  service). Live at `https://davyrockett.github.io/<repo>/`.
- Each app: `index.html` (+ `app.js` / `styles.css` when bigger), `sw.js` service worker for offline use
  with an update banner, `manifest.webmanifest`, `icons/` drawn by `tools/make-icons.py`, a
  `Start <App>.command` for local testing on the Mac, and a README written for David.
- **Every change must bump the version** (`tools/bump.sh` where it exists, otherwise `VERSION` in `sw.js`
  and the matching app version). Without it, installed copies on phones never update.
- Settings (gear icon) always has **Appearance: Light / Dark / Auto** and **Check for updates**.
  Apps open in **Light** unless changed in Settings.
- Design follows David's First Frets app: warm off-white / dark-brown palette, orange accent,
  Big Shoulders Display headings, Atkinson Hyperlegible body text, works well on a phone.
- Data lives on the device (localStorage / IndexedDB). Apps whose data must sync between phone and Mac
  use a separate `davyrockett/<app>-data` repo (`data.json`) and an access key pasted into Settings.
  Never commit keys, tokens or anything in `private/`.
- **Publish when done:** commit, push to `main`, and confirm the live site shows the new version.
  End with a brief summary of what changed. David's Mac pulls GitHub changes into its Dropbox copy
  automatically, so pushing is all that's needed.

**Taste**
- Labels and descriptions plain and descriptive. Jokes belong in names (e.g. "Page Fright"), not taglines.
- Keep screens uncluttered: show extra controls only when they're relevant.
- Commit messages: a short, plain description of the change.
- When renaming or moving an app, keep the old address working with a redirect repo.

**New apps:** create the repo under davyrockett and turn on GitHub Pages; David's Mac downloads new
davyrockett repos into `~/Dropbox/Local/Claude Apps/` automatically. Give each new app its own CLAUDE.md
with this section (copy it from any other app) plus an "## This app" section.
<!-- shared-preferences:end -->

## This app

Guitar sight-reading generator plus an improv practice section. Live: https://davyrockett.github.io/page-fright/
(`#improv` opens the Improv section). See README.md for files and features.

- **Publish:** run `tools/bump.sh` (bumps `sw.js` VERSION and `window.APP_VERSION` in index.html), commit, push,
  then confirm the live `sw.js` shows the new version. New files the app loads must be added to `ASSETS` in `sw.js`.
- **Test locally:** `python3 -m http.server 8769` in this folder, then open http://localhost:8769/. The service
  worker caches aggressively: unregister it and clear caches before re-checking a change.
- `index.html` holds the Read section (generator, VexFlow drawing, tab, playback, Customize, Settings).
  `improv.js` holds the Improv section and shares globals from index.html (`store`, `h`, `audio`, `OUT`, `pluck`,
  `tick`, `hush`, `STRINGS`, `player`, `stop`, `describe`). Notation uses vendored VexFlow 4.2.5; CSS recolors it.
- localStorage keys start with `sr.` (from the old name, Sight Reading); keep that so settings survive.
- Old address davyrockett.github.io/sight-reading/ forwards here (repo davyrockett/sight-reading).

### Music decisions David made (keep them)
- Guitar notation is written an octave above sounding pitch; playback is at real guitar pitch. Written range
  E3 (open low E) to C7 (20th fret, high E), drawn with ledger lines (no 8va yet).
- Positions 1st/5th/9th/12th, multi-select = the combined range (not phrase-by-phrase switching). Each position
  above 1st includes the index finger's reach back one fret, both for gap notes (B on the G string's 4th fret
  in 5th position) and the lowest note (G♯ on the low E's 4th fret in 5th position).
- Keys: C G D A E F B♭ E♭ A♭ major, multi-select, one picked per exercise; starts and ends on the home note.
- Rhythms: whole/half/quarter/eighth/sixteenth + Dotted + Rests, built from beat "cells" (`CELLS`); two-beat
  cells start on beat 1 or 3; never two rests in a row.
- Double stops = 3rds and perfect 5ths; triple stops = close triads; on neighboring strings, checked by
  `playable()`; no diminished 5th.
- Tab (toggle, or T): fingering is chosen for the whole exercise (`fingering()`, a cheapest-route search over
  hand positions). Whole neck settles around **5th position** (David is getting comfortable there),
  reach-back beats an open string, avoid high frets on the thick strings.
- Improv: synthesized 12-bar blues (drums, bass, organ), any key, tempo,
  shuffle/straight, quick change. Fretboard 0–17 with minor pentatonic, blues, minor scale, major pentatonic,
  major scale, CAGED chord shapes; shapes named E/D/C/A/G, several selectable. Chord tones: blue rings on scale
  notes in the chord; chord tones outside the scale as hollow blue dots labeled by role (R/3/5/♭7); tap I/IV/V
  beside Chord tones to preview a chord. David asked to remove the 12-bar chord chart; don't bring it back.
- Backing track sound: David found it "way too cheesy". v23 made the bass a quiet, round triangle-wave tone;
  v24 (his call) kept that tone but brought back the boogie line (R-3-5-6-♭7-6-5-3 swung 8ths), and replaced
  the rhythm-guitar chops with a soft drawbar organ: a chord on 1 and a push on the "and" of 2. v25 made it
  shorter (~0.8 and ~1.25 beats), quieter, with less wobble, voicing 3-5-♭7 only and mostly fundamental +
  octave, because the 9th, upper partials and deep wobble sounded out of tune. Keep the parts understated.
- Header: "Page Fright" with a plain tagline ("Guitar Sight-Reading Generator" / "Guitar Improv Practice").
  The Read | Improv switch is a pill at the top right. In Read, the Play box comes first (matching Improv),
  then New exercise and Customize, then the score.
