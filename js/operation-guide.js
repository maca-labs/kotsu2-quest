const mounted=new WeakMap();
const HOST='operation-guide-host',TARGET='operation-guide-target';
const clamp=(value,min,max)=>Math.min(Math.max(value,min),Math.max(min,max));

/** A decoration of the current real control. It never clicks, types, or focuses. */
export function mountOperationGuide({document:doc,phone,step,showInstruction=false}){
 const empty={destroy(){},scrollToTarget(){return false;}};
 if(!doc||!phone)return empty;
 mounted.get(phone)?.destroy();
 const resolveTarget=()=>{const field=phone.querySelector('[data-guide-target]');if(!field)return null;const tag=String(field.tagName??'').toUpperCase(),filled=['INPUT','TEXTAREA','SELECT'].includes(tag)&&!field.readOnly&&String(field.value??'').trim()!=='';return filled?phone.querySelector('[data-guide-submit]')??field:field;};
 let target=resolveTarget();if(!target)return empty;
 const win=doc.defaultView,hadHost=phone.classList.contains(HOST),listeners=[];
 let destroyed=false,frame=null,ownedTargetClass=false;
 const marker=doc.createElement('div');marker.className='operation-guide-marker';marker.setAttribute('aria-hidden','true');marker.style.pointerEvents='none';
 const label=doc.createElement('span');label.className='operation-guide-label';label.style.pointerEvents='none';
 const arrow=doc.createElement('span');arrow.className='operation-guide-arrow';arrow.style.pointerEvents='none';marker.append(label,arrow);
 phone.classList.add(HOST);phone.append(marker);
 const Resize=win?.ResizeObserver??globalThis.ResizeObserver,Mutation=win?.MutationObserver??globalThis.MutationObserver;
 const resizeObserver=Resize?new Resize(()=>schedule()):null;
 const mutationObserver=Mutation?new Mutation(()=>schedule()):null;
 const clearTarget=()=>{if(target){if(ownedTargetClass)target.classList.remove(TARGET);resizeObserver?.unobserve?.(target);}ownedTargetClass=false;};
 const adoptTarget=next=>{if(next===target&&target.classList.contains(TARGET))return;clearTarget();target=next;if(target){ownedTargetClass=!target.classList.contains(TARGET);target.classList.add(TARGET);resizeObserver?.observe(target);}};
 const initial=target;target=null;adoptTarget(initial);
 function update(){
  if(destroyed)return;
  adoptTarget(resolveTarget());
  if(!target){marker.hidden=true;return;}
  const type=String(target.type??'').toLowerCase(),tag=String(target.tagName??'').toUpperCase();
  const edit=['INPUT','TEXTAREA'].includes(tag)&&!target.readOnly&&!['checkbox','radio','button','submit','reset','range','file','hidden'].includes(type)&&step?.type!=='focus';
  const confirming=phone.querySelector('[data-guide-target]')!==target&&phone.querySelector('[data-guide-submit]')===target;
  const prompt=showInstruction?(confirming?'入力した内容で進もう':step?.instruction??(edit?'ここへ入力':'ここをタップ')):edit?'ここへ入力':'ここをタップ';if(label.textContent!==prompt)label.textContent=prompt;
  const host=phone.getBoundingClientRect(),rect=target.getBoundingClientRect(),borderX=phone.clientLeft??0,borderY=phone.clientTop??0;
  const width=phone.clientWidth||Math.max(0,host.width-borderX*2),height=phone.clientHeight||Math.max(0,host.height-borderY*2),sx=phone.scrollLeft||0,sy=phone.scrollTop||0;
  const x=rect.left-host.left-borderX+sx,y=rect.top-host.top-borderY+sy;
  if(width<=16||height<=16||rect.width<=0||rect.height<=0||x+rect.width<=sx||x>=sx+width||y+rect.height<=sy||y>=sy+height){marker.hidden=true;return;}
  marker.hidden=false;marker.style.maxWidth=`${width-16}px`;
  const size=marker.getBoundingClientRect(),markerWidth=Math.min(size.width||120,width-16),markerHeight=size.height||48;
  const left=clamp(x+rect.width/2-markerWidth/2,sx+8,sx+width-markerWidth-8),above=y-markerHeight-8,below=y+rect.height+8;
  const placement=above>=sy+8?'above':below+markerHeight<=sy+height-8?'below':null;
  // Keep the real control visible when a very short container has no label space.
  if(!placement){marker.hidden=true;return;}
  const top=clamp(placement==='above'?above:below,sy+8,sy+height-markerHeight-8);
  marker.setAttribute('data-placement',placement);const arrowText=placement==='above'?'▼':'▲';if(arrow.textContent!==arrowText)arrow.textContent=arrowText;
  marker.style.left=`${Math.round(left)}px`;marker.style.top=`${Math.round(top)}px`;
  marker.style.setProperty('--guide-arrow-left',`${clamp(x+rect.width/2-left,10,markerWidth-10)}px`);
 }
 function schedule(){if(destroyed||frame!==null)return;if(win?.requestAnimationFrame)frame=win.requestAnimationFrame(()=>{frame=null;update();});else update();}
 const listen=(surface,type,options)=>{if(!surface?.addEventListener)return;surface.addEventListener(type,schedule,options);listeners.push([surface,type,options]);};
 listen(win,'resize');listen(win,'scroll',true);listen(phone,'scroll',true);listen(phone,'load',true);listen(phone,'transitionend',true);listen(phone,'input',true);listen(phone,'change',true);
 resizeObserver?.observe(phone);mutationObserver?.observe(phone,{childList:true,subtree:true,characterData:true});
 function destroy(){
  if(destroyed)return;destroyed=true;
  if(frame!==null&&win?.cancelAnimationFrame)win.cancelAnimationFrame(frame);frame=null;
  for(const[surface,type,options]of listeners)surface.removeEventListener(type,schedule,options);
  resizeObserver?.disconnect();mutationObserver?.disconnect();clearTarget();marker.remove();if(!hadHost)phone.classList.remove(HOST);
  if(mounted.get(phone)===controller)mounted.delete(phone);
 }
 function scrollToTarget(){if(destroyed)return false;const current=resolveTarget();if(!current?.scrollIntoView)return false;current.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});update();return true;}
 const controller={destroy,scrollToTarget};mounted.set(phone,controller);update();return controller;
}
