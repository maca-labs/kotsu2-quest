const directions=[
 {id:'up',label:'上',arrow:'▲',dx:0,dy:-1},
 {id:'left',label:'左',arrow:'◀',dx:-1,dy:0},
 {id:'right',label:'右',arrow:'▶',dx:1,dy:0},
 {id:'down',label:'下',arrow:'▼',dx:0,dy:1}
];

// The controls only request a move. The caller keeps collision, saving and all
// game state in the existing walk/nearbyTalk entry points.
export function renderWorldControls({document,onMove,onTalk,canMove=()=>true}){
 const host=document.defaultView??globalThis;
 const root=document.createElement('section'),pad=document.createElement('div'),note=document.createElement('p');
 root.className='world-controls';pad.className='world-dpad';
 pad.setAttribute('role','group');pad.setAttribute('aria-label','町を歩く十字キー');
 note.className='world-controls-note';note.textContent='押し続けると歩く。指をずらして向きを変えよう。町の人の近くで「話す」。';
 root.append(pad,note);
 const buttons=new Map(),listeners=[];
 let pointerId=null,direction=null,timer=null,destroyed=false,suppressClickUntil=0;
 const now=()=>host.performance?.now?.()??Date.now();
 const listen=(target,name,fn)=>{target?.addEventListener(name,fn);listeners.push(()=>target?.removeEventListener(name,fn));};
 const usable=()=>!destroyed&&root.isConnected&&!document.hidden&&canMove();
 const mark=()=>{for(const [button,d]of buttons)button.classList.toggle('held',d===direction);};
 function stop(){
  if(timer!==null){host.clearTimeout(timer);timer=null;}
  const held=pointerId;pointerId=null;direction=null;mark();
  if(held!==null){suppressClickUntil=now()+750;try{if(pad.hasPointerCapture?.(held))pad.releasePointerCapture(held);}catch{}}
 }
 function step(){if(!usable()){stop();return false;}onMove(direction.dx,direction.dy);return usable()&&pointerId!==null&&direction!==null;}
 function repeat(){timer=null;if(direction&&step())timer=host.setTimeout(repeat,145);}
 function turn(next,delay=145){
  if(direction===next)return;
  if(timer!==null){host.clearTimeout(timer);timer=null;}
  direction=next;mark();
  if(next&&step())timer=host.setTimeout(repeat,delay);
 }
 function pointerDown(event,d){
  if(destroyed||pointerId!==null||(event.button!==undefined&&event.button!==0)||!usable())return;
  event.preventDefault();pointerId=event.pointerId??1;suppressClickUntil=now()+750;
  try{pad.setPointerCapture?.(pointerId);}catch{}
  turn(d,260);
 }
 function samePointer(event){return pointerId!==null&&(event.pointerId??1)===pointerId;}
 function pointerMove(event){
  if(!samePointer(event))return;
  const r=pad.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>=r.right||event.clientY<r.top||event.clientY>=r.bottom){stop();return;}
  event.preventDefault();
  let target=document.elementFromPoint(event.clientX,event.clientY);
  while(target&&target!==pad&&!buttons.has(target))target=target.parentElement;
  turn(buttons.get(target)??null);
 }
 function pointerEnd(event){if(samePointer(event))stop();}
 for(const d of directions){
  const button=document.createElement('button'),arrow=document.createElement('span'),label=document.createElement('span');
  button.type='button';button.className=`world-direction ${d.id}`;button.setAttribute('aria-label',`${d.label}へ歩く`);
  arrow.className='world-direction-arrow';arrow.textContent=d.arrow;arrow.setAttribute('aria-hidden','true');
  label.textContent=d.label;button.append(arrow,label);buttons.set(button,d);pad.append(button);
  listen(button,'pointerdown',event=>pointerDown(event,d));
  listen(button,'click',event=>{if(Number(event.detail)>0&&now()<suppressClickUntil){event.preventDefault();return;}stop();if(usable())onMove(d.dx,d.dy);});
 }
 const talk=document.createElement('button');talk.type='button';talk.className='world-talk';talk.textContent='話す';
 listen(talk,'click',()=>{stop();if(!destroyed&&root.isConnected&&!document.hidden)onTalk();});pad.append(talk);
 listen(pad,'pointermove',pointerMove);listen(pad,'pointerleave',pointerEnd);listen(pad,'lostpointercapture',pointerEnd);
 listen(host,'pointerup',pointerEnd);listen(host,'pointercancel',pointerEnd);listen(host,'blur',stop);
 listen(document,'visibilitychange',()=>{if(document.hidden)stop();});
 listen(pad,'contextmenu',event=>event.preventDefault());
 listen(pad,'keydown',event=>{
  const d={ArrowUp:directions[0],ArrowLeft:directions[1],ArrowRight:directions[2],ArrowDown:directions[3]}[event.key];
  if(d){event.preventDefault();event.stopPropagation();stop();if(usable())onMove(d.dx,d.dy);}
  else if(event.key==='Escape')stop();
 });
 const Observer=host.MutationObserver;
 const observer=Observer?new Observer(()=>{if(!root.isConnected)stop();}):null;
 if(observer&&document.documentElement)observer.observe(document.documentElement,{childList:true,subtree:true});
 function destroy(){if(destroyed)return;stop();destroyed=true;observer?.disconnect();for(const remove of listeners)remove();}
 return {element:root,stop,destroy};
}
