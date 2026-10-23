/* Improv licks: standard blues licks, all written in A (the box at the 5th fret). The app moves each one to the
   key picked, as close to where it's written as fits on frets 0–17.

   How a lick is written: notes in playing order, separated by spaces. Each note is a string and a fret:
   E A D G B e (low E to high E), e.g. B8 = B string, 8th fret.
     *2      how long it lasts in 8th notes (no * = one 8th). 8 eighths = one bar. Swung on Shuffle.
     b       bend up a whole step (b1 = a half step), e.g. B8b*2
     /G7     slide into it from two frets below
     hG6     hammer on (not picked)
     e5+B8   two notes at once (a double stop)
   job: where it fits in the 12-bar (i, iv, turn, end). scales: which scale lists it shows with
   (minor = minor pentatonic, blues scale, minor scale; major = major pentatonic, major scale). */
const LICK_JOBS={i:'Over the I chord',iv:'Over the IV chord',turn:'Turnarounds (bars 11–12)',end:'Endings'};
const LICKS=[
  {id:'bend-root',job:'i',scales:['minor'],name:'Bend to the root',notes:'B8b*2 e5 B8 B5 G7 G5 D7*5',
    tip:'Bend the ♭7 up a whole step to the root, then walk down the box.'},
  {id:'blues-run',job:'i',scales:['minor'],name:'Blues scale run',notes:'e5 B8 B5 G8 G7 G5 D7*4',
    tip:'Down the scale through the blues note (♭5) to the root.'},
  {id:'bb-box',job:'i',scales:['minor'],name:'B.B. box',notes:'e10b1*2 e8 B10*2 B8 B10*4',
    tip:'B.B. King\'s spot above the box: a half-step bend on the 4, then back to the root.'},
  {id:'iv-third',job:'iv',scales:['minor'],name:'Land on the 3rd',notes:'G5 G7 B7*3 B5 G7*4',
    tip:'The IV chord\'s 3rd isn\'t in the scale (hollow dot), but it\'s the note that makes the change.'},
  {id:'iv-flat7',job:'iv',scales:['minor'],name:'Lean on the ♭7',notes:'B5 B8 e5 e8*3 B8 G7*4',
    tip:'The scale\'s ♭3 is the IV chord\'s ♭7: lean on it, then land on the IV\'s root.'},
  {id:'chromatic-turn',job:'turn',scales:['minor','major'],name:'Chromatic turnaround',notes:'e5+B8*2 e5+B7*2 e5+B6*2 e5+B5*2 D7*4 A7*4',
    tip:'Keep the root on top while the B string walks down, then land on the V.'},
  {id:'walk-up',job:'turn',scales:['minor','major'],name:'Walk up to the V',notes:'E5*2 A4*2 A5*2 A6*2 A7*8',
    tip:'A bass-string walk from the root up to the V chord\'s root.'},
  {id:'minor-major',job:'end',scales:['minor'],name:'Minor to major 3rd',notes:'e8 e5 B5 G7 G5 hG6 D7*6',
    tip:'Hammer from the ♭3 to the major 3rd, then land on the root.'},
  {id:'run-down',job:'end',scales:['minor'],name:'Run down to the root',notes:'e8 e5 B8 B5 G7 G5 D7 D5 A7 A5 E8 E5*4',
    tip:'The whole box, top to bottom, ending on the low root.'},
  {id:'slide-third',job:'i',scales:['major'],name:'Slide to the 3rd',notes:'/G6*2 B5 B7 e5*4',
    tip:'Slide up into the 3rd, then climb to the root.'},
  {id:'bend-third',job:'i',scales:['major'],name:'Bend to the 3rd',notes:'G4b*2 B5 G6 G4 D7*3',
    tip:'Bend the 2 up to the 3rd: the sweet major sound.'},
  {id:'iv-third-maj',job:'iv',scales:['major'],name:'Aim for the IV\'s 3rd',notes:'e5 B7 B5 G6 G4*2 D4*3',
    tip:'The scale\'s 6 is the IV chord\'s 3rd: aim for it as the chord changes.'},
  {id:'major-run',job:'end',scales:['major'],name:'Major run down',notes:'e5 B7 B5 G6 G4 D7 D4 A7 A4 E5*4',
    tip:'Down the major pentatonic box to the low root.'},
];
