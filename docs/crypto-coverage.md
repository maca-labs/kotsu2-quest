# クリプト教材の実装範囲

`js/content-crypto.js` は暗号資産別冊の標準工程を個別の操作データとして持ちます。各工程の ID と本文は詳細仕様書の第20節に対応します。ラボの個別会計と実時間の期限は共通エンジン・金融エンジンが扱います。

| クエスト | 工程数 | 金融状態 |
| --- | ---: | --- |
| CR-01 資産の地図 | 18 | journey |
| CR-02 ウォレットと偽サポート | 25 | journey |
| CR-03 ネットワークと入金 | 32 | journey |
| CR-04 運用方法の比較 | 18 | journey |
| HY-SPOT 現物の塔 | 41 | spot / 別の指値練習 spot-limit |
| HY-HLP 流動性の塔 | 27 | hlp |
| HY-STAKE 委任の塔 | 40 | stake |
| HY-PERP 鏡の塔 | 48 | perp / 別のSL・資金調達・清算練習 |
| HY-EXIT 帰りの船 | 26 | 選択した journey / spot / hlp / stake / perp |
| 合計 | 275 | 9クエスト |

CR-04 の経路選択は予約です。第5章の章印を得てから第6章に進みます。4ラボはすべて完成した操作を持ちますが、受講者に全ラボの完了を要求しません。見送りでは売却・決済を作り足さず、共通入金後の99を出金します。HY-EXITの会計・完了状態は経路別で、工程・クエストの学習XPは同じ安定IDで1回です。

第5章ボスは別冊の固定5課題、第6章ボスは経路に対応する5課題です。各課題内に複数の操作を持ち、最後の確認まで終えたときだけ20ダメージになります。ボス用の金融状態は主シナリオと独立しています。

`reviewVariant` は別条件の確認課題です。`applyReviewEffect` はその課題の専用状態だけに作用し、同じ効果の再実行では変化しません。現物の数量1・価格105、HLPの2日後50追加入金、ステーキング10のうち5の委任、ショート・SL・資金調達料の向き、出金200→199を含みます。未受講ラボへの熟練証拠を作りません。

## 確認結果

Node.jsでモジュールの構文を確認し、9クエスト・275工程IDの一意性と個別数を検査しました。各標準工程を金融エンジンに適用し、5経路の出金後に会計データの再生検証を通過しました。

| 経路 | 出金申請 | 今回の受取 | 備考 |
| --- | ---: | ---: | --- |
| journey | 99 | 98 | 元のwallet900に届き998。ETHは別に0.0009 |
| spot | 980 | 979 | 売却後の確定損失20 |
| hlp | 991 | 990 | 700+291、実時間と独立した4日ロック |
| stake | 808 | 807 | 10.1HYPEの場所を順に移し、価格80で売却 |
| perp | 990 | 989 | 主ラボの手動決済。小練習は加算しない |

ボスの全操作を2回ずつ適用して重複防止と会計再生を確認しました。第6章ボス専用の受取はspot104 / hlp99 / stake79 / perp49 / journey99でした。確認課題も各効果を2回ずつ実行し、現物1005、HLP1000、ステーキング現物10、ショート決済990、独立SL決済993、出金受取199を確認しました。

この文書の検証はデータと金融操作の結合確認です。画面操作、保存、320pxレイアウト、GitHub Pages配下の読込みはプロジェクト全体のREADMEの確認記録を参照してください。

## 公式資料と教材値

2026-10-22に `factCatalog` のS1〜S10を公式Docsで再確認しました。HLPは直近の預入から4日、委任ロックは1日、ステーキングから現物への出金は7日、資金調達は毎時で数量とoracle priceを用いることを確認しました。入口によって対応する入金方式が異なることも確認しています。

- [入口と入出金](https://hyperliquid.gitbook.io/hyperliquid-docs/onboarding/how-to-start-trading)
- [HLP](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/vaults/protocol-vaults)
- [ステーキングの操作](https://hyperliquid.gitbook.io/hyperliquid-docs/onboarding/how-to-stake-hype)
- [資金調達料](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/funding)
- [清算](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations)
- [HyperCoreとHyperEVM](https://hyperliquid.gitbook.io/hyperliquid-docs/onboarding/how-to-use-the-hyperevm)
- [SL・TP](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/take-profit-and-stop-loss-orders-tp-sl)
- [Testnet faucetの利用条件](https://hyperliquid.gitbook.io/hyperliquid-docs/onboarding/testnet-faucet)
- [ステーキング残高と委任解除](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/staking)
- [USDC入金の入口による違い](https://hyperliquid.gitbook.io/hyperliquid-docs/support/faq/deposit-or-transfer-issues-missing-lost/deposited-usdc)

最低額10、入出金費1、ガス0.0001 ETH、各価格、報酬0.1、維持率5%は独自の架空値です。部分約定、複数注文板、クロス証拠金の数理、実際の部分清算・バックストップ・銘柄別証拠金階層は省略し、実相場や実料金の再現とは表示しません。公式資料は明示的に押したときだけ別タブで開くための教材リンクです。

## 2026-10-23 追加講座との関係

この表は元の別冊275工程の対応を維持しています。国内取引所の申込/KYC/販売所と板/成行と指値/貸出/自由な方向と倍率は別の[追加講座176工程](./extension-coverage.md)を参照してください。元の4ラボと見送りはそのまま選べ、追加講座を未受講でも章の条件を増やしません。
