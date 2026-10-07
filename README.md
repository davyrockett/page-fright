# Sight Reading

Endless guitar sight-reading exercises. Each one is 16 measures of quarter notes in C major,
covering the whole guitar range: low E (open 6th string) up to G on the 1st string's 15th fret
(written G6, 4 ledger lines up).
Written in treble clef, which sounds an octave lower on guitar.

**Live app:** https://davyrockett.github.io/sight-reading/ It runs as an app on
iPhone and iPad Home Screens and the Mac's Dock, and works with no signal once installed.

## What's in here

| File | What it does |
|---|---|
| `index.html` | The whole app: exercise generator, notation, playback, settings |
| `vendor/vexflow-bravura.js` | [VexFlow](https://www.vexflow.com) 4.2.5, which draws the notation (MIT license, see `vendor/VEXFLOW-LICENSE`) |
| `sw.js` | The "service worker": saves the app on the device so it works offline |
| `manifest.webmanifest` | Tells the device the app's name, icon, and to open full-screen |
| `icons/` | App icons (redraw with `python3 tools/make-icons.py`) |
| `Start Sight Reading.command` | Double-click to run a local test copy on this Mac (port 8769) |

## Using it

- **New exercise** (or press N) makes a fresh 16 measures. The current one is remembered on the device.
- **Play** (or space) counts in one measure, then plays it at guitar pitch and highlights each note.
- Tap any note to hear it.
- **Customize** limits the notes to one or more positions (1st, 5th, 9th, 12th), so every note can be played
  without leaving them. 1st position is open strings to fret 4; the others are 4 frets starting at that fret.
  Choosing several combines their ranges.
- **Notes** (in Customize): single notes, double stops (3rds and perfect 5ths) and/or triple stops (close-position
  triads). Chords are always on neighboring strings and are checked to be playable in the chosen positions
  (or within a 5-fret stretch on the whole neck). The diminished 5th B–F is left out.

## Publishing a change

1. Edit the files.
2. **Run `tools/bump.sh`** to bump the version (it updates `sw.js` and the version shown in Settings). Without this, devices keep the old copy.
3. Commit and push (`git add -A && git commit -m "…" && git push`).
4. GitHub Pages updates within a minute or two. Settings → **Check for updates** forces it on a device.

## Ideas for later

Choose keys and rhythms; more chord types; more positions; 8va for notes above the 15th fret.
