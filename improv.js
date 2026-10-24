/* Improv: a 12-bar blues backing track in any key, with pentatonic, blues and CAGED shapes on a fretboard.
   Loaded after the main script, so it shares store, h(), audio(), OUT, pluck(), tick() and STRINGS. */

/* ---------- keys and note names ---------- */
const SHARP_N=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const FLAT_N=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const BKEYS=[4,5,6,7,8,9,10,11,0,1,2,3];            // E first: the guitar's home key
const FLAT_KEYS=new Set([5,10,3,8,1]);               // F, B♭, E♭, A♭, D♭
const pcName=(pc,key)=>(FLAT_KEYS.has(key)?FLAT_N:SHARP_N)[((pc%12)+12)%12];
// Scale notes are spelled from the root's letter, one letter per step (C minor: C D E♭ F G A♭ B♭, never A♯).
// The root is the key's own name unless the other spelling needs fewer sharps and flats for this scale
// (A♭ minor would need C♭ and F♭, so the minor scales in that key are spelled from G♯).
const LETTER_ROW='CDEFGAB', LETTER_STEP=[0,1,1,2,2,3,4,4,5,5,6,6], NAT_PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function nameFrom(root,iv,step=LETTER_STEP[((iv%12)+12)%12]){
  const L=LETTER_ROW[(LETTER_ROW.indexOf(root[0])+step)%7];
  const pc=(NAT_PC[root[0]]+(root.match(/♯/g)||[]).length-(root.match(/♭/g)||[]).length+iv+120)%12;
  let d=((pc-NAT_PC[L])%12+12)%12;if(d>6)d-=12;
  const name=L+(d>0?'♯':d<0?'♭':'');
  // The blues note is the ♭5, or the ♯4 when ♭5 would be C♭, F♭ or a double flat (F blues: B, E♭ blues: A).
  if(iv===6&&step===4&&(Math.abs(d)>1||name==='C♭'||name==='F♭'))return nameFrom(root,iv,3);
  if(Math.abs(d)>1)return(root.includes('♯')?SHARP_N:FLAT_N)[pc]; // never a double sharp or flat
  return name;
}
const accidentals=(root,ivs)=>ivs.reduce((n,i)=>n+nameFrom(root,i).length-1,0);
function scaleRoot(){
  const key=B.key,minorish=['minor','blues','minorScale'].includes(B.scale),parent=B.scale==='modes'?MODES[B.mode].iv:minorish?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];
  const first=pcName(key,key),other=(FLAT_KEYS.has(key)?SHARP_N:FLAT_N)[key];
  return accidentals(other,parent)<accidentals(first,parent)?other:first;
}
const INT_N={0:'R',1:'♭2',2:'2',3:'♭3',4:'3',5:'4',6:'♭5',7:'5',8:'♭6',9:'6',10:'♭7',11:'7'};
/* ---------- modes ----------
   Each mode's shapes are a 5-note box from the mode plus its two other notes, like the major and minor scale
   shapes. "color" is the note that gives the mode its sound (ringed on the fretboard); "triad" is its home chord. */
const MODES={
  ionian:{name:'Ionian',short:'Ion',iv:[0,2,4,5,7,9,11],base:[0,2,4,7,9],add:[5,11],color:11,triad:[0,4,7]},
  dorian:{name:'Dorian',short:'Dor',iv:[0,2,3,5,7,9,10],base:[0,3,5,7,10],add:[2,9],color:9,triad:[0,3,7]},
  phrygian:{name:'Phrygian',short:'Phr',iv:[0,1,3,5,7,8,10],base:[0,3,5,7,10],add:[1,8],color:1,triad:[0,3,7]},
  lydian:{name:'Lydian',short:'Lyd',iv:[0,2,4,6,7,9,11],base:[0,2,4,7,9],add:[6,11],color:6,triad:[0,4,7]},
  mixolydian:{name:'Mixolydian',short:'Mix',iv:[0,2,4,5,7,9,10],base:[0,2,4,7,9],add:[5,10],color:10,triad:[0,4,7]},
  aeolian:{name:'Aeolian',short:'Aeo',iv:[0,2,3,5,7,8,10],base:[0,3,5,7,10],add:[2,8],color:8,triad:[0,3,7]},
  locrian:{name:'Locrian',short:'Loc',iv:[0,1,3,5,6,8,10],base:[0,3,5,8,10],add:[1,6],color:6,triad:[0,3,6]},
};
const curScale=()=>B.scale==='modes'?MODES[B.mode]:SCALES[B.scale];
// Lydian's raised 4th is a ♯4 (F♯ in C), not a ♭5.
const sharp4=()=>B.scale==='modes'&&B.mode==='lydian';
const ivLabel=iv=>iv===6&&sharp4()?'♯4':INT_N[iv];
const ivName=(root,iv)=>iv===6&&sharp4()?nameFrom(root,6,3):nameFrom(root,iv);

/* ---------- the form ----------
   Chords as steps above the key: 0 = I, 5 = IV, 7 = V. Bar 12 is the turnaround (V). */
const FORM=[0,0,0,0,5,5,0,0,7,5,0,7], QUICK=[0,5,0,0,5,5,0,0,7,5,0,7];
// Major: a two-bar loop, one bar on the I chord and one on the IV (David), same drums, bass and organ.
const MAJOR=[0,5];
const isMajor=()=>B.track==='major';
const B={key:store.get('bkey',9),bpm:store.get('btempo',92),feel:store.get('bfeel','shuffle'),quick:store.get('bquick',false),
  scale:store.get('bscale','minor'),shapes:store.get('bshapes',[]),lab:store.get('blab','int'),tones:store.get('btones',true),
  mode:store.get('bmode','dorian'),track:store.get('btrack','blues'),
  licksOn:store.get('blicksOn',false),lick:store.get('blick',null),slow:store.get('blslow',false)};
if(!MODES[B.mode])B.mode='dorian';
B.shapesOn=store.get('bshapesOn',B.shapes.length>0); // the Shapes button only shows or hides the shape buttons
const activeShapes=()=>B.shapes;                      // picks stay highlighted either way
const form=()=>isMajor()?MAJOR:B.quick?QUICK:FORM;
// Which chord's tones to show (steps above the key): a tapped chord, else the one playing, else none.
B.preview=null;
const tonesOn=()=>B.tones&&B.scale!=='modes';  // Chord tones is greyed out for Modes (for now)
const toneStep=()=>!tonesOn()?null:B.preview!==null?B.preview:bp.on&&bp.bar>=0?form()[bp.bar]:null;
const chordName=bar=>pcName(B.key+form()[bar],B.key)+(isMajor()?'':'7');

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
function organ(pc,at,dur,ivs=[4,7,10]){
  const c=AC,root=48+((pc%12)+12)%12,end=at+dur;
  const g=c.createGain(),trem=c.createGain(),f=c.createBiquadFilter(),lfo=c.createOscillator(),depth=c.createGain();
  f.type='lowpass';f.frequency.value=2600;
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.03,at+.02);g.gain.setValueAtTime(.03,end-.06);g.gain.linearRampToValueAtTime(0,end);
  lfo.frequency.value=4.5;depth.gain.value=.06;trem.gain.value=1;lfo.connect(depth);depth.connect(trem.gain); // the wobble
  trem.connect(g);g.connect(f);f.connect(OUT);lfo.start(at);lfo.stop(end+.05);
  ivs.forEach(iv=>{const fr=440*Math.pow(2,(root+iv-69)/12);
    [[1,1],[2,.4],[3,.08]].forEach(([h,a])=>{const o=c.createOscillator(),og=c.createGain();
      o.frequency.value=fr*h;og.gain.value=a;o.connect(og);og.connect(trem);o.start(at);o.stop(end+.05);});});
  live.add(g);setTimeout(()=>live.delete(g),(end-c.currentTime+.5)*1000); // so Stop fades it out
}

