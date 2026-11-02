/* Drill > Warm-up: Robb Cappelletto's six-position scale routine (as taught by Keith at Fret Science,
   youtu.be/MY1F4-id64k). One key a day around the circle of fifths. In each key, six positions that cover the neck,
   lowest first: three with the root on the low E string and three with it on the A string. In each position: the
   major scale, then the major pentatonic, then the major triad arpeggio (18 steps a day).
   Warm-up has routines (the switch at the top): that one is Cappelletto Six; Vai Fives is the minor pentatonic in
   groups of five through its five boxes, lowest first (the Eric Johnson pattern in Fundamental Changes' lesson on
   Steve Vai's warm-up, fundamental-changes.com/?p=4396); String Pairs is the minor pentatonic two strings at a time,
   up the neck box by box (guitarlessons.com's string pair pentatonic exercise). All use the key of the day; the
   pentatonic routines play its relative minor.
   Loaded after chords.js; shares the fretboard helpers (NUT, FW, TOP, GAP, H, DOT, fx, sy), the sound (pluck, tick,
   freqOf, audio, OUT, STRINGS), the note spelling (nameFrom, NAT_PC, INT_N) and store. */

// The circle of fifths, one key a day.
const WKEYS=[['C',0],['G',7],['D',2],['A',9],['E',4],['B',11],['F♯',6],['D♭',1],['A♭',8],['E♭',3],['B♭',10],['F',5]];
/* The six positions, as the major scale's notes: [string, frets from the root] (the root on string `str`; frets are
   the same on every string, so a note one fret behind the root is [s,-1] whatever the string).
   behind: root under the 4th finger, the whole position below it. straddle: root under the 2nd finger.
   front: root under the 1st finger, three notes per string. */
const WPOS=[
  {str:0,where:'behind',shape:'G shape',notes:[[0,-3],[0,-1],[0,0],[1,-3],[1,-1],[1,0],[2,-3],[2,-1],[3,-4],[3,-3],[3,-1],[4,-3],[4,-2],[4,0],[5,-3],[5,-1],[5,0]]},
  {str:0,where:'straddle',shape:'E shape',notes:[[0,-1],[0,0],[0,2],[1,-1],[1,0],[1,2],[2,-1],[2,1],[2,2],[3,-1],[3,1],[3,2],[4,0],[4,2],[5,-1],[5,0],[5,2]]},
  {str:0,where:'front',shape:'3 notes per string',notes:[[0,0],[0,2],[0,4],[1,0],[1,2],[1,4],[2,1],[2,2],[2,4],[3,1],[3,2],[3,4],[4,2],[4,4],[4,5],[5,2],[5,4],[5,5]]},
  {str:1,where:'behind',shape:'C shape',notes:[[0,-3],[0,-2],[0,0],[1,-3],[1,-1],[1,0],[2,-3],[2,-1],[2,0],[3,-3],[3,-1],[4,-3],[4,-2],[4,0],[5,-3],[5,-2],[5,0]]},
  {str:1,where:'straddle',shape:'A shape',notes:[[0,0],[0,2],[1,-1],[1,0],[1,2],[2,-1],[2,0],[2,2],[3,-1],[3,1],[3,2],[4,0],[4,2],[4,3],[5,0],[5,2]]},
  {str:1,where:'front',shape:'3 notes per string',notes:[[0,0],[0,2],[0,4],[1,0],[1,2],[1,4],[2,0],[2,2],[2,4],[3,1],[3,2],[3,4],[4,2],[4,3],[4,5],[5,2],[5,4],[5,5]]},
];
const WKINDS=[['scale','Scale',[0,2,4,5,7,9,11]],['pent','Pentatonic',[0,2,4,7,9]],['arp','Arpeggio',[0,4,7]]];
const WWHERE={behind:['Behind the root','4th'],straddle:['Straddling the root','2nd'],front:['In front of the root','1st']};
const VPENT=[0,3,5,7,10];   // the minor pentatonic, from its root
const PENT=[['pent','Minor pentatonic',[0,2,4,7,9]]];   // in the key's intervals (the relative minor = the major pentatonic)
/* The routines. all: the positions (steps = positions × kinds); tonic: the root, as an interval from the key;
   gap: beats between notes; group: notes per group (the first of each a little louder); cap: what the step buttons
   are. Each keeps its own step and tempo (five notes a beat wants a slower tempo). */
