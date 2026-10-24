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
  service). Live at `https://www.davyrockett.com/<repo>/` (since 2026-10-18; old
  `davyrockett.github.io` links redirect there). The website itself is the `davyrockett.github.io` repo.
- Each app: `index.html` (+ `app.js` / `styles.css` when bigger), `sw.js` service worker for offline use
  with an update banner, `manifest.webmanifest`, `icons/` drawn by `tools/make-icons.py`, a
  `Start <App>.command` for local testing on the Mac, and a README written for David.
- **`move.js`** (since 2026-10-17): every app loads `move.js` as its first script and lists it in `sw.js`
  `ASSETS`. It carries the app's settings over when the apps move from davyrockett.github.io to
  davyrockett.com (plan: `Claude Apps/move-to-davyrockett-com.md`; master copy `Claude Apps/tools/move.js`).
  Keep it; a new app gets a copy with `data-keep` set to its own localStorage key prefix.
- **`suite.js`** (since 2026-10-18): every app also loads `<script src="suite.js" defer></script>` (in `ASSETS` too).
  It shows an "All apps" button when the app was opened from David's app suite (www.davyrockett.com/apps, one Home
  Screen icon for everything; master copy `Claude Apps/tools/suite.js`). New apps get it too. If a new app syncs,
  add it to `SYNCED` in the website's `apps/launcher.js` so the suite's one access key reaches it.
- **`share.js`** (since 2026-10-19): Settings in every app has a **Share** section (the app's link, "Copy link",
  and "Share…" where the device can). Load `<script src="share.js" defer></script>` (in `ASSETS` too) and add a
  `data-share` block using the app's own classes (see `Claude Apps/tools/share.js`). First Frets has its own
  share section with a QR code instead.
- **Every change must bump the version** (`tools/bump.sh` where it exists, otherwise `VERSION` in `sw.js`
  and the matching app version). Without it, installed copies on phones never update.
- Settings (gear icon) always has **Appearance: Light / Dark / Auto** and **Check for updates**.
  Apps open in **Light** unless changed in Settings.
- Design follows David's First Frets app: warm off-white / dark-brown palette, bright orange accent (#F57C14; dark mode #FF9433; David tried his logo orange #E27039, too red) and
  davyrockett grey secondary text (#676767; dark mode #A3A3A3),
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
- Nothing should jump around: when a control doesn't apply, grey it out in place rather than hiding it, and
  reserve space for things that appear, so other controls never shift.
- **No AI voices, ever:** no text-to-speech or synthesised singing in any app. Use written instructions on
  screen, and instrument or synth sounds for audio.
- Commit messages: a short, plain description of the change.
- When renaming or moving an app, keep the old address working with a redirect repo.

**New apps:** create the repo under davyrockett and turn on GitHub Pages; David's Mac downloads new
davyrockett repos into `~/Dropbox/Local/Claude Apps/` automatically. Give each new app its own CLAUDE.md
with this section (copy it from any other app) plus an "## This app" section.
Also add every new app to David's unlinked app list, **www.davyrockett.com/apps** (`apps/index.html` in the
website repo, `Claude Apps/website`): icon, name and one-line description, in the right group.
<!-- shared-preferences:end -->

## This app

Guitar sight-reading generator plus an improv practice section. Live: https://www.davyrockett.com/page-fright/
(`#improv` opens the Improv section). See README.md for files and features.

- **Publish:** run `tools/bump.sh` (bumps `sw.js` VERSION and `window.APP_VERSION` in index.html), commit, push,
  then confirm the live `sw.js` shows the new version. New files the app loads must be added to `ASSETS` in `sw.js`.
- **Test locally:** `python3 -m http.server 8769` in this folder, then open http://localhost:8769/. The service
  worker caches aggressively: unregister it and clear caches before re-checking a change.
