// Original Japanese learning data. Each row is one stable, individually completed action.
const catalog = {
  "CR-01": [
    "スマホの「資産の地図」アプリを開く。",
    "「銀行の円」カードを押す。",
    "置き場所として「銀行」を押す。",
    "「USDC」カードを押す。",
    "種類として「暗号資産」を押す。",
    "「ウォレット」カードを押す。",
    "役割として「資産を操作する入口」を押す。",
    "「ネットワーク」カードを押す。",
    "役割として「送る道」を押す。",
    "「Hyperliquid内の残高」カードを押す。",
    "地図の「サービス内の置き場所」を押す。",
    "「HyperCoreとHyperEVM」の説明を開く。",
    "今回使う場所として「HyperCore」を押す。",
    "練習ウォレットの残高を開く。",
    "1000 Mock USDCの明細を開く。",
    "ガス用0.001 Mock ETHの明細を開く。",
    "「送る前の確認メモ」を保存する。",
    "「地図を確認できた」を押して町へ戻る。"
  ],
  "CR-02": [
    "スマホの取引練習アプリを開く。",
    "「接続」を押す。",
    "接続方法の一覧を開く。",
    "「練習ウォレット」を選ぶ。",
    "ウォレットの通知を開く。",
    "要求元のサービス名を開く。",
    "接続で許される操作の説明を開く。",
    "「接続を許可」を押す。",
    "スマホの最近使ったアプリを開く。",
    "取引練習アプリを選ぶ。",
    "「取引を有効にする」を押す。",
    "有効化の内容を開く。",
    "「練習の確認」を押す。",
    "接続状態を開く。",
    "接続済みのDEMO-WALLET-Aの詳細を開く。",
    "模擬メールの通知を開く。",
    "「サポート」を名乗る差出人の詳細を開く。",
    "復元情報を求める案内の詳細を開く。",
    "本文の外側にある「この案内を閉じる」を押す。",
    "スマホのホームへ戻る。",
    "取引練習アプリを開く。",
    "アプリ内の「ヘルプ」を開く。",
    "「復元情報は入力しない」の教材メモを開く。",
    "メモを保存する。",
    "接続状態に戻り、問題の案内から離れられたことを確認する。"
  ],
  "CR-03": [
    "取引練習アプリの「入金」を押す。",
    "受取資産欄を押す。",
    "「USDC」を選ぶ。",
    "受取ネットワーク欄を押す。",
    "「Arbitrum」を選ぶ。",
    "最低額・教材コスト・DEMO宛先の受取条件を開く。",
    "DEMO宛先をゲーム内クリップボードにコピーする。",
    "スマホのホームへ戻る。",
    "練習ウォレットを開く。",
    "「送る」を押す。",
    "送信資産欄を押す。",
    "「USDC」を選ぶ。",
    "送信ネットワーク欄を押す。",
    "「Arbitrum」を選ぶ。",
    "宛先欄を押す。",
    "コピーしたDEMO宛先を貼り付ける。",
    "数量欄を押す。",
    "練習値「100」を入力する。",
    "ガス残高の内訳を開く。",
    "「確認へ」を押す。",
    "資産の照合欄を確認する。",
    "ネットワークの照合欄を確認する。",
    "宛先の照合欄を確認する。",
    "送信100・教材コスト1・受取99の内訳を開く。",
    "「送信を確定」を押す。",
    "教材の「処理完了まで進める」を押す。",
    "到着通知を開く。",
    "取引練習アプリの入金履歴を開く。",
    "今回の入金明細を開く。",
    "受取残高99を照合する。",
    "練習ウォレットの残高明細を開く。",
    "送信元900 USDC・ガス残高0.0009 ETHを確認する。"
  ],
  "CR-04": [
    "運用方法の地図を開く。",
    "「現物」のカードを開く。",
    "現物で値段が変わるものの説明を開く。",
    "比較表へ戻る。",
    "「HLP」のカードを開く。",
    "損益と引出し待ちの説明を開く。",
    "比較表へ戻る。",
    "「ステーキング」のカードを開く。",
    "数量と評価額の違いを開く。",
    "委任解除と現物への出金の説明を開く。",
    "比較表へ戻る。",
    "「先物」のカードを開く。",
    "証拠金・funding・清算の説明を開く。",
    "比較表へ戻る。",
    "「いつ資金を戻したいか」の欄を開く。",
    "今回の練習上の希望を選ぶ。",
    "選んだ方法と希望の相性を示す確認欄を開く。",
    "「ラボを選ぶ」または「今回は運用しない」を選ぶ。"
  ],
  "HY-SPOT": [
    "運用ラボの「現物」を開く。",
    "独立した練習資金1000の説明を確認する。",
    "銘柄一覧を開く。",
    "教材HYPEを選ぶ。",
    "「買い」を選ぶ。",
    "注文方法として「成行」を選ぶ。",
    "数量欄を押す。",
    "練習値「2」を入力する。",
    "注文内訳を開く。",
    "支払200と残高800を確認する。",
    "「注文確認へ」を押す。",
    "注文を確定する。",
    "保有一覧を開く。",
    "HYPEの保有明細を開く。",
    "教材価格を次のコマへ進める。",
    "価格90時の評価額180の内訳を開く。",
    "評価損20の説明を開く。",
    "保有明細から「売る」を押す。",
    "売却数量欄を押す。",
    "「全数量2」を選ぶ。",
    "売却の確認画面を開く。",
    "売却を確定する。",
    "取引履歴を開く。",
    "売却明細で確定損失20と利用可能980を照合する。",
    "「指値と取消の小練習」を開く。",
    "別snapshotであることを確認する。",
    "「買い」を選ぶ。",
    "注文方法を「指値」に変える。",
    "指値価格欄を押す。",
    "練習値「95」を入力する。",
    "数量欄を押す。",
    "練習値「1」を入力する。",
    "注文確認を開く。",
    "注文を確定する。",
    "未約定注文を開く。",
    "保留中の注文を選ぶ。",
    "「取り消す」を押す。",
    "取消を確定する。",
    "拘束95が解放された残高を開く。",
    "「元の現物ラボに戻る」を押す。",
    "出金に引き継ぐ残高980を確認する。"
  ],
  "HY-HLP": [
    "運用ラボの「HLP」を開く。",
    "独立した練習資金1000の説明を確認する。",
    "HLPの仕組みを開く。",
    "引出し条件を開く。",
    "「預け入れる」を押す。",
    "数量欄を押す。",
    "練習値「300」を入力する。",
    "確認画面を開く。",
    "預入300と手元700を照合する。",
    "預入を確定する。",
    "HLPの保有明細を開く。",
    "出金可能日時を開く。",
    "教材の「2日進める」を押す。",
    "架空評価単価97の内訳を開く。",
    "保有評価額291を確認する。",
    "「引き出す」を押す。",
    "まだ引き出せない理由を開く。",
    "出金可能日までゲーム内時間を進める。",
    "「引き出す」を押す。",
    "引出し数量欄を押す。",
    "「全額」を選ぶ。",
    "確認画面を開く。",
    "受取291を照合する。",
    "引出しを確定する。",
    "履歴を開く。",
    "引出し明細を開く。",
    "手元700と受取291の合計991を確認する。"
  ],
  "HY-STAKE": [
    "運用ラボの「ステーキング」を開く。",
    "初期資産がHYPE10であることを確認する。",
    "現物残高を開く。",
    "HYPEを選ぶ。",
    "「移す」を押す。",
    "移動先としてステーキング残高を選ぶ。",
    "数量欄を押す。",
    "練習値「10」を入力する。",
    "移動の確認画面を開く。",
    "移動を確定する。",
    "ステーキング画面を開く。",
    "validator一覧を開く。",
    "架空validatorの詳細を開く。",
    "「委任する」を押す。",
    "数量欄を押す。",
    "「全数量10」を選ぶ。",
    "委任の確認画面を開く。",
    "委任を確定する。",
    "委任明細を開く。",
    "ゲーム内時間を1日進める。",
    "単発報酬0.1の明細を開く。",
    "価格80時の評価額808を開く。",
    "「委任を解除」を押す。",
    "「全数量10.1」を選ぶ。",
    "委任解除の確認画面を開く。",
    "委任解除を確定する。",
    "ステーキング残高を開く。",
    "「現物残高へ移す」を押す。",
    "「全数量10.1」を選ぶ。",
    "出金の確認画面を開く。",
    "出金を確定する。",
    "待機中の明細を開く。",
    "ゲーム内時間を7日進める。",
    "現物残高を開く。",
    "到着したHYPE10.1の明細を開く。",
    "「売る」を押す。",
    "「全数量10.1」を選ぶ。",
    "価格80・手数料0の確認画面を開く。",
    "売却を確定する。",
    "利用可能808 Mock USDCを確認する。"
  ],
  "HY-PERP": [
    "運用ラボの「先物」を開く。",
    "独立した練習資金1000の説明を確認する。",
    "証拠金方式の選択を開く。",
    "「分離証拠金」を選ぶ。",
    "銘柄一覧を開く。",
    "教材トークンを選ぶ。",
    "方向として「買い・ロング」を選ぶ。",
    "倍率欄を押す。",
    "「2倍」を選ぶ。",
    "倍率を確定する。",
    "配分する証拠金の欄を押す。",
    "練習値「100」を入力する。",
    "注文の内訳を開く。",
    "建玉金額200を確認する。",
    "数量2を確認する。",
    "教材の「損失対応の計画」を開く。",
    "この小練習では価格95で手動決済する計画を選ぶ。",
    "注文の確認画面を開く。",
    "注文を確定する。",
    "建玉を開く。",
    "教材価格を95へ進める。",
    "評価損10の内訳を開く。",
    "「決済」を押す。",
    "全数量2を選ぶ。",
    "決済の確認画面を開く。",
    "決済を確定する。",
    "履歴で利用可能990を確認する。",
    "「SLの小練習」を開く。",
    "別snapshotで価格100・数量2から始めることを確認する。",
    "「SLを設定」を押す。",
    "発動価格欄を押す。",
    "練習値「97」を入力する。",
    "確認画面を開く。",
    "SLを確定する。",
    "教材の急変コマへ進める。",
    "発動明細を開く。",
    "約定96.5と損失7の明細を開く。",
    "「fundingの小練習」を開く。",
    "別snapshotの数量2・oracle100を確認する。",
    "1時間率0.01%の表示を開く。",
    "次のfunding時刻へ進める。",
    "支払0.02の明細を開く。",
    "「清算の見学」を開く。",
    "維持証拠金と自己資本の説明を開く。",
    "教材の判定例を進める。",
    "模擬清算後の残余明細を開く。",
    "「元の先物ラボに戻る」を押す。",
    "出金に引き継ぐ残高990を確認する。"
  ],
  "HY-EXIT": [
    "「資金を戻す」を開く。",
    "今回の出口routeの残高明細を開く。",
    "拘束がなく出金可能であることを確認する。",
    "「出金」を押す。",
    "出金資産欄を押す。",
    "「USDC」を選ぶ。",
    "受取ネットワーク欄を押す。",
    "今回の練習受取カードと一致する「Arbitrum」を選ぶ。",
    "受取先欄を押す。",
    "自分の練習用DEMO宛先を選ぶ。",
    "数量欄を押す。",
    "出金可能額の「全額」を選ぶ。",
    "確認画面を開く。",
    "申請額から教材手数料1を控除する内訳を開く。",
    "資産の照合欄を確認する。",
    "networkの照合欄を確認する。",
    "宛先の照合欄を確認する。",
    "出金を確定する。",
    "処理中の履歴を開く。",
    "教材の「処理完了まで進める」を押す。",
    "受取通知を開く。",
    "受取ウォレットの残高を開く。",
    "今回の受取明細を開く。",
    "申請額から1を引いた数量が届いたことを確認する。",
    "「残高の現在地」のまとめを開く。",
    "町へ戻り、村長に明細を渡す。"
  ]
};