/* ---------- drone ----------
   A soft pad on the root and 5th (root and octave for Locrian, whose 5th is flat), slowly swelling, for as
   long as it plays. Changing key retunes it. */
const droneTriad=()=>B.scale==='modes'?MODES[B.mode].triad:['minor','blues','minorScale'].includes(B.scale)?[0,3,7]:[0,4,7];
const droneIv=()=>B.scale==='modes'&&B.mode==='locrian'?[0,12,24]:[0,7,12];
let DRONE=null;
function droneStart(){
  const c=AC,g=c.createGain(),f=c.createBiquadFilter(),lfo=c.createOscillator(),depth=c.createGain();
  f.type='lowpass';f.frequency.value=900;
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.09,c.currentTime+1.2);
  lfo.frequency.value=.12;depth.gain.value=.025;lfo.connect(depth);depth.connect(g.gain);lfo.start();
  g.connect(f);f.connect(OUT);
  const oscs=[];
  droneIv().forEach((iv,i)=>[['sine',1],['triangle',.35]].forEach(([type,a])=>{
    const o=c.createOscillator(),og=c.createGain();o.type=type;og.gain.value=a*(i===0?1:.6);
    o.connect(og);og.connect(g);o.start();oscs.push({o,iv});}));
  DRONE={g,oscs,lfo};droneTune();live.add(g);
}
function droneTune(){
  if(!DRONE)return;const base=40+((B.key-4)%12+12)%12;   // root between low E and D♯
  const ivs=droneIv();
  DRONE.oscs.forEach((x,n)=>x.o.frequency.setTargetAtTime(440*Math.pow(2,(base+ivs[Math.floor(n/2)]-69)/12),AC.currentTime,.05));
}
function droneRevoice(){droneStop();droneStart();}
function droneStop(){
  if(!DRONE)return;const d=DRONE,t=AC.currentTime;DRONE=null;
  d.g.gain.cancelScheduledValues(t);d.g.gain.setTargetAtTime(0,t,.25);
  setTimeout(()=>{d.oscs.forEach(x=>x.o.stop());d.lfo.stop();live.delete(d.g);},1500);
}

