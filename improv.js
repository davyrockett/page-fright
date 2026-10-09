/* Improv: a 12-bar blues backing track in any key, with pentatonic, blues and CAGED shapes on a fretboard.
   Loaded after the main script, so it shares store, h(), audio(), OUT, pluck(), tick() and STRINGS. */

/* ---------- keys and note names ---------- */
const SHARP_N=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const FLAT_N=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const BKEYS=[4,5,6,7,8,9,10,11,0,1,2,3];            // E first: the guitar's home key
const FLAT_KEYS=new Set([5,10,3,8,1]);               // F, B♭, E♭, A♭, D♭
const pcName=(pc,key)=>(FLAT_KEYS.has(key)?FLAT_N:SHARP_N)[((pc%12)+12)%12];
const INT_N={0:'R',1:'♭2',2:'2',3:'♭3',4:'3',5:'4',6:'♭5',7:'5',8:'♭6',9:'6',10:'♭7',11:'7'};

/* ---------- the form ----------
   Chords as steps above the key: 0 = I, 5 = IV, 7 = V. Bar 12 is the turnaround (V). */
const FORM=[0,0,0,0,5,5,0,0,7,5,0,7], QUICK=[0,5,0,0,5,5,0,0,7,5,0,7];
const B={key:store.get('bkey',9),bpm:store.get('btempo',92),feel:store.get('bfeel','shuffle'),quick:store.get('bquick',false),
  scale:store.get('bscale','minor'),shapes:store.get('bshapes',[]),lab:store.get('blab','int'),tones:store.get('btones',true)};
B.shapesOn=store.get('bshapesOn',B.shapes.length>0); // the Shapes button only shows or hides the shape buttons
const activeShapes=()=>B.shapes;                      // picks stay highlighted either way
const form=()=>B.quick?QUICK:FORM;
// Which chord's tones to show (steps above the key): a tapped chord, else the one playing, else none.
B.preview=null;
const toneStep=()=>!B.tones?null:B.preview!==null?B.preview:bp.on&&bp.bar>=0?form()[bp.bar]:null;
const chordName=bar=>pcName(B.key+form()[bar],B.key)+'7';

/* ---------- sounds ---------- */
let NOISE=null;
function noise(c){if(!NOISE){NOISE=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}return NOISE;}
function env(c,at,peak,decay){const g=c.createGain();g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(peak,at+.003);g.gain.exponentialRampToValueAtTime(.0001,at+decay);g.connect(OUT);return g;}
function kick(at){const c=AC,o=c.createOscillator(),g=env(c,at,.9,.32);o.frequency.setValueAtTime(140,at);o.frequency.exponentialRampToValueAtTime(45,at+.12);o.connect(g);o.start(at);o.stop(at+.35);}
function snare(at){const c=AC,n=c.createBufferSource(),f=c.createBiquadFilter(),g=env(c,at,.45,.18);
  n.buffer=noise(c);f.type='bandpass';f.frequency.value=1900;f.Q.value=.7;n.connect(f);f.connect(g);n.start(at,Math.random()*.5);n.stop(at+.2);
  const o=c.createOscillator(),g2=env(c,at,.25,.09);o.frequency.value=185;o.connect(g2);o.start(at);o.stop(at+.1);}
function hat(at,vol=.16){const c=AC,n=c.createBufferSource(),f=c.createBiquadFilter(),g=env(c,at,vol,.05);
  n.buffer=noise(c);f.type='highpass';f.frequency.value=7000;n.connect(f);f.connect(g);n.start(at,Math.random()*.5);n.stop(at+.06);}
// Bass: a round, quiet triangle tone (not a buzzy sawtooth), sitting under the drums and guitar.
function bass(midi,at,dur){const c=AC,o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();
  o.type='triangle';o.frequency.value=440*Math.pow(2,(midi-69)/12);f.type='lowpass';f.frequency.value=420;f.Q.value=.7;
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.3,at+.012);g.gain.exponentialRampToValueAtTime(.16,at+dur*.6);g.gain.exponentialRampToValueAtTime(.0001,at+dur);
  o.connect(f);f.connect(g);g.connect(OUT);o.start(at);o.stop(at+dur+.02);}