const option = (label, value = label) => ({label, value});
const choose = (field, value, labels, extra = {}) => ({
  type:'select', field, value,
  choices:labels.map(item => Array.isArray(item) ? option(...item) : option(item)), ...extra
});
const input = (field, value) => ({type:'input',field,value,inputMode:'decimal'});
const focus = field => ({type:'focus',field});
const check = (label, extra = {}) => ({type:'check',label,...extra});
const confirm = (label, extra = {}) => ({type:'confirm',label,...extra});
const wait = (label, extra = {}) => ({type:'wait',label,...extra});
const assetChoices = [['USDC（今回の受取条件）','USDC'],['USDT','USDT']];
const networkChoices = [['Arbitrum（今回の受取条件）','Arbitrum'],['別の道：Ethereum','Ethereum']];
export const routeChoices = [
  option('現物の塔へ進む','spot'),option('流動性の塔：HLPへ進む','hlp'),
  option('委任の塔：ステーキングへ進む','stake'),
  option('任意：先物の仕組みも学ぶ','perp'),option('今回は運用せず、出金だけ練習する','journey')
];
export const routeAmounts = Object.freeze({journey:99,spot:980,hlp:991,stake:808,perp:990});
export const routeReceipts = Object.freeze({journey:98,spot:979,hlp:990,stake:807,perp:989});

const definitions = {
 'CR-01':{title:'資産の地図',chapterId:'CH-5',requesterId:'npc-keys',scenarioId:'journey',prerequisites:['PR-01'],
  sections:[[1,13,'資産の地図'],[14,16,'練習ウォレット'],[17,18,'確認メモ']],
  details:['銀行の円 → 暗号資産を扱うサービス → ウォレットで操作する残高 → HyperCore内の残高 → 運用 → 戻す。','資産は荷物、ネットワークは送る道。ウォレットは資産を操作するための道具です。','今回の入口：練習ウォレットに1000 Mock USDC、ガス代用0.001 Mock ETH。どちらも架空です。'],
  hint:'いま選んでいるのは、荷物の種類、送る道、それとも置き場所かな。',
  guidedObjectiveMap:{crypto_basics:{0:'CR-01-S018'}}},
 'CR-02':{title:'ウォレットと偽サポート',chapterId:'CH-5',requesterId:'npc-keys',scenarioId:'journey',prerequisites:['CR-01'],
  sections:[[1,4,'接続方法'],[5,8,'練習ウォレットの許可'],[9,15,'取引の有効化'],[16,19,'模擬メール'],[20,25,'ゲーム内ヘルプ']],
  details:['これは練習画面です。あなたのウォレットには接続しません。','メールログインとウォレット接続は入口が異なります。今回はDEMO-WALLET-Aを使います。','接続、取引の有効化、資産の移動はそれぞれ別の確認です。接続だけでは資産は動きません。'],
  hint:'接続しただけでは荷物はまだ動かないよ。復元情報を求める案内は外側のボタンで閉じよう。',
  guidedObjectiveMap:{crypto_basics:{1:'CR-02-S025'}}},
 'CR-03':{title:'ネットワークと入金',chapterId:'CH-5',requesterId:'npc-keys',scenarioId:'journey',prerequisites:['CR-02'],
  sections:[[1,7,'受取条件'],[8,19,'練習ウォレットから送る'],[20,25,'送信確認'],[26,32,'処理と到着明細']],
  details:['今回の練習ルート：Arbitrum上のUSDC → HyperCore。別の入口や対応経路もあります。','受取カード：USDC / Arbitrum / DEMO-VAULT-A。練習最低額10、教材コスト1 Mock USDC。','今回の送信100から教材コスト1を引き、到着は99。ガス0.0001 Mock ETHはETH残高から使います。'],
  hint:'受取カードと送る画面の、資産、道、宛先を同じにしよう。直す前の正しい入力は残るよ。',
  guidedObjectiveMap:{crypto_basics:{2:'CR-03-S025',3:'CR-03-S032'}}},
 'CR-04':{title:'運用方法の比較',chapterId:'CH-5',requesterId:'npc-keys',scenarioId:'journey',prerequisites:['CR-03'],
  sections:[[1,4,'現物カード'],[5,7,'HLPカード'],[8,11,'ステーキングカード'],[12,14,'先物カード'],[15,18,'希望と進路']],
  details:['利益率の順位ではなく、値下がりと待つ時間を比べます。今回は運用しない選択もできます。','現物：資産そのものを持つ。HLP：戦略の利益も損失も共有し、直近の預入から4日待ちます。','ステーキング：数量が増えても価格次第で評価額は減ります。先物：証拠金、資金調達料、清算を学びます。'],
  hint:'いつ資金を戻したいかも選ぶ条件だよ。進路の予約後、鍵守りの石像へ向かおう。',
  guidedObjectiveMap:{crypto_basics:{4:'CR-04-S018'}}},
 'HY-SPOT':{title:'現物の塔',chapterId:'CH-6',requesterId:'npc-sky',scenarioId:'spot',routeId:'spot',prerequisites:['CR-04'],requiresChapterSeal:'CH-5',
  sections:[[1,2,'独立ラボの準備'],[3,12,'現物注文'],[13,17,'保有と評価'],[18,24,'売却と取引履歴'],[25,39,'指値の別練習'],[40,41,'ラボの出口']],
  details:['ここからは別の練習です。元手1000 Mock USDCを新しく用意します。他のラボや共通入金の資金と合算しません。','教材価格100、数量2、支払200。手数料を除いた例です。価格は実相場ではありません。','価格90では保有評価180、評価損20。売るまでは確定損失ではありません。'],
  hint:'注文した記録と、買えた記録は別だよ。指値95の買い注文は価格100では保留になるよ。',
  guidedObjectiveMap:{spot:{0:'HY-SPOT-S006',1:'HY-SPOT-S010',2:'HY-SPOT-S024',3:'HY-SPOT-S036',4:'HY-SPOT-S039'}}},
 'HY-HLP':{title:'流動性の塔',chapterId:'CH-6',requesterId:'npc-sky',scenarioId:'hlp',routeId:'hlp',prerequisites:['CR-04'],requiresChapterSeal:'CH-5',
  sections:[[1,4,'独立ラボと仕組み'],[5,10,'預入'],[11,17,'評価と出金ロック'],[18,24,'引出し'],[25,27,'受取明細']],
  details:['ここからは別の練習です。元手1000 Mock USDCを新しく用意します。','HLPは市場形成、清算、USDC供給などの戦略の損益を共有します。預金の固定利息ではありません。','300を預け、手元は700。評価単価100→97で預入分は291、評価損9。合計評価991です。','直近の預入から4日が出金ロック。待ち時間はゲーム内で進めます。実生活で4日待つ必要はありません。'],
  hint:'最後に預けた日から4日を数えるよ。ロック中も、いつ引き出せるか明細で見よう。',
  guidedObjectiveMap:{hlp:{0:'HY-HLP-S003',1:'HY-HLP-S010',2:'HY-HLP-S015',3:'HY-HLP-S018',4:'HY-HLP-S027'}}},
 'HY-STAKE':{title:'委任の塔',chapterId:'CH-6',requesterId:'npc-sky',scenarioId:'stake',routeId:'stake',prerequisites:['CR-04'],requiresChapterSeal:'CH-5',
  sections:[[1,10,'現物からステーキングへ'],[11,18,'預け先と委任'],[19,22,'1日のロックと単発報酬'],[23,27,'委任解除'],[28,35,'現物への7日待機'],[36,40,'売却と出口']],
  details:['独立した開始資産：HYPE10、Mock USDC0。教材価格100で合計1000相当です。USDC1000を同時には配りません。','委任は運営を支える相手を選ぶこと。現物 → ステーキング → 委任 → ステーキング → 待機 → 現物の順で動かします。','委任のロック1日と、ステーキングから現物へ戻す7日は別の時間です。','単発の教材報酬0.1で10.1 HYPEになっても、価格80なら評価808。元の評価1000より192減っています。'],
  hint:'委任をやめても、まだステーキングの場所にあるよ。7日の待機後に現物へ届くよ。',
  guidedObjectiveMap:{staking:{0:'HY-STAKE-S010',1:'HY-STAKE-S018',2:'HY-STAKE-S033',3:'HY-STAKE-S022',4:'HY-STAKE-S040'}}},
 'HY-PERP':{title:'鏡の塔（任意）',chapterId:'CH-6',requesterId:'npc-sky',scenarioId:'perp',routeId:'perp',prerequisites:['CR-04'],requiresChapterSeal:'CH-5',optional:true,
  sections:[[1,10,'独立ラボと注文設定'],[11,19,'証拠金と損失対応計画'],[20,27,'評価と手動決済'],[28,37,'SLの別練習'],[38,42,'資金調達料の別練習'],[43,46,'清算の見学'],[47,48,'元のラボへ']],
  details:['任意のラボです。ここからは別の練習で元手1000 Mock USDC。現物の学習に受講は不要です。','証拠金は取引に割り当てるお金。100、2倍、建玉金額200、価格100なら数量2です。','分離証拠金のみを操作します。クロス証拠金は口座内の資金を共有する別方式で、この教材では説明だけです。','基本場面は手数料0・資金調達料0。SL、資金調達料、清算はそれぞれ独立した小練習です。'],
  hint:'元手100で値動き200ぶんを持つよ。建玉200を残高から重ねて引かないよ。',
  guidedObjectiveMap:{perps:{0:'HY-PERP-S015',1:'HY-PERP-S022',2:'HY-PERP-S027',3:'HY-PERP-S037',4:'HY-PERP-S046'}}},
 'HY-EXIT':{title:'帰りの船',chapterId:'CH-6',requesterId:'npc-sky',scenarioId:'route',prerequisites:['CR-04'],requiresChapterSeal:'CH-5',routePrerequisites:true,
  sections:[[1,3,'選んだ経路の出口'],[4,12,'出金申請'],[13,18,'出金確認'],[19,24,'処理と受取'],[25,26,'残高の現在地']],
  details:['選んだ経路の残高だけを引き継ぎます。拘束された資金は出金可能額に数えません。','受取カード：USDC / Arbitrum / DEMO-WALLET-A。教材手数料1は申請額から引きます。現行サービスの料金ではありません。','送信履歴だけで終わらず、受取通知から今回の明細を開き、申請額−1と比べます。'],
  hint:'送った明細と受け取った明細を合わせよう。運用を見送った経路では、売却や決済は不要だよ。',
  guidedObjectiveMap:{crypto_exit:{0:'HY-EXIT-S003',1:'HY-EXIT-S012',2:'HY-EXIT-S017',3:'HY-EXIT-S018',4:'HY-EXIT-S024'}}}
};

