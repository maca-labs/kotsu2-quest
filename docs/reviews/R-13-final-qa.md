# R-13 納品前の独立QA

担当: qa_reviewer / mobile_qa、2026-10-23。AGENTS.md、agents/qa_reviewer.md、CONTRACTS/DECISIONS、R-02、R-04、R-11、R-12を確認。編集は本記録のみ。製品コード・テストファイルを変更せず、ブラウザーも操作していない。

## 結論

新RPGの戦闘・地図・UIに関する既存26テストは成功、失敗0。R-11の修正5件とR-12の独立金融合格を読み、新しい装備表示修正とapp統合を確認した。

今回、初回の章ハッシュURLで見た目の章とRPGの現在地がずれ、家への移動が拒否される問題と、ハッシュで戦闘復帰表示が上書きされる問題を発見した。親へ返し、初回/変更時の両経路の修正後に実appの処理と実engineを接続して再確認、解消済み。確認した静的・自動実行範囲では、新たな重大残件はない。

これは公開前のQAであり、物理スマートフォン・実利用者の理解/面白さ・全818工程のUI完走を合格にするものではない。

## 実行した関連テスト

```text
node --test tests/rpg.test.mjs tests/rpg-ui.test.mjs tests/rpg-world.test.mjs
26 tests / 26 pass / 0 fail / 0 skipped / 9,256 ms

node --check js/app.js
成功
```

全238テスト成功は親の結果として受領した。本役が全suiteを重複実行した結果とは扱わない。

関連テストは次を確認する。

- 7町・7洞窟への到達、入口と安全な帰路、全洞窟の3つの門と床の到達、衝突、カメラ境界、有限座標の描画。
- 装備込みの実HP/攻守、通常攻撃/防御/1戦1回の強打/逃走、予告とダメージ、古いbattleId/turnの拒否。
- 初勝利だけの固定コイン、再戦の二重報酬防止、敗北・無料宿・再挑戦。
- 店の確認→購入→別の装備操作、残高不足・二重購入・未所持装備の拒否、装備後の実ダメージ変化。
- RPGを操作しても教材金融台帳・固定XP・学習記録・章報酬が変わらないこと。
- 戦闘途中のJSON往復、RPGのコイン/HP/turn/敵HP/装備/イベント改ざん・欠落の拒否、旧642工程保存への無報酬補完。
- 複数受注・HY-EXIT経路別の実recordへの同期、戦闘中の別mutation拒否とSETTINGS許可。

## 独立したapp統合確認

ブラウザーではなく、最新app.jsの対象関数/イベント処理を抽出し、実engine/rpgと小さな表示用代替関数で接続して実行した。製品の期待値関数を流用して期待値を作らず、下記の結果を固定値としてassertした。実DOMのフォーカスや画面寸法を再現したものではない。

### 図鑑と武器名の修正

実engineでPRの門番と最終敵に勝利し、27コインから銅剣24枚を購入して装備。そのstateで、実appのrenderInventoryとgearNameを実行した。

- 武器名のタグは「武器：こだまの銅剣」。
- 旧旅人の杖の図鑑カードは「装備中」ではなく、押せる「装備する」。
- getBattleStatsのitemIdsと図鑑の装備判定が一致。表示しただけではstateを一切変更しない。
- 武器優先を購入品→既存報酬武器の順にし、上部の実戦装備と下部図鑑の矛盾を解消している。

### R13-01 初回章ハッシュとRPG現在地の不一致 — 解消

- 優先度: Major。章へ直接入る既存URL経路で主要な家入口を使えなくなる。
- 仕様根拠: 全章自由移動、家→依頼の接続、途中保存の復帰、現在地の一貫性。
- 修正前の再現: 初回に`#CH-5`を開く。appはstate.currentChapterだけCH-5にし、rpg.locationはtown:CH-0のまま。家に入る処理のRPG_TRAVEL town:CH-5が、異なる章への直接移動として拒否された。
- 実際の再現証跡: 修正前appの初期ハッシュ処理を抽出して実engineへ接続。表示CH-5/現在地town:CH-0と、RPG_TRAVELの「世界地図から」拒否をassert。
- 期待: 初回URLでもCHAPTERの正式な経路を通し、章とRPG現在地をそろえる。学習・コインを追加しない。
- 修正: 親が初回有効ハッシュをact(CHAPTER, render:false)へ変更。戦闘中はハッシュによる初期表示の変更を行わない。
- 修正後: CH-0/CH-5/CH-6をそれぞれ新規stateから処理し、currentChapterとtownの一致、家に相当する同町移動の成功、JSON往復成功をassert。合格。

### R13-02 ハッシュ変更が戦闘の復帰表示を上書きする — 解消

- 優先度: Major。戦闘記録は残るが、再開した戦闘の操作画面から離れる。
- 修正前の再現: 戦闘途中の保存を`#CH-5`付きで再読込みする。冒頭で選んだcombatを初回hash処理がworldへ上書きする。hashchangeの無効ハッシュ側もhomeへ直接変更していた。
- 実際の再現証跡: 実engineでPR戦闘を開始→parseSave→修正前app初期処理。battle.statusはactiveのまま、ui.viewだけworldになることをassert。
- 期待: active戦闘は初回・有効/無効のハッシュ変更よりcombat復帰を優先する。記録や戦闘turnを変えない。
- 修正: 初回はactiveなら処理を飛ばす。hashchangeはactiveならcombatを描いてreturn。非戦闘時、有効章はCHAPTER、無効はnav(home)へ統一。
- 修正後: 初回active保存＋#CH-5でcombat/元章/洞窟を維持。実hashchange callbackを抽出し、activeで#CH-5と#invalidの両方ともcombat・RPG commandなし・state不変、非戦闘で#CH-5はCHAPTER経由の章/現在地同期、#invalidはnav(home)をassert。合格。

