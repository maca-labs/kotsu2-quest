import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createState,dispatch,activeStep,questState,parseSave,totalXp,SAVE_KEY} from '../js/engine.js';
import {questById,steps as catalog} from '../js/content.js';
import {quests as additional,steps as newSteps} from '../js/content-extension.js';
import {SaveStore} from '../js/storage.js';
const T=1800000000000;
function begin(){let s=dispatch(createState(),{type:'START'},T);for(const chapterId of ['CH-5','CH-6'])s=dispatch(s,{type:'NPC',chapterId,index:0},T);return s;}
const valueFor=a=>a.type==='check'?true:a.value;
// Optional undefined command values are omitted by JSON by design.
const serialized=s=>JSON.parse(JSON.stringify(s));
function finish(s,id,{timed=false,at=T,finishAt=at,cuts=false,settingsAfterAccept=false}={}){
 s=dispatch(s,{type:'ACCEPT',id,timed},at);
 if(settingsAfterAccept)s=dispatch(s,{type:'SETTINGS',values:{durationHours:1}},at);
 let n=0;
 while(activeStep(s)){
  const a=activeStep(s),last=n===questById[id].stepIds.length-1;
  s=dispatch(s,{type:'STEP',id:a.id,value:valueFor(a)},last?finishAt:at);
  n++;
  if(cuts&&(a.extensionAction||a.type==='input'||a.type==='select'||last)){
   const before=structuredClone(s);s=parseSave(JSON.stringify(s));assert.deepEqual(s,serialized(before),'JSON checkpoint '+a.id);
   assert.throws(()=>dispatch(s,{type:'STEP',id:a.id,value:valueFor(a)},last?finishAt:at));
   assert.deepEqual(s,serialized(before),'stale step must be atomic '+a.id);
  }
 }
 return s;
}

test('QA: new domestic/lending/leverage cut points restore exact aggregate and refuse stale duplicate commands',()=>{
 let s=begin();for(const q of additional)s=finish(s,q.id,{cuts:true});
 assert.equal(catalog.length,818);assert.equal(newSteps.length,176);
 assert.equal(totalXp(s),638);assert.equal(s.rewardEvents.filter(e=>e.id.startsWith('step:')).length,176);
 assert.equal(new Set(s.rewardEvents.map(e=>e.id)).size,s.rewardEvents.length);
 assert.deepEqual(s.worldState.seals,[]);assert.deepEqual(s.inventory,['traveler-staff']);
 for(const id of ['HY-SPOT','HY-HLP','HY-STAKE','HY-PERP','CR-01','CR-02','CR-03','FI-01'])assert.equal(questState(s,id),undefined);
});

test('QA: 24-hour exact boundaries apply after simulated 30 days, while accepted duration remains fixed',()=>{
 for(const [offset,awarded]of [[86400000-1,true],[86400000,true],[86400000+1,false]]){
  let s=finish(begin(),'LD-01',{timed:true,finishAt:T+offset,settingsAfterAccept:true});
  const qs=s.questStates['LD-01'];
  assert.equal(qs.acceptedAtReal,T);assert.equal(qs.durationHoursAtAccept,24);assert.equal(qs.deadlineAtReal,T+86400000);
  assert.equal(qs.completed,true);assert.equal(qs.timeBonusAwarded,awarded);assert.equal(totalXp(s),90+(awarded?10:0));
  assert.equal(s.financialScenarios['lending-lab'].accounts.availableUSDC,1000.986301);
  assert.deepEqual(parseSave(JSON.stringify(s)),serialized(s));
 }
});

test('QA: clock rollback at more than five minutes blocks only the optional reward',()=>{
 let s=begin();s=dispatch(s,{type:'ACCEPT',id:'LV-01',timed:true},T+600000);
 const accept=s.questStates['LV-01'].acceptedAtReal;
 while(activeStep(s)){const a=activeStep(s);s=dispatch(s,{type:'STEP',id:a.id,value:valueFor(a)},T+299999);}
 assert.equal(s.questStates['LV-01'].acceptedAtReal,accept);assert.equal(s.questStates['LV-01'].timeBonusStatus,'clock-unverified');
 assert.equal(s.questStates['LV-01'].timeBonusAwarded,false);assert.equal(totalXp(s),90);
 assert.equal(s.financialScenarios['leverage-choice'].accounts.availableUSDC,990);
 assert.deepEqual(parseSave(JSON.stringify(s)),serialized(s));
});

test('QA: original completed 642-step save continues new optional courses without changing any old financial or reward record',()=>{
 const raw=JSON.parse(fs.readFileSync(new URL('./fixtures/pre-extension-v3.json',import.meta.url),'utf8'));
 let s=parseSave(JSON.stringify(raw));const before=structuredClone(s);
 for(const q of additional)s=finish(s,q.id,{at:Math.max(T,s.realClockState.lastObservedAt)});
 for(const [id,scenario]of Object.entries(raw.financialScenarios))assert.deepEqual(s.financialScenarios[id],scenario,'old ledger '+id);
 for(const [id,qs]of Object.entries(raw.questStates))assert.deepEqual(s.questStates[id],qs,'old quest '+id);
 assert.deepEqual(s.rewardEvents.slice(0,before.rewardEvents.length),before.rewardEvents);
 assert.equal(totalXp(s)-totalXp(before),632);
 assert.deepEqual(s.inventory,before.inventory);assert.deepEqual(s.worldState.seals,before.worldState.seals);
 assert.deepEqual(s.bossStates,before.bossStates);assert.equal(s.navigationVersion,2);
 assert.deepEqual(parseSave(JSON.stringify(s)),serialized(s));
});