const overrides = {
 'CR-01':{
  3:choose('yenLocation','銀行',[['銀行','銀行'],['HyperCore内','HyperCore内']]),
  5:choose('assetType','暗号資産',['暗号資産','銀行の円']),
  7:choose('walletRole','資産を操作する入口',['資産を操作する入口','銀行口座そのもの']),
  9:choose('networkRole','送る道',['送る道','持っている数量']),
  11:choose('coreLocation','サービス内の置き場所',['サービス内の置き場所','銀行']),
  13:choose('destinationLayer','HyperCore',['HyperCore','HyperEVM']),
  15:{details:['練習ウォレット：1000 Mock USDC。ドルや円そのものではありません。']},
  16:{details:['ガス代用：0.001 Mock ETH。USDCとは別単位です。']},
  17:confirm('送る前の確認メモを保存'),18:confirm('地図を確認できた・町へ戻る')},
 'CR-02':{
  4:choose('wallet','DEMO-WALLET-A',[['練習ウォレット：DEMO-WALLET-A','DEMO-WALLET-A'],['メールログインの説明を見る','mail-explanation']]),
  5:{appId:'wallet',tabId:'notifications',details:['要求元：そらの取引練習。ウォレットの識別子を見てよいかという練習通知です。']},
  6:{appId:'wallet',details:['要求元：そらの取引練習（ゲーム内）。実サイトへの接続ではありません。']},
  7:{appId:'wallet',details:['許可すること：DEMOの識別子を練習アプリへ表示する。資産の移動や秘密の復元情報の提出は含みません。']},
  8:confirm('練習の接続を許可',{appId:'wallet',result:'DEMO-WALLET-Aを接続しました。まだ送金していません。'}),
  9:{appId:'memo',tabId:'recent'},10:choose('recentApp','hyper',[['そらの取引練習','hyper'],['練習ウォレット','wallet']]),
  12:{details:['練習アプリ内の注文機能を有効にします。接続の許可や資産移動とは別の操作です。']},
  13:confirm('練習の有効化を確認'),
  14:{details:['接続：済み / 取引の練習：有効 / 今回の資産移動：未実行。']},
  16:{appId:'mail',tabId:'inbox'},17:{appId:'mail',details:['差出人名：おたすけ緊急係（架空）。名前が安心そうでも、要求の中身を確かめます。']},
  18:{appId:'mail',details:['偽案内：「復元情報を教えてください」。秘密情報を入力する欄はありません。案内本文の外側から閉じられます。']},
  19:{appId:'mail',label:'この案内を閉じる',result:'案内を閉じました。秘密の情報は入力していません。'},
  20:{appId:'memo',tabId:'home'},23:{details:['復元情報・秘密鍵・APIキーは入力しません。困ったら案内を閉じ、ゲーム内ヘルプや公式資料へ戻ります。']},
  24:confirm('安全メモを保存'),25:check('接続済み・今回の送金未実行を確認')},
 'CR-03':{
  2:focus('receiveAsset'),3:choose('receiveAsset','USDC',assetChoices),4:focus('receiveNetwork'),5:choose('receiveNetwork','Arbitrum',networkChoices),
  6:{details:['受取先：HyperCore / USDC / Arbitrum / DEMO-VAULT-A。最低10 Mock USDC、入金コスト1、必要ガス0.0001 Mock ETH（すべて練習値）。']},
  7:{label:'DEMO-VAULT-Aをゲーム内でコピー',field:'clipboard',value:'DEMO-VAULT-A'},8:{appId:'memo',tabId:'home'},
  9:{appId:'wallet'},10:{appId:'wallet'},11:{...focus('asset'),appId:'wallet'},12:{...choose('asset','USDC',assetChoices),appId:'wallet'},
  13:{...focus('network'),appId:'wallet'},14:{...choose('network','Arbitrum',networkChoices),appId:'wallet'},
  15:{...focus('address'),appId:'wallet'},16:{type:'tap',field:'address',value:'DEMO-VAULT-A',label:'ゲーム内クリップボードから貼り付け',appId:'wallet',details:['コピーした宛先：DEMO-VAULT-A。別のDEMO宛先とは一致しません。']},
  17:{...focus('quantity'),appId:'wallet'},18:{...input('quantity',100),appId:'wallet'},19:{appId:'wallet',details:['保有ガス：0.001 Mock ETH / 今回必要：0.0001 Mock ETH / 送信後：0.0009 Mock ETH。']},
  20:{appId:'wallet',label:'送信の確認へ'},21:check('送るUSDCと受取USDCを照合',{appId:'wallet'}),22:check('Arbitrum同士を照合',{appId:'wallet'}),
  23:check('DEMO-VAULT-A同士を照合',{appId:'wallet'}),24:{appId:'wallet',details:['送信100 − 教材コスト1 = 到着99 Mock USDC。ETHのガスは別計算です。']},
  25:confirm('練習の送信を確定',{appId:'wallet',result:'100を送る申請を記録。送信元900 USDC、ガス0.0009 ETH。到着はまだ処理中です。'}),
  26:wait('教材の処理完了まで進める',{result:'HyperCoreに99 Mock USDCが到着しました。通知と明細で確かめましょう。'}),
  30:check('今回の入金99を照合'),31:{appId:'wallet'},32:check('送信元900 USDC・0.0009 ETHを照合',{appId:'wallet'})},
 'CR-04':{
  3:{details:['現物は資産そのものを買います。HYPEを2持つなら、価格100で評価200、価格90で評価180です。']},
  6:{details:['HLPの戦略には利益も損失もあります。直近の預入から4日後まで引き出せません。追加入金すると待つ期限が更新されます。']},
  9:{details:['10 HYPE×100=1000。数量が10.1に増えても、価格80なら808。数量が増えることと評価額が増えることは別です。']},
  10:{details:['委任の1日ロック → 委任解除 → ステーキング残高 → 現物への7日待機。委任解除だけではウォレットへ戻りません。']},
  13:{details:['先物は証拠金で値動きへの建玉を持ちます。保有中の資金調達料と、自己資本が維持証拠金以下になる清算があります。任意の学習です。']},
  15:focus('returnHorizon'),16:choose('returnHorizon',undefined,[['近いうちに戻したい','soon'],['ゲーム内の待機も練習したい','flexible']],{acceptAnyChoice:true}),
  17:{details:['近いうちに使う資金なら、値下がりや出金ロックがある方法との相性を見直せます。希望も方法も選び直せます。本人への投資先の指示ではありません。']},
  18:choose('route',undefined,routeChoices.map(o=>[o.label,o.value]),{acceptAnyChoice:true,label:'第6章で学ぶ経路を予約',details:['これは第6章の予約です。先に鍵守りの石像を倒します。どの選択でも比較は達成。未受講のラボは未学習のままです。']})},
 'HY-SPOT':{
  4:choose('symbol','HYPE',[['教材HYPE','HYPE'],['別の教材銘柄','OTHER']]),5:choose('side','buy',[['買い','buy'],['売り','sell']]),
  6:choose('orderType','market',[['成行（今の教材価格）','market'],['指値（指定した価格）','limit']]),7:focus('quantity'),8:input('quantity',2),
  9:{details:['価格100 × 数量2 = 支払200。手数料0。利用可能1000 − 200 = 800、保有HYPE2。']},
  10:check('支払200・購入後800を照合'),11:{label:'現物の注文確認へ'},12:confirm('練習の購入を確定',{result:'200でHYPE2を購入。未使用USDC800、保有評価200、確定損益0。'}),
  15:wait('教材価格を100から90へ進める'),16:{details:['保有2 HYPE × 教材価格90 = 評価180。未使用800と合計980。実相場ではありません。']},
  17:{details:['取得に200を使った保有分は評価180で、評価損20。まだ売っていないので確定損失ではありません。']},
  19:focus('sellQuantity'),20:choose('sellQuantity',2,[['全数量2 HYPE',2],['1 HYPEのみ',1]]),21:{label:'現物の売却確認を開く'},22:confirm('練習の売却を確定'),
  24:check('確定損失20・利用可能980を照合',{details:['売却180 + 未使用800 = 利用可能980。ここで値動きの損失20が確定しました。']}),
  25:{details:['ここからは別の小練習。価格100、開始1000の独立した状態です。元の980は保存したままです。']},26:check('指値は別の練習状態であると確認'),
  27:choose('limitSide','buy',[['買い','buy'],['売り','sell']]),28:choose('limitType','limit',[['指値','limit'],['成行','market']]),29:focus('limitPrice'),30:input('limitPrice',95),
  31:focus('limitQuantity'),32:input('limitQuantity',1),33:{details:['現在100 / 買い指値95 / 数量1。価格条件未達なので注文は保留。必要な95を拘束します。']},
  34:confirm('指値の練習注文を確定'),36:choose('openOrder','limit-95',[['買い指値95・数量1・保留','limit-95'],['約定した注文（今回はなし）','filled']]),
  38:confirm('この指値注文の取消を確定'),39:{details:['小練習の拘束95 → 0。利用可能905 → 1000。HYPEは買えていません。']},40:{label:'元の現物ラボへ戻る'},41:check('主ラボの出金可能980を確認')},
 'HY-HLP':{
  4:{details:['出金できるのは直近の預入から4日後。追加入金したら、新しい預入時刻から4日後に変わります。']},
  6:focus('quantity'),7:input('quantity',300),9:check('預入300・手元700を照合'),10:confirm('HLPへの練習預入を確定'),
  11:{details:['教材上の模擬口数3 × 評価単価100 = 300。譲渡できるHLPトークンを発行したという意味ではありません。']},
  12:{details:['預入：ゲーム内0日目。最短の引出し：ゲーム内4日目。実時間の24時間チャレンジとは別です。']},
  13:wait('ゲーム内時間を2日進める'),14:{details:['架空の評価単価100 → 97（3%低下）。実際の利回りや実績ではありません。']},15:check('HLP評価291を照合'),
  16:{label:'引出し可否を確かめる',details:['現在2日目 / 最短4日目。ロック中なので、この操作で資金は引き出されません。']},
  17:{details:['最後の預入からまだ2日。あとゲーム内2日で引き出せます。評価額があることと出金できることは別です。']},
  18:wait('出金可能日までゲーム内2日進める'),20:focus('withdrawQuantity'),21:choose('withdrawQuantity','all',[['全額（模擬口数3）','all'],['半分だけ','half']]),
  22:{details:['引出す評価額291 / 手元700 / 引出し後の利用可能991。教材手数料0。']},23:check('今回の受取291を照合'),24:confirm('HLPの練習引出しを確定'),27:check('700 + 291 = 991を照合')},
 'HY-STAKE':{
  2:check('HYPE10・USDC0から始めると確認'),4:choose('symbol','HYPE',[['HYPE','HYPE'],['USDC（保有0）','USDC']]),
  6:choose('moveDestination','staking',[['ステーキング残高','staking'],['外部ウォレット','wallet']]),7:focus('quantity'),8:input('quantity',10),10:confirm('HYPE10をステーキング残高へ移す'),
  12:{details:['預け先の候補（バリデータ）：灯台ノード / 森の歯車 / 星波ノード。すべて架空です。稼働、手数料、委任条件を見ます。']},
  13:choose('validator',undefined,[['灯台ノード：稼働中・教材手数料5%','lighthouse'],['森の歯車：稼働中・教材手数料8%','forest'],['星波ノード：点検表示・教材手数料3%','starwave']],{acceptAnyChoice:true,details:['この数字は候補の見方を学ぶ架空データ。実在先の推奨ではありません。単発報酬0.1は候補の年利から計算しません。']}),
  15:focus('delegateQuantity'),16:choose('delegateQuantity',10,[['全数量10 HYPE',10],['5 HYPE',5]]),18:confirm('HYPE10の委任を確定'),
  19:{details:['現物0 / ステーキング手元0 / 委任中10 HYPE。委任のロックはゲーム内1日です。']},20:wait('委任後のゲーム内時間を1日進める'),
  21:{details:['単発の教材報酬0.1 HYPEを委任中残高へ1回だけ加算。委任中10.1。日利や年利ではありません。']},
  22:{details:['委任中10.1 × 教材価格80 = 評価808。数量は0.1増えましたが、評価額は元の1000より192低下。']},
  24:choose('undelegateQuantity',10.1,[['全数量10.1 HYPE',10.1],['元の10 HYPEだけ',10]]),26:confirm('委任解除を確定'),
  27:{details:['委任中0 / ステーキング手元10.1 / 現物0。委任解除だけでは現物やウォレットへ届いていません。']},
  29:choose('returnQuantity',10.1,[['全数量10.1 HYPE',10.1],['5 HYPE',5]]),30:{details:['移動元：ステーキング / 移動先：現物 / 数量10.1。到着までゲーム内7日待機。']},
  31:confirm('現物への練習出金を確定'),32:{details:['待機中10.1 HYPE / 現物0。ステーキング手元からは移動済み。二重に数えません。']},33:wait('待機のゲーム内時間を7日進める'),
  35:{details:['待機中0 / 現物10.1 HYPE。いま売れる場所へ到着しました。']},37:choose('sellQuantity',10.1,[['全数量10.1 HYPE',10.1],['10 HYPE',10]]),
  38:{details:['数量10.1 × 教材価格80 − 手数料0 = 売却代金808 Mock USDC。']},39:confirm('現物に戻ったHYPEの売却を確定'),40:check('利用可能808 Mock USDCを照合')},
 'HY-PERP':{
  4:choose('marginMode','isolated',[['分離証拠金（今回使う方式）','isolated'],['クロス証拠金（説明のみ）','cross']]),6:choose('symbol','DEMO',[['教材トークン・価格100','DEMO'],['別の教材トークン','OTHER']]),
  7:choose('side','long',[['買い・ロング','long'],['売り・ショート','short']]),8:focus('leverage'),9:choose('leverage',2,[['1倍',1],['2倍',2],['5倍',5]]),10:confirm('新規注文前の倍率2倍を確定'),
  11:focus('collateral'),12:input('collateral',100),13:{details:['証拠金100 × 倍率2 = 建玉金額200。建玉200 ÷ 約定価格100 = 数量2。未配分USDC900。']},14:check('建玉金額200を確認'),15:check('値動きの数量2を確認'),
  16:{details:['この小練習は教材価格95で手動決済する計画。SLの別練習とは分かれています。損失額の保証ではありません。']},
  17:choose('lossPlan','manual-95',[['教材価格95で手動決済する計画','manual-95'],['計画を決めずに進む','no-plan']]),
  18:{details:['分離証拠金100 / 2倍 / ロング / 建玉200 / 数量2 / 手数料0・資金調達料0。100だけを拘束し、200を重ねて引きません。']},
  19:confirm('先物の練習注文を確定'),21:wait('教材の判定用価格を95へ進める'),22:{details:['数量2 × (95 − 100) = 評価損10。配分した100の自己資本は90。未配分900とは別です。']},
  24:choose('closeQuantity',2,[['全数量2',2],['数量1のみ',1]]),25:{details:['返却100 − 確定損失10 = 90。未配分900 + 返却90 = 利用可能990。']},26:confirm('練習建玉の全決済を確定'),27:check('決済履歴の利用可能990を照合'),
  28:{details:['独立したSL練習へ。元の決済済み990は変えません。別のロング数量2、開始価格100を使います。']},29:check('SLは別状態・価格100・数量2と確認'),
  31:focus('stopPrice'),32:input('stopPrice',97),33:{details:['SLは判定用価格97で発動。急変時の売却価格は別に決まり、97で売れる保証ではありません。']},34:confirm('練習のSL発動価格97を確定'),
  35:wait('SL発動97・売却96.5の急変コマへ進める'),36:{details:['判定用価格97で発動 → 売却価格96.5で約定（売買が成立）。発動と約定は別です。']},
  37:{details:['数量2 × (96.5 − 100) = 確定損失7。発動価格97で計算した損失6とは限りません。']},
  38:{details:['独立した資金調達料の練習。数量2のロング、基準価格100。主ラボとSLの損益は持ち込みません。']},39:check('別状態の数量2・計算基準価格100を照合'),
  40:{details:['今回だけの教材1時間率 +0.01% = 0.0001。8時間率や年率ではありません。正の率ではロングが支払い、ショートが受け取ります。']},41:wait('次の1時間の資金調達時刻へ進める'),
  42:{details:['数量2 × 計算基準価格100 × 0.0001 = 0.02の支払い。同じ時刻の表示を開き直しても再課金しません。']},
  43:{details:['清算の見学用の別状態。証拠金100、2倍、数量2、開始100、未配分900。教材の簡略清算判定です。']},
  44:{details:['自己資本 = 証拠金 + 評価損益 − 費用。維持証拠金 = 数量 × 判定用価格 × 教材維持率5%。自己資本が維持証拠金以下で模擬清算。']},
  45:wait('見学用の判定価格52へ進める'),46:{details:['価格52では評価損96、自己資本4、維持証拠金5.2。模擬清算で残余4を返し、未配分900と合計904。関連SL・TPは終了。']},
  47:{label:'元の先物ラボへ戻る'},48:check('主ラボの出金可能990を照合')},
 'HY-EXIT':{
  2:{details:['共通入金99 / 現物980 / HLP991 / ステーキング808 / 先物990。それぞれ別の状態です。画面で選ばれた今回の経路だけを使います。']},
  3:check('今回の経路に拘束が残っていないと確認'),5:focus('asset'),6:choose('asset','USDC',assetChoices),7:focus('network'),8:choose('network','Arbitrum',networkChoices),
  9:focus('address'),10:choose('address','DEMO-WALLET-A',[['自分の練習受取先：DEMO-WALLET-A','DEMO-WALLET-A'],['別のDEMO宛先','DEMO-WALLET-B']]),
  11:focus('quantity'),12:choose('quantity','all',[['今回の経路の出金可能額・全額','all'],['入力をやり直す','edit']]),
  14:{details:['教材手数料1を申請額から控除します。共通経路99→98 / 現物980→979 / HLP991→990 / 委任808→807 / 先物990→989。']},
  15:check('申請USDCと受取USDCを照合'),16:check('送る道Arbitrumと受け取る道を照合'),17:check('自分のDEMO-WALLET-Aと照合'),
  18:confirm('今回の経路の練習出金を確定'),19:{details:['状態：処理中。申請しただけでは、受取を確かめたことになりません。']},20:wait('教材の処理完了まで進める'),
  24:check('今回の申請額から1を引いた到着額を照合'),25:{details:['今回の出金分は受取ウォレットにあります。共通の見送り経路なら元の900に98が届き998 USDC、ETHは別に0.0009です。未体験ラボは未学習のままです。']},
  26:confirm('町へ戻り、港の村長に練習明細を渡す')}
};

