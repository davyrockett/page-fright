/* Drill: triads. Pick a chord and three strings; the fretboard shows every playable shape of that triad on
   those strings, up and down the neck, joined by a line coloured by inversion.
   Loaded after improv.js, so it shares the fretboard drawing helpers (NUT, FW, TOP, GAP, W, H, fx, sy, LAST,
   pcAt, pcName) and the sound (pluck, freqOf, hush, STRINGS, store). */

const QUALITIES={
  maj:{name:'major',iv:[0,4,7],lab:['R','3','5']},
  min:{name:'minor',iv:[0,3,7],lab:['R','♭3','5']},
  dim:{name:'diminished',iv:[0,3,6],lab:['R','♭3','♭5']},
  aug:{name:'augmented',iv:[0,4,8],lab:['R','3','♯5']},
};
const INVERSIONS=['Root position','1st inversion','2nd inversion'];
const STRING_NAMES=['E','A','D','G','B','e'];   // low to high
const ROOTS=[0,1,2,3,4,5,6,7,8,9,10,11];
// Note names spelled the way the chord is: root, then the letter two up (3rd), then four up (5th),
// so C minor is C–E♭–G (not D♯) and F♯ diminished is F♯–A–C.
const ROOT_SPELL=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const LETTER_PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11}, LETTERS_UP='CDEFGAB';
function spell(root,deg,qual){
  const r=ROOT_SPELL[root], letter=LETTERS_UP[(LETTERS_UP.indexOf(r[0])+deg*2)%7];
  const pc=(root+QUALITIES[qual].iv[deg])%12;
  let diff=((pc-LETTER_PC[letter])%12+12)%12;if(diff>6)diff-=12;
  return letter+(diff>0?'♯'.repeat(diff):'♭'.repeat(-diff));
}
const D={root:store.get('droot',0),qual:store.get('dqual','maj'),strings:store.get('dstrings',[3,4,5]),
  inv:store.get('dinv',[0,1,2]),lab:store.get('dlab','note')};
if(!Array.isArray(D.strings)||D.strings.some(s=>!(s>=0&&s<6)))D.strings=[3,4,5];

/* ---------- the tShapes ----------
   One note on each of the three strings, using each chord tone once. Playable = all three within a 5-fret
   stretch (6 when the strings aren't next to each other). The inversion is set by the note on the lowest string. */
function triadShapes(){
  const strs=[...D.strings].sort((a,b)=>a-b);
  if(strs.length!==3)return [];
  const q=QUALITIES[D.qual], pcs=q.iv.map(i=>(D.root+i)%12);
  const adjacent=strs[2]-strs[0]===2, reach=adjacent?4:5;
  const out=[];
  for(let a=0;a<=LAST;a++)for(let b=0;b<=LAST;b++)for(let c=0;c<=LAST;c++){
    const fr=[a,b,c];
    if(Math.max(...fr)-Math.min(...fr)>reach)continue;
    const notes=strs.map((s,i)=>({s,f:fr[i],pc:pcAt(s,fr[i])}));
    const degs=notes.map(n=>pcs.indexOf(n.pc));
    if(degs.includes(-1)||new Set(degs).size!==3)continue;
    out.push({notes,degs,inv:degs[0],lo:Math.min(...fr)});
  }
  return out.sort((x,y)=>x.lo-y.lo||x.inv-y.inv);
}

