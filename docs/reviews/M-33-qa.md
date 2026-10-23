# M-33 十字キー・室内・物語案内の最終統合QA

- 担当: qa_reviewer / mobile_qa
- 対象: 2026-10-23、`011eab3`からの作業差分。親がapp/rooms/CSS、quest担当がstory-guideを所有する統合版。
- 必読: AGENTS.md、agents/qa_reviewer.md、M-02-mobile-qa.md。制作・共通契約は前任務で読了済み。
- 編集: この記録のみ。製品変更・孫の作成・ブラウザー操作なし。
- 対象: app ↔ world-controls ↔ rooms ↔ story-guide、従来の相談と復習への影響。

## 結論

関連5テストファイルの55件は成功、失敗0。屋外3扉と室内全員・出口の独立した経路探索も成功した。画面再描画中の同期destroyは、繰返しタイマーとイベントを残さない。会話開始の即停止について返した指摘は、親が共通入口で修正し、静的再確認した。

この担当の自動確認・静的確認の範囲では、金融処理・XP・818工程・保存版を壊す阻害不具合は見つからなかった。実ブラウザーのクリック・長押し・PointerCapture・指のスライドは親の確認であり、この担当の合格とは混同しない。

## 実行した関連テスト

```text
node --test tests/world-controls.test.mjs tests/rooms.test.mjs tests/story-guide.test.mjs tests/adventure.test.mjs tests/help.test.mjs
55 tests / 55 pass / 0 fail / 13,918 ms
```

- 十字キー: 初回1歩、260ms後の反復開始、145ms間隔、合成clickの重複防止。離す/cancel/外側/blur/非表示/capture喪失/DOM除去/destroyで予約解除。中央で休止、方向をスライド、複数指や右ボタンを除外。
- 室内: 壁・家具・人物で止まり、元位置は不変。3室とも人物へ近づき、出口へ到達。
- 物語: 初回序章案内、全章の選択維持、途中キーから再開、67 XPと手帳後の次章、完了後の報告と次依頼、他章への寄り道後の報告、既存章ボス、国内口座から独立したFIへの案内、ラボと運用見送りの区別、旧章クリア後の新講座、出口の経路別報告。
- 冒険/相談: 実完了工程だけで封印・記録・町変化を描く。未受講・別ラボ・別経路から実績や残高を借りない。相談は名前付きダイアログで戻れ、未完了状態を書き換えない。

全テスト一括実行は親の担当とし、この担当では実行していない。

## 追加の独立自動確認

### 1. 実際の屋外衝突判定で全扉へ経路探索

`world.move`の移動可否と、appの新しい長老宅占有範囲・扉への入室条件を使い、初期位置(12,10)から幅優先探索した。扉は移動前に入室するappの契約として扱い、途中で別の扉を通過しない。

|章|依頼人の扉|酒場の扉|長老の扉|
|---|---:|---:|---:|
|CH-0〜CH-6の各章|12歩|12歩|14歩|

全7章の3扉、合計21経路で到達可能。既存map.moveの衝突を無視した直線距離による成功判定にはしていない。

### 2. 全室の全人物と出口の経路探索

`roomStep`で各室の出現位置から探索し、人物の2マス以内と出口に到達できることを確認した。

- 依頼人の家: 1人＋出口。
- 長老の家: 1人＋出口。
- 酒場: 9人全員＋出口。

### 3. onMove中に画面が破棄される境界

既存controlsテストの最小DOM・決定的時計を再利用し、onMoveの中で即controls.destroy()を実行。方向pointerdownで1歩だけ、タイマー0、その後2秒進めても1歩のまま。window/documentリスナーのSetがすべて0、MutationObserverが解除済みであることをassertした。onMoveから入室/退室→renderする同期境界に対応する。

### 4. 既存工程と契約

- steps.length = 818。
- extra以外のstepIds合計 = 794。
- engineのschemaVersion 3 / contentVersion kotsukotsu-rpg-3 / navigationVersion 2 / 保存キーkotsukotsuQuest.save.v3は維持。
- roomsは位置の表示用情報を返すだけで、state/XP/台帳へ直接触れない。室内位置ui.roomはJSON保存へ追加しない。JSON再開は元の町から継続し、工程・記録は既存engineが復元する。
- story-guideはdispatch/storageを呼ばず、途中・完了・報告済みを既存記録から導く。読み取るだけの処理にXPや資金の追加を置いていない。
- 従来のstartReview→nav('review')とREVIEW_ACTION/RESTART_REVIEWの入口は残る。新しい室内操作はreview snapshotへ触れない。新機能を理由に未受講ラボを学習済みにしない。

## 返した指摘と修正確認

### M33-01 — 会話をすぐ閉じると、長押しが復活する境界

- 根拠: 元のcanMoveは次の反復tickでmodal.openを検査する。会話開始時そのものではstopされず、145ms未満に閉じると保持が継続し得た。
- 再現条件: 方向を保持中、別の入口で会話を開き、次tick前に閉じる。
- 期待: 会話を開いた時点で保持を解き、閉じても勝手に移動を再開しない。
- 影響: 予期せぬ1歩以上の移動。XP/金融の重複に直結しないが、操作の分かりやすさを損なう。
- 修正: 親がshowDialogの冒頭と、新しいshowCurrentHelp(mode)の冒頭でworldControls?.stop()。すべてのopenCurrentHelp呼び出しを共通ラッパーに集約した。
- 再確認: appソースで両入口のstopと、直接openCurrentHelp(state,modal,...)呼び出し1箇所のみをassert。render先頭destroyもassert。修正後の静的確認は合格。実ブラウザーは親が確認する。

### M33-02 — 序章の「町へ戻る」と室内保持の整合

- 根拠: 家からstartQuestするとui.roomが残る。PR最後のreturnToTownはSTEPをview:worldで確定し、元の室内情報を消さない。そのため外側ボタンが「町へ戻る」でも室内が描かれる経路がある。
- 再現: 郵便屋の家→PR-01受注→12工程目の外側「町へ戻る」。
- 期待: ボタン名と実際の戻り先を合わせる。戻り先のために最終STEPや手帳・XPの確定を省かない。
- 影響: 進行不能ではなく、戻り先の誤解。次章への案内自体は室内にもある。
- 修正条件: 町へ戻るならPR確定前にui.roomを解除する。家へ戻す意図ならラベルと説明を合わせる。親へ静的指摘として送付。親の最終確認を待つ。

## 版と未確認

主要静的再確認時のSHA-256:

```text
js/app.js             488B713A92D9ABCDEFC7373C21BD24EDB3F768C6AB8C65CF540A5080C187C294
js/rooms.js           015364072321442CA655E25440C31C2A132B66A88068330CF94C73A3596FD06A
js/story-guide.js     459B7F98FFA77A6AB759BCEA6137AC610D1A3A73A357B374FB67D3AC8A6A3924
js/world-controls.js  BB96F1C502C87348D6EAB438465C7DE76BE1F49A6F207520597C98B282BFEDBB
```

親の追加の小修正が入る場合、このSHAを最終納品版と同一とは扱わない。実機iOS/Androidの指スライド・仮想キーボード、実際の初心者の理解や面白さ、最終公開URLでの動作は、この任務では未確認。
