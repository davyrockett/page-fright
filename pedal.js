/* Page-turner pedal (David's two-pedal Bluetooth turner, 2026-10-30). It acts as a keyboard: depending on its mode
   the left pedal sends ←, Page Up or ↑ and the right one →, Page Down or ↓, so all three pairs work. A tap acts when
   the pedal comes back up. Only the right pedal has a hold (half a second): holding the left one shows the iPad's
   keyboard, so a long left press does nothing here. Shares globals from index.html, improv.js, drill.js, chords.js
   and warmup.js. */
const PEDAL_L=['ArrowLeft','PageUp','ArrowUp'],PEDAL_R=['ArrowRight','PageDown','ArrowDown'],PEDAL_HOLD=500;
const pedal={key:null,t:0,timer:0,held:false};
const pedalSide=k=>PEDAL_L.includes(k)?'left':PEDAL_R.includes(k)?'right':null;

// What each pedal does in the section (and Drill mode) on screen.
function pedalActions(){
  if(!document.getElementById('read-view').hidden)return{
    left:()=>player.on?stop():play(),
    right:()=>newExercise({stay:true,go:true}),
    hold:toggleTab};
  if(!document.getElementById('improv-view').hidden)return{
    left:()=>bp.on?bstop():bstart(),
    right:()=>pedalLick(1),hold:()=>pedalLick(-1)};
  if(drillMode==='warmup')return{
    left:()=>wp.on?wstop():wstart(),
    right:()=>{wGo(WU.step+1);wstart();},hold:()=>{wGo(WU.step-1);wstart();}};
  if(chordsLike())return{left:()=>pedalVoicing(0),right:()=>pedalVoicing(1),hold:()=>pedalVoicing(-1)};
  return{left:()=>pedalShape(0),right:()=>pedalShape(1),hold:()=>pedalShape(-1)};
}
// Improv: the next (or previous) lick, heard right away; with the band playing it comes in on the next bar.
function pedalLick(d){if(!licksOn()||!lickList().length)return;stepLick(d);lplay();}
// Chords and Shells: strum the next (or previous, or same) voicing, one per press.
function pedalVoicing(d){
  if(!voicings.length||!audio())return;cstop();
  const n=voicings.length;selectVoicing((CH.sel+d+n)%n);
}
// Triads: strum the next (or previous, or same) shape up the neck, one per press.
function pedalShape(d){
  if(!tShapes.length||!audio())return;
  const n=tShapes.length,cur=tFocus.length===1?tFocus[0]:d>0?-1:0;dstop();
  const i=d===0?Math.max(cur,0):(cur+d+n)%n;
  tFocus=[i];strumShape(tShapes[i],AC.currentTime);drawDrill();scrollToFocus();
}

document.addEventListener('keydown',e=>{
  const side=pedalSide(e.key);if(!side)return;
  if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey||document.querySelector('.tmodal:not([hidden])'))return;
  if(e.target.closest('input:not([type=range]):not([type=checkbox]):not([type=radio]),textarea,[contenteditable="true"]'))return;
  e.preventDefault();   // no scrolling, and a focused slider or list doesn't change
  if(e.repeat||pedal.key)return;
  pedal.key=e.key;pedal.t=performance.now();pedal.held=false;
  if(side==='right')pedal.timer=setTimeout(()=>{pedal.held=true;pedalActions().hold();},PEDAL_HOLD);
});
document.addEventListener('keyup',e=>{
  if(e.key!==pedal.key)return;
  clearTimeout(pedal.timer);pedal.key=null;
  if(pedal.held||performance.now()-pedal.t>=PEDAL_HOLD)return;
  const a=pedalActions();(pedalSide(e.key)==='left'?a.left:a.right)();
});
addEventListener('blur',()=>{clearTimeout(pedal.timer);pedal.key=null;});
