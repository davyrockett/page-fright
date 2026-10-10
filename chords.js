/* Drill > Chords: pick a root and a chord type; the app finds playable voicings all over the neck and shows
   each one in notation and tab. Loaded last: it shares the fretboard helpers from improv.js (NUT, FW, TOP, GAP,
   DOT, W, H, fx, sy, LAST, pcAt) and drill.js (ROOT_SPELL, LETTER_PC, LETTERS_UP, STRING_NAMES), and opens the
   first view at the end. */

/* ---------- chord types ----------
   Each tone: semitones above the root, which scale degree it is (for spelling), its label, and whether it may
   be left out (the 5th usually can; so can the 9th in 11 and 13 chords). */
const T={R:[0,1,'R'],M3:[4,3,'3'],m3:[3,3,'♭3'],P5:[7,5,'5'],d5:[6,5,'♭5'],A5:[8,5,'♯5'],M2:[2,2,'2'],P4:[5,4,'4'],
  m7:[10,7,'♭7'],M7:[11,7,'7'],d7:[9,7,'♭♭7'],M6:[9,6,'6'],M9:[2,2,'9'],b9:[1,2,'♭9'],s9:[3,2,'♯9'],
  P11:[5,4,'11'],s11:[6,4,'♯11'],M13:[9,6,'13']};
const opt=t=>[...t,true];
const CHORD_GROUPS=[
  ['Triads and sus',[['maj','','Major',[T.R,T.M3,T.P5]],['min','m','Minor',[T.R,T.m3,T.P5]],['dim','°','Diminished',[T.R,T.m3,T.d5]],
    ['aug','+','Augmented',[T.R,T.M3,T.A5]],['sus2','sus2','Sus 2',[T.R,T.M2,T.P5]],['sus4','sus4','Sus 4',[T.R,T.P4,T.P5]]]],
  ['Sevenths',[['7','7','Dominant 7',[T.R,T.M3,opt(T.P5),T.m7]],['maj7','maj7','Major 7',[T.R,T.M3,opt(T.P5),T.M7]],
    ['m7','m7','Minor 7',[T.R,T.m3,opt(T.P5),T.m7]],['m7b5','m7♭5','Half-diminished',[T.R,T.m3,T.d5,T.m7]],
    ['dim7','°7','Diminished 7',[T.R,T.m3,T.d5,T.d7]],['mmaj7','m(maj7)','Minor-major 7',[T.R,T.m3,opt(T.P5),T.M7]],
    ['7sus4','7sus4','7 sus 4',[T.R,T.P4,opt(T.P5),T.m7]]]],
  ['Sixths and added notes',[['6','6','Major 6',[T.R,T.M3,opt(T.P5),T.M6]],['m6','m6','Minor 6',[T.R,T.m3,opt(T.P5),T.M6]],
    ['69','6/9','6/9',[T.R,T.M3,opt(T.P5),T.M6,T.M9]],['add9','add9','Add 9',[T.R,T.M3,opt(T.P5),T.M9]],
    ['madd9','m(add9)','Minor add 9',[T.R,T.m3,opt(T.P5),T.M9]],['add11','add11','Add 11',[T.R,T.M3,opt(T.P5),T.P11]]]],
  ['Extended and altered',[['9','9','Dominant 9',[T.R,T.M3,opt(T.P5),T.m7,T.M9]],['maj9','maj9','Major 9',[T.R,T.M3,opt(T.P5),T.M7,T.M9]],
    ['m9','m9','Minor 9',[T.R,T.m3,opt(T.P5),T.m7,T.M9]],['11','11','Dominant 11',[T.R,opt(T.P5),T.m7,opt(T.M9),T.P11]],
    ['m11','m11','Minor 11',[T.R,T.m3,opt(T.P5),T.m7,opt(T.M9),T.P11]],['13','13','Dominant 13',[T.R,T.M3,opt(T.P5),T.m7,opt(T.M9),T.M13]],
    ['7b9','7♭9','7 flat 9',[T.R,T.M3,opt(T.P5),T.m7,T.b9]],['7s9','7♯9','7 sharp 9',[T.R,T.M3,opt(T.P5),T.m7,T.s9]],
    ['7s11','7♯11','7 sharp 11',[T.R,T.M3,opt(T.P5),T.m7,T.s11]],['maj7s11','maj7♯11','Major 7 sharp 11',[T.R,T.M3,opt(T.P5),T.M7,T.s11]]]],
];
const CHORD_TYPES=Object.fromEntries(CHORD_GROUPS.flatMap(([,list])=>list.map(([id,sym,name,tones])=>[id,{sym,name,tones}])));
const CH={root:store.get('croot',0),type:store.get('ctype','maj7'),lab:store.get('clab','note'),sel:-1}; // sel: highlighted voicing (-1 = none)
if(!CHORD_TYPES[CH.type])CH.type='maj7';

