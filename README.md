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
| `drill.js` | The Drill section: triad shapes on any three strings |
| `improv.js` | The Improv section: 12-bar blues backing track and scale shapes on the fretboard |
| `vendor/vexflow-bravura.js` | [VexFlow](https://www.vexflow.com) 4.2.5, which draws the notation (MIT license, see `vendor/VEXFLOW-LICENSE`) |
| `sw.js` | The "service worker": saves the app on the device so it works offline |
| `manifest.webmanifest` | Tells the device the app's name, icon, and to open full-screen |
| `icons/` | App icons: an orange eighth note and an exclamation mark (redraw with `python3 tools/make-icons.py`; `icon-maskable-512.png` is a smaller copy for Android's circle crop) |
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

## Improv

The **Read | Improv** switch under the header changes sections (`#improv` links straight to Improv).

- **Backing track:** 12-bar blues in any key, made live in the browser (drums, a soft boogie bass, and short organ chords
  on 1 and the "and" of 2). Tempo, shuffle or straight, and quick change (IV in bar 2). Counts in one bar, then loops.
- **Fretboard (frets 0–17):** minor pentatonic, blues scale, minor scale, major pentatonic, major scale, or the CAGED
  chord shapes for the key. Full-scale shapes are the pentatonic box plus the two missing notes (4 & 7 major; 2 & ♭6 minor).
  Show all shapes or pick one or more (named E, D, C, A, G for the chord shape each sits around). Dots show intervals or note
  names; roots are orange. **Chord tones** rings the notes of the chord being played while the track runs, and shows
  chord tones the scale lacks (e.g. the IV chord's major 3rd over minor pentatonic) as hollow blue dots labeled R/3/5/♭7.
  Tap I/IV/V beside Chord tones to preview a chord's tones any time; the chord being played is outlined.

## Drill

The third section of the **Read | Improv | Drill** switch (`#drill` links straight to it). It starts with **triads**:
pick a root and quality (major, minor, diminished, augmented) and up to three strings (with one or two it shows where the chord's notes fall on them). The fretboard shows every playable shape of that triad on those strings, frets 0–17, joined by a line
coloured by inversion (blue root position, green 1st, purple 2nd; each can be turned off). Note names are spelled
from the root (C minor = C–E♭–G). Under the fretboard, each shape is also written as a stacked whole-note chord (guitar pitch, spelled from the root,
coloured by inversion), lined up under its shape. Tap a shape's line or its chord to hear it; **Play** strums every
shape up the neck.

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