/* ---------- playback ---------- */
const bp={on:false,start:0,spb:.6,next:0,timer:0,raf:0,bar:-1};
const lp={on:false,start:0,beat:.6,times:[],raf:0,bus:null,cur:-1}; // a lick playing (see licks below)
const BCOUNT=4; // count-in beats
const bplay=document.getElementById('bplay'),bstatus=Object.assign(document.createElement('span'),{id:'bstatus'}); // count-in / bar / drone, shown in the subtitle (describeImprov)
// When in the beat each 8th note lands: swung (2/3 of the way) or straight (halfway).
const off8=()=>B.feel==='shuffle'?2/3:1/2;
// Boogie bass: root, 3, 5, 6, ♭7, 6, 5, 3 in 8th notes.
const BOOGIE=[0,4,7,9,10,9,7,4];
// Over the major track the line goes up to the octave instead of the ♭7: root, 3, 5, 6, 8, 6, 5, 3.
const BOOGIE_MAJ=[0,4,7,9,12,9,7,4];
function bschedule(){
  const c=AC;
  while(bp.start+bp.next*bp.spb<c.currentTime+.25){
    const b=bp.next,at=bp.start+b*bp.spb,at2=at+off8()*bp.spb;
    if(b<BCOUNT){tick(at,b===0);}
    else{
      const k=b-BCOUNT,bar=Math.floor(k/4)%form().length,beat=k%4,step=form()[bar],pc=(B.key+step)%12;
      const root=28+((pc-4)%12+12)%12;                 // bass root between low E and D♯
      if(beat===0||beat===2)kick(at); else snare(at);
      hat(at,.16);hat(at2,.1);
      const line=isMajor()?BOOGIE_MAJ:BOOGIE,voice=isMajor()?[4,7,12]:[4,7,10];   // major: 3, 5 and octave on the organ
      bass(root+line[beat*2],at,off8()*bp.spb*.95);bass(root+line[beat*2+1],at2,(1-off8())*bp.spb*.95);
      // Organ: a short chord on 1, then a push on the "and" of 2.
      if(beat===0)organ(pc,at,bp.spb*.8,voice);
      if(beat===1)organ(pc,at2,bp.spb*1.25,voice);
    }
    bp.next++;
  }
}
function bframe(){
  if(!bp.on)return;
  const beat=Math.floor((AC.currentTime-bp.start)/bp.spb);
  if(beat<BCOUNT){bstatus.textContent=beat>=0?`Count-in: ${beat+1}`:'';}
  else{const bar=Math.floor((beat-BCOUNT)/4)%form().length;if(bar!==bp.bar){bp.bar=bar;showBar();}}
  bp.raf=requestAnimationFrame(bframe);
}
function showBar(){
  if(B.track==='drone'){bstatus.textContent='';drawChips();drawBoard();return;}
  bstatus.textContent=bp.bar>=0?`Bar ${bp.bar+1} of ${form().length} · ${chordName(bp.bar)}`:'';
  drawChips();drawBoard();
}
function bstart(){
  const c=audio();if(!c)return;
  if(typeof player!=='undefined'&&player.on)stop(); // the reading player
  if(B.track==='drone'){bp.on=true;droneStart();bstatus.textContent='';  // the subtitle already says Drone on …
    bplay.querySelector('span').textContent='Stop';bplay.querySelector('path').setAttribute('d','M3 3h10v10H3z');drawBoard();return;}
  bp.on=true;bp.spb=60/B.bpm;bp.start=c.currentTime+.15;bp.next=0;bp.bar=-1;
  bschedule();bp.timer=setInterval(bschedule,40);bp.raf=requestAnimationFrame(bframe);
  bplay.querySelector('span').textContent='Stop';bplay.querySelector('path').setAttribute('d','M3 3h10v10H3z');
}
function bstop(){
  lstop();bp.on=false;clearInterval(bp.timer);cancelAnimationFrame(bp.raf);droneStop();hush();bp.bar=-1;showBar();
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
  modes:{name:'Modes'},   // the mode itself is picked with the buttons below the scale list (MODES)
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
  const key=B.key,sc=curScale();
  if(B.scale==='caged'){
    return Object.entries(CAGED).map(([L,t])=>{const sh=((key-t.pc)%12+12)%12;
      return {name:L,notes:t.f.map((f,s)=>f===null?null:{s,f:f+sh}).filter(Boolean)};});
  }
  const iv=Array.isArray(sc.base)?sc.base:SCALES[sc.base||B.scale].iv, pcs=iv.map(i=>(key+i)%12);
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

/* ---------- licks ----------
   Licks (licks.js) are written in A and moved to the key picked. With Licks on, the picked lick's notes show on the
   fretboard, labelled like the scale (intervals or note names), and the rest of the scale fades; the lick itself is
   written out under the fretboard in notation and tab. Minor licks show with the minor scales, major licks with the
   major ones (none for Modes or CAGED, so Licks is greyed out there). */
const LICK_FAMILY={minor:'minor',blues:'minor',minorScale:'minor',major:'major',majorScale:'major'};
const STR_OF={E:0,A:1,D:2,G:3,B:4,e:5};
const TICKS={w:96,h:48,q:24,'8':12,'16':6,'32':3};   // a beat is 24 ticks, a bar 96
// A lick's text as steps: each a note, chord or rest with its start and length in ticks. A note has its string,
// the fret pressed (f), the fret it sounds at (snd: higher when it's held bent), a quick bend's target (bend) and how
// it's reached from the note before on that string (link: h p s / b r _), or mute for a rake.
function parseLick(text){
  const steps=[];let dur={base:'8',dots:0,tup:false},t=0;
  for(let tok of text.trim().split(/\s+/)){
    if(tok==='|')continue;
    let vib=false;if(tok.endsWith('~')){vib=true;tok=tok.slice(0,-1);}
    const [body,d]=tok.split(':'),grace=d==='g';
    if(d&&!grace){const m=d.match(/^(w|h|q|8|16|32)(\.?)(t?)$/);if(!m)throw new Error('Lick length: '+tok);dur={base:m[1],dots:m[2]?1:0,tup:!!m[3]};}
    const ticks=grace?0:TICKS[dur.base]*(dur.dots?1.5:1)*(dur.tup?2/3:1);
    const st={start:t,ticks,dur:{...dur},vib,grace,rest:body==='-',notes:[]};
    if(body==='_')st.notes=steps[steps.length-1].notes.filter(n=>!n.mute).map(n=>({...n,snd:n.bend??n.snd,bend:null,link:'_'}));
    else if(!st.rest)st.notes=body.split('+').map(x=>{
      const m=x.match(/^([hps/brx_]?)([EADGBe])(\d+)(?:\(([\d.]+)\))?(?:\^([\d.]+))?$/);if(!m)throw new Error('Lick note: '+x);
      return {s:STR_OF[m[2]],f:+m[3],snd:m[4]?+m[4]:+m[3],bend:m[5]?+m[5]:null,link:m[1]&&m[1]!=='x'?m[1]:null,mute:m[1]==='x'};});
    steps.push(st);t+=ticks;
  }
  return steps;
}
const familyLicks=()=>LICKS.filter(l=>l.scales.includes(LICK_FAMILY[B.scale]));
const licksOn=()=>B.licksOn&&familyLicks().length>0;
/* Each lick has a shape (licks.js): one CAGED shape, or two neighbouring ones it crosses between ('E-D'). The list
   shows only the licks whose shapes are all shown (every lick with All), grouped by shape in this order. A lick's
   label is its shape and its place among that shape's licks in licks.js, for its scales: "E 3", "E–D 4". */
const LICK_SHAPES=['E','E-D','D','D-C','C','C-A','A','A-G','G','G-E'];
const shapeTitle=sh=>sh.includes('-')?sh.replace('-',' + ')+' shapes':sh+' shape';
for(const fam of ['minor','major']){const count={};
  LICKS.filter(L=>L.scales.includes(fam)).forEach(L=>{count[L.shape]=(count[L.shape]||0)+1;(L.labels??={})[fam]=`${L.shape.replace('-','–')} ${count[L.shape]}`;});}
const lickName=L=>L.labels[LICK_FAMILY[B.scale]];
let listMemo={sig:'',list:[]};
function lickList(){
  const act=activeShapes(),sig=[B.scale,B.key,act.join()].join('|');
  if(listMemo.sig!==sig)listMemo={sig,list:familyLicks().filter(L=>(!act.length||L.shape.split('-').every(s=>act.includes(s)))&&placeLick(L))
    .sort((a,b)=>LICK_SHAPES.indexOf(a.shape)-LICK_SHAPES.indexOf(b.shape))};   // keeps licks.js order within a shape
  return listMemo.list;
}
const curLick=()=>{const ls=lickList();return ls.find(L=>lickName(L)===B.lick)||ls[0]||null;};
// A lick in the key picked: moved as few frets as it can be and still fit on frets 0–17 (bends, slides and held
// bends need a fretted note), so E and F get open-position versions.
function placeLick(L){
  const steps=parseLick(L.notes),k=((B.key-9)%12+12)%12;
  for(const sh of [k,k-12].sort((a,b)=>Math.abs(a)-Math.abs(b))){
    const ok=steps.every(st=>st.notes.every(n=>{const f=n.f+sh,min=n.link==='/'?2:n.bend!==null||n.snd!==n.f||'bsr'.includes(n.link||'-')?1:0;return f>=min&&f<=LAST;}));
    if(ok)return steps.map(st=>({...st,notes:st.notes.map(n=>({...n,f:n.f+sh,snd:n.snd+sh,bend:n.bend===null?null:n.bend+sh}))}));
  }
  return null;
}
let lickMemo={L:null,key:null,steps:null};
function lickSteps(){
  const L=licksOn()&&curLick();if(!L)return null;
  if(lickMemo.L!==L||lickMemo.key!==B.key)lickMemo={L,key:B.key,steps:placeLick(L)};
  return lickMemo.steps;
}
function fillLicks(){
  const ls=lickList(),sel=document.getElementById('blick');
  // None in the shapes shown: say so, and grey out the list, ‹ › and Hear it.
  [sel.closest('label'),...['blprev','blnext','blplay'].map(id=>document.getElementById(id))].forEach(el=>greyOut(el,!ls.length));
  if(!ls.length){sel.innerHTML='<option>No licks in these shapes</option>';return;}
  sel.innerHTML=LICK_SHAPES.map(sh=>{const g=ls.filter(L=>L.shape===sh);
    return g.length?`<optgroup label="${shapeTitle(sh)}">${g.map(L=>`<option value="${lickName(L)}">${lickName(L)}</option>`).join('')}</optgroup>`:'';}).join('');
  sel.value=lickName(curLick());
}
function pickLick(id){lstop();B.lick=id;store.set('blick',id);document.getElementById('blick').value=id;drawBoard();scrollToShape();}
// ‹ and ›: the lick before or after in the list, so through a group before the next one, round and round.
function stepLick(d){const ls=lickList();if(!ls.length)return;const i=ls.indexOf(curLick());pickLick(lickName(ls[(i+d+ls.length)%ls.length]));}

/* The lick written out: notation over tab, like a lick book. Bends are a grace note in the notation and an arrow in
   the tab; hammer-ons, pull-offs, bends into a note and releases are labelled arcs (H, P, B, RB) as on David's sheet. */
const lscore=document.getElementById('lscore');
let lickEls=[], lickScoreSig='';
const vfDur=d=>d.base+(d.dots?'d':'');
const BEND_TEXT={0.5:'¼',1:'½',1.5:'¾',2:'Full',3:'1½'};
// A note's name in the key as a VexFlow key (up: spell the blues note as a ♯4 rather than a ♭5).
function lickKey(midi,iv,up){
  const name=iv===6&&up?nameFrom(pcName(B.key,B.key),6,3):nameFrom(pcName(B.key,B.key),iv);
  const acc=(name.match(/♯/g)||[]).length-(name.match(/♭/g)||[]).length;
  return name[0].toLowerCase()+(acc>0?'#'.repeat(acc):'b'.repeat(-acc))+'/'+(Math.round((midi-acc-NAT_PC[name[0]])/12)-1);
}
function drawLickScore(){
  const box=document.getElementById('blicktab'),lk=lickSteps();box.hidden=!lk;
  if(!lk){lickEls=[];lickScoreSig='';return;}
  const L=curLick();
  document.getElementById('ltip').textContent=L.name?`${lickName(L)}: ${L.name}. ${L.tip}`:'';
  document.getElementById('ltip').hidden=!L.name;
  // Drawn only while it can be seen (VexFlow measures its text), and again only when the lick or key changes.
  if(!lscore.offsetParent){lickScoreSig='';return;}
  if(lk===lickScoreSig)return;lickScoreSig=lk;   // lickSteps() makes new steps when the lick or key changes
  const root=pcName(B.key,B.key),key=root.replace('♭','b').replace('♯','#');
  const keyAcc={};[0,2,4,5,7,9,11].forEach(iv=>{const nm=nameFrom(root,iv);keyAcc[nm[0].toLowerCase()]=nm.includes('♯')?'#':nm.includes('♭')?'b':'';});
  const sounding=lk.filter(st=>!st.rest&&!st.grace);
  const top=n=>Math.floor(n.bend??n.snd);   // the fret it sounds at (a quick bend's target)
  const mid=n=>STRINGS[n.s]+top(n);   // written pitch (an octave above the sound, as guitar music is)
  const nextUp=i=>{const a=lk[i],b=lk.slice(i+1).find(st=>!st.rest&&st.notes.length);return b&&Math.max(...b.notes.map(mid))>Math.max(...a.notes.map(mid));};
  // Headroom for high notes (up to 5 ledger lines) and the bend arrows between the staves.
  const stepOf=k=>{const [,l,,o]=/^([a-g])(#+|b+)?\/(\d)$/.exec(k);return 7*(+o)+'cdefgab'.indexOf(l);};
  // The blues note is a ♯4 when it's bent or hammered up to, or leads up; otherwise a ♭5 (as on David's sheet).
  const keyOf=(n,i)=>lickKey(mid(n),((pcAt(n.s,top(n))-B.key)%12+12)%12,n.bend!==null||n.link==='h'||n.link==='b'||nextUp(i));
  const topStep=Math.max(...sounding.flatMap(st=>st.notes.map(n=>stepOf(keyOf(n,lk.indexOf(st))))));
  const above=Math.max(4,(topStep-stepOf('f/5'))/2+2.5),TAB_Y=(above+4)*10+52;
  const nBars=Math.ceil((lk[lk.length-1].start+lk[lk.length-1].ticks)/96);
  const barOf=st=>Math.min(nBars-1,Math.floor(st.start/96+1e-9));
  const startX=s=>s.getNoteStartX()-s.getX();
  const firstX=startX(new VF.Stave(0,0,200).addClef('treble').addKeySignature(key).addTimeSignature('4/4'))-startX(new VF.Stave(0,0,200));
  // Room for each note (more for grace notes and dots), then stretched to fill the card when there's space.
  const need=Array.from({length:nBars},(_,b)=>lk.filter(st=>barOf(st)===b&&!st.grace).reduce((a,st)=>a+34+(st.notes.some(q=>q.bend!==null)?22:0)+(st.dur.dots?8:0),60));
  const fit=Math.min(1.8,Math.max(1,(lscore.clientWidth-20-firstX)/need.reduce((a,b)=>a+b,0)));
  const widths=need.map((w,b)=>Math.round(w*fit)+(b===0?firstX:0)),total=widths.reduce((a,b)=>a+b,0)+16;
  lscore.replaceChildren();
  const r=new VF.Renderer(lscore,VF.Renderer.Backends.SVG);r.resize(total,TAB_Y+120);
  const ctx=r.getContext(),N=[],T=[],marks=[],barEnd=[];
  lickEls=[];let x=8;
  for(let b=0;b<nBars;b++){
    const w=widths[b],stave=new VF.Stave(x,0,w,{space_above_staff_ln:above}),ts=new VF.TabStave(x,TAB_Y,w);
    if(b===0){stave.addClef('treble').addKeySignature(key).addTimeSignature('4/4');ts.addClef('tab');}
    if(b===nBars-1){stave.setEndBarType(VF.Barline.type.END);ts.setEndBarType(VF.Barline.type.END);}
    const nx=Math.max(stave.getNoteStartX(),ts.getNoteStartX());stave.setNoteStartX(nx);ts.setNoteStartX(nx);
    stave.setContext(ctx).draw();ts.setContext(ctx).draw();
    if(b===0)new VF.StaveConnector(stave,ts).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
    const notes=[],tabs=[];let rake=false;
    lk.forEach((st,i)=>{
      if(barOf(st)!==b)return;
      if(st.grace){rake=true;return;}   // a rake before the note: written as "rake" over it
      const dur=vfDur(st.dur);let n,t;
      if(st.rest){n=new VF.StaveNote({keys:['b/4'],duration:dur+'r'});t=new VF.GhostNote({duration:dur});}
      else{
        const ns=[...st.notes].sort((p,q)=>mid(p)-mid(q));st.sorted=ns;
        n=new VF.StaveNote({keys:ns.map(q=>keyOf(q,i)+(q.mute?'/x2':'')),duration:dur,auto_stem:true});
        t=new VF.TabNote({positions:ns.map(q=>({str:6-q.s,fret:q.snd===q.f||q.snd%1?String(q.f):`(${q.snd})`})),duration:dur});
        ns.forEach((q,j)=>{
          if(q.bend===null)return;
          // A quick bend: a grace note on the fret pressed (with its own sharp, flat or natural), an arrow in the tab.
          const gk=lickKey(STRINGS[q.s]+q.f,((pcAt(q.s,q.f)-B.key)%12+12)%12,true),acc=gk.split('/')[0].slice(1),want=keyAcc[gk[0]]||'';
          const g=new VF.GraceNote({keys:[gk],duration:'8',slash:false});
          if(acc!==want)g.addModifier(new VF.Accidental(acc||'n'),0);
          n.addModifier(new VF.GraceNoteGroup([g],true),0);
          marks.push({kind:'bend',t,ts,s:q.s,text:BEND_TEXT[q.bend-q.f]||String(q.bend-q.f)});
        });
        if(st.vib)marks.push({kind:'vib',n,t,stave,ts,i,bend:ns.some(q=>q.bend!==null)});
        if(st.notes.some(q=>q.mute)||rake)marks.push({kind:'text',t,ts,text:'rake'});
        if(st.notes.some(q=>q.link==='/'))marks.push({kind:'text',t,ts,text:'SL'});
      }
      rake=false;
      if(st.dur.dots)VF.Dot.buildAndAttach([n],{all:true});
      notes.push(n);tabs.push(t);N[i]=n;T[i]=st.rest?null:t;
    });
    // Triplets: 8th, 16th or quarter-note triplets, grouped until they fill their beat (two beats for quarters).
    const tuplets=[],bs=lk.filter(s=>barOf(s)===b&&!s.grace);
    for(let k=0,grp=[],sum=0;k<bs.length;k++){
      if(!bs[k].dur.tup){grp=[];sum=0;continue;}
      grp.push(k);sum+=bs[k].ticks;
      if((sum===12&&grp.every(j=>bs[j].dur.base==='16'))||sum===24||sum===48){
        const o={num_notes:3,notes_occupied:2};tuplets.push(new VF.Tuplet(grp.map(j=>notes[j]),o));new VF.Tuplet(grp.map(j=>tabs[j]),o);grp=[];sum=0;}
    }
    const beams=VF.Beam.generateBeams(notes,{groups:[new VF.Fraction(1,4)]});
    const nv=new VF.Voice({num_beats:4,beat_value:4}).setMode(VF.Voice.Mode.SOFT).addTickables(notes);
    const tv=new VF.Voice({num_beats:4,beat_value:4}).setMode(VF.Voice.Mode.SOFT).addTickables(tabs);
    VF.Accidental.applyAccidentals([nv],key);
    new VF.Formatter().joinVoices([nv]).joinVoices([tv]).format([nv,tv],stave.getNoteEndX()-stave.getNoteStartX()-12);
    nv.draw(ctx,stave);beams.forEach(bm=>bm.setContext(ctx).draw());tuplets.forEach(tp=>tp.setContext(ctx).draw());tv.draw(ctx,ts);
    barEnd[b]=stave.getNoteEndX();x+=w;
  }
  // Arcs between notes on the same string: ties, and H / P / B / RB / slides (labelled as on David's sheet).
  const ARC={h:'H',p:'P',b:'B',r:'RB',s:'SL',_:''};
  lk.forEach((st,i)=>{
    if(st.rest||st.grace)return;const links={};
    st.sorted.forEach((q,j)=>{if(!ARC.hasOwnProperty(q.link||'-'))return;
      let pi=i-1;while(pi>=0&&!(lk[pi].sorted&&lk[pi].sorted.some(p=>p.s===q.s)))pi--;if(pi<0)return;
      const k=pi+'|'+q.link;(links[k]=links[k]||{pi,kind:q.link,a:[],z:[]});links[k].a.push(lk[pi].sorted.findIndex(p=>p.s===q.s));links[k].z.push(j);});
    Object.values(links).forEach(({pi,kind,a,z})=>{
      const text=kind==='b'&&st.sorted[z[0]].snd%1?'SB':ARC[kind];   // a slight (quarter-tone) bend
      new VF.StaveTie({first_note:N[pi],last_note:N[i],first_indices:a,last_indices:z},text).setContext(ctx).draw();
      const tie={first_note:T[pi],last_note:T[i],first_indices:a,last_indices:z};
      (kind==='s'?new VF.TabSlide(tie):new VF.TabTie(tie,text)).setContext(ctx).draw();
    });
  });
  // Bend arrows, vibrato and "rake"/"SL" labels, drawn by hand: VexFlow's own versions push the grace notes out of place.
  const wave=(x0,x1,y)=>{ctx.beginPath();ctx.moveTo(x0,y);for(let xx=x0,k=0;xx<x1;xx+=4,k++)ctx.quadraticCurveTo(xx+2,y+(k%2?2.6:-2.6),xx+4,y);ctx.stroke();};
  ctx.save();ctx.setFont('Atkinson Hyperlegible, sans-serif',10,'bold');
  marks.forEach(m=>{
    const top=m.ts.getYForLine(0),tx=m.t.getAbsoluteX();
    if(m.kind==='bend'){   // up from the fret number, with how far (½, Full, 1½) over the arrow
      const x0=tx+m.t.getWidth()+1,y0=m.ts.getYForLine(5-m.s)-1,y1=top-14;
      ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(x0+8,y0,x0+8,y1+4);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x0+4.5,y1+5);ctx.lineTo(x0+8,y1);ctx.lineTo(x0+11.5,y1+5);ctx.closePath();ctx.fill();
      ctx.fillText(m.text,x0+8-ctx.measureText(m.text).width/2,y1-3);
    }else if(m.kind==='text')ctx.fillText(m.text,tx,top-6);
    else{   // vibrato: a wavy line from the note to the next one (or the end of the bar)
      const nxt=lk.slice(m.i+1).findIndex(st=>!st.grace),ni=nxt<0?-1:m.i+1+nxt,b=barOf(lk[m.i]);
      const x1=(ni>=0&&barOf(lk[ni])===b&&N[ni]?N[ni].getAbsoluteX():barEnd[b])-6;
      const nx0=m.n.getAbsoluteX()+16,ny=Math.min(m.stave.getYForLine(0),...m.n.getYs())-14;
      const tx0=tx+m.t.getWidth()+(m.bend?24:4);wave(nx0,Math.max(nx0+20,x1),ny);wave(tx0,Math.max(tx0+20,x1),top-8);
    }
  });
  ctx.restore();
  // Each step's drawn notes, to light up the one playing.
  lickEls=lk.map((st,i)=>[N[i],T[i]].filter(Boolean).map(n=>n.getSVGElement?n.getSVGElement():null).filter(Boolean));
  const svg=lscore.querySelector('svg');svg.setAttribute('viewBox',`0 0 ${total} ${TAB_Y+120}`);
  // A little too wide for the card: shrink it to fit (up to about a quarter); much wider: scroll sideways.
  const cw=lscore.clientWidth;svg.style.width=(total>cw?Math.max(cw,total/1.35):total)+'px';
}
function lightLick(i){lscore.querySelectorAll('.on').forEach(e=>e.classList.remove('on'));(lickEls[i]||[]).forEach(e=>e.classList.add('on'));}

/* Hear it: the lick alone at the tempo picked, or, when the band is playing, from the next bar line in time with it.
   Half speed doubles every note's length (still in time with the band). Each string rings like a real one: a
   hammer-on, pull-off, slide, bend or release changes the pitch of the note already ringing instead of picking again. */
// Where a tick falls in beats: as written, or with plain 8ths swung on Shuffle for licks marked swing.
function lickBeats(t,swing){const b=Math.floor(t/24),r=t-b*24;return b+(swing?(r<12?r*16/12:16+(r-12)*8/12)/24:r/24);}
function lplay(){
  const c=audio();if(!c)return;lstop();
  const lk=lickSteps();if(!lk)return;
  const swing=!!curLick().swing&&B.feel==='shuffle';
  let beat=60/B.bpm*(B.slow?2:1),start=c.currentTime+.1;
  if(bp.on&&B.track!=='drone'){
    beat=bp.spb*(B.slow?2:1);const first=bp.start+BCOUNT*bp.spb,bar=4*bp.spb;
    start=first+Math.max(0,Math.ceil((c.currentTime+.05-first)/bar))*bar;
  }
  const at=t=>start+lickBeats(t,swing)*beat,hz=(s,f)=>440*Math.pow(2,(STRINGS[s]+f-12-69)/12);
  const bus=c.createGain();bus.connect(OUT);
  const voice={};   // what's ringing on each string: its source, the pitch it was picked at, and its pitch now
  // How long a picked note rings: through every note joined to it on that string (hammer-ons, ties, bends…).
  const ringEnd=(i,s)=>{let e=lk[i].start+lk[i].ticks;for(let k=i+1;k<lk.length;k++){const q=lk[k].notes.find(n=>n.s===s);if(!q||!q.link||q.link==='/')break;e=lk[k].start+lk[k].ticks;}return e;};
  lk.forEach((st,i)=>{
    if(st.rest)return;const t0=st.grace?at(st.start)-.06:at(st.start);
    st.notes.forEach((q,j)=>{
      if(q.mute){pluck(hz(q.s,q.f),{at:t0+j*.012,dur:.09,vol:.25,out:bus});return;}
      const v=voice[q.s];
      if(v&&q.link&&q.link!=='/'){   // legato: bend the pitch of the string already ringing
        const ratio=hz(q.s,q.snd)/v.base,p=v.src.playbackRate;
        if(q.link==='h'||q.link==='p')p.setValueAtTime(ratio,t0);
        else if(q.link!=='_'){p.setValueAtTime(v.ratio,t0);p.exponentialRampToValueAtTime(ratio,t0+(q.link==='s'?.07:.14));}
        v.ratio=ratio;
      }else{
        const end=at(ringEnd(i,q.s)),base=hz(q.s,q.snd),src=pluck(base,{at:t0,dur:Math.max(.5,end-t0+.35),vol:.5,out:bus});
        if(!src)return;voice[q.s]={src,base,ratio:1};
        if(q.link==='/'){src.playbackRate.setValueAtTime(Math.pow(2,-2/12),t0);src.playbackRate.exponentialRampToValueAtTime(1,t0+.08);}
        if(q.bend!==null){const ratio=hz(q.s,q.bend)/base;src.playbackRate.setValueAtTime(1,t0+.03);src.playbackRate.exponentialRampToValueAtTime(ratio,t0+.16);voice[q.s].ratio=ratio;}
      }
      if(st.vib&&voice[q.s]){   // vibrato: a gentle wobble in pitch while the note holds
        const lfo=c.createOscillator(),d=c.createGain(),e=at(st.start+st.ticks);lfo.frequency.value=5.5;
        d.gain.setValueAtTime(0,t0);d.gain.linearRampToValueAtTime(.012,t0+.25);lfo.connect(d);d.connect(voice[q.s].src.playbackRate);lfo.start(t0);lfo.stop(e+.3);
      }
    });
  });
  const times=lk.map(st=>at(st.start)).concat([at(lk[lk.length-1].start+lk[lk.length-1].ticks)]);
  Object.assign(lp,{on:true,start,beat,times,bus,cur:-1});setLickBtn(true);lp.raf=requestAnimationFrame(lframe);
}
function lframe(){
  if(!lp.on)return;const now=AC.currentTime;
  if(now>lp.times[lp.times.length-1]+.6){lstop(false);return;}
  let cur=-1;const lk=lickSteps()||[];for(let i=0;i<lp.times.length-1;i++)if(now>=lp.times[i]&&lk[i]&&!lk[i].grace)cur=i;
  if(cur!==lp.cur){lp.cur=cur;drawBoard();lightLick(cur);}
  lp.raf=requestAnimationFrame(lframe);
}
function lstop(fade=true){
  if(!lp.on)return;lp.on=false;cancelAnimationFrame(lp.raf);
  if(fade&&lp.bus){const b=lp.bus;b.gain.setTargetAtTime(0,AC.currentTime,.03);setTimeout(()=>b.disconnect(),800);}
  lp.cur=-1;setLickBtn(false);drawBoard();lightLick(-1);
}
function setLickBtn(on){const b=document.getElementById('blplay');b.querySelector('span').textContent=on?'Stop':'Hear it';
  b.querySelector('path').setAttribute('d',on?'M3 3h10v10H3z':'M3 1.5v13l11-6.5z');}

/* ---------- fretboard drawing ---------- */
const fb=document.getElementById('fb');
// Shared with drill.js. DOT is the dot radius; strings are GAP apart.
const NUT=46,FW=50,TOP=26,GAP=30,DOT=12.5,W=NUT+LAST*FW+14,H=TOP+5*GAP+38;
const fx=f=>f===0?NUT-20:NUT+(f-.5)*FW, sy=s=>TOP+(5-s)*GAP;
function drawBoard(){
  const key=B.key,sc=curScale(),placed=placedShapes(),root=scaleRoot();
  const sel=placed.filter(x=>activeShapes().includes(x.name)), any=sel.length>0; // chosen shapes (none = all)
  // Chord tones: over the blues, the I/IV/V chord (tapped or playing); over the drone, the mode's home chord.
  const drone=B.track==='drone', step=drone?(tonesOn()&&bp.on?0:null):toneStep();  // like the blues: only while it plays
  const chordIv=drone?droneTriad():isMajor()?[0,4,7]:[0,4,7,10], tones=step===null?null:chordIv.map(i=>(key+step+i)%12);
  // The lick showing (Licks on): the frets its notes are played on (rakes too), and which ones get bent.
  const lk=lickSteps(),lpos=new Map();
  if(lk)lk.forEach(st=>st.notes.forEach(n=>{const k=n.s+','+n.f;if(!lpos.has(k))lpos.set(k,{s:n.s,f:n.f,bend:false});
    if(n.bend!==null||n.link==='b')lpos.get(k).bend=true;}));
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
    const pc=pcAt(p.s,p.f),iv=((pc-key)%12+12)%12,L=lpos.get(p.s+','+p.f),shown=lk?!!L:!(any&&!on.has(p.s+','+p.f));
    const label=B.lab==='int'?ivLabel(iv):ivName(root,iv);
    const cls=['dot',iv===0?'root':'',sc.extra!==undefined&&iv===sc.extra?'blue':'',sc.color!==undefined&&iv===sc.color?'color':'',shown?'':'dim',L?'lick':''].join(' ');
    svg+=`<g class="${cls}" data-s="${p.s}" data-f="${p.f}"><circle cx="${fx(p.f)}" cy="${sy(p.s)}" r="${DOT}"/><text x="${fx(p.f)}" y="${sy(p.s)+.5}">${label}</text></g>`;
    if(tones&&tones.includes(pc)&&shown)svg+=`<circle class="ring" cx="${fx(p.f)}" cy="${sy(p.s)}" r="${DOT+3.5}"/>`;
  });
  // Lick notes outside the scale (like the IV chord's 3rd over minor pentatonic): hollow blue dots.
  lpos.forEach((L,k)=>{if(all.has(k))return;const iv=((pcAt(L.s,L.f)-key)%12+12)%12,label=B.lab==='int'?INT_N[iv]:ivName(root,iv);
    svg+=`<g class="dot extra lick" data-s="${L.s}" data-f="${L.f}"><circle cx="${fx(L.f)}" cy="${sy(L.s)}" r="${DOT}"/><text x="${fx(L.f)}" y="${sy(L.s)+.5}">${label}</text></g>`;
    if(tones&&tones.includes(pcAt(L.s,L.f)))svg+=`<circle class="ring" cx="${fx(L.f)}" cy="${sy(L.s)}" r="${DOT+3.5}"/>`;});
  // Bends: a small arrow up beside the note; and while the lick plays, a ring on the note(s) sounding.
  lpos.forEach(L=>{if(!L.bend)return;const x=fx(L.f)+DOT+2,y=sy(L.s);
    svg+=`<path class="bend" d="M${x} ${y} q8 0 8 -12 M${x+4} ${y-8} l4 -4 l4 4"/>`;});
  if(lk&&lp.on&&lp.cur>=0)lk[lp.cur].notes.forEach(n=>{svg+=`<circle class="lick-now" cx="${fx(n.f)}" cy="${sy(n.s)}" r="${DOT+4.5}"/>`;});
  // Chord tones the scale doesn't have (like the IV chord's major 3rd over minor pentatonic): hollow blue dots,
  // labeled by their job in the chord. Only with Chord tones on, for a tapped chord or the one playing,
  // and only inside the chosen shapes (or anywhere with All shapes).
  if(tones&&!lk){
    const cr=(key+step)%12, inScale=sc.iv.map(i=>(key+i)%12), JOB={0:'R',3:'♭3',4:'3',6:'♭5',7:'5',10:'♭7'};
    const areas=any?sel.flatMap(x=>x.places.map(pl=>[Math.min(...pl.map(p=>p.f)),Math.max(...pl.map(p=>p.f))])):[[0,LAST]];
    for(let s=0;s<6;s++)for(let f=0;f<=LAST;f++){
      const pc=pcAt(s,f);if(!tones.includes(pc)||inScale.includes(pc)||!areas.some(([a,b])=>f>=a&&f<=b))continue;
      const job=((pc-cr)%12+12)%12,label=B.lab==='int'?JOB[job]:nameFrom(nameFrom(pcName(key,key),step),job);
      svg+=`<g class="dot extra" data-s="${s}" data-f="${f}"><circle cx="${fx(f)}" cy="${sy(s)}" r="${DOT}"/><text x="${fx(f)}" y="${sy(s)+.5}">${label}</text></g>`;
    }
  }
  fb.setAttribute('viewBox',`0 0 ${W} ${H}`);fb.innerHTML=svg;
  drawLickScore();
}
// On a narrow screen the fretboard scrolls sideways: bring the chosen shape into view.
function scrollToShape(){
  const r=fb.querySelector('.region'),wrap=fb.parentElement,lick=[...fb.querySelectorAll('.dot.lick circle')].map(c=>+c.getAttribute('cx'));
  if((!r&&!lick.length)||wrap.scrollWidth<=wrap.clientWidth)return;
  const k=fb.clientWidth/W,x=lick.length?Math.min(...lick)-DOT-20:+r.getAttribute('x');wrap.scrollLeft=Math.max(0,x*k-16);
}
fb.addEventListener('click',e=>{const g=e.target.closest('.dot');if(!g)return;
  pluck(440*Math.pow(2,(STRINGS[+g.dataset.s]+ +g.dataset.f-12-69)/12),{dur:1.6});});

