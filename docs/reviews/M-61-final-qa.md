# M-61 最終統合QA

- 日付: 2026-10-23。
- 担当: qa_reviewer / mobile_qa。AGENTS.md、agents/qa_reviewer.md、M-02/M-33の証拠区分と編集制限を再確認。
- 対象: `011eab3`以降のapp / operation-guide / phone-guide / lesson-guide / rooms / controlsの統合差分。
- 編集: この記録のみ。製品コード・共通docs・テストファイルを変更せず、ブラウザーを操作していない。

## 結論

担当が実行した関連6ファイルの32テストは成功、失敗0。案内を読む・矢印を見る・スクロール・動画を閉じる操作が、本来必要なSTEPを代行しないことを静的に確認した。コピー元・現在の工程・別条件の復習・表示上のコピー済みを混同しない根拠も確認した。

この確認範囲で、進行不能・データ消失・XP/資金重複につながる重大残件は検出していない。販売所/板の切替5工程で矢印対象がない軽微な改善事項を親へ返し、phone担当の修正後に同5工程とreview/見学の除外を独立再確認して解消した。最終公開URLでの確認は、この任務時点では未実施。

## 担当が実行した確認

```text
node --test tests/operation-guide.test.mjs tests/phone-guide.test.mjs tests/lesson-guide.test.mjs tests/mail-view.test.mjs tests/rooms.test.mjs tests/world-controls.test.mjs
32 tests / 32 pass / 0 fail / 625 ms

node --check js/app.js
成功
```

全211テスト成功という親の結果を、この担当が再実行したものとは扱わない。最後の表示2修正後の全suiteは親が行う。

M61-01修正後、`node --test tests/operation-guide.test.mjs` を再実行し、追加1件を含む7件成功・失敗0（1,242 ms）。これは最初の32件と重複する6件を含む再確認であり、39種類のテストを実行したとは数えない。

|受入条件|確認した根拠・結果|
|---|---|
|矢印が実操作を代行しない|operation-guideは現在のdata-guide-targetを読み、囲みと透過ラベルを置くだけ。click/type/focus/dispatchなし。scrollToTargetはスクロールのみ。最小DOMの対象click/focus回数0、寸法・名前を維持するtest成功|
|画面遷移後に監視を残さない|app.render先頭でoperationGuide.destroy→null、worldControls.destroy→null。各moduleのdestroyは予約フレーム/タイマー・イベント・Observerを解除。関連test成功|
|今の工程から説明を始める|lesson-guideは保存済みactiveStepや同じquestの未完了recordを優先。コピー後の再開でメールを最初から読ませず、現在の戻る/貼る/認証/成人プロフィールへ説明を切り替えるtest成功|
|未実施のコピーをコピー済みにしない|phone-guideは今回のメールread、今回のcopyStep完了、今回のcodeと現在clipboardの一致を要求。未読・別用事のclipboard・未コピーで実コードを出さないtest成功|
|貼り付けと認証を別にする|app.renderActionの貼付欄は空のreadonly。通常入力の練習値ボタンを付けず、提出値はsubmissionValueで本編/復習のclipboardを分離。貼付け後は別の認証STEPへ進む。親の実ブラウザー結果とも整合する|
|DXと別条件復習を混ぜない|DX貼付けは本編なら今回のメール、reviewならreviewSnapshotのmailOpened/clipboard/profileを使う。不一致で貼付ボタンを出さずメールへ戻る。復習が本編stateを変えないtest成功|
|家/報告/次行動を保つ|enterRoomがhouseName/questId/recordKeyを保持、roomRecordが該当経路を読む。報告は既存NPC記録で進み、初回STEPを再実行しない。M-33の室内到達・衝突・出口のtestを再実行して成功|
|序章の戻り先を合わせる|returnToTownのPR最終分岐はui.room=null→既存最終STEP→world。M33-02の「町へ戻ると室内」の不整合は修正済み|
|会話で歩行を即停止|showDialogとshowCurrentHelpの先頭でworldControls.stop。全画面再描画ではdestroy。controlsの離す/cancel/画面除去/スライド/複数指のtest成功|
|動画を閉じると停止する|appのmodal closeイベントで全videoをpause。Escで閉じる場合も同じclose経路。説明へ戻る・自分で操作するボタンでもpauseしている。動画を再生/鑑賞するためのXP/学習フラグはない|
|予定の結果を現在状態と誤認しない|renderActionは配列details内でresultと同じ文だけを表示用の新配列で「この操作ができると：」付きにする。step/result/stateの元データは変更しない|
|保存・工程・台帳契約を保つ|git diffでengine.js / finance.js / finance-extension.js / storage.jsの変更なし。説明moduleに新たな送金・報酬・保存処理を置かず、既存schema/content/保存キーを維持。全818工程の保持はM-60の独立検証と親のsuite結果で別に確認される|