function labelFor(copy) {
 const quoted = [...copy.matchAll(/「([^」]+)」/g)].map(m=>m[1]);
 if (quoted.length) return quoted.join(' / ');
 return copy.replace(/。$/,'');
}
function defaultType(copy) {
 if (/欄を押す|欄を開く/.test(copy)) return 'focus';
 if (/確定する|保存する/.test(copy)) return 'confirm';
 if (/時間を.*進める|コマへ進める|価格を.*進める|処理完了まで/.test(copy)) return 'wait';
 if (/確認する|照合する/.test(copy)) return 'check';
 return 'tap';
}
function sectionFor(def,n) {
 return def.sections.find(([start,end])=>n>=start&&n<=end)?.[2] || def.title;
}
export const steps = Object.entries(catalog).flatMap(([questId,rows]) => rows.map((instruction,index)=>{
 const number=index+1, id=`${questId}-S${String(number).padStart(3,'0')}`, def=definitions[questId], patch=overrides[questId]?.[number] || {};
 const tabId=sectionFor(def,number), type=patch.type || defaultType(instruction);
 const details=[...def.details,...(patch.details || [])];
 return {id,questId,screenId:`${questId}:${tabId}`,appId:questId==='CR-01'?'memo':'hyper',tabId,
  instruction,targetAction:labelFor(instruction),label:labelFor(instruction),type,
  result:`${labelFor(instruction)}。この操作を練習の記録に保存しました。`,
  preconditions:index?[`${questId}-S${String(index).padStart(3,'0')}`]:[],
  requiredState:{scenarioId:def.scenarioId,previousStepId:index?`${questId}-S${String(index).padStart(3,'0')}`:null},
  completionRule:'action',completionEvent:`action:${id}`,nextStepIds:index+1<rows.length?[`${questId}-S${String(number+1).padStart(3,'0')}`]:[],
  equivalentRoutes:['ゲーム内ホームからアプリを開く','最近使ったアプリから戻る','通知から該当する明細を開く'],
  checkpoint:`${questId}:${String(number).padStart(3,'0')}`,hintIds:[`${questId}:hint`],hint:def.hint,
  recovery:'入力や明細は残っています。表示された確認箇所へ戻って直せます。',
  effect:id,...patch,details,context:tabId};
}));

export const quests = Object.entries(definitions).map(([id,def])=>({
 id,partId:'crypto',...def,stepIds:steps.filter(s=>s.questId===id).map(s=>s.id),
 completionRule:'all-steps',bossLink:def.chapterId,reward:40,
 timedChallenge:{enabled:true,durationHours:24},
 summary:`${def.title}を、入力・確認・結果の順に練習します。`,
 rewardCopy:'利益の大きさや運用の選択では報酬は変わりません。'
}));

