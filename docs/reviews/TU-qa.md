# T/U 最終独立QA

担当: qa_reviewer / mobile_qa、2026-10-23。AGENTS/PRODUCTION/CONTRACTS/WORKBOARD/DECISIONS、agents/qa_reviewer、T-02、U-01、U-02/03を確認した。編集は本報告のみ。製品・テストの変更、子孫作成、ブラウザー操作なし。

## 結論

野外戦闘と砂漠の敗北・復活を実engineで独立検算し、学習XP・教材資金・工程・装備を失わず、CH-0教会から元の依頼へ戻れることを確認した。統合後の関連37テストは成功。appのメニュー、戦闘後の行先、教会の再読込み/退出、旧座標補正を読取り、要点は実app関数を抽出した自動実行でも確認した。

確認した静的・自動の範囲で、再現可能な重大残件は見つからなかった。新しい公開版での一周・媒体取得・実機・実利用者の理解/面白さは、この役の合格範囲には含めない。

## 実行した限定テスト

```text
node --test tests/rpg-field.test.mjs tests/rpg.test.mjs
22 PASS / 0 FAIL / 560 ms

node --test tests/rpg-field.test.mjs tests/travel-navigation.test.mjs tests/rpg-world.test.mjs tests/rooms.test.mjs tests/world.test.mjs tests/world-controls.test.mjs
37 PASS / 0 FAIL / 7,803 ms

node --check js/app.js
成功
```

二つの実行はrpg-fieldの8件が重複するため、59種類のテストとは数えない。全suiteは親の担当。

## 金融・敗北・復活の独立検算

既存テストとは別のNodeプロセスで実dispatch/parseSaveを使い、期待値は次の固定値としてassertした。製品のダメージ関数で期待値を作っていない。

|初期装備で砂漠の初手|独立計算|実際|
|---|---|---|
|こうげき|攻撃7−敵防御8→最低1、敵HP220→219。敵攻撃90−防御2=88|敵HP219、被害88→敗北|
|まもる|敵HP220のまま。ceil((90−2)/2)=44|敵HP220、被害44→敗北|
|強打|攻撃7−敵防御8＋強打4=3、敵HP220→217。敵被害88|敵HP217、被害88→敗北|

各ケースでtown:CH-0 / currentChapter CH-0 / 屋外19,16 / HP32を確認。コイン0・XP0、金融全台帳、rewardEvents、questStates、mastery、inventory、旧equippedItems、phoneState、activeQuestKey、selectedRouteは敗北前と不変。復活eventは1件。JSON往復で同じRPG状態となり、同じbattleId/turnの再実行は拒否された。

別の検算ではPR-01とLV-01の両方を受注し、LVの3工程後にCH-6の砂漠で敗北させた。CH-0での再開候補はPR、CH-6の候補はLVと分かれ、元activeQuestKeyとLVの次の工程を保持。CH-6→ACCEPTで元のLVへ再開でき、金融や学習をやり直さない。

既存の新規fieldテストでは、野道の全7章初勝利合計111枚、鉄剣60＋防具50の購入後1枚、攻撃14・防御6も確認済み。コインは初勝利だけで再戦・逃走・再読込みで増えず、金融の円/ポイント/Mock資産と交換しない。

## app統合の独立確認

実appの1行関数を読み取り、実engineと表示用の最小代替オブジェクトへ接続した。これは実DOM・PointerEvent・ブラウザーのEscape動作を再現した確認ではない。

- メニューを開くとworldControls.stop、同じ既存modalを使用。開いた状態で実global keydown処理へArrowUpを渡すと背後のwalkは0回。閉じるとaria-expanded=false、adventure-menu-toggleへpreventScroll:trueのfocus復帰。開閉前後のstate/XPは不変。今回、新しい別dialogに既存の移動ガードが効かない問題は持ち込んでいない。
- 実revivalPending/wakeAtChurch/leaveRoomを、LV途中の砂漠敗北・JSON復帰後のstateへ接続。教会へ表示→退出→JSONを3回反復し、復活eventは1件のまま、退出時のRPG_TRAVELで復活待ちを消費、屋外19,16を保持。元のLV/XP/金融は不変。
- travel-navigationの実app関数テストで、案件戦闘の逃走は道へ、field勝利もworldへ戻り、最後の受注案件のスマホを勝手に開かないことを確認。通常の門番勝利だけはその案件へ続く。
- 同テストで野道の初回4成功歩・以後20歩、砂漠逃走後8成功歩の猶予を確認。walkExpeditionは移動成功時だけ歩数/遭遇判定へ進むため、壁への入力を成功歩に数えない。
- 旧保存の噴水/新しい建物/水/木の中の座標は、安全な町の12,16へ表示位置だけを補正する。扉と教会前19,16は補正対象から除外。XP・コイン・学習を追加しない。全7町の扉/店/南門への到達テストも成功。

