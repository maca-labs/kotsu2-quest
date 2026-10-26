/** Optional fictional courses. The original quests and their IDs stay unchanged. */
export const extensionProfile={fullName:'朝日 ミナト',birthDate:'1994-04-12',address:'練習県れんしゅう市サンプル町1-2-3 201号',phone:'09000001234',email:'minato@akatsuki.example.invalid',password:'DEMO-START-42',verificationCode:'482615',documentExpires:'2031-03-31',today:'2026-10-23'};
const C=(label,value)=>({label,value});
const tap=(instruction,label,extra={})=>({instruction,label,type:'tap',...extra});
const focus=(field,fieldLabel)=>({instruction:`「${fieldLabel}」の欄を押す。`,label:fieldLabel,type:'focus',field,fieldLabel});
const amountInstructions={quantity:'今回売買するコインの枚数を、枚数の欄に入力する。',limitPrice:'指値で売買したい1枚の価格を、価格欄に入力する。',lendingAmount:'貸すMock USDCの数量を、貸出額の欄に入力する。',collateral:'取引に配分する証拠金を、証拠金の欄に入力する。'};
const input=(field,fieldLabel,value,extra={})=>({instruction:amountInstructions[field] || `教材カードを見て、「${fieldLabel}」の欄に入力する。`,label:'入力した内容で進む',type:'input',field,fieldLabel,value,inputMode:typeof value==='number'?'decimal':'text',...extra});
const select=(instruction,field,fieldLabel,value,choices,extra={})=>({instruction,label:'この内容を選ぶ',type:'select',field,fieldLabel,value,choices:choices.map(([l,v])=>C(l,v)),...extra});
const check=(instruction,label,extra={})=>({instruction,label,type:'check',...extra});
const act=(extensionAction,instruction,label,extra={})=>({instruction,label,type:'confirm',extensionAction,eventKey:extensionAction,...extra});
const wait=(extensionAction,instruction,label,extra={})=>({instruction,label,type:'wait',extensionAction,eventKey:extensionAction,...extra});
const venue=(value,instruction)=>select(instruction,'venue','売買の画面',value,[['販売所・お店が示す値段','dealer'],['板取引所・注文を並べる画面','board']],{extensionAction:'venue-select',venueSwitch:true});
const side=(value)=>select(value==='buy'?'円を渡してコインを受け取る「買う」を選ぶ。':'持っているコインを渡す「売る」を選ぶ。','side','売買の向き',value,[['買う','buy'],['売る','sell']]);
const order=(value)=>select(value==='market'?'価格を指定せず、板の注文を相手に売買する「成行」を選ぶ。':'売買したい1枚の価格を指定する「指値」を選ぶ。','orderType','注文の方法',value,[['成行・価格を指定せず注文','market'],['指値・決めた値段で待つ','limit']]);
const qty=()=>[focus('quantity','コインの枚数'),input('quantity','コインの枚数',10)];
const rows={
 'DX-01':[
  tap('国内の架空サービス「あかつき取引所」を開く。','あかつき取引所を開く'),
  tap('銀行口座とは別の「取引サービスへの利用申込」を開く。','無料の練習口座を申し込む'),
  focus('email','練習用メールアドレス'),input('email','練習用メールアドレス',extensionProfile.email),
  focus('password','練習パスワード'),input('password','練習パスワード',extensionProfile.password,{inputType:'password'}),
  tap('この架空サービスの利用条件を開く。','練習の利用条件を読む',{phoneScreen:'terms'}),
  check('架空成人の教材データだけを使う条件を確かめ、同意欄を押す。','教材の利用条件に同意',{field:'termsAccepted',value:true}),
  act('account-register','この練習用メールアドレスで、あかつき取引所への登録を進める。','このメールアドレスで登録',{result:'あかつき取引所から、ゲーム内メールに確認コードが届きました。まだメール認証は終わっていません。'}),
  tap('練習スマホのホームを開く。','ホームへ',{appId:'browser',phoneScreen:'home',phoneEffect:'home',navigationAction:'home'}),
  tap('ホームからゲーム内メールを開く。','メールを開く',{appId:'mail',phoneEffect:'mail'}),
  tap('あかつき取引所から届いた確認メールを開く。','あかつき取引所の確認メール',{appId:'mail',phoneScreen:'mail',phoneEffect:'open-mail'}),
  tap('このメールの確認コードをゲーム内でコピーする。','メールのコードをコピー',{appId:'mail',phoneScreen:'mail',phoneEffect:'copy-code'}),
  tap('メールを閉じずに、アプリ切替の一覧を開く。','アプリ切替を開く',{appId:'mail',displayAppId:'mail',phoneScreen:'switcher',phoneEffect:'switcher',navigationAction:'switcher'}),
  tap('アプリ切替の一覧から、登録を進めているあかつき取引所を選ぶ。','入力中のブラウザーへ',{appId:'browser',displayAppId:'switcher',phoneScreen:'switcher',phoneEffect:'browser',openAppId:'browser'}),
  focus('verificationCode','メールの確認コード'),input('verificationCode','メールの確認コード',extensionProfile.verificationCode,{instruction:'メールからコピーした確認コードを、確認コードの欄に貼り付ける。',inputMode:'numeric',hidePracticeValue:true}),
  act('account-verify','入力したコードでメール認証を確定する。','練習メールを認証'),
  tap('申込者の教材プロフィールを開く。','架空成人のプロフィールを見る'),
  focus('fullName','氏名'),input('fullName','氏名',extensionProfile.fullName),
  focus('birthDate','生年月日'),input('birthDate','生年月日',extensionProfile.birthDate),
  focus('address','住所・部屋番号'),input('address','住所・部屋番号',extensionProfile.address),
  focus('phone','練習電話番号'),input('phone','練習電話番号',extensionProfile.phone,{inputMode:'numeric'}),
  select('教材プロフィールに合う「会社員」を選ぶ。','occupation','仕事','employee',[['会社員','employee'],['自営業','self-employed']]),
  select('利用目的は、この教材内の練習を選ぶ。','purpose','利用の目的','practice',[['教材内の練習','practice'],['生活費の支払い','payment']]),
  tap('入力した内容の確認画面を開く。','申込内容を確認'),
  check('氏名・生年月日・住所を教材カードと見比べる。','教材プロフィールと一致'),
  act('account-submit','確認した申込内容を、あかつき取引所へ提出する。','練習の利用申込を提出'),
  check('申込受付の履歴で、まだ本人確認が済んでおらず、取引を始められないことを確かめる。','申込受付の履歴を確認')
 ],
 'DX-02':[
  tap('あかつき取引所の本人確認を開く。','取引所の本人確認を開く'),
  tap('教材書類の情報を申込内容と比べ、画面内の人物が申し込んだ本人か確かめる方法を見る。','今回の本人確認方法を見る'),
  select('期限内で朝日ミナト本人の教材カードを選ぶ。','idType','使う教材カード','valid-demo-id',[['朝日ミナト・期限2031年3月31日','valid-demo-id'],['朝日ミナト・期限2026年9月30日（比較用）','expired-demo-id'],['別の人の教材カード','other-demo-id']]),
  tap('選んだ教材カードの表面を開く。','教材カードの表面を見る',{phoneScreen:'identity-front'}),
  check('教材カードの氏名が、申込者の氏名と同じか確かめる。','申込者とカードの氏名が一致'),
  check('教材カードの生年月日が、申込内容と同じか確かめる。','生年月日が一致'),
  check('教材カードの住所が、部屋番号まで申込内容と同じか確かめる。','住所・部屋番号が一致'),
  check('教材で定めた今日の日付が、カードの有効期限内か確かめる。','有効期限内と確認'),
  tap('カードの表面を、画面内の読取り枠で開く。','表面の読取り枠を開く',{phoneScreen:'identity-front'}),
  select('文字が読める表面を枠内へ置く。','idFront','カード表面の置き方','clear',[['明るく、文字が読める枠内','clear'],['ぼやけたまま','blurred'],['枠の外','outside']],{identityControl:true}),
  tap('教材カードの裏面へ切り替える。','裏面の読取り枠を開く',{phoneScreen:'identity-back'}),
  select('裏面も文字が読める位置へ置く。','idBack','カード裏面の置き方','clear',[['明るく、文字が読める枠内','clear'],['ぼやけたまま','blurred'],['枠の外','outside']],{identityControl:true}),
  tap('画面内の架空人物だけを使う顔合わせを開く。','画面内の顔合わせを開く',{phoneScreen:'identity-face'}),
  select('架空人物の顔を明るい枠の中央へ合わせる。','selfie','画面内人物の位置','clear-centered',[['明るい枠の中央','clear-centered'],['暗い隅','dark'],['顔が枠の外','outside']],{identityControl:true}),
  tap('表面・裏面・人物の三つを並べた確認画面を開く。','本人確認の提出内容を見る',{phoneScreen:'identity-review'}),
  check('申込者・書類・画面内人物を見比べ、書類の氏名・住所と、画面内の顔が、申し込んだ本人のものだと確認する。','申込情報と書類の情報・顔を照合'),
  act('kyc-submit','確認した教材の書類と人物で、あかつき取引所に本人確認を提出する。','本人確認を提出'),
  tap('提出履歴を開く。','本人確認の提出履歴'),
  check('「審査中」は、まだ利用可能ではないと確かめる。','審査中の表示を確認'),
  wait('kyc-advance','あかつき取引所が審査する時間を、ゲーム内で進める。','教材の審査を進める'),
  tap('届いた審査結果のお知らせを開く。','取引所の審査結果を見る'),
  act('kyc-receive','あかつき取引所が利用を認めたお知らせで、利用開始を確認する。','利用可能を確認'),
  check('あかつき取引所の口座を使えるようになったことを、履歴で照合する。','利用開始の履歴を照合')
 ],
 'DX-03':[
  tap('販売所と板の違いを比べる練習を開く。','二つの売買画面を比べる'),
  venue('dealer','まず、お店を相手に売買する「販売所」を開く。'),
  tap('あなた役が販売所から買う1枚の価格と、販売所へ売る1枚の価格を並べて見る。','販売所の二つの値段を見る'),
  venue('board','注文が並ぶ「板取引所」へ切り替える。'),
  tap('板取引所で、売り注文と買い注文の価格・枚数を見る。','注文の並んだ板を見る'),
  venue('dealer','比較を終え、販売所へ戻る。'),
  side('buy'),...qty(),
  tap('販売所の購入見積りを開く。','販売所の購入を確認'),
  check('確認画面で、買う枚数と支払予定の円を見積りと照合する。','購入の支払額を照合'),
  act('dealer-buy','販売所で教材コインの購入を確定する。','販売所で購入を確定'),
  check('購入履歴と手元のコインを照合する。','販売所の購入履歴を照合'),
  side('sell'),...qty(),
  tap('販売所の売却見積りを開く。','販売所の売却を確認'),
  check('売る枚数と受取予定の円を、売却の確認画面で照合する。','売却の受取額を照合'),
  act('dealer-sell','持っている教材コインの売却を確定する。','販売所で売却を確定'),
  tap('購入と売却の二つの履歴を開く。','販売所の往復履歴を見る'),
  check('同じ枚数を買って売ったとき、二つの価格の差で円が減ったことを確認する。','値段の差と残る円を照合')
 ],
 'DX-04':[
  tap('別の練習資金で、板の成行注文を開く。','板の成行注文を始める'),
  venue('board','注文が並ぶ板取引所を選ぶ。'),
  tap('いま出ている注文の値段と枚数を開く。','板の注文を見る'),
  side('buy'),order('market'),...qty(),
  tap('成行買いの確認画面を開く。','成行買いの内容を確認'),
  check('成行買いの確認画面で、売買の向き・注文方法・枚数・支払予定の円を照合する。','成行買いの内訳を照合'),
  act('market-buy','この教材の板の値段で成行買いを確定する。','成行買いを確定'),
  tap('注文受付ではなく、売買が成立した約定履歴を開く。','成行買いの約定履歴'),
  wait('market-move','教材の値段を次の場面へ進める。','次の教材価格へ'),
  side('sell'),order('market'),...qty(),
  tap('保有するコインの成行売りを確認する。','成行売りの内容を確認'),
  check('成行売りの確認画面で、売る枚数と受取予定の円を照合する。','成行売りの内訳を照合'),
  act('market-sell','持っているコインを成行で売る。','成行売りを確定'),
  tap('買いと売りの約定価格・枚数を履歴で開く。','二つの約定履歴を見る'),
  check('円とコインの残高が履歴と合うと確認する。','成行の残高と履歴を照合')
 ],
 'DX-05':[
  tap('別の練習資金で、値段を決めて待つ指値注文を開く。','板の指値注文を始める'),
  venue('board','注文が並ぶ板取引所を選ぶ。'),side('buy'),order('limit'),
  focus('limitPrice','指値の値段'),input('limitPrice','指値の値段',95),...qty(),
  tap('指値買いの確認画面を開く。','指値買いを確認'),
  check('現在の1枚の価格と指値価格を比べ、この買い注文で拘束する円を照合する。','買い注文で拘束する円を照合'),
  act('limit-buy-place','希望の値段で買う注文を出す。','指値買いを注文'),
  tap('未約定一覧を開く。','未約定の買い注文を見る'),
  check('買い注文に使う円は拘束中で、売買がまだ成立せず、コインは増えていないことを確認する。','予約中と購入済みを分ける'),
  act('limit-buy-cancel','まだ成立していない買い注文を取り消す。','未約定の買い注文を取消'),
  check('買い注文の取消後、拘束していた円が使える残高へ戻ったことを確認する。','取消後の円を照合'),
  tap('同じ希望の値段と枚数で注文確認をもう一度開く。','指値買いの再注文を確認'),
  act('limit-buy-replace','買い注文を改めて出す。','指値買いを再注文'),
  wait('limit-buy-fill','教材価格を指値まで進め、成立した結果を見る。','買い指値の価格まで進める'),
  tap('買いが成立した約定履歴を開く。','指値買いの約定履歴'),
  check('買いが成立したので、拘束していた円が支払われ、コイン残高が増えたことを照合する。','買い約定後の残高を照合'),
  side('sell'),order('limit'),focus('limitPrice','指値の値段'),input('limitPrice','指値の値段',105),...qty(),
  tap('指値売りの確認画面を開く。','指値売りを確認'),
  check('売る枚数が保有数を超えていないことと、注文中はそのコインを拘束することを確認する。','売り注文で拘束する枚数を照合'),
  act('limit-sell-place','保有するコインの指値売りを注文する。','指値売りを注文'),
  tap('未約定の売り注文を開く。','未約定の売り注文を見る'),
  check('売り注文で拘束中のコインを、手元で使えるコインに足さないことを確認する。','売り予約中の枚数を照合'),
  wait('limit-sell-fill','教材価格を売り指値まで進め、成立した結果を見る。','売り指値の価格まで進める'),
  tap('指値売りの約定履歴を開く。','指値売りの約定履歴'),
  check('売りが成立したので、拘束していたコインが売却され、円残高が増えたことを照合する。','売り約定後の円を照合')
 ],
 'LD-01':[
  tap('HLPやステーキングとは別の、架空の貸出窓口を開く。','こもれび貸出窓口を開く'),
  tap('あなた役がMock USDCを貸すための、契約の条件を開く。','貸す資産と契約条件を見る'),
  tap('貸す元本・教材年率・30日の期間から、利息を計算する明細を開く。','利息の教材明細を見る'),
  check('借りた相手が資金を返せない危険があることと、今回は返還に成功する教材例であることを確認する。','返還の危険と教材例を確認'),
  select('貸す資産は、この練習のMock USDCを選ぶ。','asset','貸す資産','USDC',[['Mock USDC・今回の教材資産','USDC'],['Mock HYPE・今回の対象外','HYPE']]),
  focus('lendingAmount','貸すMock USDC'),input('lendingAmount','貸すMock USDC',100),
  tap('貸す元本、契約の期間、受取予定の利息を確認画面で見る。','貸出内容を確認'),
  check('貸したMock USDCは手元で使えず、満期前には返してもらえないと確認する。','貸出中の制約を確認'),
  act('lending-apply','この教材の契約条件で、あなた役がMock USDCを貸す申込を確定する。','教材の貸出を確定'),
  tap('貸したMock USDCと、手元で使える残高の明細を開く。','貸出中の元本を見る'),
  tap('返還条件を開き、まだ満期前の表示を見る。','満期前の返還条件を見る',{phoneScreen:'lending-early'}),
  check('この契約は満期前に返還を申請できず、貸した元本を手元で使える残高に足さないことを確認する。','満期前の状態を照合'),
  wait('lending-advance','ゲーム内の時間を満期まで進める。実際に待つ必要はありません。','教材の30日満期へ'),
  tap('満期の明細で、元本と利息を別々に開く。','満期の元本と利息を見る'),
  check('契約の満期になっても、まだ元本と利息を受け取っていないことを確認する。','満期と受取を分ける'),
  act('lending-request','貸した元本と利息の返還を申請する。','元本と利息の返還を申請'),
  tap('返還処理中の明細を開く。','返還処理中の明細'),
  wait('lending-settle','教材の返還処理を進める。','教材の返還処理を進める'),
  tap('返還のお知らせを開く。','元本と利息の到着通知'),
  act('lending-receive','返還明細を確認し、元本と利息を受け取る。','明細を確認して受け取る'),
  check('貸出中の元本がゼロになり、返還された元本と利息が手元で使える残高に加わったことを照合する。','返還後の残高を照合')
 ],
 'LV-01':[
  tap('固定の先物講座とは別の、方向と倍率を選べる練習を開く。','選べる先物の練習を開く'),
  tap('この練習だけの元手1,000 Mock USDCと、取引に配分する証拠金100 Mock USDCを見る。','元手と証拠金の違いを見る'),
  focus('collateral','配分する証拠金'),input('collateral','配分する証拠金',100),
  select('価格が上がると利益になるロングか、下がると利益になるショートかを選ぶ。','side','先物の方向','long',[['ロング・上がると利益','long'],['ショート・下がると利益','short']],{acceptAnyChoice:true}),
  select('同じ証拠金で、取引する金額を何倍にするか選ぶ。1倍・2倍・5倍のどれでも練習できます。','leverage','先物の倍率',2,[['1倍','1'],['2倍','2'],['5倍','5']],{acceptAnyChoice:true}),
  tap('選んだ倍率の建玉金額と数量を開く。','選んだ条件の内訳を見る'),
  tap('損失への備えを見る。この自由練習はSL注文なしで全決済を学ぶ場面です。','今回の損失への備えを見る'),
  check('同じ証拠金で倍率を上げると、利益も損失も大きくなることを確認する。利益の多さや高い倍率でXPは増えません。','損失も大きくなると確認'),
  tap('方向・倍率・証拠金・数量を確認画面に並べる。','先物注文を確認'),
  check('確認画面の方向・倍率・証拠金・数量が、自分で選んだ条件と同じか照合する。','先物注文の内訳を照合'),
  act('leverage-open','選んだ条件で練習の建玉を作る。','この条件で新規注文'),
  tap('まだ閉じていない取引の記録、建玉を開く。','自分の建玉を見る'),
  select('次の教材価格を選ぶ。利益になる方を当てる課題ではありません。','markPrice','次の教材価格',95,[['95へ下がる','95'],['105へ上がる','105']],{acceptAnyChoice:true}),
  wait('leverage-mark','選んだ教材価格へ場面を進める。','選んだ教材価格へ進める'),
  tap('含み損益を見る。まだ決済する前の損益です。','現在の含み損益を見る'),
  check('取引に使っている証拠金、その建玉の含み損益、手元に残した未配分資金を、それぞれ確かめる。','建玉と手元の資金を照合'),
  tap('新規の反対注文ではなく、いまの建玉の決済画面を開く。','この建玉を全決済する'),
  check('選んだ建玉の全数量を決済することを確認する。','全決済の数量を確認'),
  act('leverage-close','建玉を全決済して損益を確定する。','練習の全決済を確定'),
  tap('選んだ方向と倍率、決済した価格を履歴で開く。','先物の決済履歴を見る'),
  check('決済後に建玉の残量がゼロになり、取引に使っていた資金が手元へ戻ったことを照合する。','決済後の資金と残量を照合')
 ]
};