export const chapters = [
 {id:'CH-5',title:'鍵の群島',subtitle:'荷物と道と、秘密の鍵',npcId:'npc-keys',npcName:'鍵守りのセナ',
  dialogue:['島の荷物は、どの道を通るのかで行き先が変わるんだ。','わたしの練習スマホで、資産の場所と、送る前の確認を手伝ってくれる？','復元の秘密は、だれにも渡さなくていいよ。'],area:'群島',color:'#4eaac2',
  equipment:{id:'return-lantern',name:'帰還のランタン',slot:'tool',description:'資産の置き場所と出口のメモを照らす。確認工程は一つずつ行う。'},questIds:['CR-01','CR-02','CR-03','CR-04']},
 {id:'CH-6',title:'流動の天空城',subtitle:'選ぶ勇気、戻る知恵',npcId:'npc-sky',npcName:'港の村長リオ',
  dialogue:['四つの塔は、どれも入口と出口が違う。好きな一つで学んでよいぞ。','今回は運用せず、帰りの船だけ練習しても立派な旅だ。','利益で勇者は決まらぬ。いま何を持ち、どう戻すか確かめよう。'],area:'天空城',color:'#ab8cda',
  equipment:{id:'dawn-crown',name:'暁の冠',slot:'head',description:'選んだ道から帰った証。主人公の冠と、拠点の章の旗に反映される。'},questIds:['HY-SPOT','HY-HLP','HY-STAKE','HY-PERP','HY-EXIT']}
];
const npc = (id,name,role,dialogue,afterDialogue)=>({id,name,role,topicId:`${id}:first-help`,dialogue,afterDialogue});
chapters[0].npcs = [
 npc('sena','鍵守りのセナ','requester','荷物を送る前に、資産の種類と道をそろえたいんだ。\nわたしの練習スマホを手伝ってくれる？','送り先と到着を確かめられたね。\n帰還のランタンを旅のおともにして。'),
 npc('pol','荷物係ポル','hint','資産は荷物、ネットワークは送る道。\n接続しただけでは、荷物はまだ動かないよ。','復元の秘密を求められたら、案内を閉じて戻ればいい。\n困ったら何度でも聞いてね。'),
 npc('io','地図師イオ','reflection','ウォレットで操作する残高と、サービス内の残高は別の場所。\nいま荷物がどこにあるか、地図に残そう。','道がそろい、島の灯台が明るくなった。\n次の城でも、帰りの道を確かめよう。')
];
chapters[1].npcs = [
 npc('rio','港の村長リオ','requester','四つの塔から一つを選んでも、運用を見送ってもよいぞ。\n帰りの船で、受取明細まで見届けてほしい。','選んだ道から、確かめながら帰ってきたな。\n感謝のしるしに暁の冠を授けよう。'),
 npc('mira','星読みミラ','hint','持っている量と、今の値段での評価額は別。\n待つ必要がある資金は、出金可能額に重ねて数えないよ。','最後の預入日、委任の1日、戻す7日を、それぞれ見よう。\nゲーム内の時間はボタンで進められるよ。'),
 npc('nono','船大工ノノ','reflection','送ったという知らせだけでは、受け取った証にはならない。\n今回の明細を、予定の数と比べよう。','あなたが確かめた記録で、帰りの桟橋が完成したよ。\nまだ学んでいない塔は、好きな時に訪ねられる。')
];

export const objectives = [
 {domain:'crypto_basics',names:['資産の現在地','接続と送金の区別','送信条件の一致','費用と到着額','運用条件と見送りの判断'],questIds:['CR-01','CR-02','CR-03','CR-04']},
 {domain:'spot',names:['銘柄と売買方向','数量と支払額','評価損益と確定損益','指値の保留','取消と残高解放'],questIds:['HY-SPOT']},
 {domain:'hlp',names:['戦略損益の理解','預入と手元残高','評価額の変化','直近預入からのロック','引出し後の残高照合'],questIds:['HY-HLP']},
 {domain:'staking',names:['現物・ステーキング・委任の場所','バリデータ条件の見方','1日と7日の区別','数量と評価額','待機後の現物着金'],questIds:['HY-STAKE']},
 {domain:'perps',names:['証拠金・倍率・建玉・数量','方向と損益','決済後の残高','SL発動と約定','資金調達料と維持証拠金'],questIds:['HY-PERP']},
 {domain:'crypto_exit',names:['ラボ固有の解除操作','出金可能額','宛先・資産・ネットワーク','手数料と到着予定額','受取履歴の照合'],questIds:['HY-EXIT']}
];

// Bosses are independent practice screens. Damage happens only after all actions
// in one task are complete; ordinary navigation cannot deal damage.
function action(id, label, type='tap', extra={}) {
 return {id,label,instruction:label,targetAction:label,type,appId:'hyper',screenId:id.split('-A')[0],
  completionRule:'action',result:'確認した内容を、この課題の記録に残しました。',
  details:[],preconditions:[],nextStepIds:[],checkpoint:id,hintIds:[],...extra};
}
function task(id,title,details,actions,domain,objectiveIndex,extra={}) {
 return {id,title,instruction:title,details,actions:actions.map((a,i)=>action(`${id}-A${String(i+1).padStart(2,'0')}`,a.label,a.type,a)),
  domain,objectiveIndex,damage:20,...extra};
}
const aTap = (label,details=[])=>({label,type:'tap',details});
const aCheck = (label,details=[])=>({label,type:'check',details});
const aSelect = (label,field,value,choices)=>({label,...choose(field,value,choices)});
const aInput = (label,field,value)=>({label,...input(field,value)});
const aFocus = (label,field)=>({label,...focus(field)});
const aConfirm = (label,effect,details=[])=>({label,type:'confirm',effect,details});
const aWait = (label,effect,details=[])=>({label,type:'wait',effect,details});

const ch5Tasks = [
 task('CH5-B1','資産の現在地を開く',['ボス専用の表示例：ウォレット900 USDC / HyperCore内99 USDC。主シナリオは変えません。'],[
  aTap('HyperCoreの残高画面を開く',['ウォレット900と、サービス内99は別の場所にあります。']),
  aSelect('HyperCoreの残高99を選ぶ','coreBalance',99,[['HyperCore内99',99],['ウォレット900',900]]),
  aCheck('サービス内99とウォレット900を区別できたと確認')
 ],'crypto_basics',0),
 task('CH5-B2','偽案内を閉じて接続へ戻る',['差出人名：安心復旧センター（架空）。接続済み、今回の送金は未実行の独立した練習です。'],[
  aTap('案内の要求内容を開く',['偽案内：「復元情報を送って」。実情報の入力欄はありません。']),
  aTap('本文の外の「この案内を閉じる」を押す'),aTap('ゲーム内ヘルプから接続状況へ戻る'),
  aCheck('接続済み・今回の送金未実行を確認',['接続の許可は、資産を送った記録ではありません。'])
 ],'crypto_basics',1),
 task('CH5-B3','受取カードに送信フォームを合わせる',['受取カード：USDC / Arbitrum / DEMO-VAULT-B。初期フォームのUSDT・別network・DEMO-VAULT-Aを直します。'],[
  aFocus('送信資産の欄を押す','asset'),aSelect('USDTからUSDCへ直す','asset','USDC',assetChoices),
  aFocus('送るネットワークの欄を押す','network'),aSelect('受取側と同じArbitrumへ直す','network','Arbitrum',networkChoices),
  aFocus('宛先の欄を押す','address'),aSelect('DEMO-VAULT-Bへ直す','address','DEMO-VAULT-B',[['DEMO-VAULT-A','DEMO-VAULT-A'],['DEMO-VAULT-B','DEMO-VAULT-B']]),
  aCheck('資産・ネットワーク・宛先の3つを照合',['この確認では、まだ送信を実行しません。'])
 ],'crypto_basics',2),
 task('CH5-B4','50を送り、49の到着を照合する',['独立したボス用状態：ウォレット1000 USDC・0.001 ETH。受取条件USDC / Arbitrum / DEMO-VAULT-B。教材コスト1、ガス0.0001 ETH。'],[
  aFocus('数量の欄を押す','quantity'),aInput('練習値50を入力する','quantity',50),
  aTap('送信50・コスト1・到着49の内訳を開く',['USDCの費用は送信額から引きます。ETHのガスとは足しません。']),
  aCheck('必要ガス0.0001 ETHと残高0.001 ETHを照合'),
  aConfirm('ボス専用の練習送信を確定','boss:CH5-B4:send',['確定後：送信元950 USDC・0.0009 ETH。今回の49はまだ処理中。']),
  aWait('教材の処理を進める','boss:CH5-B4:receive'),aTap('今回の受取履歴を開く',['今回の到着：49 USDC。']),
  aFocus('履歴の受取額を照合する欄を押す','received'),aInput('到着した49を入力して照合','received',49),
  aCheck('送信元950・到着49・コスト1・ETH0.0009を確認')
 ],'crypto_basics',3,{scenarioId:'boss-ch5-transfer'}),
 task('CH5-B5','明日使う資金の行き先を考える',['この課題の条件：明日使う予定があり、値下がりも望まない資金。本人の本番の投資先を指定する質問ではありません。'],[
  aTap('運用方法の比較カードを開く',['現物の値下がり、HLPの損益と4日ロック、ステーキングの価格変動と待機、先物の値動きと清算を比較。']),
  aSelect('今回は運用を見送るを選ぶ','route','journey',routeChoices.map(o=>[o.label,o.value])),
  aCheck('値下がりを望まず明日使う、という条件に合う理由を確認',['今回は運用しないことも、条件を見た判断です。'])
 ],'crypto_basics',4)
];

