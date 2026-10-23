# V-03 — 遭遇時の入力混入・独立 QA

2026-10-23。担当 qa_reviewer。基準 HEAD `6dd14a5a49d3171ffad8a1f731f83341e130d4a8` からの V 差分を対象にする。製品コードは編集せず、実ブラウザー確認は親担当。自動検証・コード確認と、実機・人間の感想を区別する。

## 初期確認

`AGENTS.md`、`agents/qa_reviewer.md`、`docs/PRODUCTION.md`、`CONTRACTS.md`、`WORKBOARD.md`、`DECISIONS.md` を参照。上位候補 `C:/AGENTS.md` からプロジェクト親までを確認し、追加ファイルなし。下位 `AGENTS.md` なし。

`beginEncounter` / `startFieldBattle` が即座に戦闘 DOM へ交換する。十字キーは pointerdown で移動要求を出すため、画面が変わる時点で同じ指がまだ下がっている場合がある。移動長押し timer は destroy で止まるが、戦闘側へのタップ混入とは別の問題。再描画後の位置に「にげる」等があれば、意図しない行動を選ぶ危険がある。

根拠は今回のユーザー報告「敵が現れた！の表示を挟み、タップミスの逃走を防ぐ」。重大度 Major。再現条件は移動/工程操作により遭遇が始まる瞬間の pointer 継続・連続 tap。ブラウザーにより click の生成先が異なるため、コード所見だけで全端末の再現済みとは扱わない。

## 修正の最低受入条件

1. 門番、工程区切り、洞窟歩行、街道、砂漠の各経路に同じ遭遇表示を挟む。表示中は四つの戦闘コマンドを DOM に置かない。
2. 短い表示待ちの後に「戦いをはじめる」を明示操作する。遭遇前からの指押下・押しっぱなしの Enter/Space を開始操作として受けない。単なる時間待ちだけでは、長押し解除が待ち時間後になる場合を防げない。
3. 開始の二重 tap が次の戦闘行動へ通らない。開始後の短いガード時間は四コマンド共通で、期限後は意図した行動を選べる。
4. 保存再開・JSON 読込みの active turn1 は同じ表示を経る。設定/ハッシュ等の描画経路も迂回できない。turn2以降は途中経過を保持する。
5. 表示の破棄・設定へ移動・別戦闘へ切替・背景化後に、古い timer や入力 listener が開始/戦闘を発火しない。再開不能にしない。
6. 遭遇の表示/開始は戦闘 action を dispatch せず、HP・敵HP・turn・コイン・固定XP・学習工程・金融台帳を変えない。現行戦闘の難しさ/報酬を変えない。

## 経路の棚卸し

|経路|既存の入口|確認点|
|---|---|---|
|洞窟門番・敵の会話|meetGate → beginEncounter|話す click を戦闘コマンドへ渡さない|
|工程の安全な区切り|runStep → automaticEncounter → beginEncounter|工程完了の click と戦闘入力を分ける|
|洞窟12歩|walkExpedition → beginEncounter|十字キーの pointerdown 継続を遮る|
|街道4/20歩|maybeFieldEncounter → startFieldBattle|長押し/繰返しを停止する|
|砂漠2歩|maybeFieldEncounter → startFieldBattle|逃走は明示した時だけ、強敵の説明を読める|
|初回load / JSON読込み|active battle → combat → renderCombatView|turn1は案内、turn2以上は同じ途中から|
|設定から復帰 / hashchange|nav / hashchange → renderCombatView|別描画経路による案内迂回・古いtimerなし|

## 実行した確認（修正前の基準）

`node --test tests/world-controls.test.mjs tests/rpg-ui.test.mjs` 相当の既存10件が成功。長押しの stop/destroy と既存戦闘 UI の token・表示・購入確認の基準確認であり、新しい遭遇表示はこの時点では未実装。新仕様の合格証跡としては数えない。

## 統合後の限定再確認

