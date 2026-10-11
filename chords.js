/* Drill > Chords: pick a root and a chord type; the app shows the book's shapes for it, moved to that root,
   on the fretboard and in notation. Loaded last: it shares the fretboard helpers from improv.js (NUT, FW, TOP, GAP,
   DOT, W, H, fx, sy, LAST, pcAt) and drill.js (ROOT_SPELL, LETTER_PC, LETTERS_UP, STRING_NAMES), and opens the
   first view at the end. */

/* ---------- chord types ----------
   Each tone: semitones above the root, which scale degree it is (for spelling), and its label. */
const T={R:[0,1,'R'],M3:[4,3,'3'],m3:[3,3,'♭3'],P5:[7,5,'5'],d5:[6,5,'♭5'],A5:[8,5,'♯5'],M2:[2,2,'2'],P4:[5,4,'4'],
  m7:[10,7,'♭7'],M7:[11,7,'7'],d7:[9,7,'♭♭7'],M6:[9,6,'6'],M9:[2,2,'9'],b9:[1,2,'♭9'],s9:[3,2,'♯9'],
  P11:[5,4,'11'],s11:[6,4,'♯11'],M13:[9,6,'13'],b13:[8,6,'♭13']};
/* The shapes, only from David's two chord books (photos he sent): the Jazz Guitar Chord book first (v56), then
   the photo chord book's five shapes per chord (v57), exact repeats left out. Written for C, low E string first
   ('x' = not played, 0 = open), with the book's fingering (T = thumb). Each one moves up or down the neck to any
   root. Some have another note in the bass, or no root at all, as in the books. `imp`: a rootless shape whose root
   the book shows as implied (string, fret). */