## 静的接続と重要な保持条件

- worldControlsは移動だけで全画面を作り直さず、地図キャンバスを更新する。入室/出室/エリア切替/戦闘への遷移でrenderが旧controllerをdestroyする。会話開始もstopする。
- entryEncounterは未完了かつindex0の受注だけ。R-11の旧途中・完了の巻戻り修正を維持。
- 門番戦は対象encounterのrecordKey/routeをengineで同期し、継続は保存されたbattle.recordKeyを優先する。meetGateは敵がまだ出ない区間でも同章の保存済み依頼を再開する。
- 進捗戦を逃げた記録は既存RPG eventLogから導出して自動再提示から外し、地図の再挑戦は残す。学習のSTEPや章ボスを旅戦闘へ置き換えていない。
- PR最終は最後のSTEP成功後、町へのRPG_TRAVELを通す。手帳・67 XPを前倒し付与しない。
- コイン・HP・購入品はstate.rpgに独立。金融教材の円・ポイント・Mock資産との換算や流用なし。
- 必要な818工程、通常34依頼794工程＋追加24、固定XP、章ボス・章印、未受講ラボの扱い、保存キー/schema3/contentVersionを継続。RPG独自履歴は旧保存に未操作の初期値だけを補完する。

## 親のブラウザー実測として受領した結果

以下は親の実行報告であり、この担当のブラウザー確認ではない。

- 村→世界6歩→洞窟11歩→門番戦→PR-01全12工程→手帳・67 XP・町へ帰還。
- 戦闘途中の再読込み、再入洞で最終敵→27コイン→24枚の銅剣→残り3枚、攻撃7から10へ変化。
- 世界を13歩進んで別章の町へ移動。
- 第1章門番で防御の被害2、13工程の進捗戦、逃走して学習の14工程目を継続。
- UIの320/390 CSS px幅。

修正後ハッシュの実ブラウザー確認と最終公開URLの確認は親が別途行う。この文書の自動確認を、その実画面結果へ読み替えない。

## 確認した版

26テスト時、engine/rpg/UI/worldの4ファイルはR-11/R-12の安定版と一致。その後、親の装備表示・ハッシュ修正をappで再確認し、最終hashを以下へ更新した。

```text
js/app.js       931d39cff9f67623a4c37307809b4e5303a018172bbcea3744b7036f57d82170
js/engine.js    476c38ec6d5266cb32c4a594d7a28631618c57a3c4372c7374d6ef41c5d2504c
js/rpg.js       8c3d2a69db68ad75387c3adc9c5419433ecd3416d167a0b6fc74f46201eae425
js/rpg-ui.js    e429036b40eb5704f5c3f5b2a27bd59f78e2a9208826c062091208fe617da5f7
js/rpg-world.js 0e67ee420082db65afce7dbf3728504e73041502d14574800e917d3fd1211357
```

未確認: この担当の実ブラウザー操作、物理iOS/Android、指での長押し/スライド、仮想キーボード、全818工程のUI完走、実利用者の理解・面白さ、公開後の媒体取得と動作。実利用者の「案外おもろw」「またやりたい」は未実証。重大残件なしという判断は、上記の対象と証跡の範囲に限定する。

## 公開確認後の再開入口の追記

親が公開版で「門番に勝利した直後、まだ0工程のまま再読込み」を実行し、洞窟の入口へ戻った後にスマホを開くには奥まで歩き直す必要があると発見した。親はrenderExpeditionのミッションカードへ、入口の敵が不要・現在の依頼あり・未完了の場合だけ「いまのスマホ練習へ」を追加した。押すと既存resumeFromChapter(state.activeQuestKey)を使う。

このQA担当は修正版の実appのrenderExpeditionのミッション描画部分、entryEncounter、resumeFromChapter、startQuest、openQuestPhoneを抽出し、実engine/rpgへ接続して別Nodeプロセスで再確認した。表示部は最小の代替オブジェクトを用い、ブラウザーを操作したとは扱わない。

- 門番未勝利・index0: ボタンなし。門番を飛ばす入口を増やさない。
- 門番勝利→JSON往復・index0: ボタンあり。押すとphoneへ戻り、同じactiveQuestKey/questStatesを保持する。
- 門番勝利→1工程→JSON往復・index1: ボタンあり。同じ保存済み工程からphoneへ戻る。
- 全12工程を終えたPR→JSON往復: ボタンなし。完了した依頼を未完了扱いにしない。
- 再開ボタン前後でSTEPのjournal件数、rewardEvents（XP）、financialScenarios、rpg、questStatesはdeepEqual。既存ACCEPTによる再開を使い、工程・XP・コインの追加や入口戦のやり直しを発生させない。

上記4条件の独立実行は成功、失敗0。担当は製品コードを変更していない。今回の追記版app SHA-256は `b76c39f40893353207d42c32612e2605aecc8b32b7361f94a2dbf3c75e389f7c`。以前の26テストや当初のapp確認版と、この再開入口の追記版を同一の証跡にはしない。追加公開反映と公開後の画面確認は親の担当。
