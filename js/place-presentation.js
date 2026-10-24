const arrivalLabels={town:'町に入りました',house:'家に入りました',tavern:'酒場に入りました',church:'教会に入りました',shop:'店に入りました',cave:'洞窟に入りました'};

// The caller supplies the actual place even while its map is hidden. Rendering
// a menu, a saved result, or the same shop again must not restart the deadline.
export function createPlaceBanner({document:doc,now,durationMs=2800}){
 const host=doc.defaultView??globalThis,clock=now??(()=>host.performance?.now?.()??Date.now());
 const duration=Number.isFinite(durationMs)?Math.max(0,durationMs):2800;
 let key=null,until=0,element=null,timer=null,observer=null,removeResize=null,restoreHost=null,destroyed=false;
 function clearDisplay(){
  if(timer!==null){host.clearTimeout(timer);timer=null;}
  observer?.disconnect();observer=null;removeResize?.();removeResize=null;
  element?.remove();element=null;restoreHost?.();restoreHost=null;
 }
 function sync({place,visible=true,host:container,anchor=container}={}){
  if(destroyed)return null;
  const valid=typeof place?.key==='string'&&place.key.length>0&&typeof place?.title==='string'&&place.title.length>0;
  const nextKey=valid?place.key:null;
  if(nextKey!==key){key=nextKey;until=valid?clock()+duration:0;}
  clearDisplay();
  if(!valid||!visible||!container?.isConnected||!anchor?.isConnected||clock()>=until)return null;
  const banner=doc.createElement('div'),caption=doc.createElement('small'),title=doc.createElement('strong');
  banner.className='place-arrival-banner';banner.setAttribute('role','status');banner.setAttribute('aria-live','polite');banner.setAttribute('aria-atomic','true');banner.setAttribute('data-place-key',place.key);
  caption.textContent=arrivalLabels[place.kind]??'ここに入りました';title.textContent=place.title;banner.append(caption,title);
  banner.style.position='absolute';banner.style.pointerEvents='none';
  const previousPosition=container.style.position??'',needsPosition=!host.getComputedStyle||host.getComputedStyle(container).position==='static';
  if(needsPosition)container.style.position='relative';
  restoreHost=()=>{if(needsPosition)container.style.position=previousPosition;};
  container.append(banner);element=banner;
  function position(){
   if(destroyed||element!==banner)return;
   if(!container.isConnected||!anchor.isConnected){clearDisplay();return;}
   const outer=container.getBoundingClientRect(),bounds=anchor.getBoundingClientRect();
   banner.style.top=`${Math.max(0,bounds.top-outer.top-(container.clientTop??0)+8)}px`;
   banner.style.left=`${bounds.left-outer.left-(container.clientLeft??0)+bounds.width/2}px`;
   banner.style.maxWidth=`${Math.max(0,bounds.width-20)}px`;
   banner.style.visibility=bounds.width>0?'':'hidden';
  }
  position();
  if(element!==banner)return null;
  if(host.ResizeObserver){observer=new host.ResizeObserver(position);observer.observe(anchor);if(anchor!==container)observer.observe(container);}
  if(host.addEventListener){host.addEventListener('resize',position);removeResize=()=>host.removeEventListener('resize',position);}
  timer=host.setTimeout(()=>{if(element!==banner)return;timer=null;clearDisplay();},Math.max(0,until-clock()));
  return banner;
 }
 function reset(){if(destroyed)return;clearDisplay();key=null;until=0;}
 function destroy(){if(destroyed)return;reset();destroyed=true;}
 return {sync,reset,destroy};
}

// A room title names a place; this separate card identifies an actual speaker.
// Portrait nodes come from the existing original pixel-art renderer.
export function renderSpeakerIdentity({document:doc,name,role,portrait}={}){
 const root=doc.createElement('section'),copy=doc.createElement('div'),label=doc.createElement('small'),title=doc.createElement('strong');
 root.className=`speaker-identity${portrait?' has-portrait':''}`;root.setAttribute('aria-label','話している人');
 label.className='speaker-label';label.textContent='話している人';title.className='speaker-name';title.textContent=String(name??'案内人');
 if(portrait){const picture=doc.createElement('div');picture.className='speaker-portrait';picture.setAttribute('aria-hidden','true');picture.append(portrait);root.append(picture);}
 copy.className='speaker-copy';copy.append(label,title);
 if(role){const detail=doc.createElement('span');detail.className='speaker-role';detail.textContent=String(role);copy.append(detail);}
 root.append(copy);return root;
}