// Organ: a soft drawbar-style tone (fundamental + octave, a touch of the 3rd harmonic) with a slight wobble.
// Voicing: the chord's 3rd, 5th and ♭7, built on a root between C3 and B3. (A 9th and stronger upper
// partials sounded out of tune to David, as did a deeper wobble.)
function organ(pc,at,dur){
  const c=AC,root=48+((pc%12)+12)%12,end=at+dur;
  const g=c.createGain(),trem=c.createGain(),f=c.createBiquadFilter(),lfo=c.createOscillator(),depth=c.createGain();
  f.type='lowpass';f.frequency.value=2600;
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.03,at+.02);g.gain.setValueAtTime(.03,end-.06);g.gain.linearRampToValueAtTime(0,end);
  lfo.frequency.value=4.5;depth.gain.value=.06;trem.gain.value=1;lfo.connect(depth);depth.connect(trem.gain); // the wobble
  trem.connect(g);g.connect(f);f.connect(OUT);lfo.start(at);lfo.stop(end+.05);
  [4,7,10].forEach(iv=>{const fr=440*Math.pow(2,(root+iv-69)/12);
    [[1,1],[2,.4],[3,.08]].forEach(([h,a])=>{const o=c.createOscillator(),og=c.createGain();
      o.frequency.value=fr*h;og.gain.value=a;o.connect(og);og.connect(trem);o.start(at);o.stop(end+.05);});});
  live.add(g);setTimeout(()=>live.delete(g),(end-c.currentTime+.5)*1000); // so Stop fades it out
}

/* ---------- playback ---------- */
const bp={on:false,start:0,spb:.6,next:0,timer:0,raf:0,bar:-1};
const BCOUNT=4; // count-in beats
const bplay=document.getElementById('bplay'),bstatus=document.getElementById('bstatus');
// When in the beat each 8th note lands: swung (2/3 of the way) or straight (halfway).
const off8=()=>B.feel==='shuffle'?2/3:1/2;
// Boogie bass: root, 3, 5, 6, ♭7, 6, 5, 3 in 8th notes.
const BOOGIE=[0,4,7,9,10,9,7,4];
function bschedule(){
  const c=AC;
  while(bp.start+bp.next*bp.spb<c.currentTime+.25){
    const b=bp.next,at=bp.start+b*bp.spb,at2=at+off8()*bp.spb;
    if(b<BCOUNT){tick(at,b===0);}
    else{
      const k=b-BCOUNT,bar=Math.floor(k/4)%12,beat=k%4,step=form()[bar],pc=(B.key+step)%12;
      const root=28+((pc-4)%12+12)%12;                 // bass root between low E and D♯
      if(beat===0||beat===2)kick(at); else snare(at);
      hat(at,.16);hat(at2,.1);
      bass(root+BOOGIE[beat*2],at,off8()*bp.spb*.95);bass(root+BOOGIE[beat*2+1],at2,(1-off8())*bp.spb*.95);
      // Organ: a short chord on 1, then a push on the "and" of 2.
      if(beat===0)organ(pc,at,bp.spb*.8);
      if(beat===1)organ(pc,at2,bp.spb*1.25);
    }
    bp.next++;
  }
}
function bframe(){
  if(!bp.on)return;
  const beat=Math.floor((AC.currentTime-bp.start)/bp.spb);
  if(beat<BCOUNT){bstatus.textContent=beat>=0?`Count-in: ${beat+1}`:'';}
  else{const bar=Math.floor((beat-BCOUNT)/4)%12;if(bar!==bp.bar){bp.bar=bar;showBar();}}
  bp.raf=requestAnimationFrame(bframe);
}
function showBar(){
  bstatus.textContent=bp.bar>=0?`Bar ${bp.bar+1} of 12 · ${chordName(bp.bar)}`:'';
  drawChips();drawBoard();
}
function bstart(){
  const c=audio();if(!c)return;
  if(typeof player!=='undefined'&&player.on)stop(); // the reading player
  bp.on=true;bp.spb=60/B.bpm;bp.start=c.currentTime+.15;bp.next=0;bp.bar=-1;
  bschedule();bp.timer=setInterval(bschedule,40);bp.raf=requestAnimationFrame(bframe);
  bplay.querySelector('span').textContent='Stop';bplay.querySelector('path').setAttribute('d','M3 3h10v10H3z');
}
function bstop(){
  bp.on=false;clearInterval(bp.timer);cancelAnimationFrame(bp.raf);hush();bp.bar=-1;showBar();
  bplay.querySelector('span').textContent='Play';bplay.querySelector('path').setAttribute('d','M3 1.5v13l11-6.5z');
}
bplay.onclick=()=>bp.on?bstop():bstart();