const bossAmounts={spot:105,hlp:100,stake:80,perp:50,journey:100};
const bossPreparation = {
 spot:[aTap('ボス用の現物保有1 HYPEを開く',['教材価格105・手数料0。他残高0。']),aTap('保有明細から売るを押す'),aFocus('売却数量の欄を押す','sellQuantity'),aInput('数量1を入力する','sellQuantity',1),aTap('売却代金105の確認画面を開く'),aConfirm('1 HYPEの売却を確定','boss:CH6-B1:spot:sell')],
 hlp:[aTap('ボス用のHLP保有を開く',['預入100・評価100・他残高0。ロックの残りはゲーム内2日。']),aTap('出金可能日時を開く'),aWait('残りのゲーム内2日を進める','boss:CH6-B1:hlp:wait'),aTap('引き出すを押す'),aSelect('評価額100の全額を選ぶ','withdrawQuantity','all',[['全額100','all'],['半分50','half']]),aTap('引出し確認画面を開く'),aConfirm('HLP100の引出しを確定','boss:CH6-B1:hlp:withdraw')],
 stake:[aTap('ボス用の委任中1 HYPEを開く',['委任から1日が過ぎ、委任ロックは終了した専用例。他残高0。売却教材価格80。']),aTap('委任を解除を押す'),aSelect('全数量1 HYPEを選ぶ','undelegateQuantity',1,[['全数量1 HYPE',1],['0.5 HYPE',0.5]]),aConfirm('委任解除を確定','boss:CH6-B1:stake:undelegate'),aTap('ステーキング残高1 HYPEを開く'),aTap('現物残高へ移すを押す'),aConfirm('現物への出金を確定','boss:CH6-B1:stake:request'),aWait('ゲーム内の待機7日を進める','boss:CH6-B1:stake:wait'),aTap('現物に届いた1 HYPEを開く'),aTap('価格80・数量1の売却確認を開く'),aConfirm('売却80を確定','boss:CH6-B1:stake:sell')],
 perp:[aTap('ボス用の分離証拠金の建玉を開く',['証拠金50 / 1倍 / 数量0.5 / 開始100 / 判定用価格100 / 手数料0 / 他残高0。']),aTap('決済を押す'),aSelect('全数量0.5を選ぶ','closeQuantity',0.5,[['全数量0.5',0.5],['数量0.25',0.25]]),aTap('損益0・返却50の確認画面を開く'),aConfirm('建玉の全決済を確定','boss:CH6-B1:perp:close')],
 journey:[aTap('ボス用の未運用100を開く',['保有・委任・建玉・ロックはすべて0。未運用の100だけが使えます。']),aCheck('運用していないので解除操作は不要と確認')]
};
function routeTasks(routeId) {
 const amount=bossAmounts[routeId], receipt=amount-1, domain='crypto_exit';
 return [
  task('CH6-B1','選んだ道の出口を整える',[`選択経路：${routeId}。このボスだけの独立した練習資金を使います。主ラボの資金は動かしません。`],bossPreparation[routeId],domain,0,{scenarioId:`boss-ch6-${routeId}`,routeId}),
  task('CH6-B2','出金できる額を残高画面で照合する',[`準備後の使える額は${amount} Mock USDC。解除前の拘束額を重ねて数えません。`],[
   aTap('ボス用の利用可能残高を開く'),aFocus('使える額を照合する欄を押す','available'),aInput(`画面の利用可能${amount}を入力して照合`,'available',amount),aCheck('保有・拘束が0であることを確認')
  ],domain,1,{scenarioId:`boss-ch6-${routeId}`,routeId}),
  task('CH6-B3','受取カードと出金フォームを合わせる',['受取カード：USDC / Arbitrum / DEMO-RETURN-B。表示しただけでは出金されません。'],[
   aTap('ボス用の出金フォームを開く'),aFocus('資産欄を押す','asset'),aSelect('USDCを選ぶ','asset','USDC',assetChoices),
   aFocus('ネットワーク欄を押す','network'),aSelect('Arbitrumを選ぶ','network','Arbitrum',networkChoices),
   aFocus('宛先欄を押す','address'),aSelect('DEMO-RETURN-Bを選ぶ','address','DEMO-RETURN-B',[['DEMO-RETURN-A','DEMO-RETURN-A'],['DEMO-RETURN-B','DEMO-RETURN-B']]),aCheck('資産・道・宛先を3つとも照合')
  ],domain,2,{scenarioId:`boss-ch6-${routeId}`,routeId}),
  task('CH6-B4','全額と教材費の内訳を確認して確定する',[`申請${amount} − 教材費1 = 受取予定${receipt}。追加で費用1を二重に払いません。`],[
   aFocus('数量欄を押す','quantity'),aSelect('使える額の全額を選ぶ','quantity','all',[[`全額${amount}`,'all'],['一部だけ','partial']]),
   aTap('出金の確認画面を開く',[`申請額${amount} / 教材費1 / 受取予定${receipt}。`]),aFocus('受取予定額の照合欄を押す','expected'),aInput(`内訳の受取予定${receipt}を入力して照合`,'expected',receipt),
   aConfirm('確認した全額の出金を確定','boss:CH6-B4:withdraw')
  ],domain,3,{scenarioId:`boss-ch6-${routeId}`,routeId}),
  task('CH6-B5','今回の受取明細を開いて到着を照合する',[`受取予定${receipt}と実際の到着を比べます。出金の履歴だけでは修了しません。`],[
   aTap('処理中の出金履歴を開く'),aWait('ボス用の教材処理を完了まで進める','boss:CH6-B5:receive'),aTap('今回の受取通知を開く'),
   aTap('ボス用の受取ウォレットを開く'),aTap('今回の受取明細を開く',[`DEMO-RETURN-B / USDC / Arbitrum / 今回の到着${receipt}。`]),
   aFocus('実際の受取額を照合する欄を押す','received'),aInput(`明細の受取${receipt}を入力して照合`,'received',receipt),aCheck('予定額と今回の到着が一致すると確認')
  ],domain,4,{scenarioId:`boss-ch6-${routeId}`,routeId})
 ];
}
export const bosses = [
 {chapterId:'CH-5',name:'鍵守りの石像',hp:100,tasks:ch5Tasks,prerequisites:['CR-01','CR-02','CR-03','CR-04'],dialogue:'秘密を渡さず、送り先と到着を確かめよ。'},
 {chapterId:'CH-6',name:'流動の古龍',hp:100,tasks:routeTasks('journey'),routeTasks:Object.fromEntries(Object.keys(bossAmounts).map(route=>[route,routeTasks(route)])),prerequisites:['HY-EXIT'],dialogue:'どの道を選んでも、帰りの明細をたしかめる者に冠を授けよう。'}
];