/* ---------- drawing ---------- */
const dfb=document.getElementById('dfb');
let tShapes=[], tFocus=-1, noteFlash='', flashTimer=0;
function drawDrill(){
  tShapes=triadShapes().filter(sh=>D.inv.includes(sh.inv));
  const q=QUALITIES[D.qual];
  let svg=`<rect class="wood" x="${NUT}" y="${TOP-10}" width="${LAST*FW}" height="${5*GAP+20}" rx="3"/>`;
  [3,5,7,9,15,17].forEach(f=>{svg+=`<circle class="inlay" cx="${fx(f)}" cy="${TOP+2.5*GAP}" r="5"/>`;});
  svg+=`<circle class="inlay" cx="${fx(12)}" cy="${TOP+1.5*GAP}" r="5"/><circle class="inlay" cx="${fx(12)}" cy="${TOP+3.5*GAP}" r="5"/>`;
  for(let f=1;f<=LAST;f++)svg+=`<line class="fret" x1="${NUT+f*FW}" x2="${NUT+f*FW}" y1="${TOP-10}" y2="${TOP+5*GAP+10}"/>`;
  [3,5,7,9,12,15,17].forEach(f=>{svg+=`<text class="fnum" x="${fx(f)}" y="${TOP+5*GAP+30}">${f}</text>`;});
  svg+=`<rect class="nut" x="${NUT-4}" y="${TOP-10}" width="5" height="${5*GAP+20}"/>`;
  for(let s=0;s<6;s++){const used=D.strings.includes(s);
    svg+=`<line class="str" x1="${NUT-34}" x2="${NUT+LAST*FW}" y1="${sy(s)}" y2="${sy(s)}" stroke-width="${1+s*.35}"${used?'':' stroke-opacity=".35"'}/>`;}
  // Shape lines first, then the dots on top.
  tShapes.forEach((sh,i)=>{const pts=sh.notes.map(n=>`${fx(n.f)},${sy(n.s)}`).join(' ');
    svg+=`<polyline class="shape inv${sh.inv}${i===tFocus?' on':''}" data-i="${i}" points="${pts}"><title>${INVERSIONS[sh.inv]}</title></polyline>`;});
  const dots=new Map();
  // Fewer than three strings: no shapes yet, so show where the chord's notes fall on the strings picked.
  if(D.strings.length<3){const pcs=q.iv.map(i=>(D.root+i)%12);
    D.strings.forEach(s=>{for(let f=0;f<=LAST;f++){const deg=pcs.indexOf(pcAt(s,f));if(deg>=0)dots.set(s+','+f,{s,f,pc:pcAt(s,f),deg,tShapes:[]});}});}
  tShapes.forEach((sh,i)=>sh.notes.forEach((n,j)=>{const k=n.s+','+n.f;const d=dots.get(k)||{...n,deg:sh.degs[j],tShapes:[]};d.tShapes.push(i);dots.set(k,d);}));
  dots.forEach(d=>{
    const label=D.lab==='int'?q.lab[d.deg]:spell(D.root,d.deg,D.qual);
    const on=tFocus>=0&&d.tShapes.includes(tFocus);
    svg+=`<g class="dot${d.deg===0?' root':''}${on?' on':''}" data-s="${d.s}" data-f="${d.f}"><circle cx="${fx(d.f)}" cy="${sy(d.s)}" r="10.5"/><text x="${fx(d.f)}" y="${sy(d.s)+.5}">${label}</text></g>`;
  });
  dfb.setAttribute('viewBox',`0 0 ${W} ${H}`);dfb.innerHTML=svg;dfb.classList.toggle('focus',tFocus>=0);
  const note=document.getElementById('dnote'), n=D.strings.length;
  note.hidden=n===3&&tShapes.length>0&&!noteFlash;
  note.textContent=noteFlash||(n===0?'Pick up to three strings.':n<3?`Showing the chord's notes on ${n===1?'that string':'those strings'}. Pick ${n===1?'two more strings':'one more string'} to see the triad shapes.`
    :!D.inv.length?'Turn on at least one inversion.':'No playable shapes on these strings.');
  drawNotation();
  describeDrill();
}

/* ---------- notation under the fretboard ----------
   Each shape as a stacked whole-note chord, written at guitar pitch (an octave above how it sounds) and spelled
   from the root, placed under the middle of its shape on the fretboard. */