const sh=(frets,fing,imp)=>({frets:frets.split('-').map(f=>f==='x'?'x':+f),fing,imp});
// An open "cowboy" chord: written at its real frets, shown only for its own root (it doesn't move).
const cow=(root,frets,fing)=>({...sh(frets,fing),root});
const CHORD_GROUPS=[
  ['Triads and sus',[
    // Major (v58, David asked Claude to choose these): the open chords, then the standard movable shapes
    // (A-shape and E-shape barres, D-shape, and the triad on the top four strings).
    ['maj','','Major',[T.R,T.M3,T.P5],[cow(0,'x-3-2-0-1-0','x32010'),cow(9,'x-0-2-2-2-0','x01230'),cow(7,'3-2-0-0-0-3','210003'),
      cow(7,'3-2-0-0-3-3','210034'),cow(4,'0-2-2-1-0-0','023100'),cow(2,'x-x-0-2-3-2','xx0132'),cow(5,'x-x-3-2-1-1','xx3211'),
      sh('x-3-5-5-5-3','x13331'),sh('8-10-10-9-8-8','134211'),sh('x-x-10-12-13-12','xx1342'),sh('x-x-5-5-5-8','xx1114')]],
    ['m','m','Minor',[T.R,T.m3,T.P5],[cow(9,'x-0-2-2-1-0','x02310'),cow(4,'0-2-2-0-0-0','023000'),cow(2,'x-x-0-2-3-1','xx0231'),sh('x-3-1-0-1-x','x4102x'),sh('x-3-5-5-4-3','x13421'),sh('8-10-10-8-8-8','134111'),sh('11-x-10-12-13-x','2x134x'),sh('x-x-13-12-13-11','xx3241')]],
    ['aug','+','Augmented',[T.R,T.M3,T.A5],[sh('x-3-2-1-1-x','x3211x'),sh('x-3-x-5-5-4','x1x342'),sh('x-x-6-5-5-8','xx2114'),sh('x-x-10-9-9-8','xx4231'),sh('12-x-14-13-13-x','1x432x')]],
    ['dim','°','Diminished',[T.R,T.m3,T.d5],[sh('x-x-4-5-4-2','xx2431'),sh('x-6-4-5-4-x','x3121x'),sh('x-9-10-8-7-x','x3421x'),sh('11-x-13-11-13-x','1x324x'),sh('x-x-13-11-13-11','xx3141')]],
    ['sus2','sus2','Sus 2',[T.R,T.M2,T.P5],[sh('x-3-0-0-1-3','x30014'),sh('x-3-5-7-x-x','x134xx'),sh('x-5-5-5-8-8','x11144'),sh('x-x-10-7-8-10','xx3124'),sh('10-10-12-12-13-x','11334x')]],
    ['sus4','sus4','Sus 4',[T.R,T.P4,T.P5],[sh('x-3-3-0-1-1','x34011'),sh('3-3-5-5-6-x','11334x'),sh('x-x-5-5-6-8','xx1124'),sh('8-8-10-10-8-8','113411'),sh('x-x-10-12-13-13','xx1344')]]]],
  ['Sixths and added notes',[
    ['6','6','Major 6',[T.R,T.M3,T.P5,T.M6],[sh('x-3-5-2-5-x','x2314x'),sh('x-x-10-12-10-12','xx1314'),sh('8-x-7-9-8-x','2x143x'),sh('x-3-x-2-5-3','x2x143'),sh('x-3-2-2-1-0','x42310'),sh('x-3-5-5-5-5','x13333'),sh('x-x-10-9-10-8','xx3241'),sh('x-12-x-12-13-12','x1x243')]],
    ['m6','m6','Minor 6',[T.R,T.m3,T.P5,T.M6],[sh('x-3-5-2-4-x','x2413x'),sh('x-x-10-12-10-11','xx1312'),sh('8-x-7-8-8-x','2x134x'),sh('x-3-x-2-4-3','x2x143'),sh('x-3-1-2-1-3','x31214'),sh('x-x-5-5-4-5','xx2314'),sh('11-x-10-12-10-x','2x131x'),sh('x-x-13-14-13-15','xx1213')]],
    ['add9','add9','Add 9',[T.R,T.M3,T.P5,T.M9],[sh('x-3-2-0-3-3','x21034'),sh('x-3-5-7-5-3','x12431'),sh('x-5-5-5-5-x','x1111x'),sh('x-7-x-7-8-8','x1x234'),sh('x-x-10-12-13-10','xx1341')]],
    ['madd9','m(add9)','Minor add 9',[T.R,T.m3,T.P5,T.M9],[sh('x-3-1-0-3-3','x21034'),sh('x-6-5-5-3-x','x4231x'),sh('x-6-x-7-8-8','x1x244'),sh('x-x-10-8-8-10','xx3114'),sh('x-x-12-12-13-11','xx2341')]]]],
  ['Sevenths',[
    ['maj7','maj7','Major 7',[T.R,T.M3,T.P5,T.M7],[sh('x-3-5-4-5-x','x1324x'),sh('x-x-10-12-12-12','xx1333'),sh('8-x-9-9-8-x','1x342x'),sh('x-3-x-4-5-3','x1x342'),sh('x-3-2-0-0-0','x32000'),sh('x-3-5-4-5-3','x13241'),sh('x-x-5-5-5-7','xx1113')]],
    ['7','7','Dominant 7',[T.R,T.M3,T.P5,T.m7],[sh('x-3-5-3-5-x','x1314x'),sh('x-x-10-12-11-12','xx1324'),sh('8-x-8-9-8-x','1x243x'),sh('x-3-x-3-5-3','x1x243'),sh('x-3-2-3-1-0','x32410'),sh('x-3-5-3-5-3','x13141'),sh('x-x-5-5-5-6','xx1112'),sh('8-10-8-9-8-8','131211')]],
    ['m7','m7','Minor 7',[T.R,T.m3,T.P5,T.m7],[sh('x-3-5-3-4-x','x1312x'),sh('x-x-10-12-11-11','xx1423'),sh('8-x-8-8-8-x','2x333x'),sh('x-3-x-3-4-3','x1x243'),sh('3-x-1-3-1-x','3x141x'),sh('x-3-5-3-4-3','x13121'),sh('11-x-10-12-11-x','2x143x')]],
    ['m7b5','m7♭5','Minor 7 flat 5',[T.R,T.m3,T.d5,T.m7],[sh('x-3-4-3-4-x','x1324x'),sh('x-x-10-11-11-11','xx1222'),sh('8-x-8-8-7-x','2x341x'),sh('x-3-x-3-4-2','x2x341'),sh('2-x-1-3-1-x','2x141x'),sh('x-6-8-5-7-x','x2413x')]],
    ['dim7','°7','Diminished 7',[T.R,T.m3,T.d5,T.d7],[sh('x-3-4-2-4-x','x2314x'),sh('x-x-10-11-10-11','xx1324'),sh('8-x-7-8-7-x','2x131x'),sh('x-3-x-2-4-2','x2x141'),sh('x-x-1-2-1-2','xx1324'),sh('x-3-4-2-4-2','x23141'),sh('x-6-7-5-7-x','x2314x')]],
    ['mmaj7','m(maj7)','Minor major 7',[T.R,T.m3,T.P5,T.M7],[sh('x-3-1-0-0-3','x31004'),sh('x-3-5-4-4-3','x14231'),sh('8-x-9-8-8-x','1x423x'),sh('11-x-10-12-12-x','2x134x'),sh('x-14-13-12-13-x','x4213x')]],
    ['7sus4','7sus4','7 sus 4',[T.R,T.P4,T.P5,T.m7],[sh('x-3-3-3-1-x','x2341x'),sh('x-3-5-3-6-3','x13141'),sh('x-x-5-5-6-6','xx1122'),sh('8-10-8-10-8-8','131411'),sh('x-x-10-12-11-13','xx1324')]]]],
  ['Extended',[
    ['maj9','maj9','Major 9',[T.R,T.M3,T.P5,T.M7,T.M9],[sh('x-3-2-4-3-x','x2143x'),sh('x-7-9-7-8-7','x14121'),sh('x-x-10-9-12-10','xx2143'),sh('x-15-12-12-12-12','x31111'),sh('x-14-14-16-15-15','x11322')]],
    ['9','9','Dominant 9',[T.R,T.M3,T.P5,T.m7,T.M9],[sh('x-3-2-3-3-x','x2133x'),sh('x-x-10-9-11-10','xx2143'),sh('8-x-8-7-5-x','3x421x'),sh('x-3-x-3-3-0','x2x340'),sh('x-3-2-3-3-3','x21333'),sh('x-7-8-7-8-x','x1324x'),sh('8-10-8-9-8-10','131214')]],
    ['m9','m9','Minor 9',[T.R,T.m3,T.P5,T.m7,T.M9],[sh('x-3-1-3-3-x','x2134x'),sh('x-x-10-8-11-10','xx2143'),sh('x-3-1-3-3-3','x21333'),sh('x-6-x-7-8-6','x1x342'),sh('8-10-8-8-8-10','131114'),sh('x-x-13-15-15-15','xx1333')]],
    ['11','11','Dominant 11',[T.R,T.M3,T.P5,T.m7,T.M9,T.P11],[sh('x-3-2-3-1-1','x32411'),sh('x-3-3-3-5-3','x11131'),sh('x-7-x-5-6-6','x4x123'),sh('x-x-10-10-11-12','xx1123'),sh('13-13-14-15-13-13','112311')]],
    ['m11','m11','Minor 11',[T.R,T.m3,T.P5,T.m7,T.M9,T.P11],[sh('8-x-8-8-6-x','2x341x'),sh('x-3-x-3-4-1','x2x341'),sh('x-3-1-3-1-1','x31411'),sh('x-3-3-3-4-3','x11121'),sh('x-x-10-10-11-11','xx1122')]],
    ['13','13','Dominant 13',[T.R,T.M3,T.P5,T.m7,T.M9,T.M13],[sh('x-3-2-3-3-5','x21334'),sh('8-x-8-9-10-x','1x234x'),sh('x-3-x-3-5-5','x1x244'),sh('x-1-2-2-1-x','x1342x'),sh('8-10-8-9-10-8','131241'),sh('x-x-14-15-13-17','xx2314')]],
    ['maj7s11','maj7♯11','Major 7 sharp 11',[T.R,T.M3,T.P5,T.M7,T.s11],[sh('x-3-2-0-0-2','x31002'),sh('x-3-4-4-5-3','x12341'),sh('x-x-4-5-5-7','xx1224'),sh('8-x-9-9-7-x','2x341x'),sh('x-x-10-11-12-12','xx1233')]]]],
  ['Altered dominants',[
    ['7b5','7♭5','7 flat 5',[T.R,T.M3,T.d5,T.m7],[sh('8-x-8-9-7-x','2x341x'),sh('x-3-x-3-5-2','x2x341'),sh('2-x-2-3-1-x','2x341x'),sh('x-3-4-3-5-x','x1214x'),sh('6-x-4-5-5-x','4x123x'),sh('x-x-10-11-11-12','xx1223')]],
    ['7s11','7(♯11)','7 sharp 11',[T.R,T.M3,T.P5,T.m7,T.s11],[sh('8-x-8-9-7-x','2x341x'),sh('x-3-x-3-5-2','x2x341'),sh('2-x-2-3-1-x','2x341x'),sh('x-3-4-3-5-x','x1214x'),sh('6-x-4-5-5-x','4x123x'),sh('x-x-10-11-11-12','xx1223')]],
    ['7s9','7♯9','7 sharp 9',[T.R,T.M3,T.P5,T.m7,T.s9],[sh('x-3-2-3-4-x','x2134x'),sh('x-x-8-9-8-11','xx1214'),sh('x-7-8-8-8-8','x13333'),sh('8-10-8-9-8-11','131214'),sh('x-x-10-9-11-11','xx2134'),sh('x-x-13-12-11-12','xx4213')]],
    ['7s5','7♯5','7 sharp 5',[T.R,T.M3,T.A5,T.m7],[sh('8-x-8-9-9-x','1x234x'),sh('x-3-x-3-5-4','x1x243'),sh('x-x-2-3-1-4','xx2314'),sh('x-3-6-3-5-4','x14132'),sh('6-x-6-5-5-x','2x311x'),sh('x-x-10-13-11-12','xx1423')]],
    ['7b9b13','7(♭9,♭13)','7 flat 9 flat 13',[T.R,T.M3,T.m7,T.b9,T.b13],[sh('8-x-8-9-9-9','1x2333'),sh('x-3-2-3-2-4','x21314')]],
    ['7b5b9','7♭5(♭9)','7 flat 5 flat 9',[T.R,T.M3,T.d5,T.m7,T.b9],[sh('8-x-8-9-7-9','Tx2314'),sh('x-3-2-3-2-2','x21311')]],
    ['7b5s9','7♭5(♯9)','7 flat 5 sharp 9',[T.R,T.M3,T.d5,T.m7,T.s9],[sh('x-x-8-9-7-11','xx2314',[0,8]),sh('x-3-2-3-4-2','x21341')]],
    ['7s5b9','7♯5(♭9)','7 sharp 5 flat 9',[T.R,T.M3,T.A5,T.m7,T.b9],[sh('x-x-8-9-9-9','xx1222',[0,8]),sh('x-3-2-3-2-4','x21314')]]]],
];
const CHORD_TYPES=Object.fromEntries(CHORD_GROUPS.flatMap(([,list])=>list.map(([id,sym,name,tones,shapes])=>[id,{sym,name,tones,shapes}])));
const CH={root:store.get('croot',0),type:store.get('ctype','maj7'),lab:store.get('clab','note'),sel:0}; // sel: the voicing shown in colour
if(!CHORD_TYPES[CH.type])CH.type='maj7';