const definitions=[
 ['DX-01','CH-5','あかつき取引所 — 申込の灯','domestic-account',[], 'domesticAccount','銀行とは別に、取引サービスの利用申込をする。'],
 ['DX-02','CH-5','本人確認 — 同じ人の三つの証し','domestic-account',['DX-01'],'domesticAccount','書類・人物・申込を合わせ、利用開始まで見届ける。'],
 ['DX-03','CH-5','販売所と板 — 二つの窓口','domestic-dealer',['DX-02'],'domesticTrading','お店の値段と板を比べ、販売所で買って売る。'],
 ['DX-04','CH-5','成行 — いまの板で買う・売る','domestic-market',['DX-03'],'domesticTrading','買いと売りの約定履歴まで確かめる。'],
 ['DX-05','CH-5','指値 — 待つ注文と予約の箱','domestic-limit',['DX-04'],'domesticTrading','未約定・取消・再注文・約定をそれぞれ確かめる。'],
 ['LD-01','CH-6','貸出 — こもれびの返還帳','lending-lab',[],'lending','元本と利息、満期と受取を分けて確かめる。'],
 ['LV-01','CH-6','先物 — 向きと倍率の稽古場','leverage-choice',[],'leverageChoice','方向と倍率を自分で選び、損益を見て全決済する。']
];
export const extensionQuestIds=definitions.map(x=>x[0]);
export const steps=Object.entries(rows).flatMap(([questId,list])=>list.map((raw,i)=>{
 const d=definitions.find(x=>x[0]===questId), id=`${questId}-S${String(i+1).padStart(3,'0')}`;
 return {id,questId,scenarioId:d[3],extension:true,screenId:`extension:${questId}:${raw.phoneScreen||'main'}`,screenTitle:raw.phoneScreen==='terms'?'練習サービスの利用条件':d[2],appId:'browser',appTitle:questId==='LD-01'?'こもれび貸出窓口':questId==='LV-01'?'そらの先物稽古場':'あかつき取引所',...raw,
 targetAction:raw.label,completionRule:'action',completionEvent:`action:${id}`,effect:id,context:d[6],details:[d[6],'すべて架空の教材です。実際の口座・売買・貸出にはつながりません。'],
 preconditions:i?[`${questId}-S${String(i).padStart(3,'0')}`]:[],nextStepIds:i+1<list.length?[`${questId}-S${String(i+2).padStart(3,'0')}`]:[],checkpoint:(i+1)%6===0||i+1===list.length,
 hint:`${raw.instruction} わからない言葉は「説明を聞く」で確かめよう。`,hints:[d[6],raw.instruction,'村人や長老へ相談しても、途中の入力は消えません。'],helpKeys:[`extension.${questId}`]};
}));
const guidedMaps={
 'DX-01':{0:['DX-01-S018'],1:['DX-01-S031'],2:['DX-01-S033']},
 'DX-02':{3:['DX-02-S016'],4:['DX-02-S023']},
 'DX-03':{0:['DX-03-S006'],1:['DX-03-S021']},
 'DX-04':{2:['DX-04-S021']},
 'DX-05':{3:['DX-05-S015'],4:['DX-05-S034']},
 'LD-01':{0:['LD-01-S004'],1:['LD-01-S013'],2:['LD-01-S016'],3:['LD-01-S018'],4:['LD-01-S022']},
 'LV-01':{0:['LV-01-S005'],1:['LV-01-S006'],2:['LV-01-S011'],3:['LV-01-S017'],4:['LV-01-S022']}
};
export const quests=definitions.map(([id,chapterId,title,scenarioId,prerequisites,domain,summary])=>({id,partId:'crypto',chapterId,title,scenarioId,prerequisites,domain,summary,requesterId:chapterId==='CH-5'?'sena':'luka',extension:true,optionalCourse:true,extra:false,reward:40,completionRule:'all-steps',stepIds:steps.filter(x=>x.questId===id).map(x=>x.id),guidedObjectiveMap:{[domain]:guidedMaps[id]},timedChallenge:{enabled:true,durationHours:24}}));
export const objectives=[
 {domain:'domesticAccount',names:['取引所のメール認証','架空成人の申込情報','受付と利用開始の区別','書類と人物の一致','審査と利用可能の確認'],questIds:['DX-01','DX-02']},
 {domain:'domesticTrading',names:['販売所と板の切替','販売所の値段の差','成行の買い・売りと約定','指値の予約と取消','指値の買い・売りの約定'],questIds:['DX-03','DX-04','DX-05']},
 {domain:'lending',names:['貸出条件と返還の危険','元本と手元の区別','利息と満期','返還申請と処理中','返還の受取照合'],questIds:['LD-01']},
 {domain:'leverageChoice',names:['先物の方向','倍率と値動きの大きさ','証拠金と建玉の数量','含み損益と手元の区別','全決済と結果の照合'],questIds:['LV-01']}
];

