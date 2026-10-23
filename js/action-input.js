// A changed-condition review uses its own copied message, never the main story's.
export function submissionValue({step,typedValue,namespace='step',mainClipboard='',reviewClipboard=''}){
 if(!/貼り付け/.test(step.label??''))return typedValue;
 if(namespace==='step')return mainClipboard;
 if(namespace==='review')return reviewClipboard;
 return typedValue;
}