/* ---------- scales and shapes ----------
   Pentatonic shapes are the five 2-notes-per-string boxes. Box n starts on the n-th scale note on the low E
   string and takes the next two scale notes on each string up. Each is named for the CAGED chord shape it
   sits around, found from which strings its roots are on.
   Full major and minor scale shapes are the matching pentatonic box plus the two missing notes in the same
   position (4 and 7 for major, 2 and ♭6 for minor), each placed once, on the string where it falls inside
   the box (or one fret outside it, preferring the index finger's reach back). */
const SCALES={
  minor:{name:'Minor pentatonic',iv:[0,3,5,7,10]},
  blues:{name:'Blues scale',iv:[0,3,5,6,7,10],base:'minor',extra:6},
  minorScale:{name:'Minor scale',iv:[0,2,3,5,7,8,10],base:'minor',add:[2,8]},
  major:{name:'Major pentatonic',iv:[0,2,4,7,9]},
  majorScale:{name:'Major scale',iv:[0,2,4,5,7,9,11],base:'major',add:[5,11]},
  caged:{name:'CAGED chords',iv:[0,4,7]},
};
const LAST=17; // frets shown
const ROOT_STRINGS={E:'0,2,5',D:'2,4',C:'1,4',A:'1,3',G:'0,3,5'};
// Open-position shapes, low E string first (null = not played), and the note each is built on.
const CAGED={C:{f:[null,3,2,0,1,0],pc:0},A:{f:[null,0,2,2,2,0],pc:9},G:{f:[3,2,0,0,0,3],pc:7},E:{f:[0,2,2,1,0,0],pc:4},D:{f:[null,null,0,2,3,2],pc:2}};
const pcAt=(s,f)=>(STRINGS[s]+f)%12;
// Move a shape by octaves so it shows on frets 0–17 (both copies if it fits twice).
function placements(notes){
  const out=[];
  for(const sh of [-24,-12,0,12,24]){const n=notes.map(p=>({s:p.s,f:p.f+sh}));if(n.every(p=>p.f>=0&&p.f<=LAST))out.push(n);}
  return out;
}
function shapes(){
  const key=B.key,sc=SCALES[B.scale];
  if(B.scale==='caged'){
    return Object.entries(CAGED).map(([L,t])=>{const sh=((key-t.pc)%12+12)%12;
      return {name:L,notes:t.f.map((f,s)=>f===null?null:{s,f:f+sh}).filter(Boolean)};});
  }
  const iv=SCALES[sc.base||B.scale].iv, pcs=iv.map(i=>(key+i)%12);
  const pitches=[];for(let m=40;m<130;m++)if(pcs.includes(m%12))pitches.push(m);
  return iv.map((_,k)=>{
    const f0=((pcs[k]-STRINGS[0])%12+12)%12, i0=pitches.indexOf(STRINGS[0]+f0);
    let notes=[];for(let s=0;s<6;s++)for(let j=0;j<2;j++){const m=pitches[i0+2*s+j];notes.push({s,f:m-STRINGS[s]});}
    if(Math.min(...notes.map(p=>p.f))<0)notes=notes.map(p=>({s:p.s,f:p.f+12})); // keep it on the neck before filling in
    const rootStr=[...new Set(notes.filter(p=>pcAt(p.s,p.f)===key).map(p=>p.s))].sort().join(',');
    const name=Object.keys(ROOT_STRINGS).find(L=>ROOT_STRINGS[L]===rootStr)||`Shape ${k+1}`;
    if(sc.add){ // full scale: fill in the missing notes, each pitch once
      const lo=Math.min(...notes.map(p=>p.f)),hi=Math.max(...notes.map(p=>p.f));
      const ps=notes.map(p=>STRINGS[p.s]+p.f),minP=Math.min(...ps),maxP=Math.max(...ps),want=sc.add.map(i=>(key+i)%12);
      for(let m=minP-2;m<=maxP+2;m++){ // a little past the box's ends too (e.g. the 7 under the root)
        if(!want.includes(m%12))continue;
        let best=null,bd=9;
        for(let st=0;st<6;st++){const f=m-STRINGS[st];if(f<0||f<lo-1||f>hi+1)continue;
          const d=f<lo?lo-f-.1:f>hi?f-hi:0;if(d<bd){bd=d;best={s:st,f};}} // reaching back beats reaching up
        if(best)notes.push(best);
      }
    }
    if(sc.extra!==undefined){ // blues: add the ♭5 wherever it falls inside the box
      const lo=Math.min(...notes.map(p=>p.f)),hi=Math.max(...notes.map(p=>p.f)),b5=(key+sc.extra)%12;
      for(let s=0;s<6;s++)for(let f=lo;f<=hi;f++)if(pcAt(s,f)===b5)notes.push({s,f});
    }
    return {name,notes};
  });
}
// Shapes in order up the neck, each with every place it shows on frets 0–17.
function placedShapes(){
  return shapes().map(sh=>({name:sh.name,places:placements(sh.notes)})).filter(x=>x.places.length)
    .sort((a,b)=>Math.min(...a.places[0].map(p=>p.f))-Math.min(...b.places[0].map(p=>p.f)));
}