// Spell a chord tone from the root's letter: C7♯9 has D♯ (a 9th), Cm has E♭, C°7 has B♭♭.
function toneName(root,tone){
  const r=ROOT_SPELL[root],letter=LETTERS_UP[(LETTERS_UP.indexOf(r[0])+tone[1]-1)%7];
  let diff=(((root+tone[0])%12-LETTER_PC[letter])%12+12)%12;if(diff>6)diff-=12;
  return letter+(diff>0?'♯'.repeat(diff):'♭'.repeat(-diff));
}
const chordSymbol=()=>ROOT_SPELL[CH.root]+CHORD_TYPES[CH.type].sym;

/* ---------- placing the shapes ----------
   Each C shape moves by the distance from C to the root, as low on the neck as it fits (so D maj7's
   x-x-10-12-12-12 shape becomes the open x-x-0-2-2-2), never past fret TOP_FRET. */
const TOP_FRET=15;
function findVoicings(){
  const out=[];
  for(const shape of CHORD_TYPES[CH.type].shapes){
    const fr=shape.frets.filter(f=>f!=='x'),lo=Math.min(...fr),hi=Math.max(...fr);
    if(shape.root!==undefined&&shape.root!==CH.root)continue;   // an open chord only in its own key
    let k=CH.root;while(lo+k>0&&lo+k-12>=0)k-=12;while(lo+k<0)k+=12;
    if(shape.root!==undefined)k=0;
    // A moved shape may not end up with open strings over a fretted bass note (Dm as 1-x-0-2-3-x): David's call
    // (v59). Then it goes up an octave instead, if that fits. Open chords with an open bass (E7 0-2-0-1-0-0) are fine.
    const sandwiched=k=>{const p=shape.frets.filter(f=>f!=='x').map(f=>f+k);return p[0]>0&&p.includes(0);};
    if(k!==0&&sandwiched(k))k+=12;
    if(hi+k>TOP_FRET)continue;
    const frets=shape.frets.map(f=>f==='x'?'x':f+k),snd=frets.map((f,i)=>f==='x'?-1:i).filter(i=>i>=0);
    const played=snd.map(i=>frets[i]),low=Math.min(...played.filter(f=>f>0),99);
    if(out.some(v=>v.frets.join()===frets.join()))continue;  // two shapes landing on the same frets
    out.push({frets,snd,fing:shape.fing,low:played.some(f=>f===0)?0:low,opens:played.filter(f=>f===0).length,
      imp:shape.imp&&shape.imp[1]+k>=0?[shape.imp[0],shape.imp[1]+k]:null});
  }
  return out.sort((a,b)=>a.low-b.low||a.snd[0]-b.snd[0]);
}

