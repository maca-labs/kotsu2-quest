// New, entirely fictional domestic preparation route. It is not a real-service recipe.
export {fundingHandoffReference} from './finance-funding.js';
export const fundingQuestIds=['FI-01','FI-02','FI-03'];
const choice=(label,value)=>({label,value});
const tap=(instruction,label,extra={})=>({instruction,label,type:'tap',...extra});
const focus=(instruction,field,fieldLabel)=>({instruction,label:fieldLabel,type:'focus',field,fieldLabel});
const input=(instruction,field,fieldLabel,value)=>({instruction,label:'この練習値を入力する',type:'input',field,fieldLabel,value,inputMode:'decimal'});
const select=(instruction,field,fieldLabel,value,choices)=>({instruction,label:'この内容を選ぶ',type:'select',field,fieldLabel,value,choices:choices.map(([label,value])=>choice(label,value))});
const check=(instruction,label,extra={})=>({instruction,label,type:'check',...extra});
const confirm=(instruction,label,extra={})=>({instruction,label,type:'confirm',...extra});
const wait=(instruction,label,extra={})=>({instruction,label,type:'wait',...extra});
const disclaimer='すべて架空の練習です。実在する国内サービスの購入・出庫経路を案内するものではありません。';
const wallet='DEMO-WALLET-A';
const sections={
 'FI-01':[
  [1,3,'銀行の円と入金先','bank','円がある場所を見よう。まだコインは持っていません。',{銀行にある円:'200,000円（架空）',国内の架空交換所:'こみち交換所。まだ入金0円。',この練習の範囲:'どの国内サービスでも同じ資産を買って出庫できる、という意味ではありません。'},['funding.location','funding.exchange']],
  [4,11,'こみち交換所へ円を入れる','bank','送る額と名義を確かめてから、確定します。',{入金先:'こみち交換所の練習口 DEMO-JPY-GATE',申込者:'朝日 ミナト（架空の成人）',送る額:'120,000円。今回の教材振込費は0円。',送信後の銀行:'80,000円。処理中のお金を残高に重ねません。'},['funding.location','funding.pending']],
  [12,15,'円の到着を確かめる','browser','送った記録と、届いた記録は別です。',{入金明細:'銀行から120,000円 → こみち交換所',見分ける状態:'処理中はまだ購入に使えません。到着後に使えます。'},['funding.pending','funding.exchange']],
  [16,23,'教材コインを購入する','browser','この架空交換所で買えて、出庫もできる教材コインを選びます。',{資産:'ミチコイン MCHI（実在しない教材コイン）',今回の教材価格:'1枚1,000円、104枚で104,000円。購入費は0円。',購入後の置き場所:'MCHI104枚は交換所内。残った円は16,000円。自分の財布にはまだ届きません。'},['funding.mchi','funding.purchase']]
 ],
 'FI-02':[
  [1,5,'出庫先の条件を見る','browser','出庫は、交換所から自分の練習財布へ動かすことです。',{出庫元:'こみち交換所のMCHI104枚',受取カード:'MCHI / みち道（MichiNet） / DEMO-WALLET-A',今回の費用:'104枚から1枚を引き、103枚が届く。最低出庫数は2枚（すべて架空値）。'},['funding.withdraw','funding.network']],
  [6,16,'資産・道・宛先を合わせる','browser','同じコインでも、受け取る道が違えば今回の条件に合いません。',{今回の受取資産:'MCHI',今回の受取ネットワーク:'みち道（MichiNet）という架空の道',自分の練習宛先:wallet,費用の内訳:'出庫104枚 − 教材の出庫費1枚 = 到着103枚。費用をもう1枚追加しません。'},['funding.network','funding.address','funding.fee']],
  [17,21,'出庫から着金まで','wallet','出庫を確定したあと、自分の財布の到着明細を開きます。',{出庫元:'交換所のMCHIは0枚',移動中:'MCHI103枚。処理完了まではまだ使えません。',受取先:'自分の財布 / みち道 / MCHI103枚',このあとの道:'MCHIはHyperCoreへそのまま送る練習には使いません。次に資産と道を整えます。'},['funding.pending','funding.withdraw']]
 ],
 'FI-03':[
  [1,8,'MCHIを教材USDCへ交換する','browser','最初は資産の種類だけを替えます。道はまだ、みち道のままです。',{利用先:'道案内交換所（架空）。受取・交換・配送の費用が見積書に含まれる教材サービスです。',交換する数:'MCHI103枚 → Mock USDC1,030。1枚を10 Mock USDCに替える架空の比率、交換費0。',この段階の現在地:'Mock USDCはまだ、みち道にあります。Arbitrumにある残高とは別です。',補足:'本物のウォレット内交換を、この順番・費用で実行できるという案内ではありません。'},['funding.usdc','funding.swap']],
  [9,16,'USDCの道を替える','browser','資産を替える操作と、道を替える操作を分けます。',{出発:'みち道のMock USDC1,030',到着:'ArbitrumのMock USDC1,010 / 自分のDEMO-WALLET-A',今回の教材費:'道替えと処理の費用20 Mock USDCを申請額から引く。',道の名前:'Arbitrumは現実にもある名前ですが、このゲームは実ネットワークへ接続しません。'},['funding.network','funding.bridge','funding.fee']],
  [17,23,'送るためのガスを用意する','wallet','USDCと、道を使う処理のための資産は別に用意します。',{今ある資産:'ArbitrumのMock USDC1,010。ガス用Mock ETHはまだ0。',今回の見積書:'10 Mock USDCを使い、ガス用Mock ETH0.001を用意します。架空の比率です。',準備後:'Mock USDC1,000とMock ETH0.001。両方が同じArbitrumにあることを照合。',次の入金練習:'USDC100を送り、教材費1で99到着。ガスは別に0.0001 Mock ETHを使います。'},['funding.gas','funding.eth','funding.usdc']],
  [24,26,'同じ資金を次の旅へ引き継ぐ','wallet','同じお金を二度もらう操作ではありません。保管先の記録をつなぎます。',{準備した資金:'ArbitrumのMock USDC1,000 / Mock ETH0.001',引継ぎ先:'資産の地図 → 接続 → 既存のネットワークと入金の練習',引継ぎの意味:'準備台帳の財布を空にし、「この資金は旅へ移管済み」と記録します。旅へ新しく足しません。',以前の旅を進めた人:'今回は独立した準備の復習です。元の旅の資金・送金履歴を増やしたり巻き戻したりしません。'},['funding.handoff','funding.location']]
 ]
};
const rows={
 'FI-01':[
  tap('練習銀行を開き、200,000円の残高明細を見る。','銀行の円の明細を開く'),
  tap('国内の架空サービス「こみち交換所」の円入金を開く。','こみち交換所の円入金'),
  tap('入金先・名義・今回の教材振込費0円のカードを開く。','今回の円の入金先を見る'),
  tap('練習銀行の「振込」を開く。','練習の振込を開く'),
  focus('入金先の欄を押す。','depositRecipient','円の入金先'),
  select('入金カードと同じ「DEMO-JPY-GATE」を選ぶ。','depositRecipient','円の入金先','DEMO-JPY-GATE',[['こみち交換所の練習口 DEMO-JPY-GATE','DEMO-JPY-GATE'],['別の練習口 DEMO-JPY-OTHER','DEMO-JPY-OTHER']]),
  focus('送る円の金額欄を押す。','depositJPY','送る円の金額'),
  input('練習値「120000」を入力する。','depositJPY','送る円の金額（円）',120000),
  tap('振込の確認画面を開き、入金先と120,000円を並べて見る。','振込の確認画面を開く'),
  check('架空の成人名義「朝日 ミナト」と入金先の一致を確認する。','名義と入金先が同じと確認'),
  confirm('この練習の振込120,000円を確定する。','練習の振込を確定',{result:'銀行は80,000円。120,000円は入金の途中です。まだ購入には使えません。'}),
  tap('銀行の振込履歴を開き、処理中の120,000円を見る。','処理中の振込履歴を開く'),
  wait('教材の時間を進め、こみち交換所への入金を完了させる。','教材の入金処理を進める'),
  tap('こみち交換所の入金通知を開く。','円の到着通知を開く'),
  check('こみち交換所の入金明細120,000円を照合する。','今回の円の到着を照合'),
  tap('購入できる教材コインの一覧を開く。','教材コインの一覧を開く'),
  select('この練習で購入と出庫ができる「ミチコイン MCHI」を選ぶ。','purchaseAsset','購入する教材コイン','MCHI',[['ミチコイン MCHI・今回の出庫に対応','MCHI'],['ソラコイン SORA・この教材口では出庫できない','SORA']]),
  focus('購入枚数の欄を押す。','purchaseQuantity','購入する枚数'),
  input('練習値「104」を入力する。','purchaseQuantity','購入する枚数（MCHI）',104),
  tap('1枚1,000円・購入費0円の見積書を開く。','今回の購入見積書を開く'),
  check('支払104,000円と、購入後に残る16,000円を照合する。','支払と残る円を照合'),
  confirm('MCHI104枚の練習購入を確定する。','教材コインの購入を確定',{result:'交換所にMCHI104枚、円16,000円。自分の財布には、まだ送っていません。'}),
  check('購入履歴でMCHI104枚と、交換所内という現在地を確かめる。','購入履歴と現在地を照合')
 ],
 'FI-02':[
  tap('こみち交換所のMCHI104枚の保有明細を開く。','交換所のMCHI残高を開く'),
  tap('交換所から自分の財布へ移す「出庫」を開く。','MCHIの出庫を開く'),
  focus('出庫する資産の欄を押す。','withdrawAsset','出庫する資産'),
  select('受取カードと同じ「MCHI」を選ぶ。','withdrawAsset','出庫する資産','MCHI',[['ミチコイン MCHI','MCHI'],['ソラコイン SORA','SORA']]),
  tap('自分の練習財布の受取資産・道・宛先・最低数・費用を開く。','自分の財布の受取カードを見る'),
  focus('送るネットワークの欄を押す。','withdrawNetwork','出庫する道'),
  select('受取カードと同じ「みち道」を選ぶ。','withdrawNetwork','出庫する道','MichiNet',[['みち道 MichiNet（今回の受取条件）','MichiNet'],['ほし道 HoshiNet（別の架空ネットワーク）','HoshiNet']]),
  focus('受取先の欄を押す。','withdrawAddress','自分の練習宛先'),
  select('自分の練習宛先「DEMO-WALLET-A」を選ぶ。','withdrawAddress','自分の練習宛先',wallet,[[`自分の財布 ${wallet}`,wallet],['別の財布 DEMO-WALLET-B','DEMO-WALLET-B']]),
  focus('出庫する枚数の欄を押す。','withdrawQuantity','出庫する枚数'),
  input('交換所にある全数量「104」を入力する。','withdrawQuantity','出庫する枚数（MCHI）',104),
  tap('出庫の確認画面を開く。','出庫の確認画面を開く'),
  check('送るMCHIと、受け取るMCHIが同じと確認する。','資産の種類を照合'),
  check('送る道と、受け取る道が「みち道」で同じと確認する。','ネットワークを照合'),
  check('自分のDEMO-WALLET-Aと宛先が同じと確認する。','自分の宛先を照合'),
  tap('出庫104枚・費用1枚・到着103枚の内訳を開く。','教材の出庫費と到着枚数を見る'),
  confirm('MCHIの練習出庫を確定する。','自分の練習財布への出庫を確定',{result:'交換所のMCHIは0枚。費用1枚を控除し、103枚が移動中です。'}),
  tap('出庫履歴を開き、処理中の103枚を見る。','今回の出庫履歴を開く'),
  wait('教材の処理を進め、自分の練習財布へ届ける。','教材の出庫処理を進める'),
  tap('練習財布のMCHI到着通知を開く。','MCHIの到着通知を開く'),
  check('財布の受取明細で、みち道のMCHI103枚を照合する。','道とMCHI103枚の到着を照合')
 ],
 'FI-03':[
  tap('架空の「道案内交換所」を開き、MCHI103枚の現在地を見る。','道案内交換所を開く'),
  select('資産の種類を替える「MCHIからMock USDC」を選ぶ。','swapPair','交換する組合せ','MCHI/USDC',[['MCHI → Mock USDC','MCHI/USDC'],['MCHI → 別の教材資産','MCHI/OTHER']]),
  focus('交換するMCHIの枚数欄を押す。','swapQuantity','交換するMCHIの枚数'),
  input('財布に届いた「103」を入力する。','swapQuantity','交換する枚数（MCHI）',103),
  tap('103枚を1,030 Mock USDCに替える、交換費0の教材見積書を開く。','教材の交換見積書を見る'),
  confirm('この練習の資産交換を確定する。','MCHIからMock USDCへの交換を確定',{result:'MCHI103枚を渡しました。みち道のMock USDC1,030はまだ処理中です。'}),
  wait('教材の交換処理を進める。','教材の交換処理を進める'),
  check('交換明細のMock USDC1,030と、まだ「みち道」にあることを照合する。','交換した資産と道を照合'),
  tap('同じUSDCを別の道へ用意する「道替え」のカードを開く。','資産を替える操作と道替えを見比べる'),
  focus('道替え先のネットワーク欄を押す。','bridgeNetwork','道替え後の受取ネットワーク'),
  select('次の入金練習の受取条件に合う「Arbitrum」を選ぶ。','bridgeNetwork','道替え後の受取ネットワーク','Arbitrum',[['Arbitrum（次の教材の受取条件）','Arbitrum'],['みち道のまま（今回は条件に合わない）','MichiNet']]),
  tap('みち道1,030・教材費20・Arbitrumへの到着1,010の見積書を開く。','道替えの費用と到着額を見る'),
  check('資産USDC・道Arbitrum・自分のDEMO-WALLET-Aを受取カードと照合する。','道替え後の受取条件を照合'),
  confirm('今回の架空サービスで、USDCの道替えを確定する。','教材の道替えを確定',{result:'みち道のUSDCは0。費用20を控除し、1,010 Mock USDCがArbitrumへ移動中です。'}),
  wait('教材の道替え処理を進める。','教材の道替え処理を進める'),
  check('到着明細でArbitrum上のMock USDC1,010を照合する。','道替え後の道と到着額を照合'),
  tap('USDCとは別に必要な「ガス用Mock ETH」の説明と見積書を開く。','ガス用の資産を用意する理由を見る'),
  focus('ガス準備に使うMock USDCの数量欄を押す。','gasPayment','ガス準備に使うMock USDC'),
  input('教材の見積書にある「10」を入力する。','gasPayment','ガス準備に使う数量（Mock USDC）',10),
  tap('支払10・ガス用ETH0.001・残るUSDC1,000を確認画面で見る。','ガス準備の確認画面を開く'),
  confirm('教材のガス準備を確定する。','ガス用Mock ETHの準備を確定',{result:'Mock USDCは1,000。ガス用Mock ETH0.001はまだ準備中です。'}),
  wait('教材のガス準備を完了まで進める。','教材のガス準備を進める'),
  check('同じArbitrumにUSDC1,000とガス用ETH0.001があると照合する。','二種類の資産と同じ道を照合'),
  tap('準備した資金から、次の資産の地図へつながる引継ぎカードを開く。','次の旅への引継ぎを見る'),
  check('1,000 Mock USDCと0.001 Mock ETHを追加配布せず引き継ぐと確認する。','同じ資金の移管と確認'),
  confirm('この資金を旅へ移管した証跡を確定する。','この旅の練習財布へ引き継ぐ',{result:'準備台帳の財布は0。資金は旅の開始状態へ移管済みです。旧セーブの旅の残高を加算・巻戻ししません。'})
 ]
};
export const milestones=[
 ['FI-01-S008','円の元手を決めた','迷い霧の封印が一つほどけた。','鍵守りのセナ','送る額が決まったね。まだ届いたことにはならないよ。'],
 ['FI-01-S011','円の入金を申請した','円の渡し舟が岸を離れた。','荷物係ポル','いまは移動中。到着の明細まで見よう。'],
 ['FI-01-S015','円の到着を確かめた','交換所の灯りがともった。','鍵守りのセナ','120,000円が届いた。ここから教材コインを買えるね。'],
 ['FI-01-S022','教材コインを購入した','コイン箱の封印がほどけた。','鍵守りのセナ','交換所には104枚。次は自分の財布まで運ぼう。'],
 ['FI-01-S023','交換所の保有履歴を照合した','準備の帳面に、最初の足あとが付いた。','地図師イオ','買った場所と、自分の財布はまだ別の場所だよ。'],
 ['FI-02-S009','自分の宛先を合わせた','宛先すり替えの封印がほどけた。','荷物係ポル','道も同じか確かめれば、出庫の準備がそろうよ。'],
 ['FI-02-S017','出庫を申請した','財布への便が出発した。','鍵守りのセナ','104枚から費用1枚。届くのは103枚だね。'],
 ['FI-02-S021','自分の財布で103枚を受け取った','群島の桟橋に、自分の荷物が届いた。','地図師イオ','出庫した記録と、届いた記録がつながったね。'],
 ['FI-03-S006','資産の交換を申請した','種類の迷路の封印がほどけた。','鍵守りのセナ','種類を替えても、道はまだみち道のままだよ。'],
 ['FI-03-S008','みち道のUSDCを受け取った','資産の看板がUSDCへ変わった。','地図師イオ','次の入金ではArbitrumの道が必要。道も整えよう。'],
 ['FI-03-S014','道替えを申請した','道違いの封印がほどけた。','荷物係ポル','同じUSDCでも、いまどの道にあるかが大切なんだ。'],
 ['FI-03-S016','Arbitrumの到着を照合した','群島の道標がそろった。','地図師イオ','USDC1,010が届いた。あと一つ、道を使うための資産を用意しよう。'],
 ['FI-03-S021','ガス用の資産を用意した','動かぬ舟の封印がほどけた。','荷物係ポル','USDCとETHを、同じ数として足さないでね。'],
 ['FI-03-S023','二種類の資産を照合した','帰還のランタンに火が入った。','鍵守りのセナ','1,000 USDCと0.001 ETH。ようやく次の入金練習の準備ができたね。'],
 ['FI-03-S026','同じ資金を旅へ引き継いだ','島と空の道が、一本につながった。','鍵守りのセナ','同じお金を二度もらったわけではないよ。置き場所の記録をつないだんだ。']
].map(([stepId,title,worldCopy,npcName,dialogue])=>({id:`funding:${stepId}`,stepId,chapterId:'CH-5',title,worldCopy,npcName,dialogue,enemyName:'みちまどいの霧',damage:0,kind:'preparation-seal',grantsChapterSeal:false}));
export const steps=Object.entries(rows).flatMap(([questId,list])=>list.map((raw,index)=>{
 const n=index+1,id=`${questId}-S${String(n).padStart(3,'0')}`,section=sections[questId].find(([from,to])=>n>=from&&n<=to),[, ,screenTitle,appId,context,panel,helpKeys]=section;
 const actualApp=(questId==='FI-01'&&n>=2&&n<=3)||(questId==='FI-02'&&n>=17&&n<=19)?'browser':questId==='FI-03'&&(n===8||n===16)?'wallet':appId;
 return {id,questId,screenId:`funding:${questId}:${section[0]}`,screenTitle,appId:actualApp,appTitle:actualApp==='bank'?'あかり練習銀行':actualApp==='wallet'?'自分の練習財布':questId==='FI-01'||questId==='FI-02'?'こみち交換所':'道案内交換所',
  ...raw,targetAction:raw.label,completionRule:'action',completionEvent:`action:${id}`,effect:id,context,
  details:[context,disclaimer],panel,helpKeys,hint:`${context} 受取カードと${raw.fieldLabel||'今回の明細'}を見比べよう。`,hintIds:helpKeys,
  requiredState:{scenarioId:'funding-japan',previousStepId:index?`${questId}-S${String(index).padStart(3,'0')}`:null},
  preconditions:index?[`${questId}-S${String(index).padStart(3,'0')}`]:[],nextStepIds:n<list.length?[`${questId}-S${String(n+1).padStart(3,'0')}`]:[],
  equivalentRoutes:['ゲーム内のホームから該当アプリを開く','通知から今回の到着明細を開く','最近使ったアプリから戻る'],
  checkpoint:id,recovery:'正しかった欄は残したまま、合わなかった欄だけを直せます。',result:raw.result||'この一つの操作を記録しました。',
  milestone:milestones.find(m=>m.stepId===id)?.id};
}));
const questData=[
 ['FI-01','円を運び、教材コインを買う',['PR-01'],{funding_basics:{0:'FI-01-S015',1:'FI-01-S023'}},'架空の国内交換所へ円を入れ、その交換所で出庫できる教材コインを購入します。'],
 ['FI-02','自分の財布まで届ける',['FI-01'],{funding_basics:{2:'FI-02-S021'}},'資産・道・自分の宛先・費用を合わせ、交換所から財布へ出庫して着金を照合します。'],
 ['FI-03','資産と道を整えて旅へつなぐ',['FI-02'],{funding_basics:{3:'FI-03-S016',4:'FI-03-S026'}},'必要な交換、道替え、ガス準備を別々に行い、既存の入金練習と同じ資金へつなぎます。']
];
export const quests=questData.map(([id,title,prerequisites,guidedObjectiveMap,description])=>({id,title,description,partId:'crypto',chapterId:'CH-5',requesterId:'sena',scenarioId:'funding-japan',prerequisites,stepIds:steps.filter(s=>s.questId===id).map(s=>s.id),guidedObjectiveMap,completionRule:'all-steps',bossLink:'CH-5',reward:40,timedChallenge:{enabled:true,durationHours:24},fictionalOnly:true,courseSegment:'domestic-preparation'}));
quests[0].reviewVariant={id:'funding-fiat-variant',title:'円の額が違う確認',description:'別の練習：入金100,000円からMCHI90枚を1枚1,000円で買った後、交換所に残る円を照合。主台帳は動きません。',fields:[{key:'remainingJPY',label:'交換所に残る円',type:'number',value:10000}]};
quests[1].reviewVariant={id:'funding-withdraw-variant',title:'出庫する数が違う確認',description:'別の練習：出庫20枚、教材の出庫費1枚を申請数から引きます。今回の到着枚数を照合。主台帳は動きません。',fields:[{key:'receivedMCHI',label:'今回届くMCHIの枚数',type:'number',value:19}]};
quests[2].reviewVariant={id:'funding-route-variant',title:'交換後の費用が違う確認',description:'別の練習：20 MCHIを1枚10 USDCに交換し、道替え費20 USDC、ガス準備10 USDCを使います。残るUSDCを照合。主台帳は動きません。',fields:[{key:'remainingUSDC',label:'ガス準備後に残るMock USDC',type:'number',value:170}]};
export const objectives=[{domain:'funding_basics',names:['銀行・交換所・財布の現在地','円の入金と教材コインの購入','出庫条件・費用・着金','資産の交換と道替えの区別','ガス準備と同じ資金の引継ぎ'],questIds:fundingQuestIds}];
export const glossary=[
 ['funding.location','資金の現在地','いま、お金やコインがどこにあるか。銀行、交換所、自分の財布、移動中を分けます。'],
 ['funding.exchange','国内の架空交換所','このゲームで、円を入れて教材コインを買う場所。実在の会社ではありません。取扱う資産や出庫先はサービスごとに違います。'],
 ['funding.mchi','ミチコイン MCHI','国内の架空交換所で購入・出庫できる、実在しない教材コイン。今回は1枚1,000円という架空の値段です。'],
 ['funding.purchase','購入','円などを支払って資産を取得すること。交換所で買っただけでは、自分の財布へ届いたことにはなりません。'],
 ['funding.withdraw','出庫','交換所から自分の財布へ、暗号資産を動かすこと。この教材では申請と到着を分けて確認します。'],
 ['funding.network','ネットワーク・道','資産が動く道。資産の名前が同じでも、今回の受取カードと道が違えば条件に合いません。'],
 ['funding.address','自分の練習宛先','自分の財布を選ぶためのゲーム内識別子。DEMO-WALLET-Aは実際に送金できるアドレスではありません。'],
 ['funding.fee','費用','資産を動かす処理などに使う分。今回の見積書では送る数から引きます。表示の値は実際のサービスの料金ではありません。'],
 ['funding.pending','処理中','送る申請は済んだが、まだ指定先への到着を確かめていない状態。届くまで使える残高に重ねません。'],
 ['funding.usdc','教材USDC・Mock USDC','USDCという暗号資産をまねた練習単位。銀行にあるドルや円そのものではありません。ゲームの資金は現実に使えません。'],
 ['funding.swap','資産の交換','持っている資産の種類を替えること。今回はMCHIを教材USDCへ替えます。種類を替えても、道は自動で替わりません。'],
 ['funding.bridge','道替え','同じ種類の資産を別のネットワークで使えるようにする練習。実際には対応する方法・費用・条件の確認が必要です。この教材の経路は全て架空です。'],
 ['funding.eth','ガス用Mock ETH','次の練習で、Arbitrumの道を使う処理のために用意する別種類の教材資産。USDCの数量とは足しません。'],
 ['funding.gas','ガス','ネットワーク上の処理に使う費用のこと。この教材ではガス用Mock ETHを用意し、次の入金で一部を使います。実際の料金や購入方法の案内ではありません。'],
 ['funding.handoff','資金の引継ぎ','同じ資金の置き場所の記録を次の教材につなぐこと。追加配布ではありません。以前の旅を進めたセーブでは、準備を独立して復習します。']
].map(([id,term,description])=>({id,term,description}));