const dnot=document.getElementById('dnotation');
function vfKey(n,deg){
  const name=spell(D.root,deg,D.qual), L=name[0], acc=name.slice(1);
  const alter=[...acc].reduce((a,c)=>a+(c==='♯'?1:-1),0), midi=STRINGS[n.s]+n.f;
  const oct=Math.round((midi-LETTER_PC[L]-alter)/12)-1;
  const a=acc.replace(/♯/g,'#').replace(/♭/g,'b');
  return {key:`${L.toLowerCase()}${a}/${oct}`,acc:a,name:name+oct,midi};
}
function drawNotation(){
  dnot.replaceChildren();
  if(!tShapes.length)return;
  const chords=tShapes.map(sh=>sh.notes.map((n,j)=>vfKey(n,sh.degs[j])).sort((a,b)=>a.midi-b.midi));
  // Room above and below the staff for the highest and lowest notes (ledger lines).
  const step=k=>{const [l,o]=k.split('/');return 7*(+o)+'cdefgab'.indexOf(l[0]);};
  const all=chords.flat().map(c=>step(c.key)), top=Math.max(...all), bot=Math.min(...all);
  const above=Math.max(2,(top-step('f/5'))/2+1.5), below=Math.max(2,(step('e/4')-bot)/2+1.5);
  const h=Math.ceil((above+4+below)*10+8);
  const r=new VF.Renderer(dnot,VF.Renderer.Backends.SVG);r.resize(W,h);
  const ctx=r.getContext();
  const stave=new VF.Stave(0,0,W,{space_above_staff_ln:above,space_below_staff_ln:below,left_bar:false});
  stave.addClef('treble').setEndBarType(VF.Barline.type.NONE).setContext(ctx).draw();
  const minX=stave.getNoteStartX()+18;
  tShapes.forEach((sh,i)=>{
    const ch=chords[i];
    const note=new VF.StaveNote({keys:ch.map(c=>c.key),duration:'w'});
    ch.forEach((c,j)=>{if(c.acc)note.addModifier(new VF.Accidental(c.acc),j);});
    const mc=new VF.ModifierContext();note.addToModifierContext(mc);
    const tc=new VF.TickContext();tc.addTickable(note).preFormat();
    const mid=sh.notes.reduce((a,n)=>a+fx(n.f),0)/3;
    tc.setX(Math.max(minX,mid)-stave.getNoteStartX()-16);
    note.setStave(stave).setContext(ctx).draw();
  });
  const svg=dnot.querySelector('svg');svg.setAttribute('viewBox',`0 0 ${W} ${h}`);svg.removeAttribute('width');svg.removeAttribute('height');svg.style.width='';svg.style.height='';
  dnot.querySelectorAll('.vf-stavenote').forEach((g,i)=>{g.dataset.i=i;g.classList.add('inv'+tShapes[i].inv);if(i===tFocus)g.classList.add('on');
    g.setAttribute('role','img');g.setAttribute('aria-label',`${INVERSIONS[tShapes[i].inv]}: ${chords[i].map(c=>c.name).join(', ')}`);});
  dnot.classList.toggle('focus',tFocus>=0);
}
dnot.addEventListener('click',e=>{const g=e.target.closest('.vf-stavenote');if(!g)return;
  tFocus=+g.dataset.i;strumShape(tShapes[tFocus],audio()?.currentTime||0);drawDrill();});

/* ---------- sound ---------- */
const strumShape=(sh,at=0)=>[...sh.notes].sort((a,b)=>a.s-b.s).forEach((n,j)=>pluck(freqOf(STRINGS[n.s]+n.f),{at:at+j*.03,dur:1.6,vol:.4}));
dfb.addEventListener('click',e=>{
  const line=e.target.closest('.shape');
  if(line){tFocus=+line.dataset.i;strumShape(tShapes[tFocus],audio()?.currentTime||0);drawDrill();return;}
  const dot=e.target.closest('.dot');
  if(dot)pluck(freqOf(STRINGS[+dot.dataset.s]+ +dot.dataset.f),{dur:1.4});
  else if(tFocus>=0&&!dp.on){tFocus=-1;drawDrill();}
});

// Play: strum every shape in order up the neck, highlighting each one.
const dp={on:false,timer:0,i:0};
const dplay=document.getElementById('dplay'),dstatus=document.getElementById('dstatus');
function dstep(){
  if(!dp.on)return;
  if(dp.i>=tShapes.length){dstop();dstatus.textContent='Done.';return;}
  tFocus=dp.i;strumShape(tShapes[dp.i],audio().currentTime);drawDrill();
  dstatus.textContent=`Shape ${dp.i+1} of ${tShapes.length} · ${INVERSIONS[tShapes[dp.i].inv]}`;
  scrollToFocus();
  dp.i++;dp.timer=setTimeout(dstep,1100);
}
function dstart(){if(!audio()||!tShapes.length)return;dp.on=true;dp.i=0;
  dplay.querySelector('span').textContent='Stop';dplay.querySelector('path').setAttribute('d','M3 3h10v10H3z');dstep();}
