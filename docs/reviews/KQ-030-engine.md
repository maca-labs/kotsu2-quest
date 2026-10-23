# KQ-030 engine implementation and reviewer corrections

担当: engine_engineer。作業場所は既存 `kotsukotsu-quest`。製品コードの編集は `js/engine.js`、`js/finance.js`、新規 `js/finance-extension.js` に限定。`js/storage.js` は変更不要だった。

## 実装と契約

- 新6台帳: domestic-account / domestic-dealer / domestic-market / domestic-limit / lending-lab / leverage-choice。既存の金融snapshotへ資金を合算しない。
- 金銭・口座イベントは申込、認証、提出、審査時間送り、利用開始、注文、予約、取消、成立、貸出、返還申込、処理、受取、先物新規/値送り/決済を一意IDで記録する。通常の閲覧や売買画面の切替は金融イベントを増やさない。
- 新7講座の176工程を既存STEPで処理。extension講座を旧章内の暗黙的な順序や章ボス要件から除き、追加講座自身の明示prerequisitesを適用。
- `getExtensionView` はrows、quote、venues、orders、fills、account、lending、metricsを返す。表示側は独自に金融計算しない。
- 復習は専用snapshot。各7講座の別プロフィール、売買5枚、貸出200、方向/倍率/値動きの選択に対応。初回資金、XP、受注日時、装備を変えない。
- 保存キー、schemaVersion、contentVersion、既存IDは変更なし。旧nav2の新6台帳欠落は完全に未操作のdefaultだけ補完。既存台帳の欠落、未知ID、重複、改ざんを拒否。
- 既存openPerpの数値文字列を検証済みnumberへ統一し、手数料控除後の自己資本が教材維持額を上回らない新規注文を拒否。旧固定例990、費用あり989.61は維持。

## 独立学習レビュー後の修正

1. KYC照合材料の欠落: main profileへ教材日2026-10-23と書類期限2031-03-31を追加。確認課題の別成人の期限2032-06-30は維持。初期、旧642工程保存の補完、新規保存の再生で表示APIが同じ期限を返し、期限改ざんは拒否する。
2. 同条件のLV復習: 本編とside / leverage / markPriceが全て同じでも復習のcompletedは可能だが、transfer証拠は加算しない。どれかを変えた場合だけ該当5技能のtransferを付与。以前取得したtransferは減らさない。`extensionReviewConditionsChanged(state, reviewSnapshot)`とview.changedConditionsで毎回導出し、新しいboolを保存stateへ追加していない。
3. 板の枚数の欠落: view.orderBookを追加。架空教材であるラベル、asks/bids各3段の価格と待機枚数を返す。初期は売100/101/102・枚数10/20/30、買99/98/97・枚数15/25/35。値送り後の成行売りと指値売りの最良買値105、指値買い成立時の最良売値95を表示し、固定約定額を維持。表示情報でありsnapshotを増やさない。
4. 金融レビューの決済後残量: metrics.quantity/notional/collateralとview.positionは現在の保有だけを示し、決済後は0。終えた取引はview.leverageHistoryの方向、倍率、entry/exit価格、数量、金額、配分、損益、返却額へ分離。初回openイベントとclose履歴から導出し、既存保存や固定perpの履歴構造を変更しない。決済後quoteの数量/金額/配分も0、方向/倍率には「終えた取引」のラベルを付ける。

## 実行結果

最終修正後:

`node --test tests/extension-engine.test.mjs tests/extension-finance.test.mjs`

33 tests、pass33、fail0、skipped0、約24.27秒。新176工程、全7復習、LV全12条件、注文予約/取消/再注文/約定、貸出満期−1ms/一致と別受取、不正入力、重複処理、途中JSON、旧642工程保存、期限表示、同条件/異条件の技能証拠、板の価格と枚数、全12条件の決済後残量0と過去履歴の一致を確認。

最初の機能統合後には、既存finance/funding/navigation/self-auditと新financial testを組み合わせた別実行で60 tests、pass60、fail0、約37.47秒。既存全contentの金融モデル一致も通過。最後の学習レビュー修正後に全体回帰を実施したとは本記録では扱わず、親の統合確認へ引き渡す。

## 未確認と境界

本担当はブラウザー、モバイル実機、公開環境、人間プレイ観察を実施していない。板は架空の3段・整数枚数・全量約定の教材であり、実市場の板、部分約定、価格推奨を表さない。貸出は年率12%、30/365単利、小数6桁の返還成功例であり元本保証ではない。新しいLV自由練習はfee/funding0、証拠金100、entry100、1/2/5倍、95/105の教材価格。既存の固定SL/funding/清算課題は独立して残す。
