// Older authored home steps predate openAppId. Keep their IDs and rewards intact.
const legacyOpenApps=Object.freeze({'PR-01-001':'memo','PR-01-004':'mail',P001:'browser',P012:'mail','BK-01-001':'bank','TR-01-001':'bank','FX-01-001':'fx','FX-03-001':'points','TC-01-001':'market'});
export const homeAppNames=Object.freeze({memo:'メモ',mail:'メール',browser:'ブラウザー',points:'ポイント',bank:'銀行',fx:'FX',market:'カード市場',wallet:'ウォレット',hyper:'運用ラボ',gift:'ギフト'});
export function getStepOpenAppId(step){return step?.openAppId??legacyOpenApps[step?.id]??(/スマホホーム/.test(step?.screenTitle??'')?step.appId:null);}
export function getPhoneSurfaceAppId(step){return step?.questId==='FX-03'?'points':step?.appId??'home';}
export function getPhoneResumeTarget(step){return getStepOpenAppId(step)??step?.displayAppId??getPhoneSurfaceAppId(step);}
export function getPhoneHomeApps(quest,step){const chapter=Number(quest?.chapterId?.slice(3))||0,wanted=getStepOpenAppId(step);return Object.entries(homeAppNames).filter(([id])=>id===wanted||(!(['bank','fx','market'].includes(id)&&chapter<({bank:2,fx:3,market:4}[id]))&&!(['wallet','hyper'].includes(id)&&quest?.partId!=='crypto')&&!(id==='gift'&&chapter<1)&&!(id==='points'&&chapter<1)));}
