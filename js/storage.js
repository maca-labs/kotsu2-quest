import {SAVE_KEY,parseSave,createState} from './engine.js';
const LEASE_KEY=`${SAVE_KEY}.editor`;
export class SaveStore{
 constructor(onConflict){this.onConflict=onConflict;this.available=true;this.writable=false;this.token=globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`;this.rawCorrupt=null;this.memory=null;this.seenRevision=0;}
 load(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return createState();try{const state=parseSave(raw);this.seenRevision=state.revision;if(JSON.parse(raw).navigationVersion===undefined){this.preMigrationRaw=raw;this.migrationNotice='前の冒険の工程・XP・装備・練習残高を保ったまま、全章を選べるようにしました。';}return state;}catch(e){this.rawCorrupt=raw;this.problem=e.message;return createState();}}catch{this.available=false;return createState();}}
 async acquire(){
  if(!this.available){this.writable=true;return;}
  if(navigator.locks?.request){await new Promise(resolve=>{navigator.locks.request(SAVE_KEY,{ifAvailable:true},async lock=>{this.writable=!!lock;resolve();if(lock)await new Promise(done=>this.release=done);});});}
  else{try{const old=JSON.parse(localStorage.getItem(LEASE_KEY)||'null');if(old&&Date.now()-old.at<6000){this.writable=false;return;}localStorage.setItem(LEASE_KEY,JSON.stringify({token:this.token,at:Date.now()}));await new Promise(resolve=>setTimeout(resolve,120));this.writable=JSON.parse(localStorage.getItem(LEASE_KEY)||'null')?.token===this.token;if(this.writable)this.heartbeat=setInterval(()=>{try{const lease=JSON.parse(localStorage.getItem(LEASE_KEY)||'null');if(lease?.token!==this.token){this.conflict();return;}localStorage.setItem(LEASE_KEY,JSON.stringify({token:this.token,at:Date.now()}));}catch{this.conflict();}},2000);}catch{this.available=false;this.writable=true;}}
  addEventListener('storage',e=>{if(e.key===SAVE_KEY&&e.newValue){try{const rev=JSON.parse(e.newValue).revision;if(rev>this.seenRevision)this.conflict();}catch{this.conflict();}}});
  addEventListener('pagehide',()=>{this.release?.();clearInterval(this.heartbeat);if(this.writable&&!navigator.locks?.request)try{if(JSON.parse(localStorage.getItem(LEASE_KEY)||'null')?.token===this.token)localStorage.removeItem(LEASE_KEY);}catch{}});
 }
 conflict(){this.writable=false;this.onConflict?.();}
 save(state){this.memory=state;if(!this.writable)throw new Error('別のタブが冒険を編集中です。この画面を再読み込みしてください。');if(this.rawCorrupt)throw new Error('破損した記録を保護しています。書出し・読込み・新規開始から選んでください。');if(!this.available)return false;try{const current=localStorage.getItem(SAVE_KEY);if(current&&JSON.parse(current).revision>this.seenRevision){this.conflict();throw new Error('別タブの新しい記録があります。再読み込みしてください。');}localStorage.setItem(SAVE_KEY,JSON.stringify(state));this.seenRevision=state.revision;return true;}catch(e){if(!this.writable)throw e;this.available=false;return false;}}
 replace(text){const next=parseSave(text);if(!this.writable)throw new Error('編集できるタブで読み込んでください。');this.rawCorrupt=null;this.memory=next;this.seenRevision=next.revision;if(JSON.parse(text).navigationVersion===undefined)this.preMigrationRaw=text;try{localStorage.setItem(SAVE_KEY,JSON.stringify(next));}catch{this.available=false;}return next;}
 reset(){if(!this.writable)throw new Error('編集できるタブで操作してください。');this.rawCorrupt=null;this.seenRevision=0;try{localStorage.removeItem(SAVE_KEY);}catch{}return createState();}
 legacy(){try{return ['trainingHub.save.v1','pointquest.save.v1','pointquest.save.v2','hyperliquidRehearsal:v1'].filter(k=>localStorage.getItem(k)).map(key=>({key,raw:localStorage.getItem(key)}));}catch{return [];}}
}
export function downloadText(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
