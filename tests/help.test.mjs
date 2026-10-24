import test from 'node:test';
import assert from 'node:assert/strict';
import {quests,steps} from '../js/content.js';
import {getHelpTopics,getGlossary,explainTerm,humanFieldLabel,displayPracticeValue} from '../js/help.js';
import {openHelp,openCurrentHelp} from '../js/ui-adventure.js';
import {createState,dispatch,activeStep} from '../js/engine.js';
const questById=Object.fromEntries(quests.map(q=>[q.id,q]));

test('all original 572, funding 70 and extension 176 steps get contextual help',()=>{
 assert.equal(steps.filter(step=>!step.extension).length,642);assert.equal(steps.filter(step=>step.extension).length,176);assert.equal(steps.length,818);
 for(const step of steps){
  const topics=getHelpTopics(step,questById[step.questId]);assert.ok(topics.length>0&&topics.length<=5,step.id);
  assert.equal(new Set(topics.map(t=>t.id)).size,topics.length,step.id);
  if(step.questId!=='PR-01')assert.notEqual(topics[0].id,'phone',step.id);
  for(const t of topics)for(const field of ['id','title','short','why','how','example'])assert.ok(typeof t[field]==='string'&&t[field].length>0,`${step.id} ${field}`);
 }
});

test('help distinguishes asset swap, network bridge, gas and the two service places',()=>{
 for(const id of ['USDC','ETH','Arbitrum','wallet','network','HyperCore','HyperEVM','swap','bridge','gas','KYC','lot','Bid/Ask'])assert.ok(explainTerm(id),id);
 assert.match(explainTerm('swap').short,/種類/);assert.match(explainTerm('bridge').short,/ネットワーク/);
 assert.match(explainTerm('gas').how,/道/);assert.match(explainTerm('HyperEVM').short,/別/);
 assert.match(explainTerm('lot').how,/1lot＝1,000通貨/);
 assert.match(explainTerm('staking').example,/1日.*7日/);
});

test('the help of each funding quest explains its actual location in the journey',()=>{
 assert.equal(getHelpTopics({questId:'FI-01'},{id:'FI-01'})[0].id,'yen-funding');
 assert.equal(getHelpTopics({questId:'FI-02'},{id:'FI-02'})[0].id,'self-wallet');
 const topics=getHelpTopics({questId:'FI-03',instruction:'道替えとガスを確認'},{id:'FI-03'});
 assert.ok(topics.some(t=>t.id==='bridge'));assert.ok(topics.some(t=>t.id==='gas'));
});

test('FX help explains opening direction and reserved margin at their first named operations',()=>{
 const direction=steps.find(s=>s.id==='FX-01-005'),margin=steps.find(s=>s.id==='FX-02-002');
 assert.ok(getHelpTopics(direction,questById['FX-01']).some(t=>t.id==='fx-direction'));
 assert.ok(getHelpTopics(margin,questById['FX-02']).some(t=>t.id==='fx-margin'));
 assert.match(explainTerm('新規売り').short,/下がると有利/);
 assert.match(explainTerm('新規買い').example,/新規売り.*別の取引/);
 const cash=explainTerm('FXの証拠金');assert.match(cash.short,/確保/);assert.match(cash.short,/払って消える.*ではありません/);assert.match(cash.how,/150,000.*30,000.*100,000/);assert.match(cash.example,/69,980/);
 const sell=getHelpTopics(steps.find(s=>s.id==='FX-02-S-008'),questById['FX-02-S']);assert.ok(sell.some(t=>t.id==='fx-sell-margin'));assert.ok(!sell.some(t=>t.id==='fx-margin'));assert.match(explainTerm('fx-sell-margin').example,/67,970/);
});

test('help explains the action without inserting the expected answer of a review',()=>{
 const step={questId:'TR-01',type:'input',field:'transferAmount',value:91827364,instruction:'振込金額を入力する'};
 const text=JSON.stringify(getHelpTopics(step,{id:'TR-01'}));assert.ok(!text.includes('91827364'));
 assert.ok(!text.includes('transferAmount'));assert.match(text,/受取|金額|費用/);
});