function review(id,title,initialSnapshot,tasks) {
 return {id,variantId:id,title,scenarioId:id,description:'条件が違う確認課題です。主シナリオの残高、受注時刻、基本XPは変えません。',
  initialSnapshot:{...initialSnapshot,eventLog:[]},tasks};
}
const reviewTask=(id,title,details,actions,domain,objectiveIndex)=>task(id,title,details,actions,domain,objectiveIndex);
const reviewVariants = {
 'CR-01':review('review-asset-map','二つの場所にある資産',{wallet:500,core:200},[
  reviewTask('RV-CR01-1','ウォレットとサービス内を区別する',['ウォレット500 / HyperCore内200を同時に表示した別画面。'],[
   aTap('サービス内の残高画面を開く'),aSelect('HyperCore内の200を選ぶ','location',200,[['ウォレット500',500],['HyperCore内200',200]]),aCheck('資産を操作する道具と、サービス内の残高を区別')
  ],'crypto_basics',0)
 ]),
 'CR-02':review('review-wallet','名前が違う偽案内',{connected:true,sent:false},[
  reviewTask('RV-CR02-1','偽案内から安全な画面へ戻る',['差出人：青空ヘルプ係（架空）。要求：「復元情報を送って」。'],[
   aTap('差出人と要求の中身を開く'),aTap('本文の外の案内を閉じる'),aTap('ゲーム内ヘルプに戻る'),aCheck('接続済み・送信は未実行を確認')
  ],'crypto_basics',1)
 ]),
 'CR-03':review('review-network','別の宛先へ50を送る',{wallet:1000,eth:0.001,core:0,pending:0,fee:0},[
  reviewTask('RV-CR03-1','新しい受取カードに合わせる',['USDC / Arbitrum / DEMO-VAULT-C。誤りは今回の受取条件との不一致です。'],[
   aFocus('資産欄を押す','asset'),aSelect('USDCを選ぶ','asset','USDC',assetChoices),aFocus('ネットワーク欄を押す','network'),aSelect('Arbitrumを選ぶ','network','Arbitrum',networkChoices),
   aFocus('宛先欄を押す','address'),aSelect('DEMO-VAULT-Cを選ぶ','address','DEMO-VAULT-C',[['DEMO-VAULT-A','DEMO-VAULT-A'],['DEMO-VAULT-C','DEMO-VAULT-C']]),aCheck('3つの一致を確認')
  ],'crypto_basics',2),
  reviewTask('RV-CR03-2','費用と到着49を照合する',['別snapshotのwallet1000・ETH0.001。送信50、教材コスト1、ガス0.0001 ETH。'],[
   aFocus('数量欄を押す','quantity'),aInput('50を入力','quantity',50),aTap('送信50・教材コスト1・到着49の確認画面を開く'),aConfirm('この確認課題の送信を確定','review:network:send'),
   aWait('この確認課題の処理を進める','review:network:receive'),aTap('今回の到着明細を開く'),aFocus('到着数量の照合欄を押す','received'),aInput('49を入力して照合','received',49),aCheck('wallet950・ETH0.0009・受取49を確認')
  ],'crypto_basics',3)
 ]),
 'CR-04':review('review-comparison','近いうちに必要な資金',{route:null},[
  reviewTask('RV-CR04-1','希望と拘束の条件を比較する',['近いうちに必要な資金という教材条件です。固定の人気順や期待利益で選びません。'],[
   aTap('四つの方法と運用見送りを比較する'),
   {label:'条件に合う方法と理由を選ぶ',...choose('reasonedChoice',undefined,[['運用を見送り、使える状態を保つ','skip'],['値下がりを受け入れられる別資金として現物を検討する','separate-spot'],['必要時期をゲーム内の4日後以降に変えてHLPを検討する','change-horizon']],{acceptAnyChoice:true})},
   aCheck('必要時期と、選んだ理由を確認',['希望か方法を見直せます。本人の資金の投資先を指定する課題ではありません。'])
  ],'crypto_basics',4)
 ]),
 'HY-SPOT':review('review-spot','数量1・上昇と注文取消',{available:1000,hype:0,price:100,cost:0,unrealized:0,realized:0,limitAvailable:1000,reserved:0},[
  reviewTask('RV-SPOT-1','銘柄と方向を設定する',['元手1000、教材HYPE価格100。主ラボとは別の状態です。'],[
   aTap('現物の注文画面を開く'),aSelect('教材HYPEを選ぶ','symbol','HYPE',[['教材HYPE','HYPE'],['別銘柄','OTHER']]),aSelect('買いを選ぶ','side','buy',[['買い','buy'],['売り','sell']])
  ],'spot',0),
  reviewTask('RV-SPOT-2','数量1の支払を確かめて購入',['価格100 × 数量1 = 支払100。手数料0。'],[
   aFocus('数量欄を押す','quantity'),aInput('数量1を入力','quantity',1),aTap('支払100・残高900の内訳を開く'),aConfirm('この確認課題の購入を確定','review:spot:buy')
  ],'spot',1),
  reviewTask('RV-SPOT-3','評価益と確定益を分ける',['価格105では保有評価105、評価益5。売る前と売った後を比べます。'],[
   aWait('教材価格を105へ進める','review:spot:tick'),aTap('保有評価105・評価益5を開く'),aTap('保有から売るを押す'),aSelect('全数量1を選ぶ','sellQuantity',1,[['全数量1',1],['0.5',0.5]]),aTap('売却105の確認画面を開く'),aConfirm('売却を確定','review:spot:sell'),aFocus('確定益の照合欄を押す','profit'),aInput('確定益5を入力して照合','profit',5),aCheck('利用可能1005を確認')
  ],'spot',2),
  reviewTask('RV-SPOT-4','指値95が保留になることを確かめる',['指値はさらに独立した元手1000・教材価格100の状態です。主の1005へ合算しません。'],[
   aTap('買い指値の小練習を開く'),aFocus('指値価格欄を押す','limitPrice'),aInput('95を入力','limitPrice',95),aFocus('注文数量欄を押す','limitQuantity'),aInput('1を入力','limitQuantity',1),aTap('価格100では保留となる確認画面を開く'),aConfirm('買い指値を確定','review:spot:limit'),aTap('保留の未約定注文を開く')
  ],'spot',3),
  reviewTask('RV-SPOT-5','取消で拘束95を解放する',['注文だけではHYPEを買えたことになりません。'],[
   aTap('保留注文の取り消すを押す'),aConfirm('指値の取消を確定','review:spot:cancel'),aTap('拘束0・利用可能1000を開く'),aCheck('別の主確認課題の確定益5と合算していないことを確認')
  ],'spot',4)
 ]),
 'HY-HLP':review('review-hlp','追加入金で出金日が延びる',{available:1000,units:0,price:100,simulationDay:0,unlockDay:0},[
  reviewTask('RV-HLP-1','HLPの損益の仕組みを見る',['この別状態は評価単価100に固定。基本の300→291の状態とは混ぜません。'],[aTap('HLPの戦略の説明を開く'),aCheck('利益も損失も共有し、固定利息ではないと確認')],'hlp',0),
  reviewTask('RV-HLP-2','300を預けて手元を確かめる',['元手1000 / 預入300 / 手元700 / 評価単価100。'],[
   aFocus('預入数量欄を押す','quantity'),aInput('300を入力','quantity',300),aTap('確認画面を開く'),aConfirm('300の預入を確定','review:hlp:deposit'),aTap('預入300と手元700を開く')
  ],'hlp',1),
  reviewTask('RV-HLP-3','評価額と合計を照合する',['評価単価が同じなら、模擬口数3×100=300。手元700と合計1000。架空の上昇例103なら評価309、下落例97なら291です。'],[
   aTap('価格100に固定した今回の保有明細を開く'),aFocus('預入分の評価額欄を押す','valuation'),aInput('300を入力して照合','valuation',300),aCheck('価格が動く例も、利息ではなく戦略の評価変化と確認')
  ],'hlp',2),
  reviewTask('RV-HLP-4','2日後に50を追加して待つ期限を更新する',['最初の預入から2日進み、その日に50を追加します。新しい出金可能日はゲーム内6日目。'],[
   aWait('ゲーム内2日進める','review:hlp:two-days'),aFocus('追加入金欄を押す','extraQuantity'),aInput('50を入力','extraQuantity',50),aTap('追加後の預入350・手元650の確認画面を開く'),aConfirm('50の追加入金を確定','review:hlp:add'),aTap('直近預入2日目+4日=6日目の明細を開く'),aWait('直近の預入から4日進める','review:hlp:unlock')
  ],'hlp',3),
  reviewTask('RV-HLP-5','引出し後の合計1000を照合する',['価格100に固定。預入350を引き出して、手元650と合わせます。'],[
   aTap('引き出すを押す'),aSelect('全額350を選ぶ','withdrawQuantity','all',[['全額350','all'],['初回分300のみ','initial-only']]),aTap('受取350の確認画面を開く'),aConfirm('引出しを確定','review:hlp:withdraw'),aFocus('引出し後の残高を照合する欄を押す','available'),aInput('合計1000を入力して照合','available',1000),aCheck('模擬口数と手元を二重に数えていないと確認')
  ],'hlp',4)
 ]),
 'HY-STAKE':review('review-stake','10のうち5だけを委任する',{spot:10,staking:0,delegated:0,waiting:0,simulationDay:0,unlockDay:0,arrivalDay:0,price:100},[
  reviewTask('RV-STAKE-1','現物の半分だけを移す',['報酬を追加しない別状態。HYPEの合計10はずっと保ちます。'],[
   aTap('現物HYPE10を開く'),aTap('ステーキングへ移すを押す'),aFocus('数量欄を押す','quantity'),aInput('5を入力','quantity',5),aTap('現物5・ステーキング5の確認画面を開く'),aConfirm('5 HYPEの移動を確定','review:stake:move')
  ],'staking',0),
  reviewTask('RV-STAKE-2','預け先の条件を見て5を委任する',['灯台ノード：稼働中・教材5% / 森の歯車：稼働中・教材8% / 星波ノード：点検表示・教材3%。すべて架空。'],[
   aTap('預け先一覧を開く'),{label:'条件を読んで候補を選ぶ',...choose('validator',undefined,[['灯台ノード','lighthouse'],['森の歯車','forest'],['星波ノード','starwave']],{acceptAnyChoice:true})},aSelect('全数量5を選ぶ','delegateQuantity',5,[['5 HYPE',5],['10 HYPE',10]]),aTap('委任の確認画面を開く'),aConfirm('5 HYPEの委任を確定','review:stake:delegate')
  ],'staking',1),
  reviewTask('RV-STAKE-3','委任の1日と出金の7日を分ける',['現物5+委任5 → 解除後の現物5+ステーキング5 → 現物5+待機5。'],[
   aWait('委任から1日進める','review:stake:one-day'),aTap('委任解除を押す'),aSelect('5を解除する','undelegateQuantity',5,[['5 HYPE',5],['10 HYPE',10]]),aConfirm('委任解除を確定','review:stake:undelegate'),aTap('ステーキング5を開く'),aTap('現物へ移すを押す'),aConfirm('7日待機する出金を確定','review:stake:request'),aTap('現物5・待機5の内訳を開く')
  ],'staking',2),
  reviewTask('RV-STAKE-4','場所が違っても数量合計を保つ',['この確認課題には報酬を付けません。現物5+待機5=合計10。価格80なら評価800。'],[
   aTap('HYPEの現在地を開く'),aFocus('合計数量の欄を押す','totalHype'),aInput('合計10を入力して照合','totalHype',10),aFocus('価格80の評価額欄を押す','valuation'),aInput('評価800を入力して照合','valuation',800),aCheck('数量と価格と評価額を分けて確認')
  ],'staking',3),
  reviewTask('RV-STAKE-5','待機後に現物10を照合する',['残った現物5も合算して、到着後の現物は10。未配布のUSDCは足しません。'],[
   aWait('出金待機の7日を進める','review:stake:seven-days'),aTap('現物の今回の到着明細を開く'),aFocus('現物数量の照合欄を押す','receivedSpot'),aInput('現物10を入力して照合','receivedSpot',10),aCheck('現物10・ステーキング0・委任0・待機0を確認')
  ],'staking',4)
 ]),
 'HY-PERP':review('review-perp','倍率・売り・SL・資金調達料を変える',{available:1000,collateral:0,quantity:0,price:100,side:1,realized:0,equity:0,maintenance:0,paid:0,received:0},[
  reviewTask('RV-PERP-1','1倍なら数量がどう変わるか入力する',['独立状態：証拠金100、1倍、価格100。'],[
   aSelect('新規注文前に1倍を選ぶ','leverage',1,[['1倍',1],['2倍',2],['5倍',5]]),aFocus('建玉金額の欄を押す','notional'),aInput('建玉100を入力','notional',100),aFocus('数量欄を押す','quantity'),aInput('数量1を入力','quantity',1),aCheck('証拠金100・倍率1・建玉100・数量1を照合')
  ],'perps',0),
  reviewTask('RV-PERP-2','売りの建玉で価格が上がる場面',['ここはさらに別の状態：証拠金100、2倍、ショート数量2、開始100。価格105では評価損10。'],[
   aSelect('売り・ショートを選ぶ','side','short',[['買い・ロング','long'],['売り・ショート','short']]),aConfirm('別状態のショートを開く','review:perp:short-open'),aWait('教材価格を105へ進める','review:perp:short-tick'),aFocus('損失額の照合欄を押す','loss'),aInput('評価損10を入力して照合','loss',10)
  ],'perps',1),
  reviewTask('RV-PERP-3','売り建玉の決済後残高を照合する',['費用0。未配分900 + 証拠金から戻る90 = 990。'],[
   aTap('このショートの決済を押す'),aSelect('全数量2を選ぶ','closeQuantity',2,[['数量2',2],['数量1',1]]),aTap('返却90の確認画面を開く'),aConfirm('決済を確定','review:perp:short-close'),aFocus('利用可能残高の照合欄を押す','available'),aInput('990を入力して照合','available',990)
  ],'perps',2),
  reviewTask('RV-PERP-4','SLの発動価格と約定価格を分ける',['別状態：ロング数量2、開始100。SL発動97、売却96.5。'],[
   aFocus('SL発動価格欄を押す','stopPrice'),aInput('97を入力','stopPrice',97),aConfirm('別状態にSLを設定','review:perp:sl-set'),aWait('発動97・約定96.5へ進める','review:perp:sl-fill'),aTap('約定明細を開く'),aFocus('確定損失の欄を押す','loss'),aInput('損失7を入力して照合','loss',7)
  ],'perps',3),
  reviewTask('RV-PERP-5','資金調達の向きと清算の条件を確認する',['以下はそれぞれ独立した見学状態。主ラボや直前の損益とは合算しません。'],[
   aTap('数量2・基準価格100・1時間率+0.01%の明細を開く'),aSelect('正の率のロングの向きを選ぶ','positiveLong','pay',[['0.02を支払う','pay'],['0.02を受け取る','receive']]),
   aSelect('正の率のショートの向きを選ぶ','positiveShort','receive',[['0.02を支払う','pay'],['0.02を受け取る','receive']]),aSelect('負の率のショートの向きを選ぶ','negativeShort','pay',[['0.02を支払う','pay'],['0.02を受け取る','receive']]),
   aFocus('1時間の資金調達額の欄を押す','funding'),aInput('0.02を入力して照合','funding',0.02),
   aTap('自己資本4・維持証拠金5.2の別判定を開く'),aSelect('自己資本が維持証拠金以下と照合','liquidation','at-or-below',[['4は5.2以下','at-or-below'],['4は5.2より大きい','above']]),aCheck('教材の簡略清算判定であり、実市場の清算予測ではないと確認')
  ],'perps',4)
 ]),
 'HY-EXIT':review('review-exit','200の出金と199の受取',{available:200,pending:0,wallet:0,fee:0,held:0},[
  reviewTask('RV-EXIT-1','別状態の拘束を確かめる',['未運用200・拘束0の独立した確認課題。選んでいない運用の売却は要求しません。'],[aTap('資産の現在地を開く'),aCheck('未運用なので解除は不要と確認')],'crypto_exit',0),
  reviewTask('RV-EXIT-2','使える額200を照合する',[],[aTap('利用可能残高を開く'),aFocus('出金できる額の欄を押す','available'),aInput('200を入力して照合','available',200)],'crypto_exit',1),
  reviewTask('RV-EXIT-3','受取カードに一致させる',['USDC / Arbitrum / DEMO-REVIEW-A。'],[
   aSelect('USDCを選ぶ','asset','USDC',assetChoices),aSelect('Arbitrumを選ぶ','network','Arbitrum',networkChoices),aSelect('DEMO-REVIEW-Aを選ぶ','address','DEMO-REVIEW-A',[['DEMO-REVIEW-A','DEMO-REVIEW-A'],['DEMO-REVIEW-B','DEMO-REVIEW-B']]),aCheck('資産・道・宛先を照合')
  ],'crypto_exit',2),
  reviewTask('RV-EXIT-4','費用1を引いて199になると確認して申請',['教材費は申請額から控除します。'],[
   aSelect('全額200を選ぶ','quantity','all',[['全額200','all'],['100だけ','partial']]),aTap('申請200・教材費1の内訳を開く'),aFocus('受取予定額の欄を押す','expected'),aInput('199を入力して照合','expected',199),aConfirm('この確認課題の出金を確定','review:exit:withdraw')
  ],'crypto_exit',3),
  reviewTask('RV-EXIT-5','受取の明細を照合する',[],[
   aWait('教材の処理を完了へ進める','review:exit:receive'),aTap('今回の受取通知を開く'),aTap('今回のウォレット明細を開く'),aFocus('受取額の照合欄を押す','received'),aInput('199を入力して照合','received',199),aCheck('申請200−費用1=受取199と照合')
  ],'crypto_exit',4)
 ])
};
for (const quest of quests) quest.reviewVariant=reviewVariants[quest.id];

