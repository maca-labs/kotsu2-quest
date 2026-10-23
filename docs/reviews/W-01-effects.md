# W-01 — 攻撃・反撃・撃破の短い演出

担当: world_engineer / 2026-10-23。基準remote/main `0f8cfeffb207eb4d92dc16aa1d06987f539c7900`。当担当は `js/rpg-ui.js`・`styles/rpg-ui.css`・新規 `js/battle-effects.js`・新規 `tests/battle-effects.test.mjs`・本報告のみを編集。孫エージェントなし。

## 実装と統合契約

`mountBattleTurn({document,root,beforeState,afterState,action,onComplete,reducedMotion=false}) → {destroy}`。

親がRPG_BATTLE_ACTIONを一度だけdispatch/saveし、旧DOMを残したまま保存済afterStateを渡す。controllerは見せ方だけを担当し、dispatch・保存・金融・XP・報酬の更新を行わない。通常1120ms、勝利1040ms、敗北1280ms、逃走440ms、動き軽減340msで完了する。「結果をすぐ見る」はonCompleteを一度だけ早める。destroyではcallbackを呼ばず、全timerと専用listener/DOM/一時classを片づける。取り外されたrootも完了callbackを呼ばない。

攻撃は短い斬撃、一度の減光点滅と数字、敵HP減少、反撃の数字と主人公の反応を順に出す。強打は実際の大きい数字、まもるは防御表示、力ためはダメージを出さず予告、撃破では敵を消す。通常の勝利結果を再描画したときにも敵canvasは生成しない。動き軽減では斬撃・点滅・揺れ・移動なしで静止した数字と文章を短く提示する。音・外部素材は追加していない。

実ダメージは当該行動の保存済ログから末尾側の攻撃文・反撃文を読む。残HPとの差ではないため、残HP4への6ダメージも6と表示する。beforeの敵予告で力ためを区別し、撃破/逃走後に古い反撃値を出さない。勝利回復は回復として扱い、砂漠でHP32→敗北→教会で32となる保存でも実被害88と衝突時HP0を出す。10行に切り詰められたログも、長さの差分ではなく該当文を読むので動作する。

既存introの600ms・入力解放・開始後ガードのコードは保持。親が演出中のメニュー/移動/行動を抑止し、完了直後の入力貫通とstale completionも守る。新moduleのimport map追加・配信版更新は親の所有。

## 発見した位置の問題と修正

親の390幅ブラウザー確認で、最初の版ではskipを新しい行に挿入したことで約68px増え、scroll anchoringが発生した。既存の敵予告領域へskipをabsolute中央配置し、元の子要素をvisibility:hiddenとして高さを保持する方式へ修正。案内文はmount時の実高をmin-heightで保ち、演出中14px表示、rootをoverflow-anchor:noneにした。新しい縦行は追加しない。cleanupで案内文の一時min-heightを復元する。最終寸法の実画面再確認は親が担当する。

## 自動確認

`node --test tests/battle-effects.test.mjs tests/rpg-ui.test.mjs tests/encounter-intro.test.mjs` を実行。**25成功 / 0失敗**（新規10・既存UI5・既存intro10）。real engineでbefore/afterを作り、fake clockと実rendererのDOM hookを使って時間・表示・stateを確認した。

- 通常攻撃6→敵HP14から8、反撃3→主人公32から29の順序。
- 強打10、防御時被害2、強い攻撃を防御した被害4、力ためでは被害なし。
- before/afterとも10行のログでも、現在の攻撃6と反撃3を表示。
- 残HP4への攻撃6、敵の消滅、通常勝利renderに敵なし、12コインは一度だけ。
- 旧保存fixtureの帰還ランタンによる勝利回復3を被害に混ぜない。
- 砂漠の被害88→衝突時HP0→保存済教会全回復32。宿へ運ばれる洞窟敗北との区別。
- 逃走の短時間表示、HP/コイン/金融/学習記録の保持。
- 元の行動ボタンをdisabled、skip連打でも一度だけ完了、途中destroy・DOM除去でtimer全解除かつ完了しない。
- 動き軽減の攻撃・防御・逃走・撃破で点滅/斬撃/揺れ/移動なし。
- skipが既存の敵予告の子であること、案内文の高さ保持/復元、save parse往復とstate不変。

## ブラウザー・未確認

本担当はブラウザー・実機の直接操作を行っていない。親からローカル390で6/10の数字、反撃HP30→27、攻撃中reload後のturn3/敵HP2、強打overkill10→敵HP0/消滅・coin12一回を確認したとの連絡を受領。親の正式な実画面・公開確認は別の検証記録へ残す。

実機タッチ、Safari、支援技術実機、人間の面白さは未確認。表示演出であり、初めての人が理解しやすいか・楽しいかの実証とは扱わない。
