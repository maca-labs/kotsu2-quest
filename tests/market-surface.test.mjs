import test from 'node:test';
import assert from 'node:assert/strict';
import {questById} from '../js/content.js';
import {createState,dispatch,activeStep} from '../js/engine.js';
import {renderPhonePanel} from '../js/phone-panels.js';

class Element {
 constructor(tag){this.tag=tag;this.childNodes=[];this.style={};this.attributes={};this.listeners={};this.textContent='';this.rectangles=[];}
 append(...children){this.childNodes.push(...children);}
 setAttribute(key,value){this.attributes[key]=value;}
 addEventListener(event,callback){this.listeners[event]=callback;}
 getContext(){const rectangles=this.rectangles;return {fillRect(...rect){rectangles.push([...rect,this.fillStyle]);}};}
}
const document={createElement:tag=>new Element(tag)};
const flatten=node=>node?[node,...node.childNodes.flatMap(flatten)]:[];

function journey(){
 let state=createState(),now=Date.now();
 const act=command=>{state=dispatch(state,command,++now);};
 for(const command of [{type:'START'},{type:'CHAPTER',id:'CH-4'},{type:'NPC',chapterId:'CH-4',index:0},{type:'ACCEPT',id:'TC-01'}])act(command);
 function finishStep(){
  const step=activeStep(state);
  act({type:'STEP',id:step.id,value:step.type==='check'?true:step.value});
 }
 function at(id){
  while(activeStep(state)?.id!==id){
   if(!activeStep(state))act({type:'ACCEPT',id:'TC-02'});
   else finishStep();
  }
  const step=activeStep(state);
  const panel=renderPhonePanel({document,state,step,quest:questById[step.questId],onAction:value=>act({type:'STEP',id,value})});
  const nodes=flatten(panel?.element);
  return {text:nodes.map(n=>n.textContent).join(' '),canvas:nodes.find(n=>n.tag==='canvas'),buttons:nodes.filter(n=>n.tag==='button'),handlesAction:panel?.handlesAction};
 }
 return {at,get state(){return state;},reload(){state=JSON.parse(JSON.stringify(state));}};
}

test('each inspection opens its own photo; arrivals and the purchase listing have separate inspections',()=>{
 const j=journey();
 for(const [front,back,next] of [['TC-01-009','TC-01-010','TC-01-011'],['TC-02-003','TC-02-004','TC-02-005']]){
  const before=j.at(front);
  assert.equal(before.canvas,undefined);
  assert.equal(before.handlesAction,true);
  assert.equal(before.buttons.length,1);assert.ok(before.buttons[0].attributes['data-guide-target']);
  before.buttons[0].listeners.click();
  assert.equal(activeStep(j.state).id,back);
  const photo=j.at(back);
  assert.match(photo.canvas.attributes['aria-label'],/3枚の表面/);
  assert.equal(photo.buttons.length,1);assert.ok(photo.buttons[0].attributes['data-guide-target']);
  photo.buttons[0].listeners.click();
  j.reload();
  const reversed=j.at(next);
  assert.equal(reversed.handlesAction,false);
  assert.match(reversed.canvas.attributes['aria-label'],/右下.*すり傷/);
  assert.notDeepEqual(photo.canvas.rectangles,reversed.canvas.rectangles);
  assert.ok(reversed.canvas.rectangles.some(rect=>rect.at(-1)==='#fff9e4'));
 }
});

test('the seller sees only their confirmed photos and packing steps and the notice for each event',()=>{
 const j=journey();
 assert.doesNotMatch(j.at('TC-01-006').text,/2,900円/);
 assert.match(j.at('TC-01-008').text,/2,900円.*3,000円.*3,100円/);
 assert.match(j.at('TC-02-002').text,/到着通知/);
 assert.match(j.at('TC-02-007').text,/添付した写真 まだありません/);
 assert.match(j.at('TC-02-008').text,/添付した写真 表面$/);
 assert.match(j.at('TC-02-009').text,/添付した写真 表面・裏面/);
 assert.match(j.at('TC-02-022').text,/小さな傷.*3,000円.*追跡あり/);
 assert.match(j.at('TC-02-023').text,/出品中/);
 const sold=j.at('TC-02-024').text;
 assert.match(sold,/購入通知/);assert.doesNotMatch(sold,/発送済み|入金済み|希望価格/);
 assert.match(j.at('TC-02-026').text,/台紙 これから.*袋 これから/);
 assert.match(j.at('TC-02-027').text,/台紙 つけました.*袋 これから/);
 assert.match(j.at('TC-02-028').text,/台紙 つけました.*袋 入れました/);
 assert.match(j.at('TC-02-029').text,/発送した荷物/);
 assert.match(j.at('TC-02-030').text,/受取通知/);
 assert.doesNotMatch(j.at('TC-02-031').text,/希望価格|未精算の売上/);
});
