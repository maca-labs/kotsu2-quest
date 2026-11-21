// A changed-condition review uses its own copied message, never the main story's.
export function submissionValue({step,typedValue,namespace='step',mainClipboard='',reviewClipboard=''}){
 if(namespace==='step' && /^FX-/.test(step.questId??'') && ['lots','closeLots'].includes(step.field) && typeof typedValue==='string'){
  return typedValue.replace(/[０-９．]/g,char=>String.fromCharCode(char.charCodeAt(0)-0xfee0));
 }
 if(!/貼り付け/.test(step.label??''))return typedValue;
 if(namespace==='step')return mainClipboard;
 if(namespace==='review')return reviewClipboard;
 return typedValue;
}