/** Mutates only the caller-owned independent review snapshot. Replays are no-ops. */
export function applyReviewEffect(snapshot, actionOrEffect) {
 const effect=typeof actionOrEffect==='string'?actionOrEffect:actionOrEffect?.effect;
 if (!effect?.startsWith('review:')) return false;
 if (!snapshot || typeof snapshot!=='object' || Array.isArray(snapshot)) throw new Error('確認課題の練習状態が見つかりません。');
 snapshot.eventLog ||= [];
 if (snapshot.eventLog.includes(effect)) return false;
 const need=(condition,message)=>{if(!condition)throw new Error(message);};
 const prior=(id)=>need(snapshot.eventLog.includes(id),'先に、この確認課題の前の操作を確かめよう。');
 switch(effect) {
  case 'review:network:send':need(snapshot.wallet>=50&&snapshot.eth>=0.0001,'練習の残高かガスが足りません。');snapshot.wallet-=50;snapshot.eth=0.0009;snapshot.pending=49;snapshot.fee=1;break;
  case 'review:network:receive':prior('review:network:send');snapshot.core+=snapshot.pending;snapshot.pending=0;break;
  case 'review:spot:buy':need(snapshot.available>=100,'練習残高を確かめよう。');snapshot.available-=100;snapshot.hype=1;snapshot.cost=100;break;
  case 'review:spot:tick':prior('review:spot:buy');snapshot.price=105;snapshot.unrealized=snapshot.hype*snapshot.price-snapshot.cost;break;
  case 'review:spot:sell':prior('review:spot:tick');snapshot.available+=snapshot.hype*snapshot.price;snapshot.realized=snapshot.unrealized;snapshot.unrealized=0;snapshot.hype=0;snapshot.cost=0;break;
  case 'review:spot:limit':need(snapshot.limitAvailable>=95,'指値の小練習の残高を確かめよう。');snapshot.limitAvailable-=95;snapshot.reserved=95;snapshot.orderStatus='pending';break;
  case 'review:spot:cancel':prior('review:spot:limit');snapshot.limitAvailable+=snapshot.reserved;snapshot.reserved=0;snapshot.orderStatus='cancelled';break;
  case 'review:hlp:deposit':snapshot.available-=300;snapshot.units=3;snapshot.unlockDay=snapshot.simulationDay+4;break;
  case 'review:hlp:two-days':prior('review:hlp:deposit');snapshot.simulationDay+=2;break;
  case 'review:hlp:add':prior('review:hlp:two-days');snapshot.available-=50;snapshot.units+=0.5;snapshot.unlockDay=snapshot.simulationDay+4;break;
  case 'review:hlp:unlock':prior('review:hlp:add');snapshot.simulationDay+=4;break;
  case 'review:hlp:withdraw':prior('review:hlp:unlock');need(snapshot.simulationDay>=snapshot.unlockDay,'最後の預入から4日を数えよう。');snapshot.available+=snapshot.units*snapshot.price;snapshot.units=0;break;
  case 'review:stake:move':snapshot.spot-=5;snapshot.staking+=5;break;
  case 'review:stake:delegate':prior('review:stake:move');snapshot.staking-=5;snapshot.delegated+=5;snapshot.unlockDay=snapshot.simulationDay+1;break;
  case 'review:stake:one-day':prior('review:stake:delegate');snapshot.simulationDay+=1;break;
  case 'review:stake:undelegate':prior('review:stake:one-day');need(snapshot.simulationDay>=snapshot.unlockDay,'委任から1日待つ場面を進めよう。');snapshot.delegated-=5;snapshot.staking+=5;break;
  case 'review:stake:request':prior('review:stake:undelegate');snapshot.staking-=5;snapshot.waiting+=5;snapshot.arrivalDay=snapshot.simulationDay+7;break;
  case 'review:stake:seven-days':prior('review:stake:request');snapshot.simulationDay+=7;need(snapshot.simulationDay>=snapshot.arrivalDay,'現物への7日待機を確認しよう。');snapshot.spot+=snapshot.waiting;snapshot.waiting=0;break;
  case 'review:perp:short-open':snapshot.available=900;snapshot.collateral=100;snapshot.quantity=2;snapshot.price=100;snapshot.side=-1;break;
  case 'review:perp:short-tick':prior('review:perp:short-open');snapshot.price=105;snapshot.equity=snapshot.collateral+snapshot.side*snapshot.quantity*(snapshot.price-100);break;
  case 'review:perp:short-close':prior('review:perp:short-tick');snapshot.available+=snapshot.equity;snapshot.realized=-10;snapshot.collateral=0;snapshot.quantity=0;snapshot.equity=0;break;
  case 'review:perp:sl-set':snapshot.available=900;snapshot.collateral=100;snapshot.quantity=2;snapshot.price=100;snapshot.side=1;snapshot.stop=97;break;
  case 'review:perp:sl-fill':prior('review:perp:sl-set');snapshot.price=96.5;snapshot.realized=snapshot.quantity*(snapshot.price-100);snapshot.available+=snapshot.collateral+snapshot.realized;snapshot.quantity=0;snapshot.collateral=0;snapshot.stop=null;break;
  case 'review:exit:withdraw':need(snapshot.available===200&&!snapshot.held,'利用可能額と拘束を確かめよう。');snapshot.available=0;snapshot.pending=199;snapshot.fee=1;break;
  case 'review:exit:receive':prior('review:exit:withdraw');snapshot.wallet+=snapshot.pending;snapshot.pending=0;break;
  default:throw new Error('この確認課題の操作が見つかりません。');
 }
 snapshot.eventLog.push(effect);
 return true;
}

export const simulationConfig = Object.freeze({
  disclaimer:'非公式の学習用シミュレーション。表示資金はすべて架空。',
  depositMinimum:10,depositCost:1,gasETH:0.0001,withdrawalCost:1,
  mainFeeRate:0,mainFundingRate:0,hlpLockDays:4,delegationLockDays:1,stakingReturnDays:7,
  spotPrices:[100,90],hlpPrices:{down:[100,97],up:[100,103]},stakingPrices:[100,80],
  oneTimeStakingReward:0.1,fundingHourlyRate:0.0001,maintenanceRate:0.05,
  rounding:'小数6桁。表示の丸め値から帳簿を再計算しません。',
  omissions:['部分約定と複数注文板','クロス証拠金の計算','実際の部分清算・バックストップ・銘柄別証拠金階層','HyperEVMの実操作']
});
const sourceBase='https://hyperliquid.gitbook.io/hyperliquid-docs/';
export const factCatalog = [
 ['S1','入口と接続・有効化・入出金の区別','onboarding/how-to-start-trading',['CR-02','CR-03','HY-PERP','HY-EXIT']],
 ['S2','HLPの戦略損益と直近預入から4日のロック','hypercore/vaults/protocol-vaults',['HY-HLP']],
 ['S3','委任の1日と、ステーキングから現物への7日','onboarding/how-to-stake-hype',['HY-STAKE']],
 ['S4','毎時の資金調達、正負の向き、数量と基準価格','trading/funding',['HY-PERP']],
 ['S5','自己資本と維持証拠金による清算','trading/liquidations',['HY-PERP']],
 ['S6','HyperCoreとHyperEVMは異なる資産の場所','onboarding/how-to-use-the-hyperevm',['CR-01','CR-03']],
 ['S7','SL・TPの発動と約定の違い','trading/take-profit-and-stop-loss-orders-tp-sl',['HY-PERP']],
 ['S8','公式testnet faucetにはmainnet入金歴等の条件がある','onboarding/testnet-faucet',['CR-01']],
 ['S9','委任解除後はステーキング残高へ戻る','hypercore/staking',['HY-STAKE']],
 ['S10','入金経路は入口と方式で異なる','support/faq/deposit-or-transfer-issues-missing-lost/deposited-usdc',['CR-03']]
].map(([id,description,path,scenarioUses])=>({id,description,sourceUrl:sourceBase+path,verifiedAt:'2026-10-22',recheckStatus:'verified',scenarioUses}));

export const glossary = [
 ['ウォレット','資産を操作するための道具。銀行口座そのものと同じ仕組みではありません。'],
 ['ネットワーク','資産を送る道。受取条件と同じ道を選びます。'],
 ['評価額','いまの教材価格で計算した金額。'],['評価損益','持っている資産の値段が変わった分。まだ売っていない場面で使います。'],
 ['確定損益','売却や決済で、値動きの結果が確定した分。'],['約定','注文の売り買いが成立すること。注文を出しただけとは違います。'],
 ['指値','買いたい・売りたい価格を指定する注文。条件に届くまで保留になることがあります。'],
 ['委任','運営を支える相手を選び、HYPEを委ねること。'],['バリデータ','運営を支える預け先の候補。教材ではすべて架空です。'],
 ['証拠金','値動きの取引のために割り当てるお金。'],['建玉','決済前に持っている値動きへの取引。'],
 ['倍率','証拠金に対して、どれだけの金額の値動きを持つか。'],['資金調達料','保有中に、取引の反対側へ払ったり受け取ったりするお金。'],
 ['判定用の価格','教材内で清算やSLの発動を判断する価格。mark priceの役割を簡略化しています。'],
 ['計算基準価格','資金調達料を計算するoracle priceの教材上の役割。判定用の価格とは分けます。'],
 ['SL','損失を抑えるための注文。発動した価格と売買が成立する価格が同じになる保証はありません。']
].map(([term,description])=>({term,description}));
