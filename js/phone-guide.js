const lessons={
 'PR-01':{mailId:'intro-mail',copyStep:'PR-01-006',pasteStep:'PR-01-010',field:'introPhrase',source:'郵便屋ミナのメール',returnTo:'旅人のメモ',destination:'メールの合言葉の欄',shortReturn:'メモへ戻る',shortDestination:'合言葉欄へ貼る',kind:'合言葉',prepareEnd:2,sourceEnd:6,returnEnd:8,pasteEnd:10,finishLabel:'メモを保存する',doneLabel:'合言葉のメモを保存できた',doneCopy:'メモを届けに、町へ戻ろう。'},
 'PO-01':{mailId:'registration-mail',copyStep:'P014',pasteStep:'P018',field:'registrationCode',source:'コツコツモールの会員登録メール',returnTo:'入力中のコツコツモールの認証画面',destination:'メールの確認コードの欄',shortReturn:'モールへ戻る',shortDestination:'確認コード欄へ',kind:'コード',prepareEnd:10,sourceEnd:14,returnEnd:16,pasteEnd:18,finishLabel:'入力したコードで認証する',doneLabel:'コツコツモールのメール認証ができた',doneCopy:'メールの持ち主を確認できました。次の用事へ進めます。'},
 'DX-01':{mailId:'domestic-registration',copyStep:'DX-01-S013',pasteStep:'DX-01-S017',field:'verificationCode',source:'あかつき取引所の確認メール',returnTo:'入力中のあかつき取引所の認証画面',destination:'メールの確認コードの欄',shortReturn:'取引所へ戻る',shortDestination:'確認コード欄へ',kind:'コード',prepareEnd:9,sourceEnd:13,returnEnd:15,pasteEnd:17,finishLabel:'入力したコードで認証する',doneLabel:'あかつき取引所のメール認証ができた',doneCopy:'メールの確認は終わり。続けて教材プロフィールを入力します。'}
};

/** Present only evidence from this lesson; old clipboard contents never become its code. */
export function getPhoneGuideView(state,quest,step){
 const questId=quest?.id??step?.questId,lesson=lessons[questId];if(!lesson)return null;
 const phone=state.phoneState??{},qs=state.questStates?.[questId]??Object.values(state.questStates??{}).find(item=>item.questId===questId),completed=qs?.completedSteps??[];
 const mail=phone.mailById?.[lesson.mailId],mailRead=mail?.read===true,copyStepCompleted=completed.includes(lesson.copyStep);
 const code=mailRead&&['string','number'].includes(typeof mail?.code)&&String(mail.code).trim()!==''?String(mail.code):null;
 const copyText=code!==null&&copyStepCompleted&&phone.clipboard===code?code:null;
 const draft=phone.formDrafts?.[questId]??(questId==='DX-01'?state.financialScenarios?.['domestic-account']?.phoneState?.formDrafts:undefined)??{};
 const pasted=mailRead&&copyStepCompleted&&completed.includes(lesson.pasteStep)&&code!==null&&String(draft[lesson.field]??'')===code;
 const finished=questId==='PR-01'?phone.introMemoSaved===true||completed.includes('PR-01-011'):questId==='PO-01'?phone.registrationVerified===true||completed.includes('P019'):state.financialScenarios?.['domestic-account']?.data?.emailVerified===true||completed.includes('DX-01-S018');
 const listedIndex=quest?.stepIds?.indexOf(step?.id)??-1,n=listedIndex>=0?listedIndex+1:step?.id?Number(step.id.slice(-3)):(qs?.index??0)+1;
 const phase=finished?'done':pasted||n>lesson.pasteEnd?'finish':n<=lesson.prepareEnd?'prepare':n<=lesson.sourceEnd?'source':n<=lesson.returnEnd?'return':'destination';
 const phaseLabel={prepare:'このあと：メールから写して確かめる',source:'① メールを開いて、ゲーム内でコピー',return:`② ${lesson.shortReturn}`,destination:`③ ${lesson.destination}へ貼り付ける`,finish:lesson.finishLabel,done:lesson.doneLabel}[phase];
 const summary={prepare:questId==='PR-01'?'まずはメモで、今日の用事を見よう。':'登録を送信すると、この用事の確認メールが届きます。',source:mailRead?'開いたメールの中の「コピー」を押します。':'この用事のメール本文を開こう。戻り先は下の流れで分かります。',return:`「アプリ切替」から、${lesson.returnTo}を選びます。`,destination:`${lesson.destination}を押し、ゲーム内の「貼り付け」で写します。`,finish:questId==='PR-01'?'欄へ写せました。保存してから、町へ届けよう。':'欄へ写せました。認証のボタンで、このメールを確認します。',done:lesson.doneCopy}[phase];
 const stage=finished||pasted?3:phase==='source'?0:phase==='return'?1:['destination','finish'].includes(phase)?2:-1;
 const flow=[{id:'source',label:'メールでコピー',target:lesson.source},{id:'return',label:lesson.shortReturn,target:lesson.returnTo},{id:'destination',label:lesson.shortDestination,target:lesson.destination}].map((item,index)=>({...item,state:index<stage?'done':index===stage?'current':'upcoming'}));
 const copyMessage=copyText!==null?`この用事でコピー済みの${lesson.kind}`:copyStepCompleted?`この用事の${lesson.kind}は、いまはゲーム内コピーにありません。`:`この用事の${lesson.kind}はまだコピーしていません。`;
 return {questId,phase,phaseLabel,summary,flow,copyState:copyText===null?'not-copied':'copied',copyText,copyMessage,mailRead,copyStepCompleted,pasted,finished,details:[`コピー元：${lesson.source}。`,`戻る先：${lesson.returnTo}。`,`入力先：${lesson.destination}。`,'コピーは、言葉を一時的に持っておくこと。貼り付けは、持ってきた言葉を欄へ写すことです。','使うのはゲーム内のコピーと貼り付けです。自分のスマホのコピーを変える操作はありません。']};
}

export function renderPhoneGuide({document:doc,state,quest,step}){
 const view=getPhoneGuideView(state,quest,step);if(!doc||!view)return null;
 const node=(tag,text='',className='')=>{const element=doc.createElement(tag);if(text)element.textContent=text;if(className)element.className=className;return element;};
 const root=node('section','',`phone-copy-guide${view.finished?' is-finished':''}`);root.setAttribute('aria-label','メールから入力するまでの道案内');
 root.append(node('p',view.phaseLabel,'phone-copy-phase'));
 const flow=node('ol','','phone-copy-flow');flow.setAttribute('aria-label','コピー元から入力先まで');
 for(const item of view.flow){const point=node('li',item.label);point.setAttribute('data-state',item.state);point.setAttribute('aria-label',`${item.label}：${item.target}`);if(item.state==='current')point.setAttribute('aria-current','step');flow.append(point);}
 const copy=node('p',view.copyMessage,'phone-copy-content');
 if(view.copyText!==null)copy.append(node('strong',view.copyText));
 const details=node('details','','phone-copy-details');details.append(node('summary','コピーのやり方・戻る先'),node('p',view.summary));for(const text of view.details)details.append(node('p',text));
 if(view.finished){details.append(flow,copy);root.append(details);}else root.append(flow,copy,details);
 return root;
}