/* ---------- drawing ----------
   Every voicing is on the board, but only the selected one is in colour (with × for its unplayed strings);
   the rest are greyed out. Tap a grey one to select it. The notation strip underneath works the same way. */
const cfb=document.getElementById('cfb'),cnot=document.getElementById('cnotation');
let voicings=[];
const toneAt=(s,f)=>{const pc=pcAt(s,f);return CHORD_TYPES[CH.type].tones.find(t=>(CH.root+t[0])%12===pc);};
const vMid=v=>v.snd.reduce((a,s)=>a+fx(v.frets[s]),0)/v.snd.length;
// The board stops at the 15th fret but keeps the same scale as the other fretboards.
const CW13=NUT+TOP_FRET*FW+14, cScale=CW13/W;
function sizeLike(el){el.style.width=(cScale*100)+'%';el.style.minWidth=Math.round(760*cScale)+'px';}
function drawChordBoard(){
  const on=CH.sel;
  let svg=`<rect class="wood" x="${NUT}" y="${TOP-10}" width="${TOP_FRET*FW}" height="${5*GAP+20}" rx="3"/>`;
  [3,5,7,9,15].forEach(f=>{svg+=`<circle class="inlay" cx="${fx(f)}" cy="${TOP+2.5*GAP}" r="5"/>`;});
  svg+=`<circle class="inlay" cx="${fx(12)}" cy="${TOP+1.5*GAP}" r="5"/><circle class="inlay" cx="${fx(12)}" cy="${TOP+3.5*GAP}" r="5"/>`;
  for(let f=1;f<=TOP_FRET;f++)svg+=`<line class="fret" x1="${NUT+f*FW}" x2="${NUT+f*FW}" y1="${TOP-10}" y2="${TOP+5*GAP+10}"/>`;
  [3,5,7,9,12,15].forEach(f=>{svg+=`<text class="fnum" x="${fx(f)}" y="${TOP+5*GAP+30}">${f}</text>`;});
  svg+=`<rect class="nut" x="${NUT-4}" y="${TOP-10}" width="5" height="${5*GAP+20}"/>`;
  for(let s=0;s<6;s++)svg+=`<line class="str" x1="${NUT-34}" x2="${NUT+TOP_FRET*FW}" y1="${sy(s)}" y2="${sy(s)}" stroke-width="${1+s*.35}"/>`;
  voicings.forEach((v,i)=>{
    const pts=v.snd.map(s=>`${fx(v.frets[s])},${sy(s)}`).join(' ');
    svg+=`<polyline class="shape ${i===on?'picked':'other'}" data-i="${i}" points="${pts}"><title>Voicing ${i+1}</title></polyline>`;
  });
  // Draw the selected voicing's line last so it sits on top, with × for its unplayed strings
  // (at the nut for an open-position voicing, otherwise just left of the shape).
  const v0=voicings[on];
  if(v0){const pts=v0.snd.map(s=>`${fx(v0.frets[s])},${sy(s)}`).join(' ');
    svg+=`<polyline class="shape picked" data-i="${on}" points="${pts}"><title>Voicing ${on+1}</title></polyline>`;
    const mx=v0.low===0||v0.opens&&Math.max(...v0.snd.map(s=>v0.frets[s]))<=4?fx(0):NUT+(v0.low-1)*FW-2;
    v0.frets.forEach((f,s)=>{if(f==='x')svg+=`<text class="mute" x="${mx}" y="${sy(s)+1}">×</text>`;});}
  // A rootless shape: the book's implied root as a hollow dot (not played).
  if(v0&&v0.imp){const [is,iff]=v0.imp;
    svg+=`<g class="dot implied" data-s="${is}" data-f="${iff}"><title>Implied root (not played)</title><circle cx="${fx(iff)}" cy="${sy(is)}" r="${DOT}"/><text x="${fx(iff)}" y="${sy(is)+.5}">${CH.lab==='note'?ROOT_SPELL[CH.root]:'R'}</text></g>`;}
  const dots=new Map();
  voicings.forEach((v,i)=>v.snd.forEach(s=>{const k=s+','+v.frets[s];const d=dots.get(k)||{s,f:v.frets[s],vs:[]};d.vs.push(i);dots.set(k,d);}));
  dots.forEach(d=>{const t=toneAt(d.s,d.f),label=CH.lab==='note'?toneName(CH.root,t):t[2];
    const mine=d.vs.includes(on);
    svg+=`<g class="dot${t[0]===0&&mine?' root':''}${mine?'':' ghost'}" data-s="${d.s}" data-f="${d.f}" data-v="${d.vs[0]}"><circle cx="${fx(d.f)}" cy="${sy(d.s)}" r="${DOT}"/><text x="${fx(d.f)}" y="${sy(d.s)+.5}">${label}</text></g>`;});
  // Same drawing space as the other fretboards (so sizes match).
  cfb.setAttribute('viewBox',`0 0 ${CW13} ${H}`);sizeLike(cfb);cfb.innerHTML=svg;
  const wrap=cfb.parentElement,v=voicings[on];
  if(v&&wrap.scrollWidth>wrap.clientWidth){const k=cfb.clientWidth/CW13,x=fx(v.low)*k;if(x<wrap.scrollLeft+20||x>wrap.scrollLeft+wrap.clientWidth-160)wrap.scrollLeft=Math.max(0,x-60);}
}
// Each voicing as a stacked whole-note chord under its shape (written guitar pitch, an octave above sounding).
function chordKeys(v){
  return v.snd.map(s=>{const f=v.frets[s],t=toneAt(s,f),name=toneName(CH.root,t),L=name[0],acc=name.slice(1);
    const alter=[...acc].reduce((a,c)=>a+(c==='♯'?1:-1),0),midi=STRINGS[s]+f,oct=Math.round((midi-LETTER_PC[L]-alter)/12)-1;
    const a=acc.replace(/♯/g,'#').replace(/♭/g,'b');
    return {key:`${L.toLowerCase()}${a}/${oct}`,acc:a,midi};}).sort((a,b)=>a.midi-b.midi);
}
function drawChordNotation(){
  cnot.replaceChildren();
  if(!voicings.length)return;
  const keys=voicings.map(chordKeys);
  const step=k=>{const [l,o]=k.split('/');return 7*(+o)+'cdefgab'.indexOf(l[0]);};
  const all=keys.flat().map(k=>step(k.key)),top=Math.max(...all),bot=Math.min(...all);
  const above=Math.max(2,(top-step('f/5'))/2+1.5),below=Math.max(2,(step('e/4')-bot)/2+1.5);
  const h=Math.ceil((above+4+below)*10+8);
  const r=new VF.Renderer(cnot,VF.Renderer.Backends.SVG);r.resize(CW13,h);
  const ctx=r.getContext();
  const stave=new VF.Stave(0,0,NUT+TOP_FRET*FW,{space_above_staff_ln:above,space_below_staff_ln:below,left_bar:false});
  stave.addClef('treble').setEndBarType(VF.Barline.type.NONE).setContext(ctx).draw();
  const minX=stave.getNoteStartX()+18;
  // Under each shape where possible, nudged apart when two would overlap.
  const xs=voicings.map(v=>Math.max(minX,vMid(v)));
  for(let i=1;i<xs.length;i++)xs[i]=Math.max(xs[i],xs[i-1]+40);
  voicings.forEach((v,i)=>{
    const note=new VF.StaveNote({keys:keys[i].map(k=>k.key),duration:'w'});
    keys[i].forEach((k,j)=>{if(k.acc)note.addModifier(new VF.Accidental(k.acc),j);});
    const mc=new VF.ModifierContext();note.addToModifierContext(mc);
    const tc=new VF.TickContext();tc.addTickable(note).preFormat();
    tc.setX(xs[i]-stave.getNoteStartX()-16);
    note.setStave(stave).setContext(ctx).draw();
  });
  const svg=cnot.querySelector('svg');svg.setAttribute('viewBox',`0 0 ${CW13} ${h}`);svg.removeAttribute('width');svg.removeAttribute('height');svg.style.height='';sizeLike(svg);
  cnot.querySelectorAll('.vf-stavenote').forEach((el,i)=>{el.dataset.i=i;el.classList.add(i===CH.sel?'picked':'other');
    el.setAttribute('role','img');el.setAttribute('aria-label',`Voicing ${i+1}: ${voicings[i].frets.join(' ')}`);});
}
function drawChords(){
  voicings=findVoicings();
  if(CH.sel<0||CH.sel>=voicings.length)CH.sel=0;
  document.getElementById('cname').textContent=chordSymbol();
  const note=document.getElementById('cnote');note.hidden=voicings.length>0;note.textContent='No playable voicings found for this chord.';
  drawChordBoard();drawChordNotation();describeChords();
}