## M61-01 販売所/板の切替で「矢印の場所へ」が反応しない

- 優先度: Improvement。進行や金額は壊さないが、同じ案内ボタンが突然反応しなくなる。
- 位置: `js/phone-extension.js` のvenue-tabs生成、`js/app.js` のguideへ常時追加されるoperation-jump。
- 仕様の根拠: 初めてでも、現在の指示と実際の押す場所が結びつくこと。案内は実操作を省略しない。
- 再現: DX-03のS002/S004/S006、DX-04 S002、DX-05 S002で「矢印の場所へ」を押す。
- 期待: 指示された販売所または板取引所の実ボタンに囲み/矢印が付き、そこへ移動する。
- 実際: venueSwitchではhandlesAction=true、両タブbuttonはdata-guide-targetを持たない。最小DOMで該当5工程すべてtargets=0を確認。operationGuideは空controllerを返し、scrollToTargetはfalseとなる。
- 修正条件: venueSwitch時に、今回のstep.valueと一致する実ボタンへdata-guide-target=trueを付ける。見学タブの操作を自動成立させない。5工程それぞれで対象1個・正しいボタン名・state不変を再確認する。
- 修正: phone担当が、通常DX工程のvenueSwitchで要求されるタブだけに印を付けた。reviewSnapshotあり、view.isReview、見学中、BOSS等の別IDは除外する。修正版のphone-extension SHA-256は下記へ追加。
- 独立再確認: 既存testへの追加とは別のNodeプロセス・最小DOMで、全5工程を再描画して要求タブ1個/他タブ0個をassert。要求タブのclickはonActionへ今回のvenueを1回、他タブのclickはonNavigateへ見学先を1回だけ渡す。stateはdeepEqualで不変。
- 境界: previewVenue=dealer/boardの双方、実際のreviewVariantのvenueSwitch＋独立initialSnapshot、BOSS接頭辞付きコピーでは、案内対象のタブ0を各工程でassert。見学画面の「元の作業画面へ戻る」は操作の答えとは別であり、その戻りボタンの印まで禁止したという意味ではない。
- 結果: 全5工程・両見学先・復習・BOSSコピー成功。追加済みoperation-guideの7テストも成功。担当の製品編集はなし。M61-01は解消済み。

## 親から受領したブラウザー証跡

以下は親の実行報告であり、このQA担当のブラウザー操作ではない。

- ローカルの実ブラウザーで、PR-01の12工程とPO-01の19工程をすべてUIで通過。合計148 XP、章印0。
- コピー直前の保存と再読込みから続行。
- 390×940 CSS pxでお手本動画の再生を確認。
- POの貼付け前の入力欄は空→実際の貼付けで246810→別の認証操作で完了、という順を確認。

これらは公開前の確認結果であり、最終公開後の動作や物理スマートフォンの合格へ読み替えない。

## 確認版

主要ソースを再読した時点のSHA-256。親の後続修正は同じ証跡へ混ぜず、修正箇所を追記する。

```text
js/app.js             771f70e295514ac7e0e1abc0e0ddecca18e3b6eb4f8135c328e8e8483955f150
js/operation-guide.js 16a4c561ce773fcff8e6fd4ecb576d71ac666d5e362e9ed950da35017beda122
js/phone-guide.js     bba1f984a559b5316beef2190c48d79516d65dda36195da7964e114a45c9a2bf
js/lesson-guide.js    92607695481ae824f9f353ebf78c6fcff3f11214f38f8ea7edf678762c758576
js/rooms.js           015364072321442ca655e25440c31c2a132b66a88068330cf94c73a3596fd06a
js/world-controls.js  bb96f1c502c87348d6eab438465c7de76be1f49a6f207520597c98b282bfedbb
js/phone-extension.js 36118dc56e2a5330ba0ca59b6a4621ed18ae4cd011a637d13e4b793afd1daa98
```

## 未確認

本役での動画の視聴・字幕内容・媒体の再生/停止/公開時取得、実ブラウザーの画面寸法、物理iOS/Androidの指操作・仮想キーボード、実際の初心者の理解度・面白さは未確認。実参加者による「迷わない」「楽しい」「またやりたい」の実証を、AIの静的レビューや32テスト成功から主張しない。
