import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {steps,questById} from '../js/content.js';
import {createState} from '../js/engine.js';
import {getStepOpenAppId,getPhoneResumeTarget,getPhoneHomeApps,getPhoneSurfaceAppId} from '../js/phone-navigation.js';
import {renderPhonePanel} from '../js/phone-panels.js';
import {getFxOperationInstruction} from '../js/fx-guidance.js';

class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.style={};this.textContent='';this.events={};}
 get childNodes(){return this.children;}
 append(...nodes){this.children.push(...nodes);}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,fn){this.events[k]=fn;}
}
const doc={createElement:tag=>new Element(tag)},nodes=root=>[root,...root.children.flatMap(n=>nodes(n))];
const source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');

test('each authored home opening has exactly one real app target and advances only on that icon',()=>{
 const expected={'PR-01-001':'memo','PR-01-004':'mail',P001:'browser',P012:'mail','BK-01-001':'bank','TR-01-001':'bank','FX-01-001':'fx','FX-03-001':'points','TC-01-001':'market'};
 assert.equal(steps.filter(s=>/スマホホーム/.test(s.screenTitle??'')).length,Object.keys(expected).length);
 for(const[id,app]of Object.entries(expected)){
  const step=steps.find(s=>s.id===id),state=createState(),before=JSON.stringify(state),actions=[],visits=[];
  const panel=renderPhonePanel({document:doc,state,step,quest:questById[step.questId],onAction:v=>actions.push(v),onNavigate:id=>visits.push(id)}),all=nodes(panel.element),targets=all.filter(n=>n.attributes['data-guide-target']);
  assert.equal(panel.handlesAction,true);assert.equal(targets.length,1,id);assert.equal(targets[0].attributes['data-phone-app'],app,id);assert.equal(getStepOpenAppId(step),app);
  const other=all.find(n=>n.attributes['data-phone-app']&&n!==targets[0]);other.events.click();assert.equal(actions.length,0);assert.equal(visits.length,1);
  targets[0].events.click();assert.equal(actions.length,1,id);assert.equal(JSON.stringify(state),before);
 }
});

test('returning from a detour distinguishes opening a requested app from restoring an unfinished field',()=>{
 const calls=[],env={getStepOpenAppId,getPhoneResumeTarget,ui:{divert:'home'},runStep:(s,v)=>calls.push(['step',s.id,v]),render:()=>calls.push(['render']),orientPhone:()=>calls.push(['orient']),phoneSwitch:id=>calls.push(['visit',id])};vm.createContext(env);vm.runInContext(source.split('\n').find(s=>s.startsWith('function chooseDivertedApp(')),env);
 env.chooseDivertedApp('points',steps.find(s=>s.id==='FX-03-001'));assert.equal(calls[0][0],'step');
 calls.length=0;env.chooseDivertedApp('fx',{id:'FX-01-010',appId:'fx',type:'input'});assert.equal(env.ui.divert,null);assert.deepEqual(calls,[['render'],['orient']]);
 calls.length=0;env.chooseDivertedApp('mail',{id:'FX-01-010',appId:'fx',type:'input'});assert.deepEqual(calls,[['visit','mail']]);
});

test('a detour arrow describes the visible return control without replacing the saved lesson instruction',()=>{
 const env={ui:{divert:'home'},getFxOperationInstruction};vm.createContext(env);vm.runInContext(source.split('\n').find(s=>s.startsWith('function phoneGuideStep(')),env);
 const step={id:'FX-01-010',type:'input',instruction:'0.1lotのチップを押す'},before=JSON.stringify(step),phone={querySelector:()=>({textContent:'「FX」へ戻ろう。'})};
 assert.equal(env.phoneGuideStep(step,phone).instruction,'「FX」へ戻ろう。');assert.equal(JSON.stringify(step),before);env.ui.divert=null;assert.equal(env.phoneGuideStep(step,phone),step);
});