/* ---------- controls ---------- */
const keySelect=document.getElementById('bkey');
keySelect.innerHTML=BKEYS.map(k=>`<option value="${k}">${pcName(k,k)}</option>`).join('');
keySelect.value=B.key;
keySelect.onchange=()=>{lstop();B.key=+keySelect.value;store.set('bkey',B.key);droneTune();drawShapes();drawChips();drawBoard();scrollToShape();describeImprov();};
const bt=document.getElementById('btempo'),btv=document.getElementById('btempo-val');
bt.value=B.bpm;btv.textContent=B.bpm+' bpm';
bt.oninput=()=>{const nb=+bt.value;btv.textContent=nb+' bpm';
  if(bp.on){const now=AC.currentTime,pos=(now-bp.start)/bp.spb,spb=60/nb;bp.start=now-pos*spb;bp.spb=spb;}
  B.bpm=nb;store.set('btempo',nb);describeImprov();};
function pressAll(){
  document.getElementById('bfeel').value=B.feel;
  document.getElementById('bscale').value=B.scale;
  document.getElementById('btrack').value=B.track;
  // Mode buttons: only for Modes. Tempo, Feel and Quick change only matter for the blues, so on the drone they're
  // greyed out (not hidden) and nothing else moves.
  const md=document.getElementById('bmodes');md.hidden=B.scale!=='modes';
  md.querySelectorAll('[data-md]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.md===B.mode));
  // Quick change is only for the 12-bar; Tempo and Feel for anything with drums.
  greyOut(document.getElementById('bquick'),B.track!=='blues');
  [document.getElementById('btempo').closest('label'),document.getElementById('bfeel').closest('label')].forEach(el=>greyOut(el,B.track==='drone'));
  document.getElementById('blab').setAttribute('aria-pressed',B.lab==='note');
  document.getElementById('bshapes').setAttribute('aria-pressed',B.shapesOn);const sh=document.getElementById('bshape');sh.classList.toggle('off',!B.shapesOn);sh.setAttribute('aria-hidden',!B.shapesOn); // invisible but still takes its space, so nothing jumps
  document.querySelectorAll('#bshape [data-sh]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.sh==='all'?!B.shapes.length:B.shapes.includes(b.dataset.sh)));
  document.getElementById('bquick').setAttribute('aria-pressed',B.quick);
  const bt=document.getElementById('btones');bt.setAttribute('aria-pressed',tonesOn());greyOut(bt,B.scale==='modes');
  // Licks: greyed out for scales with no licks (Modes, CAGED); the lick list and its row only with Licks on.
  const lb=document.getElementById('blicks');lb.setAttribute('aria-pressed',licksOn());greyOut(lb,!familyLicks().length);
  document.getElementById('blickrow').hidden=!licksOn();document.getElementById('blslow').setAttribute('aria-pressed',B.slow);
  fillLicks();
}
document.getElementById('blick').onchange=e=>pickLick(e.target.value);
document.getElementById('bscale').innerHTML=Object.entries(SCALES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');
document.getElementById('bscale').onchange=e=>{
  lstop();const was=B.scale;B.scale=e.target.value;store.set('bscale',B.scale);
  // Modes come with the drone (the blues only suits a couple of them); leaving Modes brings the blues back.
  if(B.scale==='modes'&&was!=='modes')setTrack('drone');else if(was==='modes'&&B.scale!=='modes')setTrack('blues');
  pressAll();drawShapes();drawChips();drawBoard();scrollToShape();describeImprov();};
document.getElementById('bmodes').innerHTML=Object.entries(MODES).map(([k,m])=>`<button type="button" class="btn" data-md="${k}" title="${m.name}">${m.short}</button>`).join('');
function greyOut(el,off){el.classList.toggle('greyed',off);el.setAttribute('aria-disabled',off);el.querySelectorAll('input,select').forEach(i=>i.disabled=off);if(el.matches('button'))el.disabled=off;}
function setTrack(t){
  if(t===B.track)return;const playing=bp.on;if(playing)bstop();
  B.track=t;store.set('btrack',t);if(t==='major'&&B.preview===7)B.preview=null;pressAll();if(playing)bstart();
}
document.getElementById('btrack').onchange=e=>{setTrack(e.target.value);drawChips();drawBoard();describeImprov();};
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
  else if(d.md){B.mode=d.md;store.set('bmode',B.mode);droneTune();if(DRONE)droneRevoice();drawShapes();}
  else if(b.id==='blicks'){lstop();B.licksOn=!B.licksOn;store.set('blicksOn',B.licksOn);}
  else if(b.id==='blslow'){B.slow=!B.slow;store.set('blslow',B.slow);}
  else if(b.id==='blplay'){lp.on?lstop():lplay();return;}
  else if(b.id==='blprev'||b.id==='blnext'){stepLick(b.id==='blnext'?1:-1);return;}
  else if(b.id==='btones'){B.tones=!B.tones;store.set('btones',B.tones);if(!B.tones)B.preview=null;drawChips();}
  else if(d.chip!==undefined){const st=+d.chip;B.preview=B.preview===st?null:st;drawChips();}
  else return;
  pressAll();drawBoard();if(d.sh||b.id==='bshapes'||b.id==='blicks')scrollToShape();describeImprov();
});
// The I, IV and V chords beside Chord tones: tap one to see its tones; the one playing is outlined.
function drawChips(){
  // The I/IV/V chords are for the blues, so on the drone they're hidden (David preferred hiding these).
  const el=document.getElementById('bchips'),hide=!tonesOn()||B.track==='drone';
  el.classList.toggle('off',hide);el.setAttribute('aria-hidden',hide);
  const now=bp.on&&bp.bar>=0?form()[bp.bar]:null;
  // Major: the I and IV triads (no 7ths); the V isn't in the loop, so it's greyed out, keeping its place.
  const sfx=isMajor()?'':'7';
  el.innerHTML=[0,5,7].map(st=>{const nm=pcName(B.key+st,B.key)+sfx,off=isMajor()&&st===7;
    return `<button type="button" class="btn chip${st===now?' now':''}${off?' greyed':''}" data-chip="${st}" aria-pressed="${B.preview===st}"${off?' disabled aria-disabled="true"':''} title="Show the tones of ${nm}">${nm}</button>`;}).join('');
  keepLines();
}
// Whenever the chord buttons are hidden (Chord tones off, or the drone), the row keeps the line breaks it has with
// them showing: if Chord tones + chords needs its own line, Chord tones sits there even when off, so clicking it
// never makes it jump down. Measure the row with the buttons present but invisible, then hide them and add the breaks.
function keepLines(){
  const el=document.getElementById('bchips'),tones=document.querySelector('.pick-row .tones'),shapes=document.querySelector('.pick-row .shapes-group');
  if(!el||!tones)return;
  tones.style.minWidth='';shapes.classList.remove('own-line');
  if(!el.classList.contains('off')||!el.closest('.pick-row').offsetParent)return;
  el.classList.remove('off');el.style.visibility='hidden';
  const box=x=>x.getBoundingClientRect(), sc=box(document.getElementById('bscale')).top,tn=box(tones),sh=box(shapes).top;
  el.classList.add('off');el.style.visibility='';
  if(tn.top>sc+8)tones.style.minWidth=tn.width+'px';   // Chord tones + chords needed a new line: keep that line
  shapes.classList.toggle('own-line',sh>tn.top+8);      // Shapes started a new line
}
{let w=0;new ResizeObserver(es=>{const nw=Math.round(es[0].contentRect.width);if(nw!==w){w=nw;keepLines();}}).observe(document.querySelector('#improv-view .scales'));}
function describeImprov(){
  if(document.getElementById('improv-view').hidden)return;
  const sc=B.scale==='modes'?`${scaleRoot()} ${MODES[B.mode].name}`:`${scaleRoot()} ${SCALES[B.scale].name.toLowerCase()}`;
  document.getElementById('subtitle').textContent=B.track==='drone'?`Drone on ${scaleRoot()} · ${sc}`
      :`${isMajor()?'Major I–IV':'12-bar blues'} in ${pcName(B.key,B.key)} · ${B.bpm} bpm · ${B.feel==='shuffle'?'Shuffle':'Straight'}${B.quick&&!isMajor()?' · Quick change':''}`;
  document.getElementById('subtitle').append(bstatus);
}

/* ---------- Read | Improv | Drill ---------- */
const TAGLINES={read:'Aaaahhh! Notation!',improv:'Guided Wanking',drill:'Go Hit the Shed'};
function showView(v){
  if(!TAGLINES[v])v='read';
  for(const k of Object.keys(TAGLINES))document.getElementById(k+'-view').hidden=k!==v;
  document.querySelectorAll('.views [data-view]').forEach(b=>{b.setAttribute('aria-selected',b.dataset.view===v);b.setAttribute('aria-pressed',b.dataset.view===v);});
  document.querySelector('.tagline').textContent=TAGLINES[v];
  store.set('view',v);
  // Only one thing plays at a time.
  if(v!=='read'&&player.on)stop();
  if(v!=='improv'){lstop();if(bp.on)bstop();}
  if(v!=='drill'&&typeof dstop==='function'){dstop();if(typeof cstop==='function')cstop();}
  if(v==='read')describe();else if(v==='improv'){describeImprov();drawBoard();}else if(typeof describeDrill==='function')describeDrill();
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
