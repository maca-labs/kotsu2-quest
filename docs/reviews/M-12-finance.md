# M-12 — FI確認票・DX本人確認三点の独立金融レビュー

**判定: 対象の金融表示モデルは合格。重大な不整合は発見しなかった。** M-01-L2の実入力・予定・処理済みの混同、M-01-L3の三点照合欠落は、今回の表示差分で解消する条件を満たす。実ブラウザーや公開反映の確認とは別の判定。

担当: /root/finance_reviewer、2026-10-23 JST。今回の対象コード・テストの著者ではない独立レビュー。製品コード・製品テストは編集していない。編集したのは本報告のみ。子孫エージェント、ブラウザー操作なし。

## 対象と根拠

AGENTS.md、docs/CONTRACTS.md、agents/finance_reviewer.md、docs/reviews/M-01-learning.md、js/finance-funding.jsを読了。既読のpointquestの実入力/確認/確定/到着・共通保存と金融台帳の条件、hyperliquid §7/14〜17の資産/道/数量/費用/現在地・独立snapshot・再受取防止を根拠にした。対象は新js/phone-funding.js、js/phone-extension.jsのDX-02三点、関連テスト・content。親が変更中のapp/stylesはこの判定に含めない。

開始・終了で以下5ファイルのSHA-256が一致。

|ファイル|SHA-256|
|---|---|
|js/phone-funding.js|52e5da1131ea7ec8caafca321eb642bebf7a9a8db8bc93a5f94615a223113ee1|
|js/phone-extension.js|bc22009e2d85930a277ccaa9c657212373733e9ecda7f3d16d87b6bc181335c6|
|js/finance-funding.js|06cb7cd55b95100563d3647f4858b9ca495999a5d525b2836a4cfc4c9f6408bc|
|js/content-funding.js|01159544869166ac78e59faebb5544657a68238fadd5b1c3cb34b1371b3cc23e|
|tests/phone-funding.test.mjs|257309c9f185a8200e464f79e76fb7ad9ce04b558f7eb03570ecde07237f041f|

## 実行した確認

1. node --test tests/phone-funding.test.mjs tests/funding.test.mjs を実行。Node v24.14.1 / Windows cmd、13件（新表示6＋既存資金準備7）、pass13 / fail0 / skipped0、401.3703ms。
2. 製品外Tempの別スクリプトを新しいNodeプロセスで実行。FI-01〜03の既存70工程をengine STEPから進め、各工程でgetFundingView/renderFundingPanelの純粋性とgeneric操作を置換しないことを確認。全70工程後にparseSaveし、途中復帰を70回検証。12金融状態遷移を、下記の独立期待値と一致させた。exit0、1.3232452秒。スクリプトは報告後に削除。
3. 元のCR-01〜03を金融moduleの正規イベントで進め、wallet900 / HyperCore99の既存journey台帳を作ってからFI70工程を適用。FIのhandoff前後でjourneyの全金融状態が完全一致。handoff表示は準備台帳の移管記録1000で、既存journeyへ1000を加算しない。全金融台帳のvalidateFinancialStateも合格。

表示fixtureのDOM検証は実際のrender関数を使うが、スクリーンショットや実画面の見やすさの検証ではない。

## FI表示と独立検算

期待値は既存仕様の固定定数を整数の加減乗で先に算出し、UI関数から期待金額を生成していない。資産・道・単位は分けた。

|区間|独立計算・期待状態|実際の表示モデル/台帳|
|---|---|---|
|振込の確認前|銀行200000、途中0、国内交換所0。送る予定120000/費用0|『今回、入力した内容』のDEMO-JPY-GATE/120000と、受取条件/予定と、現在銀行200000を別表示。名義は既存の架空成人 朝日ミナト。確定前を受取済みにしない|
|申請→到着|200000−120000=銀行80000、途中120000、交換所0。その後途中0/交換所120000|processing表示は『まだ受取先では使えません』、receivedは『台帳の受取先に記録』。両状態と金額が一致|
|購入|104×1000=104000円、120000−104000=16000円、取得104MCHI|実入力MCHI/104、教材見積の単価1000/合計104000を分ける。確定後国内円16000/MCHI104、walletには足さない|
|出庫|104MCHI−費用1=103MCHI。送信直後は交換所0/途中103/wallet0、到着後wallet103|実際の資産/道/宛先/枚数がMCHI/みち道/DEMO-WALLET-A/104と表示され、受取カード・教材費1・到着予定103は別欄。途中と受取を区別し、費用を重ねて引かない|
|種類を替える|103MCHI×10=1030Mock USDC、費用0、同じみち道|入力swapPair/swapQuantityと教材見積を分け、処理中USDC1030/利用可能0→みち道1030。資産の種類を替えても道を替えた扱いにしない|
|道替え|1030−20=1010Mock USDC|入力Arbitrumと、見積の出発道/到着道/資産/DEMO宛先/費用20/到着予定1010を分ける。申請中みち道0/途中1010/Arbitrum0→到着Arbitrum1010|
|ガス準備|1010USDC−10USDC=1000USDC。別単位のETH0.001を受取|支払実入力10、教材見積ETH0.001、USDC支払済み10、準備中ETH0.001→walletETH0.001を区別。USDCとETHを足さない|
|CRへの引継ぎ|USDC1000/ETH0.001は同じ資金の参照。準備台帳wallet0へ移管、追加配布なし|教材条件1000/.001と、移管後の台帳0、移管記録1000を区別。以前のjourney進行済み900/99も完全保持|

誤った保存draftを読取専用fixtureへ置いたケースでは、正しい予定値で実入力を上書きせず、実際の違う入金先/数量/道/宛先/ガス額をそのまま表示しquoteReady=false。JSON往復後も同じ。未入力は『未入力』であり、教材の正解が入力済みに見えない。原資や現在残高はfinance-fundingのsummary、費用/予定は既存quotesから読む。新view側に残高計算・イベント確定・STEP送信はない。

## DX-02三点照合

S015（確認を開く）、S016（照合）、S017（提出）の全てで表面・裏面・画面内人物の3canvas/figcaptionを出す条件がある。getIdentityReviewViewはその時のidType/idFront/idBack/selfieを読み、申込者profileの氏名・生年月日・住所・教材日付・有効期限と並べる。3点を開く瞬間だけ表示して照合時に1枚へ戻る分岐にはならない。

主課題は朝日ミナトとclear/clear/clear-centered。独立reviewは木立アオイとそのreview snapshotの選択を読み、元の朝日ミナトや本編選択を混ぜない。専用テストではreviewの裏面をblurredへ差し替えた読取fixtureも『ぼやけたまま』と表示し、読取で元のstateを変更しない。これは不正な画像を製品の提出guardが受け付けるという意味ではない。教材内画像のみで実カメラは使わない。

## 指摘・未確認

対象差分について修正が必要な金融不整合の指摘はない。M-01-L2/L3の解消を金融表示モデルとして受け入れ可能。工程数/ID/固定XP/保存版/金融数式を変える必要はない。

未確認: appからの接続と一般入力欄の実押下、狭い画面での配置/可視性、相談を閉じた後の復帰、実ブラウザー再読込、Pages配信/公開反映、実機、人間の理解や面白さ。親のブラウザー/QAと人間観察の別記録に属し、13テストや本スクリプトだけで確認済みとしない。架空の価格・費用・交換比率を確認しており、現行の実サービスの口座条件/送金経路/料金の外部照会は行っていない。