test('other-app detours name their real return button and expose only one target without advancing the lesson',()=>{
 const make=(tag,props={},...children)=>{const el=new Element(tag);for(const[k,v]of Object.entries(props))if(v!==undefined)el.setAttribute(k,v);const add=value=>{if(Array.isArray(value)){value.forEach(add);return;}if(value===null||value===undefined)return;if(typeof value==='string'){const text=new Element('text');text.textContent=value;el.append(text);}else el.append(value);};children.forEach(add);el.textContent=el.children.map(n=>n.textContent).join('');return el;};
 const step=steps.find(s=>s.id==='FX-03-001'),state=createState(),before=JSON.stringify(state),calls=[];
 const env={state,ui:{},h:make,p:t=>make('p',{},t),small:t=>make('small',{},t),btn:(label,fn,cls,attrs={})=>{const el=make('button',attrs,label);el.events.click=fn;return el;},getPhoneResumeTarget,getStepOpenAppId,phoneNavigationForStep:s=>s.navigationAction??null,homeAppNames:{points:'ポイント'},names:{fx:'FX',mail:'メール',memo:'メモ'},questById,getPhoneGuideView:()=>null,render:()=>calls.push('render'),orientPhone:()=>calls.push('orient'),saveQuiet:()=>calls.push('save'),appSymbols:{points:'P',fx:'FX'},appColors:{},operationGuide:null};
 vm.createContext(env);vm.runInContext(source.slice(source.indexOf('function renderDiverted('),source.indexOf('function scenarioBalances(')),env);
 for(const appId of ['fx','mail','memo','browser-tab']){
  env.ui.divert=appId;const body=make('section');env.renderDiverted(body,appId,step);const all=nodes(body),targets=all.filter(n=>n.attributes['data-guide-target']);
  assert.equal(targets.length,1,appId);assert.equal(targets[0].textContent,'練習中の画面へ戻る');
  assert.equal(all.find(n=>n.tagName==='DIV'&&n.attributes.class==='current-operation').children.find(n=>n.tagName==='H2').textContent,'「練習中の画面へ戻る」を押そう。');
  calls.length=0;targets[0].events.click();assert.equal(env.ui.divert,null);assert.deepEqual(calls,['render','orient']);assert.equal(JSON.stringify(state),before);
 }
 const navBody=make('section');env.renderDiverted(navBody,'fx',{...step,navigationAction:'home'});assert.equal(nodes(navBody).filter(n=>n.attributes['data-guide-target']).length,0,'navigation target belongs to the real phone navigation bar');assert.match(navBody.children.find(n=>n.attributes.class==='current-operation').textContent,/下の「ホーム」を押そう。/);
});

test('explicit app metadata takes priority and the required app is never hidden by chapter filtering',()=>{
 const step={id:'custom',openAppId:'fx',appId:'browser',screenTitle:'スマホホーム'},quest={chapterId:'CH-0'};
 assert.equal(getStepOpenAppId(step),'fx');assert.equal(getPhoneResumeTarget(step),'fx');assert.ok(getPhoneHomeApps(quest,step).some(([id])=>id==='fx'));
 assert.equal(getPhoneResumeTarget({appId:'memo',displayAppId:'switcher'}),'switcher');
});

test('the FX condition app keeps its points identity after opening and on detour return',()=>{
 const state=createState(),before=JSON.stringify(state),step=steps.find(s=>s.id==='FX-03-002');
 assert.equal(step.appId,'browser','saved authored metadata remains compatible');assert.equal(getPhoneSurfaceAppId(step),'points');assert.equal(getPhoneResumeTarget(step),'points');
 const panel=renderPhonePanel({document:doc,state,step,quest:questById['FX-03']}),text=nodes(panel.element).map(n=>n.textContent).join(' ');
 assert.match(text,/コツコツモール/);assert.doesNotMatch(text,/まいにちストア|会員プロフィール/);assert.equal(JSON.stringify(state),before);
});