- `index.html` holds the Read section (generator, VexFlow drawing, tab, playback, Customize, Settings).
- Read: floating buttons (bottom right, Read only; they fade in once you scroll down past 40px, hidden at the top): Play/Stop (same as the top Play button, kept in step), "New" (new exercise, same settings, no playback; added
  2026-10-21 at David's request) and "New + Play": new exercise with the same settings, starts playing. Both New buttons:
  the page does NOT scroll (David: scrolling up and back down broke his flow). While playing, each new line is
  scrolled up to ~12% from the top (if it's below 30% or off screen) so the lines after it show (David: look ahead).
- Read controls: Play · Metronome · Subdivide (quieter 8th clicks, greyed out with the metronome off), then the tempo
  on its own full-width line: − / long slider (1 bpm steps) / + / bpm. Tempo, Metronome and Subdivide all change
  during playback (David). Below it, Metronome level and Notes level sliders (0–150%, 100 = normal; own gain
  buses, so they act instantly and only affect Read playback). Metronome: max 200%, a woodblock-style click (`rclick`)
  that skips the main compressor for its own limiter. David found the old beep too quiet on his iPad even maxed out.
- Customize (Read): Key / Rhythm / Notes / Positions are collapsible cards (`.csec` details): icon tile, title, a live
  summary of what's chosen, round chevron that turns orange when open. Every section starts closed each time
  (Notes: the Intervals buttons are HIDDEN with Single notes only. David chose hiding over greying here; leave it.)
  Customize opens (David).
- Tuner: tuning-fork button beside the gear opens a pop-up (index.html, `Tuner()`). Rebuilt Oct 2026 after David found
  the First Frets (YIN) version unreliable: McLeod Pitch Method (normalized square difference, first key maximum within
  7% of the top), mic filtered to 60–1100 Hz, gate = 1.4x the quietest recent level (not a fixed level, so quiet
  phone mics work); clarity >= .84 for a new note, >= .7 while it agrees with the note ringing (David: needed to pluck
  too hard, so made more sensitive + mic autoGainControl on), median of 7 readings + eased needle, reading held ~2 s as the string fades, Auto switches
  string only after 3 agreeing readings, one-octave jumps folded back.
  Fading notes: only readings nearly as clear as the pluck's best (within .035) move the needle; weaker ones within
  15 cents keep it alive; a jump in level (new pluck) resets that. First Frets has the same tuner: keep them in step. Tested with synthetic plucks (weak low-E
  fundamental, quiet mic, noise): ~90% of the ring shown, within 3 cents. Same needle and messages; Auto or a picked string; standard tuning. No Start button (David): opening the pop-up starts
  listening on Auto (a string picked last time is forgotten); it stops the Improv backing; closing the pop-up or
  leaving the app turns the mic off, coming back with it open turns it on again.
  Play pitch: a steady drone (softened sawtooth, David: not guitar-like, easy to tune to) on the picked string until
  turned off; switching strings glides to the new note; greyed out on Auto. Pop-ups close with an × icon.
- Section switch (Drill | Improv | Read) has depth: a recessed track with the chosen section raised (David asked when
  the palette changed). Palette: bright orange #F57C14 / dark #FF9433, grey text #676767 / #A3A3A3.
  `improv.js` holds the Improv section and shares globals from index.html (`store`, `h`, `audio`, `OUT`, `pluck`,
  `tick`, `hush`, `STRINGS`, `player`, `stop`, `describe`). Notation uses vendored VexFlow 4.2.5; CSS recolors it.
- localStorage keys start with `sr.` (from the old name, Sight Reading); keep that so settings survive.
- Old address www.davyrockett.com/sight-reading/ forwards here (repo davyrockett/sight-reading).
- Icon links carry `?v=N` (index.html and manifest). After redrawing the icons, bump N so Safari fetches the new
  files; installed Home Screen / Dock copies still keep their old icon until removed and re-added.

### Music decisions David made (keep them)
- Guitar notation is written an octave above sounding pitch; playback is at real guitar pitch. Written range
  E3 (open low E) to C7 (20th fret, high E), drawn with ledger lines (no 8va yet).
- Positions 1st/5th/9th/12th, multi-select = the combined range (not phrase-by-phrase switching). Each position
  above 1st includes the index finger's reach back one fret, both for gap notes (B on the G string's 4th fret
  in 5th position) and the lowest note (G♯ on the low E's 4th fret in 5th position).
- Keys: C G D A E F B♭ E♭ A♭ major, multi-select, one picked per exercise; starts and ends on the home note.
- Rhythms: whole/half/quarter/eighth/sixteenth + Dotted + Rests, built from beat "cells" (`CELLS`); two-beat
  cells start on beat 1 or 3; never two rests in a row.
- Double stops: intervals chosen in Customize (v71, David's request: 2nds 3rds 4ths 5ths 6ths 7ths octaves; default
  3rds and 5ths; `GEN.dints`), on neighboring strings or skipping one string (`stringSets()`). Triple stops (v72, David's
  call): no separate options; two of the chosen intervals stacked (3rds+3rds = triad, 3rds+4ths = inversion), on
  neighboring strings; a texture that can't be built (e.g. octaves only) is dropped. Checked by `playable()`; no
  tritone anywhere. The Intervals row shows only when double or triple stops are on.
- Ending (2026-10-21, David): the last note/chord comes from the key's I chord, sized to the texture (`iChord()` in
  `generate()`; with several textures chosen, one of them at random): single = the home note; double = the nearest two
  notes of the triad (in C: C–E, E–G, G–C, also C–G, E–C); triple = the nearest triad in any order (any inversion).
  Ignores the chosen intervals. The last few notes head for a step above its top note, so it ends with a step down.
- Accidentals (v71; v72 moved to Customize > Key, off by default): some single notes become chromatic approach notes a
  half step below or above the next note (`approach()`), spelled from the neighbouring letter; drawn with
  `VF.Accidental.applyAccidentals` per measure (adds naturals too).
- Tab (toggle, or T): fingering is chosen for the whole exercise (`fingering()`, a cheapest-route search over
  hand positions). Whole neck settles around **5th position** (David is getting comfortable there),
  reach-back beats an open string, avoid high frets on the thick strings.
- Improv: synthesized 12-bar blues (drums, bass, organ), any key, tempo,
  shuffle/straight, quick change. Fretboard 0–17 with minor pentatonic, blues, minor scale, major pentatonic,
  major scale, CAGED chord shapes; shapes named E/D/C/A/G, several selectable. Chord tones: blue rings on scale
  notes in the chord; chord tones outside the scale as hollow blue dots labeled by role (R/3/5/♭7); tap I/IV/V
  beside Chord tones to preview a chord. David asked to remove the 12-bar chord chart; don't bring it back.
- Improv modes (v70, David picked layout "C"): "Modes" in the scale list shows a row of mode buttons
  (Ion…Loc, `MODES`, own row so nothing jumps); shapes = 5-note box + 2 notes; colour note (Dorian ♮6, Lydian ♯4,
  Mixolydian ♭7, Phrygian ♭2, Aeolian ♭6, Locrian ♭5, Ionian 7) ringed purple; Lydian labels/spells ♯4. Track
- Major I–IV track (David): same drums/bass/organ, two-bar loop of I then IV. Organ plays 3-5-octave (no ♭7), bass
  boogie goes to the octave instead of the ♭7, chord tones are the triads, chips read A · D (no 7) with the V chip
  greyed out. Quick change is greyed out on it; Tempo and Feel work.
  select: 12-bar blues | Major I–IV | Drone (root+5th pad; root+octave for Locrian). Picking Modes switches to Drone, leaving
  switches back. Tempo/Feel/Quick change are GREYED OUT on Drone (David: hiding them made things jump); the I/IV/V chips are HIDDEN on Drone (his later call), but whenever the chips are hidden
  (drone, or Chord tones off) the row keeps the lines it has with them showing (`keepLines()`): if Chord tones + chips
  needs a new line, Chord tones sits on it even when off. RULE (David): clicking Chord tones must never make it jump
  down a line. Chord-tone rings = home chord.
  Chord tones is GREYED OUT while Modes is selected (David, for now); its on/off setting is kept for other scales.
- Improv licks (2026-10-22, David picked mockup "A" of three; B call-and-response and C same-lick-every-position not
  chosen yet). 2026-10-23 (David): added his A blues lick sheet as licks **1–50** (numbered as on the sheet, transcribed
  exactly from his photos: rhythms, H/P, bends, HB/RB, SB, slides, rakes, vibrato); Claude's 13 standard licks are 51–63
  (with name + tip, swung 8ths on Shuffle). His rules: the list is labelled "Lick N" (names got too long), grouped by fret
  area in the current key (`LICK_AREAS`), with ‹ › stepping in number order; the fretboard shows the lick's notes with
  the SAME labels as the scale (intervals or names) — NOT numbered in playing order, no connecting line; the order is
  shown by notation + tab under the fretboard (he asked for notation+tab or rhythmic tab; Claude chose notation+tab, like
  his sheet). Format in `licks.js`: 24 ticks a beat, `|` between 4/4 bars (all checked to add up), `:8t`/`:16t`/`:qt`
  triplets, `B8^10` quick bend, `B8(10)` held bend, link prefixes h p s / b r x _. Score: `drawLickScore()` (VexFlow
  notation over tab, grace notes for quick bends, StaveTie/TabTie arcs labelled H P B RB SB SL); bend arrows, vibrato and
  "rake"/"SL" labels are drawn by hand because VexFlow's Bend/Vibrato/Annotation on tab notes push the grace notes out
  of place. Blues note spelled ♯4 when bent/hammered up to or leading up, else ♭5. Playback: `pluck()` returns its
  source; legato notes change that source's playbackRate (one pick per string chain), vibrato is an LFO on it.
  Licks is greyed out for Modes and CAGED; Chord tones rings only lick notes; out-of-scale lick notes are hollow blue.
- Improv note names are spelled from the scale (C minor: B♭ and E♭, never A♯/D♯): `nameFrom()` / `scaleRoot()`.
  Minor scales in A♭ are spelled from G♯; the blues ♭5 becomes ♯4 where ♭5 would be C♭/F♭ (F blues: B).
  Chord tones are spelled from the chord's root (F7 = F A C E♭).
- Backing track sound: David found it "way too cheesy". v23 made the bass a quiet, round triangle-wave tone;
  v24 (his call) kept that tone but brought back the boogie line (R-3-5-6-♭7-6-5-3 swung 8ths), and replaced
  the rhythm-guitar chops with a soft drawbar organ: a chord on 1 and a push on the "and" of 2. v25 made it
  shorter (~0.8 and ~1.25 beats), quieter, with less wobble, voicing 3-5-♭7 only and mostly fundamental +
  octave, because the 9th, upper partials and deep wobble sounded out of tune. Keep the parts understated.
- Drill section (v40, `drill.js`): Read | Improv | Drill switch; `showView()` in improv.js handles all three and
  the first view is opened at the end of drill.js. Triads: root + quality (maj/min/dim/aug), UP TO THREE strings
  (tap toggles; a 4th is refused with a message; 1–2 strings show the chord's notes on them). David tried
  all six (v44–v45: string sets three neighbours at a time, merged chords on one staff) and went back to three
  (v46). `stringGroups()` is still in the code but only ever sees one group; notation is one chord per shape., every
  playable shape on frets 0–17 (span ≤4 frets adjacent, ≤5 spread), lines coloured by inversion (toggleable),
  tap a line to hear it, Play walks up the neck. Note names (on by default, David's call) spelled from the
  root letter (`spell()`).
  v42: notation strip under the fretboard (`drawNotation()`): each shape as a stacked whole-note chord at written
  guitar pitch, same width/scroll as the fretboard so it sits under its shape, coloured by inversion, tappable.
- Drill > Chords (`chords.js`; Triads | Chords switch inside Drill, `drillMode`). David's call (v56–v57): no voicing
  search; shapes come only from David's two chord books (photos he sent): the Jazz Guitar Chord book (v56) and a
  photo chord book with five shapes per chord (pages 2–14 of 14). v58: David asked Claude to add the major chords
  and the open "cowboy" chords: `cow(root,…)` shapes (C A G E D F, Am Em Dm) show only in their own key; major's
  movable shapes are the A-shape and E-shape barres, the D shape and the top-four-string triad. Stored in C in `CHORD_GROUPS`, jazz book first, exact repeats dropped, with the
  books' fingering (`fing`, 0 open, T thumb; not shown yet); `findVoicings()` moves each to the root (lowest
  placement that fits, board up to fret 15; open strings become fretted when moved). v59 (David's call): a moved
  shape never lands with open strings over a fretted bass (Dm 1-x-0-2-3-x); it goes up an octave instead. v60: Csus2
  x-3-0-0-3-3 and x-3-5-5-3-3 added (David's own shapes). v61: Cadd9 8-10-12-9-8-8 and
  Cm(add9) 8-10-12-8-8-8 (David's; he first called them maj9 and m9, but they have no 7th). v67: 6/9
  (x-3-2-2-3-3, 8-7-7-7-8-8, x-x-10-9-10-10; David asked, Claude chose). v68: m7(add4)
  (8-8-8-8-8-8, x-3-3-3-4-3, x-3-1-3-1-1, 8-x-8-8-6-x, x-x-10-10-11-11; David asked, Claude chose). 34 types in 5 groups: triads/sus,
  sixths/added, sevenths, extended, altered dominants. Some shapes have another tone in the bass or no root, as in
  the books; two jazz-book rootless shapes show the implied root as a dashed circle (`imp`). Add or change shapes
  only from David's sources. Display (v52): one voicing in colour (no × marks for muted strings: removed v64, David's call), the rest greyed out; tap to switch. Notation
  underneath. Note names on by default.
- Drill > Shells (v63, David's request; Claude chose the shapes, David may send book pages to replace or add):
  Triads | Chords | Shells switch. Shells reuse the Chords screen (`#chords-mode`) with `SHELL_GROUPS` instead of
  `CHORD_GROUPS` (`TYPES` points at the list in use; type pick saved as `stype` vs `ctype`). Three-note shells:
  maj7, 7, m7 (R-7-3 and R-3-7 with root on 6th, 5th, 4th strings), m7♭5 (R-♭5-♭7), °7 and 6 (R-6-3).
  v65 (David's call: the root needn't be in the bass): shells are no longer a fixed list; `shellVoicings()`
  finds every arrangement of the three notes, one per string, on string groups 6-5-4 5-4-3 4-3-2 3-2-1
  (skipped-string groups removed v66, David's call), within 4 frets, up to fret 15 (`SHELL_GROUPS` shapes now only define each type's notes).
  v69 (David asked for 9s, 11s, 13s): an "Extended shells (no root)" group: 3rd, 7th and extension, rootless
  (maj9 9 m9 m11 13 maj7♯11 7♯11 7♭9 7♯9 7♭13), found by the same generator.
  drill.js shares improv.js globals (fx, sy, W, H, NUT, FW, TOP, GAP, LAST, pcAt) — avoid reusing their names.
- Planned (2026-10-09): David will provide a MIDI file of exactly the backing track he wants. Play it with
  the app's own synths, transposed to the chosen key and at the chosen tempo (no recorded audio: he decided
  against pitch-shifting a found recording). Ask for one track per part and the key it's written in.
- Header: the logo (inline SVG copy of the icon: orange note, "!" in the text color, glow only in dark mode)
  before "Page Fright", with a joke tagline per section (David's call, v53, an exception to the plain-taglines rule): Read "Aaaahhh! Notation!",
  Improv "Guided Wanking" (guitarists call aimless soloing wanking), Drill "Go Hit the Shed".
  The Drill | Improv | Read switch (that order, David's call v55; Drill opens first for new visitors, then the last-used section) is a pill that must NEVER move between sections (header is a grid: its own
  column level with the title; on phones title → tagline → switch → settings line). In Read, the Play box comes first (matching Improv),
  then New exercise and Customize, then the score.
- Improv layout (David liked it, v29): controls row Play, Key, Quick change (right after Key, so it stays on
  the first line when the row wraps), then Tempo and Feel dropdown. One row above the fretboard, in this order: scale dropdown (no label), Note names, Chord tones + I/IV/V, then
  LAST a Shapes toggle (last so its reserved space trails the line and nothing floats) that reveals compact shape
  buttons (All A G E D C; it only shows/hides them: picks stay highlighted while hidden; their space is always reserved so turning
  Shapes on never pushes other controls to a new line), and Chord tones +
  I/IV/V. No caption under the fretboard; instructions folded into "How it works".
- Chord tones is never right-aligned (David doesn't want it alone on the right at any width): it follows the
  other buttons on the left and wraps to its own row if needed. Its I/IV/V buttons disappear when it's off
  (no empty gap); the shape buttons, last in the row, keep their space when hidden.
- Phones (≤560px): smaller buttons and tighter spacing; the Shapes button and its shape buttons always share
  one line (no blank row); Play, Key and Quick change fit on one line down to 360px wide.
