import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,dispatch,activeStep,questState,totalXp,chapterResumeKey} from '../js/engine.js';
import {quests,questById,stepById,contentEffect} from '../js/content.js';
import {applyFinancialStep} from '../js/finance.js';
import {renderPhonePanel} from '../js/phone-panels.js';

const answer=step=>step.value??step.choices?.[0]?.value??true;

test('switching chapters resumes the matching partial quest and retains both original clocks and checkpoints',()=>{
  let s=createState(),now=1_000_000_000;
  const act=c=>s=dispatch(s,c,now++);
  assert.equal(chapterResumeKey(s),null);assert.equal(chapterResumeKey(s,'CH-5'),null);
  act({type:'START'});act({type:'NPC',chapterId:'CH-0',index:0});act({type:'ACCEPT',id:'PR-01'});
  while(activeStep(s)){const step=activeStep(s);act({type:'STEP',id:step.id,value:answer(step)});}
  act({type:'UNLOCK',code:'POINT-START'});act({type:'UNLOCK',code:'CRYPTO-START'});
  const entry=quests.find(q=>q.chapterId==='CH-5'&&!q.extra);
  for(const [chapter,id]of [['CH-1','PO-01'],['CH-5',entry.id]]){
    act({type:'CHAPTER',id:chapter});act({type:'NPC',chapterId:chapter,index:0});act({type:'ACCEPT',id,timed:true});
    const step=activeStep(s);act({type:'STEP',id:step.id,value:answer(step)});
  }
  const before=structuredClone(s),xp=totalXp(s);
  for(const [chapter,id,checkpoint]of [['CH-1','PO-01','P002'],['CH-5',entry.id,entry.stepIds[1]],['CH-1','PO-01','P002']]){
    act({type:'CHAPTER',id:chapter});
    assert.equal(chapterResumeKey(s),id);assert.equal(chapterResumeKey(s,chapter),id);
    const chosen=s.questStates[chapterResumeKey(s)];act({type:'ACCEPT',id:chosen.questId,timed:false});
    assert.equal(s.activeQuestKey,id);assert.equal(activeStep(s).id,checkpoint);
    assert.deepEqual(questState(s,id),questState(before,id));
    assert.equal(totalXp(s),xp);assert.deepEqual(s.financialScenarios,before.financialScenarios);
  }
  assert.equal(chapterResumeKey(s,'CH-2'),null);assert.equal(chapterResumeKey(s,'CH-0'),null);
});

// The native panel's DOM text is inspected, rather than searching source text.
// No event listener runs while rendering; the finance state comes from real content actions.
class LocalElement {
  constructor(tag){this.tagName=tag;this.childNodes=[];this.style={};this.text='';}
  set textContent(value){this.text=String(value);this.childNodes=[];}
  get textContent(){return this.text+this.childNodes.map(node=>typeof node==='string'?node:node.textContent).join(' ');}
  append(...nodes){this.childNodes.push(...nodes);}
  setAttribute(){}
  addEventListener(){}
}
test('the actual FX native panel lot label agrees with the quantity in its actual confirmed order fill',()=>{
  const s=createState();let panel;
  const document={createElement:tag=>new LocalElement(tag)};
  for(const id of ['FX-01','FX-02']){
    const quest=questById[id];
    for(const stepId of quest.stepIds){
      const step=stepById[stepId],value=answer(step);
      if(stepId==='FX-02-004'){
        const before=structuredClone(s.financialScenarios);
        panel=renderPhonePanel({document,state:s,step,quest,onAction:()=>assert.fail('rendering must not confirm an order')});
        assert.deepEqual(s.financialScenarios,before);
      }
      applyFinancialStep(s,step,value);contentEffect(s,step,value);
    }
  }
  assert.ok(panel?.element);
  const displayed=panel.element.textContent.match(/1\s*lot\s*=\s*([\d,]+)\s*通貨/);
  assert.ok(displayed,'native panel exposes the one-lot quantity in readable text');
  const displayedUnit=Number(displayed[1].replaceAll(',',''));
  const newFill=s.financialScenarios['fx-order'].data.fills.find(fill=>fill.kind==='new');
  const lots=s.phoneState.formDrafts['FX-01'].lots;
  assert.ok(newFill.baseQuantity>0);assert.equal(displayedUnit*lots,newFill.baseQuantity);
});