function dstop(){if(!dp.on)return;dp.on=false;clearTimeout(dp.timer);hush();tFocus=-1;dstatus.textContent='';drawDrill();
  dplay.querySelector('span').textContent='Play';dplay.querySelector('path').setAttribute('d','M3 1.5v13l11-6.5z');}
dplay.onclick=()=>dp.on?dstop():dstart();
// On a narrow screen the fretboard scrolls sideways: keep the shape being played in view.
function scrollToFocus(){
  const wrap=dfb.parentElement;if(tFocus<0||wrap.scrollWidth<=wrap.clientWidth)return;
  const k=dfb.clientWidth/W,x=fx(Math.min(...tShapes[tFocus].notes.map(n=>n.f)))*k;
  if(x<wrap.scrollLeft+20||x>wrap.scrollLeft+wrap.clientWidth-120)wrap.scrollLeft=Math.max(0,x-40);
}

/* ---------- controls ---------- */
const rootSel=document.getElementById('droot'),qualSel=document.getElementById('dqual');
rootSel.innerHTML=ROOTS.map(r=>`<option value="${r}">${ROOT_SPELL[r]}</option>`).join('');
rootSel.value=D.root;qualSel.value=D.qual;
const changed=()=>{dstop();tFocus=-1;drawDrill();};
rootSel.onchange=()=>{D.root=+rootSel.value;store.set('droot',D.root);changed();};
qualSel.onchange=()=>{D.qual=qualSel.value;store.set('dqual',D.qual);drawInv();changed();};
function drawStrings(){
  document.getElementById('dstrings').innerHTML=STRING_NAMES.map((n,s)=>`<button type="button" class="btn chip" data-str="${s}" aria-pressed="${D.strings.includes(s)}" title="${['Low E','A','D','G','B','High E'][s]} string">${n}</button>`).join('');
}
function drawInv(){
  document.getElementById('dinv').innerHTML=INVERSIONS.map((n,i)=>`<button type="button" class="btn chip inv-btn" data-inv="${i}" aria-pressed="${D.inv.includes(i)}"><span class="sw" style="background:var(--inv${i})"></span><span class="long">${n}</span><span class="short">${['Root','1st inv','2nd inv'][i]}</span></button>`).join('');
}
document.getElementById('drill-view').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.str!==undefined){const s=+d.str;
    if(D.strings.includes(s))D.strings=D.strings.filter(x=>x!==s);
    else if(D.strings.length>=3){ // up to three: say so instead of adding a fourth
      noteFlash='Up to three strings. Tap one to turn it off first.';clearTimeout(flashTimer);
      flashTimer=setTimeout(()=>{noteFlash='';drawDrill();},2500);drawDrill();return;}
    else D.strings=[...D.strings,s];
    noteFlash='';clearTimeout(flashTimer);
    store.set('dstrings',D.strings);drawStrings();changed();}
  else if(d.inv!==undefined){const i=+d.inv;D.inv=D.inv.includes(i)?D.inv.filter(x=>x!==i):[...D.inv,i].sort();store.set('dinv',D.inv);drawInv();changed();}
  else if(b.id==='dlab'){D.lab=D.lab==='note'?'int':'note';store.set('dlab',D.lab);b.setAttribute('aria-pressed',D.lab==='note');drawDrill();}
});
document.getElementById('dlab').setAttribute('aria-pressed',D.lab==='note');
function describeDrill(){
  if(document.getElementById('drill-view').hidden)return;
  const strs=[...D.strings].sort((a,b)=>a-b).map(s=>STRING_NAMES[s]).join(' ');
  document.getElementById('subtitle').textContent=`Triads · ${ROOT_SPELL[D.root]} ${QUALITIES[D.qual].name} · strings ${strs||'none'}`;
}
document.addEventListener('keydown',e=>{
  if(document.getElementById('drill-view').hidden)return;
  if(e.metaKey||e.ctrlKey||e.altKey||document.querySelector('.tmodal:not([hidden])'))return;
  if(e.target.closest('input,select,textarea'))return;
  if(e.key===' '){e.preventDefault();dp.on?dstop():dstart();}
});

drawStrings();drawInv();drawDrill();
// Now that every section is set up, open the one asked for (#improv / #drill) or the last one used.
showView({'#improv':'improv','#drill':'drill'}[location.hash]||store.get('view','read'));