const WR={
  six:{name:'Cappelletto Six',all:()=>wPositions(),kinds:WKINDS,tonic:0,gap:1/2,group:0,cap:'Position',step:'wstep',tempo:['wtempo',80]},
  fives:{name:'Vai Fives',all:()=>wBoxes(),kinds:PENT,tonic:9,gap:1/5,group:5,cap:'Box',step:'vstep',tempo:['vtempo',60]},
  pairs:{name:'String Pairs',all:()=>wPairs(),kinds:PENT,tonic:9,gap:1/2,group:4,cap:'Strings',step:'pstep',tempo:['ptempo',80]},
};
const R=()=>WR[WU.rt];
const wSK=()=>R().step, wTK=()=>R().tempo[0], wTDef=()=>R().tempo[1];

const today=()=>{const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
const WU={rt:WR[store.get('wrt','six')]?store.get('wrt','six'):'six',key:store.get('wkey',3),lab:store.get('wlab','note'),
  click:store.get('wclick',true),nonstop:store.get('wnonstop',false),played:store.get('wplayed',''),keyDay:store.get('wkeyday','')};
WU.step=store.get(wSK(),0);WU.bpm=store.get(wTK(),wTDef());
// A new day after a day of practice: move on one key around the circle and start again at step 1.
// (Days off don't skip keys: it only moves on after a day the warm-up was played.)
if(WU.played&&WU.played!==today()&&WU.keyDay!==today()){WU.key=(WU.key+1)%12;WU.step=0;WU.keyDay=today();
  store.set('wkey',WU.key);Object.values(WR).forEach(r=>store.set(r.step,0));store.set('wkeyday',WU.keyDay);}

/* ---------- the positions in a key ----------
   Root frets: the lowest place each position fits on the neck (low E string: fret 4 and up, for the reach back to
   4 frets below the root; A string: fret 3 and up). The string whose root is lower goes first. */
function wPositions(){
  const pc=WKEYS[WU.key][1],rootFret=(str,min)=>{let f=((pc-STRINGS[str])%12+12)%12;if(f<min)f+=12;return f;};
  const rE=rootFret(0,4),rA=rootFret(1,3);
  const list=WPOS.map(p=>{const r=p.str===0?rE:rA;
    const notes=p.notes.map(([s,o])=>({s,f:r+o,m:STRINGS[s]+r+o})).sort((a,b)=>a.m-b.m);
    return {...p,root:r,notes};});
  return rA<rE?[...list.slice(3),...list.slice(0,3)]:list;
}
/* Vai Fives' five boxes of the relative minor pentatonic: box N starts on the pentatonic's Nth note on the low E string
   and climbs twelve notes, two per string (so the B string's shift comes out by itself). Each box sits with its lowest
   fret between 1 and 12 (no open strings), lowest box first. */
function wBoxes(){
  const r=((WKEYS[WU.key][1]+9-STRINGS[0])%12+12)%12;   // the minor root's fret on the low E string
  return [0,1,2,3,4].map(k=>{
    let notes=[];
    for(let d=k;d<k+12;d++){const s=Math.floor((d-k)/2),m=STRINGS[0]+r+12*Math.floor(d/5)+VPENT[d%5];notes.push({s,f:m-STRINGS[s],m});}
    const lo=Math.min(...notes.map(n=>n.f)),sh=lo<1?12:lo>12?-12:0;
    notes=notes.map(n=>({...n,f:n.f+sh,m:n.m+sh}));
    return {box:k+1,notes,lo:lo+sh,hi:Math.max(...notes.map(n=>n.f))};
  }).sort((a,b)=>a.lo-b.lo);
}
/* String Pairs: one step per pair of neighbouring strings, lowest pair first. On each pair, box by box up the neck:
   the box's two notes on the lower string, then its two on the upper one (four notes, one group); the next box up
   starts one note higher, on the second note of the last group. Every box whose four notes fit between frets 1 and
   17. Box N's notes on string s are the pentatonic's notes N+2s and N+2s+1 counted from the low E string's root. */
function wPairs(){
  const r=((WKEYS[WU.key][1]+9-STRINGS[0])%12+12)%12;
  const at=(d,s)=>{const m=STRINGS[0]+r+12*Math.floor(d/5)+VPENT[(d%5+5)%5];return {s,f:m-STRINGS[s],m};};
  return [0,1,2,3,4].map(s=>{
    const groups=[];
    for(let g=-10;g<25;g++){const q=[at(g+2*s,s),at(g+2*s+1,s),at(g+2*s+2,s+1),at(g+2*s+3,s+1)];
      if(q.every(n=>n.f>=1&&n.f<=17))groups.push({box:(g%5+5)%5+1,q});}
    const seq=groups.flatMap(x=>x.q),uniq=new Map(seq.map(n=>[n.s+','+n.f,n]));
    return {s,groups,seq,notes:[...uniq.values()].sort((a,b)=>a.m-b.m),lo:Math.min(...seq.map(n=>n.f)),hi:Math.max(...seq.map(n=>n.f))};
  });
}
const wAll=()=>R().all();
const wKinds=()=>R().kinds;
const wCount=()=>wAll().length*wKinds().length;   // 18 steps, or 5
const wTonic=()=>R().tonic;
const PAIR_NAME=['low E and A','A and D','D and G','G and B','B and high E'];
const wIv=m=>((m-WKEYS[WU.key][1])%12+12)%12;
const wStepInfo=(i=WU.step)=>{const K=wKinds();return {pos:Math.floor(i/K.length),kind:K[i%K.length]};};
const wNotes=(pos,kind)=>pos.notes.filter(n=>kind[2].includes(wIv(n.m)));
/* What's played. Cappelletto Six: up from the lowest note to the highest and back down, in 8ths.
   Vai Fives: groups of five, one a beat, each starting one note on from the last; up to the top, then down from the
   note below it (so the top isn't played twice), ending on the lowest note.
   String Pairs: the groups up the neck in 8ths, then the same notes backwards, down to the lowest. */
const wFives=n=>{const g=[];for(let i=0;i+5<=n.length;i++)g.push(...n.slice(i,i+5));
  for(let i=n.length-2;i>=4;i--)g.push(...n.slice(i-4,i+1).reverse());return g;};
const upDown=n=>[...n,...n.slice(0,-1).reverse()];
function wRun(pos,kind){
  if(WU.rt==='pairs')return upDown(pos.seq);
  const n=wNotes(pos,kind);return WU.rt==='fives'?wFives(n):upDown(n);
}
const wGap=()=>R().gap;   // beats between notes
const wLast=positions=>Math.max(17,...positions.flatMap(p=>p.notes.map(n=>n.f)));

/* ---------- fretboard ---------- */
const wfb=document.getElementById('wfb');
let wPlaying=-1;   // index into the run of the note playing now
function drawWarm(){
  if(WU.step<0||WU.step>=wCount())WU.step=0;
  const P=wAll(),{pos,kind}=wStepInfo(),cur=P[pos],last=wLast(P),Wd=NUT+last*FW+14;
  const root=WKEYS[WU.key][0];
  let svg=`<rect class="wood" x="${NUT}" y="${TOP-10}" width="${last*FW}" height="${5*GAP+20}" rx="3"/>`;
  [3,5,7,9,15,17,19].filter(f=>f<=last).forEach(f=>{svg+=`<circle class="inlay" cx="${fx(f)}" cy="${TOP+2.5*GAP}" r="5"/>`;});
  svg+=`<circle class="inlay" cx="${fx(12)}" cy="${TOP+1.5*GAP}" r="5"/><circle class="inlay" cx="${fx(12)}" cy="${TOP+3.5*GAP}" r="5"/>`;
  for(let f=1;f<=last;f++)svg+=`<line class="fret" x1="${NUT+f*FW}" x2="${NUT+f*FW}" y1="${TOP-10}" y2="${TOP+5*GAP+10}"/>`;
  [3,5,7,9,12,15,17,19].filter(f=>f<=last).forEach(f=>{svg+=`<text class="fnum" x="${fx(f)}" y="${TOP+5*GAP+30}">${f}</text>`;});
  svg+=`<rect class="nut" x="${NUT-4}" y="${TOP-10}" width="5" height="${5*GAP+20}"/>`;
  for(let s=0;s<6;s++)svg+=`<line class="str" x1="${NUT-34}" x2="${NUT+last*FW}" y1="${sy(s)}" y2="${sy(s)}" stroke-width="${1+s*.35}"/>`;
  // The other five positions greyed out (tap one to go there), then this one on top.
  const dots=new Map();
  P.forEach((p,i)=>{if(i===pos)return;wNotes(p,kind).forEach(n=>{const k=n.s+','+n.f;if(!dots.has(k))dots.set(k,{...n,ghost:true,pos:i});});});
  wNotes(cur,kind).forEach(n=>dots.set(n.s+','+n.f,{...n,ghost:false,pos}));
  const label=n=>WU.lab==='int'?INT_N[(wIv(n.m)-wTonic()+12)%12]:nameFrom(root,wIv(n.m));
  dots.forEach(d=>{const r=wIv(d.m)===wTonic();
    svg+=`<g class="dot${d.ghost?' ghost':r?' root':''}" data-s="${d.s}" data-f="${d.f}"${d.ghost?` data-pos="${d.pos}"`:''}><circle cx="${fx(d.f)}" cy="${sy(d.s)}" r="${DOT}"/><text x="${fx(d.f)}" y="${sy(d.s)+.5}">${label(d)}</text></g>`;});
  const run=wRun(cur,kind),now=run[wPlaying];
  if(now)svg+=`<circle class="lick-now" cx="${fx(now.f)}" cy="${sy(now.s)}" r="${DOT+4}"/>`;
  wfb.setAttribute('viewBox',`0 0 ${Wd} ${H}`);wfb.innerHTML=svg;
  wfb.style.minWidth=Math.round(760*Wd/W)+'px';   // same size per fret as the other fretboards
  // The controls for this step.
  document.querySelectorAll('#wkind [data-kind]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.kind===kind[0]));
  document.querySelectorAll('#wpos [data-pos]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.pos===pos));
  if(WU.rt==='six'){const [where,finger]=WWHERE[cur.where];
    document.getElementById('wdesc').innerHTML=`<span><b>Step ${WU.step+1} of 18</b> · ${where}: root on the ${cur.str?'A':'low E'} string (fret ${cur.root}) under your ${finger} finger · ${cur.shape}</span>`;}
  else if(WU.rt==='fives')document.getElementById('wdesc').innerHTML=`<span><b>Step ${WU.step+1} of 5</b> · Box ${cur.box} of ${nameFrom(root,9)} minor pentatonic, frets ${cur.lo}–${cur.hi} · groups of five, up then down</span>`;
  else document.getElementById('wdesc').innerHTML=`<span><b>Step ${WU.step+1} of 5</b> · Strings ${6-cur.s} and ${5-cur.s} (${PAIR_NAME[cur.s]}) · up the neck through ${cur.groups.length} boxes and back down</span>`;
  document.getElementById('wkey').value=WU.key;
  document.getElementById('wfirst').classList.toggle('greyed',WU.step===0);
  describeWarm();
}
function wScrollTo(){
  const wrap=wfb.parentElement;if(wrap.scrollWidth<=wrap.clientWidth)return;
  const P=wAll(),Wd=NUT+wLast(P)*FW+14,k=wfb.clientWidth/Wd,{pos}=wStepInfo();
  const fs=P[pos].notes.map(n=>n.f),x0=fx(Math.min(...fs))*k,x1=fx(Math.max(...fs))*k;
  if(x0<wrap.scrollLeft+10||x1>wrap.scrollLeft+wrap.clientWidth-10)wrap.scrollLeft=Math.max(0,(x0+x1)/2-wrap.clientWidth/2);
}
wfb.addEventListener('click',e=>{
  const dot=e.target.closest('.dot');if(!dot)return;
  const K=wKinds().length;
  if(dot.dataset.pos!==undefined&&!wp.on){wGo(+dot.dataset.pos*K+WU.step%K);return;}
  pluck(freqOf(STRINGS[+dot.dataset.s]+ +dot.dataset.f),{dur:1.4});
});

/* ---------- playing ----------
   A one-bar count-in, then the step up and back down in 8ths (Vai Fives: quintuplets; the first note of each group
   a little louder), lit on the fretboard, with the metronome on the beat. Each note sounds until the next one comes
   (a scale is played one note at a time: the finger lifts as the next note sounds); the last note rings out. Non-stop goes straight on to the next step after
   one bar of clicks (to move your hand), through all of them. Tempo changes act right away. */
const wp={on:false,bus:null,start:0,spb:.75,ev:[],i:0,segs:[],timer:0,raf:0};
const wplay=document.getElementById('wplay');
const wTime=b=>wp.start+b*wp.spb, wBeat=t=>(t-wp.start)/wp.spb;
function wQueue(step,b0){
  const {pos,kind}=wStepInfo(step),run=wRun(wAll()[pos],kind),gap=wGap(),grp=R().group;
  const notesAt=run.map((_,j)=>b0+4+j*gap),end=b0+4+Math.ceil(run.length*gap/4-1e-9)*4;
  for(let b=b0;b<end;b++)wp.ev.push({b,click:true,strong:(b-b0)%4===0});
  run.forEach((n,j)=>wp.ev.push({b:notesAt[j],m:n.m,hold:j<run.length-1?gap:null,vol:grp?(j%grp?.42:.58):.5}));
  wp.ev.sort((x,y)=>x.b-y.b);
  wp.segs.push({step,b0,notesAt,end});
}
function wSched(){
  if(!wp.on)return;
  const now=AC.currentTime,ahead=now+.2;
  let seg=wp.segs[wp.segs.length-1];
  // Non-stop: line up the next step before this one runs out.
  const lastStep=wCount()-1;
  if(WU.nonstop&&seg.step<lastStep&&wTime(seg.end)<ahead+.5)wQueue(seg.step+1,seg.end);
  while(wp.i<wp.ev.length&&wTime(wp.ev[wp.i].b)<ahead){
    const e=wp.ev[wp.i++],t=Math.max(wTime(e.b),now);
    if(e.click){if(WU.click)tick(t,e.strong,false,wp.bus);}
    else pluck(freqOf(e.m),{at:t,...(e.hold===null?{dur:2.6}:{hold:e.hold*wp.spb+.03}),vol:e.vol,out:wp.bus});
  }
  seg=wp.segs[wp.segs.length-1];
  if(wBeat(now)>=seg.end-.5&&!(WU.nonstop&&seg.step<lastStep)){wstop();return;}
  wp.timer=setTimeout(wSched,25);
}
// Follow along: switch to the step being played and light the note.
function wFrame(){
  if(!wp.on)return;
  const b=wBeat(AC.currentTime),seg=[...wp.segs].reverse().find(s=>s.b0<=b+1e-6)||wp.segs[0];
  const i=seg.notesAt.filter(x=>x<=b+.02).length-1;
  if(seg.step!==WU.step){WU.step=seg.step;store.set(wSK(),WU.step);wPlaying=-1;drawWarm();wScrollTo();}
  if(i!==wPlaying){wPlaying=i;
    const ring=wfb.querySelector('.lick-now'),run=wRun(wAll()[wStepInfo().pos],wStepInfo().kind),n=run[i];
    if(n){if(ring){ring.setAttribute('cx',fx(n.f));ring.setAttribute('cy',sy(n.s));}else wfb.insertAdjacentHTML('beforeend',`<circle class="lick-now" cx="${fx(n.f)}" cy="${sy(n.s)}" r="${DOT+4}"/>`);
      wFollow(n.f);}
    else ring?.remove();
  }
  wp.raf=requestAnimationFrame(wFrame);
}
// String Pairs runs the whole neck: on a narrow screen, keep the note being played in view.
function wFollow(f){
  const wrap=wfb.parentElement;if(wrap.scrollWidth<=wrap.clientWidth)return;
  const k=wfb.clientWidth/wfb.viewBox.baseVal.width,x=fx(f)*k;
  if(x<wrap.scrollLeft+30||x>wrap.scrollLeft+wrap.clientWidth-30)wrap.scrollLeft=Math.max(0,x-wrap.clientWidth/2);
}
function wstart(){
  const c=audio();if(!c)return;
  wp.bus=c.createGain();wp.bus.connect(OUT);
  wp.on=true;wp.spb=60/WU.bpm;wp.start=c.currentTime+.1;wp.ev=[];wp.i=0;wp.segs=[];wPlaying=-2;
  wQueue(WU.step,0);
  WU.played=today();WU.keyDay=today();store.set('wplayed',WU.played);store.set('wkeyday',WU.keyDay);
  wplay.querySelector('span').textContent='Stop';wplay.querySelector('path').setAttribute('d','M3 3h10v10H3z');
  wSched();wFrame();wScrollTo();
}
function wstop(){
  if(!wp.on)return;wp.on=false;clearTimeout(wp.timer);cancelAnimationFrame(wp.raf);
  const c=AC,g=wp.bus;g.gain.setTargetAtTime(0,c.currentTime,.03);setTimeout(()=>g.disconnect(),400);
  wPlaying=-1;wfb.querySelector('.lick-now')?.remove();
  wplay.querySelector('span').textContent='Play';wplay.querySelector('path').setAttribute('d','M3 1.5v13l11-6.5z');
}
wplay.onclick=()=>wp.on?wstop():wstart();

/* ---------- controls ---------- */
function wGo(step){wstop();const N=wCount();WU.step=(step+N)%N;store.set(wSK(),WU.step);drawWarm();wScrollTo();}
const wkeySel=document.getElementById('wkey');
wkeySel.onchange=()=>{wstop();WU.key=+wkeySel.value;WU.keyDay=today();store.set('wkey',WU.key);store.set('wkeyday',WU.keyDay);drawWarm();wScrollTo();};
document.getElementById('wroutine').innerHTML=Object.entries(WR).map(([id,{name}])=>`<button type="button" class="btn chip" role="tab" data-rt="${id}">${name}</button>`).join('');
// The parts that differ between routines: the key names, the kind buttons, the position or box numbers, the help.
function wRoutineUI(){
  const six=WU.rt==='six';
  document.querySelectorAll('#wroutine [data-rt]').forEach(b=>{b.setAttribute('aria-selected',b.dataset.rt===WU.rt);b.setAttribute('aria-pressed',b.dataset.rt===WU.rt);});
  wkeySel.innerHTML=WKEYS.map(([n],i)=>`<option value="${i}">${six?n+' major':nameFrom(n,9)+' minor'}</option>`).join('');
  document.getElementById('wkind').hidden=!six;
  document.getElementById('wkind').innerHTML=WKINDS.map(([id,name])=>`<button type="button" class="btn chip" data-kind="${id}">${name}</button>`).join('');
  document.getElementById('wpos-cap').textContent=R().cap;
  const btn=(p,i)=>six?i+1:WU.rt==='fives'?p.box:`${6-p.s}–${5-p.s}`;
  document.getElementById('wpos').innerHTML=wAll().map((p,i)=>`<button type="button" class="btn chip" data-pos="${i}" aria-label="${six?'Position':'Step'} ${i+1}">${btn(p,i)}</button>`).join('');
  document.querySelectorAll('#warmup-mode [data-help]').forEach(el=>el.hidden=el.dataset.help!==WU.rt);
  wt.value=WU.bpm;wtv.textContent=WU.bpm+' bpm';
}
document.getElementById('warmup-mode').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const d=b.dataset,K=wKinds().length;
  if(d.rt){if(d.rt===WU.rt)return;wstop();WU.rt=d.rt;store.set('wrt',WU.rt);
    WU.step=store.get(wSK(),0);WU.bpm=store.get(wTK(),wTDef());wRoutineUI();drawWarm();wScrollTo();}
  else if(d.kind)wGo(Math.floor(WU.step/K)*K+WKINDS.findIndex(k=>k[0]===d.kind));
  else if(d.pos!==undefined)wGo(+d.pos*K+WU.step%K);
  else if(b.id==='wfirst')wGo(0);
  else if(b.id==='wprev')wGo(WU.step-1);
  else if(b.id==='wnext')wGo(WU.step+1);
  else if(b.id==='wlab'){WU.lab=WU.lab==='note'?'int':'note';store.set('wlab',WU.lab);b.setAttribute('aria-pressed',WU.lab==='note');drawWarm();}
  else if(b.id==='wclick'){WU.click=!WU.click;store.set('wclick',WU.click);b.setAttribute('aria-pressed',WU.click);}
  else if(b.id==='wnonstop'){WU.nonstop=!WU.nonstop;store.set('wnonstop',WU.nonstop);b.setAttribute('aria-pressed',WU.nonstop);}
});
document.getElementById('wlab').setAttribute('aria-pressed',WU.lab==='note');
document.getElementById('wclick').setAttribute('aria-pressed',WU.click);
document.getElementById('wnonstop').setAttribute('aria-pressed',WU.nonstop);
const wt=document.getElementById('wtempo'),wtv=document.getElementById('wtempo-val');
wt.oninput=()=>{const nb=+wt.value;wtv.textContent=nb+' bpm';
  if(wp.on){const now=AC.currentTime,b=wBeat(now);wp.spb=60/nb;wp.start=now-b*wp.spb;}
  WU.bpm=nb;store.set(wTK(),nb);};
wRoutineUI();
function describeWarm(){
  if(document.getElementById('drill-view').hidden||drillMode!=='warmup')return;
  const {pos,kind}=wStepInfo(),k=WKEYS[WU.key][0];
  const p=wAll()[pos];
  document.getElementById('subtitle').textContent=WU.rt==='six'?`Warm-up · ${k} major · position ${pos+1} of 6 · ${kind[1].toLowerCase()}`
    :WU.rt==='fives'?`Vai Fives · ${nameFrom(k,9)} minor pentatonic · box ${p.box} (${pos+1} of 5)`
    :`String Pairs · ${nameFrom(k,9)} minor pentatonic · strings ${6-p.s} and ${5-p.s}`;
}

showMode(drillMode);
// Now that every section is set up, open the one asked for (#improv / #drill) or the last one used.
showView({'#improv':'improv','#drill':'drill'}[location.hash]||store.get('view','drill'));