test('selection values use Japanese option labels rather than internal enum codes',()=>{
 assert.equal(displayPracticeValue({value:'employee'}),'会社員');
 assert.equal(displayPracticeValue({value:'ordinary'}),'普通預金');
 assert.equal(displayPracticeValue({value:'lighthouse',choices:[{value:'lighthouse',label:'灯台ノード・稼働中'}]}),'灯台ノード・稼働中');
 assert.equal(displayPracticeValue({value:'internal_not_for_people'}),'練習カードにある項目');
 for(const step of steps.filter(s=>s.type==='select')){
  const display=displayPracticeValue(step);assert.equal(typeof display,'string');
  assert.ok(!/\b(employee|ordinary|minor-scratches|tracked-200|lighthouse|returnHorizon)\b/.test(display),step.id+' '+display);
 }
});

test('every current field has a human label, including added funding and route fields',()=>{
 for(const field of new Set(steps.map(s=>s.field).filter(Boolean))){assert.notEqual(humanFieldLabel(field),'練習する項目',field);assert.ok(/[ぁ-んァ-ヶ一-龥]/.test(humanFieldLabel(field)),field);}
 assert.equal(humanFieldLabel('unknownPrivateImplementationName'),'練習する項目');
});

test('town help tolerates empty context and object details without changing its inputs',()=>{
 assert.ok(getHelpTopics().length);assert.ok(getHelpTopics(null,null).length);
 const step={questId:'CR-03',instruction:'道を確かめる',details:{asset:'USDC',network:'Arbitrum'}},q={id:'CR-03'},before=structuredClone({step,q});
 getHelpTopics(step,q);assert.deepEqual({step,q},before);
 const first=getGlossary();first[0].title='書き換え';assert.notEqual(getGlossary()[0].title,'書き換え');
 const wallet=explainTerm('wallet');wallet.short='変更';assert.notEqual(explainTerm('wallet').short,'変更');
 assert.equal(explainTerm('unknown term'),null);
});

test('short explanations are complete and diagrams use readable labels',()=>{
 const glossary=getGlossary();assert.ok(glossary.length>=40);
 for(const t of glossary){assert.ok(t.short.length<=85,t.id);assert.ok(t.why.length<=100,t.id);for(const item of t.diagram)assert.ok(typeof item.label==='string'&&item.label.length>0);}
});

test('new terms separate venues, order states, lending and leverage in plain language',()=>{
 for(const term of ['販売所','板取引所','成行','指値','未約定','約定','予約金','予約枚数','レンディング','年率','元本','返還','ロング','ショート','倍率']){
  const topic=explainTerm(term);assert.ok(topic,term);assert.ok(topic.short&&topic.why&&topic.how&&topic.example,term);assert.ok(topic.diagram.length,term);
 }
 assert.match(explainTerm('販売所').short,/窓口/);assert.match(explainTerm('板取引所').short,/買いたい人.*売りたい人/);
 assert.match(explainTerm('未約定').short,/まだ.*成立していない/);assert.match(explainTerm('予約金').how,/買いなら円.*売りなら枚数/);
 assert.match(explainTerm('レンディング').example,/HLP.*ステーキング.*別/);assert.match(explainTerm('年率').how,/365日.*単利/);
 assert.match(explainTerm('返還').why,/返せない危険/);assert.match(explainTerm('倍率').why,/利益.*損失/);
});

test('every new course has its own help and free choices do not leak expected answers',()=>{
 const expected={'DX-01':'domestic-account','DX-02':'kyc','DX-03':'dealer','DX-04':'market-order','DX-05':'limit-order','LD-01':'lending','LV-01':'long-short'};
 for(const [id,topic]of Object.entries(expected))assert.equal(getHelpTopics({questId:id},questById[id])[0].id,topic,id);
 for(const field of ['side','leverage','markPrice']){
  const subject={questId:'LV-01',field,type:'select',value:987654321,acceptAnyChoice:true,instruction:'条件を自分で選ぶ'};
  const text=JSON.stringify(getHelpTopics(subject,questById['LV-01']));assert.ok(!text.includes('987654321'));assert.match(text,/選|向き|倍率/);
 }
 assert.match(explainTerm('practice-repeat').how,/依頼帳.*もう一度/);
});