親から差分固定の連絡後、`mountEncounterIntro` / `trackEncounterInputs` と `renderCombatView`、開始/読込/描画の各経路を確認した。

- 入力 tracker は最初の操作より前に常時登録し、遭遇前から押した pointer/キーを保持。600ms経過だけでは開始を許さず、押していた全入力を解放した後の新しい開始操作を要する。
- 開始は新しい pointerdown と同じ pointerup の対応を要する。Enter/Spaceのrepeat、元のSpace解放に伴うclick、cancel、古いclickを拒否。支援技術の入力は阻害しない。
- 初回 turn1 の gate/road/desert と JSON 復元は遭遇表示、turn2 復元は同じ戦闘から。四つの戦闘行動がない表示を挟み、明示開始後350msはボタンと実action callbackの両方を止める。
- renderでintroのdestroyとarm timerのclearを実行。古いonStartはview/battle.id/statusを照合する。設定往復中の残り350msと、閉じた画面のtimer/切断DOMも検査する。
- 背景からの復帰でreadyを更新する処理も現在の実装とテストに含まれる。

独立実行:

```text
node --test tests/encounter-intro.test.mjs tests/encounter-routing.test.mjs tests/world-controls.test.mjs tests/rpg-field.test.mjs tests/rpg-navigation.test.mjs tests/rpg-ui.test.mjs
35 tests / 35 pass / 0 fail / 16.215898 s
```

この実行はローカルの模擬DOM/実engine検証。画面幅・ネイティブのタッチイベント生成・公開版の描画確認は親の実ブラウザー証跡へ分離する。

### V-03-02 — 保存を置換したときの遭遇確認ID（Major）

- 再現: 街道初戦の案内で「戦闘をはじめる」→逃げる→新しい冒険へリセット→街道4歩。または、開始確認済みの戦闘と同じturn1 JSONを設定画面で読み込む。
- 期待: 新しい冒険/置換した保存では遭遇表示だけを出し、HP/turnを進めない。
- 実際の初期差分: `ui.acknowledgedBattleId` がreset/importで残る。battle.idは保存内の敵ID/attemptから作るため、新しい冒険でも同じIDとなり得る。`renderCombatView` のID一致判定で案内を飛ばす。
- 影響: 本修正の主目的である遭遇直後の誤タップ防止を、リセット/JSON置換後に迂回する。
- 修正条件: `store.replace` / `store.reset` 成功時に表示用の確認IDとarm時刻を消す。失敗した読込みで現在の状態を壊さない。同一IDの保存置換/新冒険を回帰テストへ追加。
- 親へ通知し、reset/import成功直後に `acknowledgedBattleId=null` と `combatReadyAt=0` を追加。失敗時はこの更新へ到達しないため、現行の案内状態を維持する。
- 本番成功処理のsnippetを実行する回帰2件を親が追加し、同一battle.idのJSON置換/新冒険でintroだけになることを独立再確認した。Majorは解消。

### 修正後の最終限定結果

上記と同じ6ファイルを再実行し、**37件成功 / 0件失敗 / 10.237065秒**。初回の35件に、JSON置換と新冒険の同一ID回帰2件を加えたもの。独立QAで把握した重大残件は0。確認済み対象を固定するため、改行変換なしのgit blob値を以下に記す。

|対象|git hash-object --no-filters|
|---|---|
|js/app.js|2dbd2637f3b1c36d0f648c7c3f8bc860aebb7434|
|js/rpg-ui.js|4cfe3ad3d98412544b02a625bf8dec3dc6cb94cb|
|tests/encounter-routing.test.mjs|d5511f009fb27437038607d38e807373d9b6b458|
|tests/encounter-intro.test.mjs|9e1529c7262145bd1dabe9a51388803d021679f4|

公開反映とブラウザー確認は親の記録へ統合する。非対象の全テストや実機をこの37件から成功扱いにしない。

実機スマホ・人間の面白さ/理解度の実証はこの担当では未実施。
