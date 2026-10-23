import test from 'node:test';
import assert from 'node:assert/strict';
import {selectQuestMail} from '../js/phone-panels.js';

test('a later foreign email never replaces the source of the current task',()=>{
 const mailById={'intro-mail':{code:'一歩ずつ',read:true},'registration-mail':{code:'246810'},'bank-verification':{code:'864200'},'domestic-registration':{code:'482615',read:false}};
 const state={phoneState:{mailById}};
 assert.equal(selectQuestMail(state,{id:'PR-01'})[1].code,'一歩ずつ');
 assert.equal(selectQuestMail(state,{id:'PO-01'})[1].code,'246810');
 assert.equal(selectQuestMail(state,{id:'BK-01'})[1].code,'864200');
 assert.equal(selectQuestMail(state,{id:'PO-05'}),null);
 assert.equal(mailById['domestic-registration'].read,false);
});
test('order, inquiry and gift tasks select their own message rather than the last incoming mail',()=>{
 const state={phoneState:{mailById:{'order-mail':{subject:'注文'},'approval-mail':{subject:'回答'},'gift-mail':{subject:'ギフト'},'intro-mail':{subject:'別のメール'}}}};
 for(const [questId,id]of [['PO-04','order-mail'],['PO-05','approval-mail'],['PO-06','gift-mail']])assert.equal(selectQuestMail(state,{id:questId})[0],id);
 assert.equal(selectQuestMail(state,{id:'unknown'}),null);
});


import {renderPhonePanel} from '../js/phone-panels.js';
import {createState} from '../js/engine.js';
import {questById,stepById} from '../js/content.js';
class Node {constructor(tag){this.tag=tag;this.childNodes=[];this.style={};this.textContent='';}append(...n){this.childNodes.push(...n);}setAttribute(){}addEventListener(){}}
const document={createElement:tag=>new Node(tag)};
const text=node=>typeof node==='string'?node:[node.textContent,...node.childNodes.map(text)].join(' ');
test('native source mail shows the correct passphrase after a foreign unread message arrived',()=>{
 const state=createState();state.phoneState.mailById={'intro-mail':{subject:'ミナ',body:'合言葉は一歩ずつ',code:'一歩ずつ',read:true},'domestic-registration':{subject:'あかつき',code:'482615',read:false}};
 const panel=renderPhonePanel({document,state,quest:questById['PR-01'],step:stepById['PR-01-006']});
 assert.match(text(panel.element),/一歩ずつ/);assert.doesNotMatch(text(panel.element),/482615|あかつき/);
});
test('a bank code is hidden until the mail is opened while the fake-secret lesson stays visible',()=>{
 const state=createState();state.phoneState.mailById['bank-verification']={subject:'銀行メール',body:'コード864200',code:'864200',read:false};
 let panel=renderPhonePanel({document,state,quest:questById['BK-01'],step:stepById['BK-01-008']});assert.doesNotMatch(text(panel.element),/864200/);assert.match(text(panel.element),/銀行メール/);
 state.phoneState.mailById['bank-verification'].read=true;panel=renderPhonePanel({document,state,quest:questById['BK-01'],step:stepById['BK-01-009']});assert.match(text(panel.element),/864200/);
 panel=renderPhonePanel({document,state,quest:questById['CR-02'],step:{id:'fake',appId:'mail',screenTitle:'本文',instruction:'この案内を閉じる',type:'tap'}});assert.match(text(panel.element),/復元情報を教えてください|要求には応じず/);
});