/* ---------- fretboard drawing ---------- */
const fb=document.getElementById('fb');
const NUT=46,FW=50,TOP=22,GAP=24,W=NUT+LAST*FW+14,H=TOP+5*GAP+38;
const fx=f=>f===0?NUT-20:NUT+(f-.5)*FW, sy=s=>TOP+(5-s)*GAP;
function drawBoard(){
  const key=B.key,sc=SCALES[B.scale],placed=placedShapes();
  const sel=placed.filter(x=>activeShapes().includes(x.name)), any=sel.length>0; // chosen shapes (none = all)
  const step=toneStep(), tones=step===null?null:[0,4,7,10].map(i=>(key+step+i)%12);
  let svg=`<rect class="wood" x="${NUT}" y="${TOP-10}" width="${LAST*FW}" height="${5*GAP+20}" rx="3"/>`;
  // The chosen shapes' areas, under the fret lines so those still show
  sel.forEach(x=>x.places.forEach(pl=>{const fr=pl.map(p=>p.f),lo=Math.min(...fr),hi=Math.max(...fr);
    const x1=lo===0?NUT-34:NUT+(lo-1)*FW+4,x2=NUT+hi*FW-4;
    svg+=`<rect class="region" x="${x1}" y="${TOP-12}" width="${x2-x1}" height="${5*GAP+24}" rx="10"/>`;}));
  [3,5,7,9,15,17].forEach(f=>{svg+=`<circle class="inlay" cx="${fx(f)}" cy="${TOP+2.5*GAP}" r="5"/>`;});
  svg+=`<circle class="inlay" cx="${fx(12)}" cy="${TOP+1.5*GAP}" r="5"/><circle class="inlay" cx="${fx(12)}" cy="${TOP+3.5*GAP}" r="5"/>`;
  for(let f=1;f<=LAST;f++)svg+=`<line class="fret" x1="${NUT+f*FW}" x2="${NUT+f*FW}" y1="${TOP-10}" y2="${TOP+5*GAP+10}"/>`;
  [3,5,7,9,12,15,17].forEach(f=>{svg+=`<text class="fnum" x="${fx(f)}" y="${TOP+5*GAP+30}">${f}</text>`;});
  svg+=`<rect class="nut" x="${NUT-4}" y="${TOP-10}" width="5" height="${5*GAP+20}"/>`;
  for(let s=0;s<6;s++)svg+=`<line class="str" x1="${NUT-34}" x2="${NUT+LAST*FW}" y1="${sy(s)}" y2="${sy(s)}" stroke-width="${1+s*.35}"/>`;
  // Dots: every note of the scale (or of all five chord shapes), with the chosen shapes bright.
  const on=new Set(), all=new Map();
  placed.forEach(x=>x.places.forEach(pl=>pl.forEach(p=>{all.set(p.s+','+p.f,p);if(sel.includes(x))on.add(p.s+','+p.f);})));
  if(B.scale!=='caged'){const iv=sc.iv.map(i=>(key+i)%12);for(let s=0;s<6;s++)for(let f=0;f<=LAST;f++)if(iv.includes(pcAt(s,f)))all.set(s+','+f,{s,f});}
  all.forEach(p=>{
    const pc=pcAt(p.s,p.f),iv=((pc-key)%12+12)%12;
    const cls=['dot',iv===0?'root':'',sc.extra!==undefined&&iv===sc.extra?'blue':'',any&&!on.has(p.s+','+p.f)?'dim':''].join(' ');
    const label=B.lab==='int'?INT_N[iv]:pcName(pc,key);
    svg+=`<g class="${cls}" data-s="${p.s}" data-f="${p.f}"><circle cx="${fx(p.f)}" cy="${sy(p.s)}" r="10.5"/><text x="${fx(p.f)}" y="${sy(p.s)+.5}">${label}</text></g>`;
    if(tones&&tones.includes(pc)&&!(any&&!on.has(p.s+','+p.f)))svg+=`<circle class="ring" cx="${fx(p.f)}" cy="${sy(p.s)}" r="14"/>`;
  });
  // Chord tones the scale doesn't have (like the IV chord's major 3rd over minor pentatonic): hollow blue dots,
  // labeled by their job in the chord. Only with Chord tones on, for a tapped chord or the one playing,
  // and only inside the chosen shapes (or anywhere with All shapes).
  if(tones){
    const cr=(key+step)%12, inScale=sc.iv.map(i=>(key+i)%12), JOB={0:'R',4:'3',7:'5',10:'♭7'};
    const areas=any?sel.flatMap(x=>x.places.map(pl=>[Math.min(...pl.map(p=>p.f)),Math.max(...pl.map(p=>p.f))])):[[0,LAST]];
    for(let s=0;s<6;s++)for(let f=0;f<=LAST;f++){
      const pc=pcAt(s,f);if(!tones.includes(pc)||inScale.includes(pc)||!areas.some(([a,b])=>f>=a&&f<=b))continue;
      const label=B.lab==='int'?JOB[((pc-cr)%12+12)%12]:pcName(pc,key);
      svg+=`<g class="dot extra" data-s="${s}" data-f="${f}"><circle cx="${fx(f)}" cy="${sy(s)}" r="10.5"/><text x="${fx(f)}" y="${sy(s)+.5}">${label}</text></g>`;
    }
  }
  fb.setAttribute('viewBox',`0 0 ${W} ${H}`);fb.innerHTML=svg;
}
// On a narrow screen the fretboard scrolls sideways: bring the chosen shape into view.
function scrollToShape(){
  const r=fb.querySelector('.region'),wrap=fb.parentElement;if(!r||wrap.scrollWidth<=wrap.clientWidth)return;
  const k=fb.clientWidth/W;wrap.scrollLeft=Math.max(0,+r.getAttribute('x')*k-16);
}
fb.addEventListener('click',e=>{const g=e.target.closest('.dot');if(!g)return;
  pluck(440*Math.pow(2,(STRINGS[+g.dataset.s]+ +g.dataset.f-12-69)/12),{dur:1.6});});

