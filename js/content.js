import * as extension from './content-extension.js';
import * as points from './content-points.js';
import * as crypto from './content-crypto.js';
import * as funding from './content-funding.js';
export const quests = [...points.quests,...extension.quests.filter(q=>q.chapterId==='CH-5'),...funding.quests,...crypto.quests,...extension.quests.filter(q=>q.chapterId==='CH-6')];
export const steps = [...points.steps,...extension.steps,...funding.steps,...crypto.steps];
export const chapters = [...points.chapters,...crypto.chapters];
export const bosses = [...points.bosses,...crypto.bosses];
export const objectives = [...points.objectives,...funding.objectives,...crypto.objectives,...extension.objectives];
export const questById=Object.fromEntries(quests.map(q=>[q.id,q]));
export const stepById=Object.fromEntries(steps.map(s=>[s.id,s]));
export const chapterById=Object.fromEntries(chapters.map(c=>[c.id,c]));
// The original step IDs and rewards remain stable. The new entrance precedes the existing journey.
const firstCrypto=quests.find(q=>q.id==='CR-01');
if(firstCrypto)firstCrypto.prerequisites=[funding.quests.at(-1).id];
const cryptoChapter=chapterById['CH-5'];
if(cryptoChapter)cryptoChapter.questIds=[...funding.fundingQuestIds,...cryptoChapter.questIds];
for(const chapter of chapters){const ids=extension.quests.filter(q=>q.chapterId===chapter.id).map(q=>q.id);chapter.extensionQuestIds=ids;}
export const modeUnlockConfig={points:'POINT-START',crypto:'CRYPTO-START'};
export const equipment=[{id:'traveler-staff',name:'旅人の杖',slot:'weapon',description:'小さな一歩を支える、使い慣れた杖。'},...chapters.map(c=>c.equipment).filter(Boolean),{id:'rainbow-oath',name:'虹誓の大剣',slot:'weapon',description:'六つの町で交わした約束が、虹の光になった。'}];
export const equipmentById=Object.fromEntries(equipment.map(e=>[e.id,e]));
export function contentEffect(state,step,value,context){points.applyContentEffect?.(state,step,value,context);crypto.applyContentEffect?.(state,step,value,context);funding.applyContentEffect?.(state,step,value,context);extension.applyContentEffect?.(state,step,value,context);}
export {points,crypto,funding,extension};
