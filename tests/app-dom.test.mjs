import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// HTML boolean attributes are true whenever present, even readonly="false".
class Element{
 constructor(){this.attributes={};this.children=[];}
 setAttribute(key,value){this.attributes[key]=String(value);}
 addEventListener(){}
 append(...children){this.children.push(...children);}
}
for(const[property,attribute]of [['readOnly','readonly'],['hidden','hidden'],['disabled','disabled'],['checked','checked']])Object.defineProperty(Element.prototype,property,{get(){return Object.hasOwn(this.attributes,attribute);},set(value){if(value)this.attributes[attribute]='';else delete this.attributes[attribute];}});
const context={Node:Element,document:{createElement:()=>new Element(),createTextNode:text=>({text})}};vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8').split('\n').find(line=>line.startsWith('function h(')),context);

test('manual fields stay editable and error messages stay visible when their boolean flags are false',()=>{
 const input=context.h('input',{readonly:false}),error=context.h('div',{hidden:false});
 assert.equal(input.readOnly,false);assert.equal(Object.hasOwn(input.attributes,'readonly'),false);assert.equal(error.hidden,false);
});

test('paste and focus fields remain readonly while disabled, checked and hidden keep their true meanings',()=>{
 const input=context.h('input',{readonly:true,disabled:true,checked:true}),error=context.h('div',{hidden:true});
 assert.equal(input.readOnly,true);assert.equal(input.disabled,true);assert.equal(input.checked,true);assert.equal(error.hidden,true);
 const aria=context.h('button',{'aria-expanded':false,'data-value':false});assert.equal(aria.attributes['aria-expanded'],'false');assert.equal(aria.attributes['data-value'],'false');
});