/* ---------- controls ---------- */
const keySelect=document.getElementById('bkey');
keySelect.innerHTML=BKEYS.map(k=>`<option value="${k}">${pcName(k,k)}</option>`).join('');
keySelect.value=B.key;
keySelect.onchange=()=>{B.key=+keySelect.value;store.set('bkey',B.key);drawShapes();drawChips();drawBoard();scrollToShape();describeImprov();};
const bt=document.getElementById('btempo'),btv=document.getElementById('btempo-val');
bt.value=B.bpm;btv.textContent=B.bpm+' bpm';
bt.oninput=()=>{const nb=+bt.value;btv.textContent=nb+' bpm';
  if(bp.on){const now=AC.currentTime,pos=(now-bp.start)/bp.spb,spb=60/nb;bp.start=now-pos*spb;bp.spb=spb;}
  B.bpm=nb;store.set('btempo',nb);describeImprov();};
function pressAll(){
  document.getElementById('bfeel').value=B.feel;
  document.getElementById('bscale').value=B.scale;
  document.getElementById('blab').setAttribute('aria-pressed',B.lab==='note');
  document.getElementById('bshapes').setAttribute('aria-pressed',B.shapesOn);const sh=document.getElementById('bshape');sh.classList.toggle('off',!B.shapesOn);sh.setAttribute('aria-hidden',!B.shapesOn); // invisible but still takes its space, so nothing jumps
  document.querySelectorAll('#bshape [data-sh]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.sh==='all'?!B.shapes.length:B.shapes.includes(b.dataset.sh)));
  document.getElementById('bquick').setAttribute('aria-pressed',B.quick);
  document.getElementById('btones').setAttribute('aria-pressed',B.tones);
}
document.getElementById('bscale').innerHTML=Object.entries(SCALES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');
document.getElementById('bscale').onchange=e=>{B.scale=e.target.value;store.set('bscale',B.scale);drawShapes();drawBoard();scrollToShape();};
document.getElementById('bfeel').onchange=e=>{B.feel=e.target.value;store.set('bfeel',B.feel);describeImprov();};
function drawShapes(){
  const names=placedShapes().map(x=>x.name);
  B.shapes=B.shapes.filter(n=>names.includes(n));
  document.getElementById('bshape').innerHTML=`<button type="button" class="btn" data-sh="all">All</button>`+names.map(n=>`<button type="button" class="btn" data-sh="${n}" title="${n} shape">${n}</button>`).join('');
  pressAll();
}
document.getElementById('improv-view').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(b.id==='blab'){B.lab=B.lab==='note'?'int':'note';store.set('blab',B.lab);}
  else if(b.id==='bshapes'){B.shapesOn=!B.shapesOn;store.set('bshapesOn',B.shapesOn);}
  else if(d.sh){B.shapes=d.sh==='all'?[]:B.shapes.includes(d.sh)?B.shapes.filter(n=>n!==d.sh):[...B.shapes,d.sh];store.set('bshapes',B.shapes);}
  else if(b.id==='bquick'){B.quick=!B.quick;store.set('bquick',B.quick);}
  else if(b.id==='btones'){B.tones=!B.tones;store.set('btones',B.tones);if(!B.tones)B.preview=null;drawChips();}
  else if(d.chip!==undefined){const st=+d.chip;B.preview=B.preview===st?null:st;drawChips();}
  else return;
  pressAll();drawBoard();if(d.sh||b.id==='bshapes')scrollToShape();describeImprov();
});
// The I, IV and V chords beside Chord tones: tap one to see its tones; the one playing is outlined.
function drawChips(){
  const el=document.getElementById('bchips');el.classList.toggle('off',!B.tones);el.setAttribute('aria-hidden',!B.tones);
  const now=bp.on&&bp.bar>=0?form()[bp.bar]:null;
  el.innerHTML=[0,5,7].map(st=>`<button type="button" class="btn chip${st===now?' now':''}" data-chip="${st}" aria-pressed="${B.preview===st}" title="Show the tones of ${pcName(B.key+st,B.key)}7">${pcName(B.key+st,B.key)}7</button>`).join('');
}
function describeImprov(){
  if(document.getElementById('improv-view').hidden)return;
  document.getElementById('subtitle').textContent=`12-bar blues in ${pcName(B.key,B.key)} · ${B.bpm} bpm · ${B.feel==='shuffle'?'Shuffle':'Straight'}${B.quick?' · Quick change':''}`;
}

