# W-02 — 戦闘演出の独立 QA

2026-10-23。基準 HEAD `0f8cfeffb207eb4d92dc16aa1d06987f539c7900`。担当 qa_reviewer、製品コード編集なし。W-01が演出/UI、親がapp・入口・共通契約を所有する。実ブラウザーと公開反映は親の証跡、実機/人間の感想は未確認として分ける。

## 初期点検の対象

既読の `AGENTS.md`、`agents/qa_reviewer.md`、`docs/PRODUCTION.md` と最新 `docs/CONTRACTS.md` を踏まえ、`js/rpg.js` の `RPG_BATTLE_ACTION`、`getRpgView`、`js/app.js` の `act` / `renderCombatView` を確認。製品の工程・報酬ID・保存v3・金融台帳を変更せず、確定した戦闘1ターンの結果を描画する変更として扱う。

## 統合前の注意点と受入条件

1. **確定は一度だけ。** 最初の入力で同期的にbusyへ入り、実engineのcommandをrender:falseで1回だけ保存してから演出を開始する。演出完了 callback から再dispatchしない。actの失敗では演出を開始せず、busyを解除する。
2. **押せない見た目と実入口の両方。** 四コマンドだけでなく、Escape/メニュー/nav/hash等が古い画面を動かさないようにする。途中で別画面へ移る必要がある場合は演出controllerを破棄し、古い完了callbackが別stateを描画しないようtoken/battle.id/turnを照合する。
3. **保存と描画を分離。** リロード時は保存済みのafter状態へ戻り、同じ攻撃/コイン/ダメージをもう一度処理しない。実時間の演出中断で進行不能にしない。
4. **数字の根拠。** UIが別の攻防式で金融や戦闘を計算し直さない。通常被害・防御・強打・ため・強攻撃・とどめ・逃走を区別する。敵残HPより大きい表示ダメージ（overkill）と、実際の残HP減少量を混同しない。
5. **敗北のHP。** field敗北時のstate.hpは同command内で教会の全回復へ変わる。before-afterだけでは被害0や回復だけに見える。演出では被撃→倒れると、教会で回復した結果を区別し、残HPを不正な負値へしない。quest敗北はHP0で宿へ戻る既存仕様を守る。
6. **勝利・回復。** 勝利後の再描画で生きた敵を残さず、結果/初勝利コインを正しく示す。`winHeal` がある場合、味方のHP増加を敵の被害と誤表示しない。再戦はコインを増やさない。
7. **長い戦闘ログ。** engineは `battle.log.slice(-10)` とするため、`after.log.slice(before.log.length)` だけでは10行に達した後の新規ログが失われる。同じ語句が繰り返すケースも含め、その1turnの表示を特定する。
8. **破棄/動きの抑制。** destroyは二度呼んでも安全で、timer/animation/listenerを解除し、古いcallbackを呼ばない。通常1turnは概ね0.9〜1.5秒、reducedMotionでは揺れ/飛びを抑え、結果を同じように読み取れる。0msや短縮時にも二重完了しない。
9. **既存の遭遇区切り。** 600msの遭遇案内と開始後350msの誤タップ防止を破壊しない。開始直後の2tapで攻撃/逃走が入らず、通常の次turnは意図した一操作で実行できる。

## 初期の独立した期待値

序章の街道初戦は初期装備込み攻撃7、防御2、強打追加4、敵HP14/防御1/攻撃5。通常攻撃は表示6（敵HP8）、通常反撃3（味方HP29）。最初の防御では被害2（HP30）。強打は表示10（敵HP4）と反撃3（HP29）。その後の通常攻撃は表示6だが残HPの減少は4で勝利し、敵からの反撃はなく、初勝利12コイン。これらは製品関数をそのまま期待値生成に使わずコードの定数と計算を独立に追った値。

砂漠の初期通常反撃は90-2=88（防御なら44）。32HPの主人公は倒れるが、保存済みafter.hpは教会で32へ戻る。88または44の被害と全回復の事実を混ぜないことを確認する。

実engineへ独立に作った6分岐（街道attack/guard/skill、強打後のとどめ、砂漠attack/guard）を与え、上記のHP・敵HP・表示ログ・勝利12コイン/XP0・教会への移動が一致した。これは既存結果の基準であり、演出モジュールの合格を意味しない。

## 統合後の確認

