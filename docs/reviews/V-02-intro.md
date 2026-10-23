# V-02 — 遭遇の区切りと入力の解放

担当: phone_engineer / 2026-10-23。親と共有の作業ツリー、当担当の変更は `js/rpg-ui.js`・`styles/rpg-ui.css`・`tests/encounter-intro.test.mjs`・本報告のみ。

## 改修

通常の野道・洞窟の門番・砂漠を同じ `mountEncounterIntro({document,state,onStart,minimumDisplayMs=600})` で表示。敵の実名と既存のドット絵、現在のHP、「敵が現れた！」「画面を確かめてから戦闘をはじめよう。」と「戦闘をはじめる」だけを出す。攻撃・逃走などの戦闘行動は出さない。砂漠には強さ・確実な逃走・教会での回復を短く説明する。

`trackEncounterInputs(document)` を親appの初期化時に一度呼び、遭遇を起こしたpointer/keyも表示前から記録する。表示開始から最低600msと、押されていたすべての指・キーの解放を待って開始ボタンを有効にする。表示前から押されていた操作のrelease/clickでは開始せず、有効化後の新しいpointerdown/up、非repeatのEnter/Space、通常の支援技術activationを受け付ける。既知のキー解放clickだけ250ms抑止する。開始は一度のみ。`destroy()` はtimer・当mountのlistener/購読を解除し、取り外し後・非表示中もcallbackしない。親の常設trackerのlistenerはその返り値を呼ぶまで維持する。

UI内でstate更新やdispatchは行わない。save/schema/工程/XP/ターン/金融残高/コインは不変。親の開始後350msガードと再読込み時turn1の表示制御は別の統合範囲。

## 自動確認

`node --test tests/encounter-intro.test.mjs tests/rpg-ui.test.mjs` を実行。**15成功 / 0失敗**（新規10・既存5）。fake clockで実際のイベント伝播capture/bubbleとlistener数、timer数を扱い、以下を確認。

- 599msは無効、600msで有効。指定0でも600msを短縮しない。指定1200msは待つ。
- 表示前のpointer長押し、複数指とキーの同時押し、無関係なpointerupは解除扱いにしない。
- 解放後のclickthrough、先行Spaceのkeyup/click、repeat Enter、表示中の早押し、pointercancel、fresh pressのないclickを拒否。
- 新しいpointer操作・通常Enter/Space・支援技術detail0 activationは利用可能。
- 二重開始を拒否、destroy後はtimer/listenerが0、取り外し/hiddenではcallbackしない。
- 待ち時間中にタブを離れ、戻った後も開始可能。
- 砂漠と洞窟で実際の敵名、HP、注意を表示し、元stateがdeepEqualで不変。
- 既存の戦闘結果、装備値、購入確認、装備操作の5テストも維持。

## 未確認

本担当はブラウザー・実機の確認を実施していない。CSSは320×720/390×844と上部56pxを想定した最大高と短い絵・56px開始ボタンを用意し、実画面確認は親へ依頼。人間が面白いと感じるか、支援技術実機、Safari、実タッチの動作は未確認。