## 表示・経路・保存の静的根拠

|対象|確認した接続|
|---|---|
|地図が主画面|town/room/expeditionは短いexplorationObjective→canvasとcontrolsの同じstage。常時7ナビと長いミッションはメニューへ移動|
|狭い画面の比率|exploration-stageの幅を高さにも応答させ、canvas25:18を縦横一緒に縮める。切取りやobject-fit余白による人物クリックのずれを追加しない|
|メニューと戦闘|activeでは「戦いへ戻る」と「設定・保存」。navもcombatを優先し、engineもBATTLE_ACTION/SETTINGS以外を拒否。メニュー開閉は行動token/HPを消費しない|
|長押し破棄|renderで旧worldControls/operationGuideをdestroy。会話/メニュー開始はstop。既存controlsのcancel/非表示/DOM除去/複数指テスト成功|
|スマホの上部|game-barはsticky。後読みのexploration.cssがcurrent-operation/action-group/complete-panelへscroll-margin-top:72pxを指定し、元の12/16pxを上書きする。実画面での完全な見切れなしは親が最終確認する|
|教会の繰返し|field敗北のbattle-action lostが最後の場合だけ復活待ちを導出。reloadでchurchを表示し、退出の既存TRAVELを境に再表示しない。新しい保存フラグなし|
|教会の通常訪問|神官名はミルへ統一。全回復の台詞は実HP=maxHP時だけ。通常訪問でHPを自動補充した、という誤表示をしない|
|地形|7町/7洞窟のID・位置を維持。山脈・峠、危険を告げる脇道、歩行可能な砂漠。道を歩く順と、直接の章選択の自由を混同しない|
|報告|story-guideは未報告の完了案件をCH-0の次章案内より先に判定。室内のお礼後は最新guideを取り直し、旧参照のお礼ループを避ける|
|保存|schema3/保存キー/818工程/固定XPは維持。fieldは既存rpgのbattle/attempts/defeatedIds/eventLogとjournalだけで再生。途中資金や未受講の判定をworld/menuへ移さない|

## 親の実ブラウザー証跡として受領した値

この役はブラウザーを操作していない。以下は親の結果。

- T版390×844: canvas y139 / bottom401、pad bottom613。
- T版320×720: canvas y137 / bottom354、pad bottom540、キー56px、横overflow0。
- menu Escape後のfocusはadventure-menu-toggle、scrollY0。
- 統合後ローカル320px: 無受注で4歩→野道の初回遭遇、戦闘4行動の下端622<720、menu/Escape/overflow0。
- 旧公開c1cab3aの一周はPR12完了67XP、受注後world8歩＋cave11歩→門番2操作→帰還→家で上3歩＋会話による報告を実行。報告前にCH-1が案内される不整合を実証した。この旧公開結果を、修正後の公開一周の成功とは扱わない。

新しいUI/地形/復活を含む公開後の一周、公開媒体の取得、コンソール、実機は親の残る確認と区別する。

## 確認版

2026-10-23、基準c1cab3a以降の共有作業差分。engineはU-01確定後の同版。appは町の便り・神官名等の親の最後の表示修正まで再読した。

```text
js/app.js               9e2c7c4bd857ed2d8b0261adb0db54da75d6b347c91064aabbcfa61fd7d0c2e4
js/rpg.js               70265ddacb0ae1500f7273fede2464bd4abe3ed8c85eb843425f4ebdd9eee398
js/engine.js            6b4b83a470e19fbd99dba48fa79084a5da366b89d801c0c9a2df2ba3c71844c8
js/rpg-world.js         7ecf2575d5b9dff1ae73a5031822aae1244645a8d1ae4aedea1814b5c04cdfdf
js/rooms.js             e04ed0452a0b07c6e12f5476b9ca407a2ffa0f8510ae53b6073cf2feff535956
styles/exploration.css  571e213b9600f0e34682f182284cbbeb57d86845c57a62731a76f216f9de9002
```

未確認: 物理iOS/Android、実際の指による長押し/スライド、仮想キーボード、全818工程のUI通過、実利用者の理解・面白さ。AIの自動操作やコード上の合格から「小6でも絶対迷わない」「面白いと実証した」とは判断しない。