// Spell a chord tone from the root's letter: C7♯9 has D♯ (a 9th), Cm has E♭, C°7 has B♭♭.
function toneName(root,tone){
  const r=ROOT_SPELL[root],letter=LETTERS_UP[(LETTERS_UP.indexOf(r[0])+tone[1]-1)%7];
  let diff=(((root+tone[0])%12-LETTER_PC[letter])%12+12)%12;if(diff>6)diff-=12;
  return letter+(diff>0?'♯'.repeat(diff):'♭'.repeat(-diff));
}
const chordSymbol=()=>ROOT_SPELL[CH.root]+CHORD_TYPES[CH.type].sym;

/* ---------- finding voicings ----------
   Every way to play the chord with the root as the lowest note, all essential tones present, nothing outside
   the chord, at least three strings, at most one skipped string in the middle, all within four frets, and no
   more than four fingers (a barre on the lowest fret counts as one). Then the best one in each area of the neck. */
const TOP_FRET=13;   // voicings stay at or below the 13th fret
// How voicings are scored (tuned against well-known shapes like x-3-2-3-1-0 C7 and 0-7-6-7-8-x E7♯9).
const VW={strings:.39,inner:1.97,topMuted:.12,extras:.64,lowBass:.38,span:.91,finger:.14,openNear:.1,low:.22,doubled:.14,gap:1};
function findVoicings(){
  const type=CHORD_TYPES[CH.type],root=CH.root;
  const byPc=new Map();type.tones.forEach(t=>{const pc=(root+t[0])%12;if(!byPc.has(pc))byPc.set(pc,t);});
  const need=type.tones.filter(t=>!t[3]).map(t=>(root+t[0])%12);
  const found=new Map();
  for(let base=0;base<=TOP_FRET-3;base++){
    const choices=[];
    for(let s=0;s<6;s++){
      const c=['x',0];
      for(let f=Math.max(1,base);f<=base+3;f++)c.push(f);
      choices.push(c.filter(f=>f==='x'||byPc.has(pcAt(s,f))));
    }
    const pick=[];
    (function walk(s){
      if(s===6){
        const snd=pick.map((f,i)=>f==='x'?-1:i).filter(i=>i>=0);
        if(snd.length<3||pcAt(snd[0],pick[snd[0]])!==root)return;
        const pcs=snd.map(i=>pcAt(i,pick[i])), set=new Set(pcs);
        if(!need.every(pc=>set.has(pc)))return;
        const inner=pick.slice(snd[0],snd.at(-1)+1).filter(f=>f==='x').length;
        if(inner>1)return;
        const fr=snd.map(i=>pick[i]).filter(f=>f>0);
        if(fr.length&&Math.max(...fr)-Math.min(...fr)>3)return;
        const low=fr.length?Math.min(...fr):0;
        // Open strings: fine near the nut; higher up only as the bass note (like the open E under E7♯9).
        if(low>3&&snd.slice(1).some(i=>pick[i]===0))return;
        const fingers=fr.filter(f=>f>low).length+(fr.some(f=>f===low)?1:0);
        if(fingers>4)return;
        // Under a barre (one finger across several strings) an open string in between makes no sense
        // (F as 1-0-3-2-1-1). Open strings outside the barred strings are fine (A as x-0-2-2-2-0).
        if(low>0){const bar=snd.filter(i=>pick[i]===low);
          if(bar.length>=2&&snd.some(i=>pick[i]===0&&i>bar[0]&&i<bar.at(-1)))return;}
        // An open string sandwiched between fretted strings only works near the nut (C as x-3-2-0-1-0),
        // not under a shape higher up (A7 as 5-0-5-2-2-0).
        for(let j=1;j<snd.length-1;j++){const i=snd[j];if(pick[i]!==0)continue;
          const lo=snd.slice(0,j).map(k=>pick[k]).filter(f=>f>0),hi=snd.slice(j+1).map(k=>pick[k]).filter(f=>f>0);
          if(lo.length&&hi.length&&Math.max(...lo,...hi)>3)return;}
        const key=pick.join(',');if(found.has(key))return;
        const extras=type.tones.filter(t=>t[3]&&set.has((root+t[0])%12)).length;
        const opens=snd.filter(i=>pick[i]===0).length, span=fr.length?Math.max(...fr)-low:0;
        // Doubling the root or 5th is normal (barre chords do it); doubling the 3rd, 7th or extensions isn't.
        const fifth=(root+7)%12, doubled=[...set].filter(p=>p!==root&&p!==fifth).reduce((n,p)=>n+pcs.filter(q=>q===p).length-1,0);
        // A big jump from the open bass up to the shape is harder to hear as one chord.
        const gap=opens&&pick[snd[0]]===0&&low>4?1:0;
        const score=snd.length*VW.strings-inner*VW.inner-(5-snd.at(-1))*VW.topMuted+extras*VW.extras+(snd[0]<=1?VW.lowBass:0)
          -span*VW.span-fingers*VW.finger+(low<=3?opens*VW.openNear:0)-low*VW.low-doubled*VW.doubled-gap*VW.gap;
        found.set(key,{frets:[...pick],snd,low,score,opens});
        return;
      }
      for(const f of choices[s]){pick[s]=f;walk(s+1);}
    })(0);
  }
  // Best first; keep one per area of the neck and bass string, up to eight.
  const all=[...found.values()].sort((a,b)=>b.score-a.score), keep=[];
  // Is every note of a also in b, on the same string and fret? (x-x-x-5-5-7 is part of 8-7-5-5-5-7.)
  const partOf=(a,b)=>a.snd.every(s=>b.frets[s]===a.frets[s]);
  for(const v of all){
    if(keep.length>=8)break;
    if(keep.some(k=>partOf(v,k)||partOf(k,v)))continue;
    if(keep.some(k=>k.snd[0]===v.snd[0]&&Math.abs(k.low-v.low)<3))continue;
    if(keep.some(k=>Math.abs(k.low-v.low)<2&&k.score-v.score>2))continue;
    keep.push(v);
  }
  return keep.sort((a,b)=>a.low-b.low||a.snd[0]-b.snd[0]);
}