/* ---------- Read | Improv | Drill ---------- */
const TAGLINES={read:'Guitar Sight-Reading Generator',improv:'Guitar Improv Practice',drill:'Guitar Drills'};
function showView(v){
  if(!TAGLINES[v])v='read';
  for(const k of Object.keys(TAGLINES))document.getElementById(k+'-view').hidden=k!==v;
  document.querySelectorAll('.views [data-view]').forEach(b=>{b.setAttribute('aria-selected',b.dataset.view===v);b.setAttribute('aria-pressed',b.dataset.view===v);});
  document.querySelector('.tagline').textContent=TAGLINES[v];
  store.set('view',v);
  // Only one thing plays at a time.
  if(v!=='read'&&player.on)stop();
  if(v!=='improv'&&bp.on)bstop();
  if(v!=='drill'&&typeof dstop==='function')dstop();
  if(v==='read')describe();else if(v==='improv')describeImprov();else if(typeof describeDrill==='function')describeDrill();
  history.replaceState(null,'',v==='read'?location.pathname+location.search:'#'+v); // #improv / #drill link straight there
}
document.querySelector('.views').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)showView(b.dataset.view);});
document.addEventListener('keydown',e=>{
  if(document.getElementById('improv-view').hidden)return;
  if(e.metaKey||e.ctrlKey||e.altKey||document.querySelector('.tmodal:not([hidden])'))return;
  if(e.target.closest('input,select,textarea'))return;
  if(e.key===' '){e.preventDefault();bp.on?bstop():bstart();}
});

drawShapes();drawChips();drawBoard();
// The first view is shown at the end of drill.js, once every section is set up.
