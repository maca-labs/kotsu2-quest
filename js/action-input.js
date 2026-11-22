export function yenInput(value){
 const normalized=String(value??'').trim().replace(/[０-９，]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0));
 return /^\d{1,3}(,\d{3})+$/.test(normalized)?normalized.replaceAll(',',''):normalized;
}

// A changed-condition review uses its own copied message, never the main story's.
export function submissionValue({step,typedValue,namespace='step',mainClipboard='',reviewClipboard=''}){
 if(namespace==='step' && /^FX-/.test(step.questId??'') && ['lots','closeLots'].includes(step.field) && typeof typedValue==='string'){
  return typedValue.replace(/[０-９．]/g,char=>String.fromCharCode(char.charCodeAt(0)-0xfee0));
 }
 const hlpReview=namespace==='review' && /^RV-HLP-/.test(step.id??'');
 if((hlpReview || (namespace==='step' && ['HY-SPOT','HY-HLP'].includes(step.questId))) && step.type==='input' && typeof step.value==='number'){
  return yenInput(typedValue).replaceAll('．','.');
 }
 const amountForm=namespace==='step' && /^(?:TC-|FI-|CR-03$)/.test(step.questId??'');
 const cryptoTrial=namespace==='boss' && /^CH[56]-/.test(step.id??'');
 if((amountForm||cryptoTrial) && step.type==='input' && typeof step.value==='number')return yenInput(typedValue);
 if(!/貼り付け/.test(step.label??''))return typedValue;
 if(namespace==='step')return mainClipboard;
 if(namespace==='review')return reviewClipboard;
 return typedValue;
}