親から差分固定の連絡後、app / rpg-ui / battle-effects / stylesと関連テストを独立に確認した。製品コードは編集していない。

### 結果

重大残件0。以下の条件をコード・模擬DOM・実engineで確認した。

- 実appの `renderCombatView` はbusyを同期設定し、`act(...,{render:false})` が成功してから演出を作る。実appの `act` はその時点で `store.save(next)` を実行する。演出側は `getRpgView` で確定済み結果を読むだけで、dispatch/XP/コイン/金融更新を呼ばない。
- 連打中の二度目のaction、終了状態が先に保存された逃走中のmenu/nav/hashもbusyが止める。完了直後180msはcommandと結果ボタン双方の実入口も止める。旧来の600ms遭遇表示・350ms開始後ガードは維持する。
- 完了は一度のみ。破棄・別保存へ置換・別画面・切断DOM・視覚controller失敗で、古い完了が別の戦闘を戻さず、確定済みactionを再実行しない。失敗したactionでbusy/演出を残さない。
- 味方攻撃と反撃を別の時点で見せ、強打10・通常6・防御被害2・強攻撃を防御した被害4・ための無被害を区別する。10行のログ上限後も現在turnの数字を読み取る。
- 敵残HP4への表示6はoverkillとしてそのまま出す。とどめ後に反撃せず、敵を消し、初勝利の12コインを一回だけ記録する。勝利回復3は回復と表示する。
- 砂漠での被害88→表示HP0→保存の教会HP32と、洞窟敗北のHP0/宿を区別する。逃走は被害の数字を出さず、HP/コイン/金融/学習を変えない。
- 通常のターンは1120ms、勝利1040ms、敗北1280ms。逃走440ms、動き抑制340msの短縮例は別扱い。動き抑制では点滅・斬撃・振動・移動なしで数字/結果を示す。「結果をすぐ見る」は表示のみを終え、再commandを発火しない。
- 攻撃・行動ボタンに重なることがないよう、skipは予告枠のoverlayへ出す。予告枠の元の寸法と説明の最小高を維持するCSSは確認した。実際の320/390px描画は親のブラウザー証跡へ分離する。

### 実行した限定検証

```text
node --test tests/battle-effects.test.mjs tests/encounter-routing.test.mjs tests/encounter-intro.test.mjs tests/rpg-ui.test.mjs tests/rpg-field.test.mjs tests/rpg-navigation.test.mjs tests/world-controls.test.mjs
52 tests / 52 pass / 0 fail / 5.304140 s
```

appの単体経路は本番関数をVMへ読み出し、実engineとUI controllerのstubで実行する。演出テストは本番 `renderRpgBattle` と `mountBattleTurn` を模擬DOMで実行する。ブラウザーのイベント生成や画面描画をこれらのテスト成功から保証しない。

加えて、QA担当が製品コードやテストファイルを変更せず、既存の模擬DOM fixtureだけを再利用した独立3ケースをstdinから実行した。

|独立ケース|期待と結果|
|---|---|
|砂漠で防御・通常演出|被害44、演出HP0、保存HP32、lost、完了1回、revive1件、演出前後の保存JSON一致|
|砂漠で防御・動き抑制|被害44、演出HP0、保存HP32、揺れなし、完了1回、保存JSON一致|
|10行ログ/turn7で防御|過去の被害4を再使用せず現在被害2、HP18、完了1回|

以上は3ケースとも期待通り。通常攻撃/強打以外の砂漠防御と、ログが満杯になった後の防御を補った。

### 対象の固定

基準HEADからのW差分。`git hash-object --no-filters` は次の通り。

|対象|blob|
|---|---|
|js/app.js|6e0d2fb7456b54d849ba1c603f3f94a15576250a|
|js/rpg-ui.js|259ce2e27f42d498b500ca893948af9fdab2198a|
|js/battle-effects.js|ed9ec191a89ab5185f5f045e9960a7bf104693d1|
|styles/rpg-ui.css|4ec48d1d2cb4149e0ce6f6c53c4229573c393750|
|tests/encounter-routing.test.mjs|3841007f52a4e4fb31359986cedca53afde5c37d|
|tests/battle-effects.test.mjs|ec7549bc325bc2a9e4a4a389d6a95f4ebaac3062|

全体テスト、公開後の一致、実ブラウザー/実機、人間の感想はこの担当の52+3ケースとは別の証跡とする。公開反映可否は親の全体検証と合わせて判定する。