/* ---------- drawing ----------
   Every voicing at once: its notes joined by a line (colours alternate so neighbours stand apart), × beside it
   for strings not played, and the voicing written as a chord in the strip underneath. */
const cfb=document.getElementById('cfb'),cnot=document.getElementById('cnotation');
let voicings=[];
const toneAt=(s,f)=>{const pc=pcAt(s,f);return CHORD_TYPES[CH.type].tones.find(t=>(CH.root+t[0])%12===pc);};
const vMid=v=>v.snd.reduce((a,s)=>a+fx(v.frets[s]),0)/v.snd.length;
// The board stops at the 13th fret but keeps the same scale as the other fretboards.
const CW13=NUT+TOP_FRET*FW+14, cScale=CW13/W;
function sizeLike(el){el.style.width=(cScale*100)+'%';el.style.minWidth=Math.round(760*cScale)+'px';}
function drawChordBoard(){
  const on=CH.sel;
  let svg=`<rect class="wood" x="${NUT}" y="${TOP-10}" width="${TOP_FRET*FW}" height="${5*GAP+20}" rx="3"/>`;
  [3,5,7,9].forEach(f=>{svg+=`<circle class="inlay" cx="${fx(f)}" cy="${TOP+2.5*GAP}" r="5"/>`;});
  svg+=`<circle class="inlay" cx="${fx(12)}" cy="${TOP+1.5*GAP}" r="5"/><circle class="inlay" cx="${fx(12)}" cy="${TOP+3.5*GAP}" r="5"/>`;
  for(let f=1;f<=TOP_FRET;f++)svg+=`<line class="fret" x1="${NUT+f*FW}" x2="${NUT+f*FW}" y1="${TOP-10}" y2="${TOP+5*GAP+10}"/>`;
  [3,5,7,9,12].forEach(f=>{svg+=`<text class="fnum" x="${fx(f)}" y="${TOP+5*GAP+30}">${f}</text>`;});
  svg+=`<rect class="nut" x="${NUT-4}" y="${TOP-10}" width="5" height="${5*GAP+20}"/>`;
  for(let s=0;s<6;s++)svg+=`<line class="str" x1="${NUT-34}" x2="${NUT+TOP_FRET*FW}" y1="${sy(s)}" y2="${sy(s)}" stroke-width="${1+s*.35}"/>`;
  voicings.forEach((v,i)=>{
    const pts=v.snd.map(s=>`${fx(v.frets[s])},${sy(s)}`).join(' ');
    svg+=`<polyline class="shape inv${i%3}${i===on?' on':''}" data-i="${i}" points="${pts}"><title>Voicing ${i+1}</title></polyline>`;
    // × for unplayed strings, just left of this voicing (at the nut for an open-position voicing).
    const mx=v.low===0||v.opens&&Math.max(...v.snd.map(s=>v.frets[s]))<=4?fx(0):NUT+(v.low-1)*FW-2;
    v.frets.forEach((f,s)=>{if(f==='x')svg+=`<text class="mute${i===on?' on':''}" x="${mx}" y="${sy(s)+1}">×</text>`;});
  });
  const dots=new Map();
  voicings.forEach((v,i)=>v.snd.forEach(s=>{const k=s+','+v.frets[s];const d=dots.get(k)||{s,f:v.frets[s],vs:[]};d.vs.push(i);dots.set(k,d);}));
  dots.forEach(d=>{const t=toneAt(d.s,d.f),label=CH.lab==='note'?toneName(CH.root,t):t[2];
    svg+=`<g class="dot${t[0]===0?' root':''}${d.vs.includes(on)?' on':''}" data-s="${d.s}" data-f="${d.f}"><circle cx="${fx(d.f)}" cy="${sy(d.s)}" r="${DOT}"/><text x="${fx(d.f)}" y="${sy(d.s)+.5}">${label}</text></g>`;});
  // Same drawing space as the other fretboards (so sizes match); frets past the 13th are left empty.
  cfb.setAttribute('viewBox',`0 0 ${CW13} ${H}`);sizeLike(cfb);cfb.innerHTML=svg;cfb.classList.toggle('focus',on>=0);
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
  cnot.querySelectorAll('.vf-stavenote').forEach((el,i)=>{el.dataset.i=i;el.querySelectorAll('.vf-notehead').forEach(nh=>nh.classList.add('inv'+(i%3)));
    if(i===CH.sel)el.classList.add('on');el.setAttribute('role','img');el.setAttribute('aria-label',`Voicing ${i+1}: ${voicings[i].frets.join(' ')}`);});
  cnot.classList.toggle('focus',CH.sel>=0);
}
function drawChords(){
  voicings=findVoicings();
  if(CH.sel>=voicings.length)CH.sel=-1;
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
  const d=e.target.closest('.dot');if(d){pluck(freqOf(STRINGS[+d.dataset.s]+ +d.dataset.f),{dur:1.4});return;}
  if(CH.sel>=0&&!cp.on)selectVoicing(-1,false);   // tap the empty fretboard to see them all again
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
function cstop(){if(!cp.on)return;cp.on=false;clearTimeout(cp.timer);hush();cstatus.textContent='';CH.sel=-1;drawChordBoard();drawChordNotation();cplay.querySelector('span').textContent='Play';cplay.querySelector('path').setAttribute('d','M3 1.5v13l11-6.5z');}
cplay.onclick=()=>cp.on?cstop():cstart();

/* ---------- controls ---------- */
const crootSel=document.getElementById('croot'),ctypeSel=document.getElementById('ctype');
crootSel.innerHTML=ROOT_SPELL.map((n,r)=>`<option value="${r}">${n}</option>`).join('');
ctypeSel.innerHTML=CHORD_GROUPS.map(([g,list])=>`<optgroup label="${g}">${list.map(([id,sym,name])=>`<option value="${id}">${name}${sym&&sym!==name?` (${sym})`:''}</option>`).join('')}</optgroup>`).join('');
crootSel.value=CH.root;ctypeSel.value=CH.type;
crootSel.onchange=()=>{cstop();CH.root=+crootSel.value;CH.sel=-1;store.set('croot',CH.root);drawChords();};
ctypeSel.onchange=()=>{cstop();CH.type=ctypeSel.value;CH.sel=-1;store.set('ctype',CH.type);drawChords();};
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
showView({'#improv':'improv','#drill':'drill'}[location.hash]||store.get('view','read'));