test('QA: all review field and financial cut points replay independently and can be repeated with zero XP',()=>{
 let s=begin();for(const q of additional)s=finish(s,q.id);
 const before=structuredClone({money:s.financialScenarios,quests:s.questStates,xp:totalXp(s),inventory:s.inventory,clock:s.realClockState});
 for(const q of additional){for(let repeat=0;repeat<2;repeat++){
  if(repeat)s=dispatch(s,{type:'RESTART_REVIEW',id:q.id},T);
  for(const task of q.reviewVariant.tasks)for(const a of task.actions??[task]){
   s=dispatch(s,{type:'REVIEW_ACTION',id:q.id,taskId:task.id,actionId:a.id,value:valueFor(a)},T);
   if(a.extensionAction||a.type==='input'||a.type==='select')assert.deepEqual(parseSave(JSON.stringify(s)),serialized(s),'review cut '+a.id);
  }
  assert.equal(s.reviewStates[q.id].completed,true);
 }}
 assert.deepEqual({money:s.financialScenarios,quests:s.questStates,xp:totalXp(s),inventory:s.inventory,clock:s.realClockState},before);
 assert.deepEqual(parseSave(JSON.stringify(s)),serialized(s));
});

test('QA: corrupted/rejected JSON leaves stored progress intact, and new conflicting revision cannot be overwritten',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');const values=new Map();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)}});
 try{
  const s=begin(),raw=JSON.stringify(s);values.set(SAVE_KEY,raw);
  const a=new SaveStore();assert.deepEqual(a.load(),serialized(s));a.writable=true;
  assert.throws(()=>a.replace('{bad-json'));assert.equal(values.get(SAVE_KEY),raw);
  const corrupted=JSON.parse(raw);corrupted.rewardEvents.push({id:'invented',xp:999});values.set(SAVE_KEY,JSON.stringify(corrupted));
  const damagedRaw=values.get(SAVE_KEY),b=new SaveStore();b.load();b.writable=true;assert.equal(b.rawCorrupt,damagedRaw);
  assert.throws(()=>b.save(createState()));assert.equal(values.get(SAVE_KEY),damagedRaw);
  values.set(SAVE_KEY,raw);const c=new SaveStore();c.load();c.writable=true;
  const newer=dispatch(s,{type:'CHAPTER',id:'CH-6'},T);values.set(SAVE_KEY,JSON.stringify(newer));
  assert.throws(()=>c.save(dispatch(s,{type:'CHAPTER',id:'CH-5'},T)));
  assert.equal(c.writable,false);assert.equal(values.get(SAVE_KEY),JSON.stringify(newer));
 }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});

test('QA: unavailable localStorage retains aggregate in memory for JSON export',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem(){throw new Error('denied');},setItem(){throw new Error('quota');}}});
 try{
  const store=new SaveStore();store.load();store.writable=true;const s=begin();
  assert.equal(store.save(s),false);assert.equal(store.memory,s);assert.equal(store.available,false);
  assert.deepEqual(parseSave(JSON.stringify(store.memory)),serialized(s));
 }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});

test('QA: runtime imports, local CSS dependencies and HTML assets stay within a repository subpath',()=>{
 const root=fileURLToPath(new URL('../',import.meta.url)),entry=new URL('https://example.test/repository/');
 const found=new Set();function inspect(rel){
  if(found.has(rel))return;found.add(rel);const source=fs.readFileSync(path.join(root,rel),'utf8');
  const refs=rel.endsWith('.html')?[...source.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]):rel.endsWith('.js')?[...source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map(m=>m[1]):rel.endsWith('.css')?[...source.matchAll(/url\(\s*['"]?([^'"\)]+)|@import\s+['"]([^'"]+)['"]/g)].map(m=>m[1]??m[2]):[];
  for(const reference of refs){if(reference.startsWith('data:'))continue;assert.ok(reference.startsWith('./')||reference.startsWith('../'),'relative runtime ref '+rel+':'+reference);const resolved=new URL(reference,new URL(rel,entry));assert.equal(resolved.origin,entry.origin);assert.ok(resolved.pathname.startsWith(entry.pathname),resolved.href);const next=resolved.pathname.slice(entry.pathname.length);assert.ok(fs.existsSync(path.join(root,next)),next);if(/\.(js|css|html)$/.test(next))inspect(next);}
 }
 inspect('index.html');assert.ok(found.has('js/finance-extension.js'));assert.ok(found.has('js/content-extension.js'));assert.ok(found.has('styles/phone-extension.css'));assert.ok(found.has('styles/world-extension.css'));
});


test('QA: rollback threshold is inclusive at exactly five minutes, with the smaller boundary still eligible',()=>{
 for(const [rollback,held]of [[299999,false],[300000,true],[300001,true]]){
  let s=begin();s=dispatch(s,{type:'ACCEPT',id:'LV-01',timed:true},T);
  s=dispatch(s,{type:'SETTINGS',values:{hideTime:false}},T+600000);
  while(activeStep(s)){const a=activeStep(s);s=dispatch(s,{type:'STEP',id:a.id,value:valueFor(a)},T+600000-rollback);}
  assert.equal(s.questStates['LV-01'].timeBonusStatus,held?'clock-unverified':'awarded','rollback '+rollback+'ms');
  assert.equal(s.questStates['LV-01'].timeBonusAwarded,!held);
  assert.equal(totalXp(s),90+(held?0:10));
  assert.deepEqual(parseSave(JSON.stringify(s)),serialized(s));
 }
});
