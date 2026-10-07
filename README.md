# Page Fright

*How do you get a guitar player to be quiet? Put sheet music in front of them.*

Endless guitar sight-reading exercises. Each one is 16 measures in 4/4 (quarter notes in C major to start),
covering the whole guitar range: low E (open 6th string) up to C on the 1st string's 20th fret
(written C7, above the 5th ledger line).
Written in treble clef, which sounds an octave lower on guitar.

**Live app:** https://davyrockett.github.io/page-fright/ It runs as an app on
iPhone and iPad Home Screens and the Mac's Dock, and works with no signal once installed.

## What's in here

| File | What it does |
|---|---|
| `index.html` | The whole app: exercise generator, notation, playback, settings |
| `vendor/vexflow-bravura.js` | [VexFlow](https://www.vexflow.com) 4.2.5, which draws the notation (MIT license, see `vendor/VEXFLOW-LICENSE`) |
| `sw.js` | The "service worker": saves the app on the device so it works offline |
| `manifest.webmanifest` | Tells the device the app's name, icon, and to open full-screen |
| `icons/` | App icons (redraw with `python3 tools/make-icons.py`) |
| `Start Page Fright.command` | Double-click to run a local test copy on this Mac (port 8769) |

## Using it

- **New exercise** (or press N) makes a fresh 16 measures. The current one is remembered on the device.
- **Play** (or space) counts in one measure, then plays it at guitar pitch and highlights each note.
- Tap any note to hear it.
- **Tab** (button by Play, or press T) shows or hides guitar tab under the staff, any time, even while playing.
  Fingerings are worked out for the whole exercise at once (fewest, smallest hand shifts; stays in the chosen
  positions; on the whole neck it settles around 5th position and prefers fretted notes to open strings;
  avoids high frets on the thick strings). See `fingering()` in index.html.
- **Customize** limits the notes to one or more positions (1st, 5th, 9th, 12th), so every note can be played
  without leaving them. 1st position is open strings to fret 4; the others are 4 frets starting at that fret, plus the
  index finger's reach back one fret (e.g. in 5th position: B on the G string's 4th fret, and the low G♯ on
  the low E string's 4th fret).
  Choosing several combines their ranges.
- **Key** (in Customize): C, G, D, A, E, F, B♭, E♭, A♭ major. Choose several and each exercise picks one.
  Only notes in the key are used; it starts and ends on the home note.
- **Rhythm** (in Customize): any mix of whole, half, quarter, eighth and sixteenth notes, plus Dotted and Rests.
  Measures are built from common one- and two-beat patterns (two-beat ones start on beat 1 or 3), and
  eighths/sixteenths are beamed by the beat.
- **Notes** (in Customize): single notes, double stops (3rds and perfect 5ths) and/or triple stops (close-position
  triads). Chords are always on neighboring strings and are checked to be playable in the chosen positions
  (or within a 5-fret stretch on the whole neck). The diminished 5th B–F is left out.

## Publishing a change

1. Edit the files.
2. **Run `tools/bump.sh`** to bump the version (it updates `sw.js` and the version shown in Settings). Without this, devices keep the old copy.
3. Commit and push (`git add -A && git commit -m "…" && git push`).
4. GitHub Pages updates within a minute or two. Settings → **Check for updates** forces it on a device.

## Old address

The app used to be called Sight Reading, at https://davyrockett.github.io/sight-reading/. That address now
forwards here (repo `davyrockett/sight-reading`, local folder `../sight-reading-redirect`). Settings carry over
because both addresses are on the same site (localStorage keys start with `sr.`).

## Ideas for later

Minor keys; triplets, ties and syncopation; more chord types; more positions; 8va for the highest notes.