/* ---------- sound and playback ---------- */
const strumVoicing=(v,at)=>v.snd.forEach((s,j)=>pluck(freqOf(STRINGS[s]+v.frets[s]),{at:at+j*.035,dur:2,vol:.36}));
function selectVoicing(i,sound=true){
  CH.sel=i;drawChordBoard();drawChordNotation();
  if(sound&&voicings[i])strumVoicing(voicings[i],audio()?.currentTime||0);
}
cfb.addEventListener('click',e=>{
  const line=e.target.closest('.shape');if(line){if(cp.on)cstop();selectVoicing(+line.dataset.i);return;}
  const d=e.target.closest('.dot');if(!d)return;
  if(d.classList.contains('ghost')){if(cp.on)cstop();selectVoicing(+d.dataset.v);return;}  // a grey dot picks its voicing
  pluck(freqOf(STRINGS[+d.dataset.s]+ +d.dataset.f),{dur:1.4});
});
cnot.addEventListener('click',e=>{const g=e.target.closest('.vf-stavenote');if(g){if(cp.on)cstop();selectVoicing(+g.dataset.i);}});
const cp={on:false,timer:0,i:0},cplay=document.getElementById('cplay'),cstatus=document.getElementById('cstatus');
function cstep(){
  if(!cp.on)return;
  if(cp.i>=voicings.length){cstop();cstatus.textContent='Done.';return;}
  selectVoicing(cp.i);cstatus.textContent=`Voicing ${cp.i+1} of ${voicings.length}`;
  cp.i++;cp.timer=setTimeout(cstep,1500);
}
function cstart(){if(!audio()||!voicings.length)return;cp.on=true;cp.i=0;cplay.querySelector('span').textContent='Stop';cplay.querySelector('path').setAttribute('d','M3 3h10v10H3z');cstep();}
function cstop(){if(!cp.on)return;cp.on=false;clearTimeout(cp.timer);hush();cstatus.textContent='';cplay.querySelector('span').textContent='Play';cplay.querySelector('path').setAttribute('d','M3 1.5v13l11-6.5z');}
cplay.onclick=()=>cp.on?cstop():cstart();