export const extensionReviewProfile={fullName:'木立 アオイ',birthDate:'1991-08-20',address:'練習県れんしゅう市新芽町2-3-4 302号',phone:'09000005678',email:'aoi@akatsuki.example.invalid',password:'DEMO-REVIEW-73',verificationCode:'739204',documentExpires:'2032-06-30',today:'2026-10-23'};
// Every review performs the actual operations in an independent copy. No XP or money
// from the first attempt is reused. LV keeps all twelve direction/multiplier/move choices.
for(const q of quests){
 const changed=q.id==='DX-01'||q.id==='DX-02'?'別の成人「木立アオイ」の教材カード':q.id==='LD-01'?'貸出元本200 Mock USDC':q.id==='LV-01'?'もう一度、自分で選ぶ方向・倍率・教材価格':'売買数量5枚';
 const actions=steps.filter(s=>s.questId===q.id).map((s,i)=>{
  const a={...structuredClone(s),id:`RV-${q.id}-A${String(i+1).padStart(3,'0')}`,details:[`条件違いの確認：${changed}。本編の資金・時計・XPは変わりません。`],preconditions:[],nextStepIds:[]};
  if(q.id==='DX-01'&&a.field&&Object.hasOwn(extensionReviewProfile,a.field))a.value=extensionReviewProfile[a.field];
  if(a.field==='quantity')a.value=5;
  if(a.field==='lendingAmount')a.value=200;
  if(q.id==='LD-01'&&a.id.endsWith('A014'))a.instruction='この確認課題のゲーム内時間を、30日の満期まで進める。';
  if(q.id==='DX-02'){
   a.instruction=a.instruction.replaceAll('朝日ミナト','木立アオイ');
   if(a.field==='idType')a.choices=[C('木立アオイ・期限2032年6月30日','valid-demo-id'),C('木立アオイ・期限2026年9月30日（比較用）','expired-demo-id'),C('別の人の教材カード','other-demo-id')];
  }
  return a;
 });
 q.reviewVariant={id:`${q.id}-extension-review`,title:`${q.title} — 条件を変えた確認`,description:`${changed}で確かめる独立した練習です。`,independentSnapshot:true,usesChangedConditions:true,stepReward:0,questReward:0,
  initialSnapshot:{scenarioId:q.scenarioId,review:true,...(['DX-01','DX-02'].includes(q.id)?{profile:structuredClone(extensionReviewProfile)}:{}),...(q.id==='DX-02'?{accountStatus:'submitted',emailVerified:true}:{}),...(['DX-03','DX-04','DX-05'].includes(q.id)?{exerciseQuantity:5}:{}),...(q.id==='LD-01'?{lendingAmount:200}:{})},
  tasks:[{id:`RV-${q.id}-task`,title:`${changed}で、結果まで確認`,instruction:`${changed}を使います。わからない言葉は説明を聞けます。`,domain:q.domain,objectiveIndex:Number(Object.keys(guidedMaps[q.id])[0]),objectiveEvidence:Object.keys(guidedMaps[q.id]).map(i=>({domain:q.domain,objectiveIndex:Number(i)})),actions}]};
 if(q.id==='LV-01'){
  q.reviewVariant.title='先物 — 向きと倍率を選び直す復習';
  q.reviewVariant.description='同じ条件でも復習できます。方向・倍率・値動きのどれかを変えて結果まで確かめると、別条件の技能として記録します。';
  for(const a of q.reviewVariant.tasks[0].actions)a.details=['方向・倍率・値動きを選び直せる独立の復習です。本編の資金・時計・XPは変わりません。'];
 }
}

