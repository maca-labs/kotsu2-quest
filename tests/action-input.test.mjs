import test from 'node:test';
import assert from 'node:assert/strict';
import {submissionValue} from '../js/action-input.js';

test('review paste uses its own copied code despite a different main-story code',()=>{
 const context={step:{label:'ゲーム内コードを貼り付け'},typedValue:'',mainClipboard:'246810',reviewClipboard:'735921'};
 assert.equal(submissionValue({...context,namespace:'review'}),'735921');
 assert.equal(submissionValue({...context,namespace:'step'}),'246810');
 assert.equal(submissionValue({...context,namespace:'review',reviewClipboard:''}),'');
 assert.equal(submissionValue({...context,namespace:'boss',typedValue:'別の確認値'}),'別の確認値');
});
test('ordinary typed input stays in its own field and is not replaced by any clipboard',()=>{
 for(const namespace of ['step','review','boss'])assert.equal(submissionValue({step:{label:'数量を入力'},typedValue:'103',namespace,mainClipboard:'246810',reviewClipboard:'735921'}),'103');
});