// Only the DOM surface used by the help menus is needed; this does not emulate
// layout, focus handling or assistive-technology announcements in a browser.
function helpDialogFixture(){
 const context=new Proxy({},{get:(_target,key)=>key==='measureText'?()=>({width:20}):()=>{},set:()=>true});
 const make=tag=>({tagName:tag,children:[],listeners:{},attributes:{},textContent:'',open:false,scrollTop:80,
  append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=nodes;},
  get lastChild(){return this.children.at(-1);},setAttribute(k,v){this.attributes[k]=v;},
  addEventListener(k,fn){this.listeners[k]=fn;},getContext(){return context;},
  showModal(){this.open=true;},close(){this.open=false;}});
 return {document:{createElement:make},modal:make('dialog')};
}
const helpNodes=node=>[node,...node.children.flatMap(helpNodes)];
function helpClick(modal,label){const node=helpNodes(modal).find(n=>n.tagName==='button'&&(typeof label==='string'?n.textContent===label:label.test(n.textContent)));assert.ok(node,`missing help button: ${label}`);node.listeners.click();}

test('unaccepted sky-town help follows the chosen route while an unfinished lesson keeps its context',()=>{
 const fixture=helpDialogFixture(),previousDocument=globalThis.document;globalThis.document=fixture.document;
 try{
  let state=dispatch(dispatch(createState(),{type:'START'}),{type:'CHAPTER',id:'CH-6'});
  const expected={journey:'帰りの資金はどう見る？',spot:'現物（げんぶつ）は何を持つ？',hlp:'HLPは預金の利息と同じ？',stake:'ステーキングと委任って何？',perp:'無期限先物は何をする？'};
  for(const [route,title]of Object.entries(expected)){
   state=dispatch(state,{type:'ROUTE',route});const before=JSON.stringify(state);openCurrentHelp(state,fixture.modal,'what');
   assert.ok(helpNodes(fixture.modal).some(n=>n.textContent===title),route);assert.equal(JSON.stringify(state),before);
  }
  state=dispatch(state,{type:'ROUTE',route:'spot'});state=dispatch(state,{type:'NPC',chapterId:'CH-6',index:0});state=dispatch(state,{type:'ACCEPT',id:'HY-SPOT'});state=dispatch(state,{type:'ROUTE',route:'journey'});
  openCurrentHelp(state,fixture.modal,'what');assert.ok(helpNodes(fixture.modal).some(n=>n.textContent==='現物（げんぶつ）は何を持つ？'));
 }finally{if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;}
});

test('help, tavern and elder keep a named dialog and return without changing unfinished work',()=>{
 const fixture=helpDialogFixture(),previousDocument=globalThis.document;
 globalThis.document=fixture.document;
 try{
  let now=1000000,state=dispatch(createState(),{type:'START'},now++);
  state=dispatch(state,{type:'NPC',chapterId:'CH-5',index:0},now++);
  state=dispatch(state,{type:'ACCEPT',id:'DX-01'},now++);
  for(let i=0;i<4;i++){const step=activeStep(state);state=dispatch(state,{type:'STEP',id:step.id,value:step.value},now++);}
  const before=structuredClone(state),modal=fixture.modal,quest=questById['DX-01'],step=activeStep(state);
  // The real dialog names itself with this ID; every substituted page must keep it.
  const named=()=>{const names=helpNodes(modal).filter(n=>n.id==='modal-title');assert.equal(names.length,1);assert.equal(names[0].tagName,'h2');assert.ok(names[0].textContent);assert.equal(modal.scrollTop,0);};
  for(const mode of ['what','why','glossary','tavern','archive']){openHelp({state,quest,step,modal,mode});named();helpClick(modal,'今の作業へ戻る');assert.equal(modal.open,false);}
  openHelp({state,quest,step,modal});helpClick(modal,'国内取引所の口座って何？');named();
  assert.ok(helpNodes(modal).some(n=>n.textContent==='どうして確かめるの？'));
  assert.ok(helpNodes(modal).some(n=>n.textContent==='この場面では'));
  helpClick(modal,'ほかの説明を聞く');helpClick(modal,'ことばの本を開く');helpClick(modal,'ネットワークって何？');named();helpClick(modal,'今の作業へ戻る');
  openHelp({state,quest,step,modal,mode:'tavern'});helpClick(modal,/^郵便屋ミナ /);named();helpClick(modal,'前に残した控えを見よう');named();helpClick(modal,'今の作業へ戻る');
  openHelp({state,quest,step,modal,mode:'archive'});helpClick(modal,/途中の控え/);named();helpClick(modal,/^1\. /);named();helpClick(modal,'今の作業へ戻る');
  assert.deepEqual(state,before);assert.equal(activeStep(state).id,'DX-01-S005');
 }finally{if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;}
});