/** Only local phone evidence; money belongs to finance-extension.js. */
export function applyContentEffect(state,step,value){
 if(!step.extension||!extensionQuestIds.includes(step.questId))return;
 const p=state.phoneState;p.formDrafts||={};p.mailById||={};p.notifications||=[];p.recentApps||=[];
 const draft=p.formDrafts[step.questId]||={};
 if(step.field&&step.type!=='focus')draft[step.field]=value??step.value;
 p.activeApp=step.appId;p.currentScreen=step.screenId;p.recentApps=[step.appId,...p.recentApps.filter(x=>x!==step.appId)].slice(0,9);
 if(step.type==='focus'){p.focusedField=step.field;p.keyboard={open:true,field:step.field,questId:step.questId};}else if(['input','select','confirm'].includes(step.type))p.keyboard={open:false};
 if(step.extensionAction==='account-register'){
  p.mailById['domestic-registration']={id:'domestic-registration',subject:'あかつき取引所のメール確認',sender:'あかつき教材窓口',body:`このメールの確認コードは ${extensionProfile.verificationCode} です。ゲーム内だけで使います。`,code:extensionProfile.verificationCode,read:false};
  if(!p.notifications.some(x=>x.id==='domestic-registration'))p.notifications.push({id:'domestic-registration',appId:'mail',title:'取引所の確認メール',read:false});
 }
 switch(step.phoneEffect){
  case 'home':p.activeApp='home';break;
  case 'mail':p.activeApp='mail';break;
  case 'open-mail':{const m=p.mailById['domestic-registration'];if(!m)throw new Error('取引所から届いたメールを開こう。');m.read=true;p.activeMailId='domestic-registration';break;}
  case 'copy-code':if(!p.mailById['domestic-registration']?.read)throw new Error('先に届いたメール本文を開こう。');p.clipboard=extensionProfile.verificationCode;break;
  case 'switcher':p.appSwitcherOpen=true;break;
  case 'browser':p.appSwitcherOpen=false;p.activeApp='browser';break;
 }
 if(step.extensionAction==='account-verify'&&p.clipboard!==extensionProfile.verificationCode)throw new Error('届いたメールを開き、確認コードをゲーム内でコピーしよう。');
}