/* ---------- controls ---------- */
const crootSel=document.getElementById('croot'),ctypeSel=document.getElementById('ctype');
crootSel.innerHTML=ROOT_SPELL.map((n,r)=>`<option value="${r}">${n}</option>`).join('');
ctypeSel.innerHTML=CHORD_GROUPS.map(([g,list])=>`<optgroup label="${g}">${list.map(([id,sym,name])=>`<option value="${id}">${name}${sym&&sym!==name?` (${sym})`:''}</option>`).join('')}</optgroup>`).join('');
crootSel.value=CH.root;ctypeSel.value=CH.type;
crootSel.onchange=()=>{cstop();CH.root=+crootSel.value;CH.sel=0;store.set('croot',CH.root);drawChords();};
ctypeSel.onchange=()=>{cstop();CH.type=ctypeSel.value;CH.sel=0;store.set('ctype',CH.type);drawChords();};
const clab=document.getElementById('clab');clab.setAttribute('aria-pressed',CH.lab==='note');
clab.onclick=()=>{CH.lab=CH.lab==='note'?'int':'note';store.set('clab',CH.lab);clab.setAttribute('aria-pressed',CH.lab==='note');drawChordBoard();};
function describeChords(){
  if(document.getElementById('drill-view').hidden||drillMode!=='chords')return;
  document.getElementById('subtitle').textContent=`Chords · ${chordSymbol()} · ${voicings.length} voicing${voicings.length===1?'':'s'}`;
}

/* ---------- Triads | Chords ---------- */
let drillMode=store.get('dmode','triads');
function showMode(m){
  drillMode=m==='chords'?'chords':'triads';store.set('dmode',drillMode);
  document.getElementById('triads-mode').hidden=drillMode!=='triads';
  document.getElementById('chords-mode').hidden=drillMode!=='chords';
  document.querySelectorAll('.drill-modes [data-mode]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.mode===drillMode);b.setAttribute('aria-selected',b.dataset.mode===drillMode);});
  if(drillMode==='chords'){dstop();drawChords();}else{cstop();drawDrill();}
  describeDrill();
}
document.querySelector('.drill-modes').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(b)showMode(b.dataset.mode);});

showMode(drillMode);
// Now that every section is set up, open the one asked for (#improv / #drill) or the last one used.
showView({'#improv':'improv','#drill':'drill'}[location.hash]||store.get('view','drill'));
