# U-01 — 野外遭遇・砂漠の強敵・教会復活

対象: 2026-10-23の公開後R版に対するengine差分。担当: engine_engineer。製品編集はjs/rpg.jsとjs/engine.jsのRPG switch、新規tests/rpg-field.test.mjsのみ。

## 結論と共通入口

`RPG_FIELD_START {kind:'road'|'desert',chapterId,encounterId?}`を追加した。世界地図上かつ現在の章と一致する場合だけ開始し、受注した案件がなくても野道の敵と戦える。任意encounterIdを渡す場合は固定IDとの一致を検証する。歩数や砂漠の座標判定はUI/world担当であり、本エンジンは座標や遭遇率を重複管理しない。

`getFieldEncounter(kind,chapterId)`は固定データを返す純粋関数。不正な種類/章はnull。IDは`field:road:CH-0..6`、`field:desert:CH-0..6`。既勝利は`state.rpg.defeatedIds.includes(enc.id)`、初回接触済みは`state.rpg.attempts[enc.id]`で導出できる。

新しい戦闘には`kind:'field'`、`fieldKind`、`recordKey:null`が付く。既存の案件戦闘の保存形・ID・敵・計算を変更しない。初勝利のみ野道12/12/15/15/18/18/21枚、砂漠24枚。再戦と逃走でコインを増やさず、学習XP・金融資金・工程・章印には触れない。武具の実効果は既存getBattleStatsを使う。

完全オリジナルの砂漠敵「砂暁のガルザドン」はHP220、攻撃90、防御8。初期HP32では攻撃・防御・強打のどれを選んでも最初の敵行動で敗北する。逃走は確定成功し、戦闘開始時にも逃げられる説明を残す。

field敗北はstatus:'lost'を残しつつ、town:CH-0へ移しHPを装備込み最大まで回復する。教会の屋外復活点はworld担当と合意した19,16（扉19,15）。`revive {battleId,mapId:'town:CH-0'}`と、その後の既存battle-action(status lost)が保存される。UIは最後のbattle-action lostを教会表示に使え、後続travel等を境に繰り返し演出を避けられる。既存案件戦闘の敗北は従来の同章の町・HP0・無料宿のまま。

装備、コイン、案件の途中工程、activeQuestKey、selectedRoute、XP、金融状態を復活で失わない。currentChapterのみCH-0へそろえ、chapterResumeKeyは町ごとの途中案件を返す。別章のactiveQuestを保持していても、CH-0の再開候補と別章の再開候補を混ぜない。

保存schema3、RPG version1、保存キー、既存ID・固定XPは維持。新たなルートstate項目は追加せず、既存attempts/defeatedIds/battle/eventLogへ記録し、journalから再構成して不正な残高・敵・fieldKind・報酬を拒否する。

## 実行した確認

`node --test tests/rpg-field.test.mjs tests/rpg.test.mjs`: **22件PASS / 0FAIL**（新規8、既存14）。

- 無受注で野外戦闘開始、装備込み攻撃と被害、途中JSON復元、古いturnの再実行拒否、初回12枚・再戦0枚。
- 7章の固定報酬合計111枚。店で鉄剣60枚と防具50枚を買い装備後、残り1枚、攻撃14・防御6。金融資金・学習XPは不変。
- 野道/砂漠とも必ず逃走可能。報酬・工程・資金・HPを変更しない。
- 初期状態で砂漠の攻撃・防御・強打を個別に試し、いずれも初手敗北→教会・HP32へ復帰。再読込後も同じ結果、二重行動を拒否。
- 装備購入済み・PR-01/LV-01双方受注・LV途中入力の状態から砂漠敗北。装備/コイン/両案件/入力/学習/資金を保持、CH-0とCH-6の再開キーを分けて復元。
- 通常野道の敗北でも教会へ復活し、旧案件戦闘の従来の敗北挙動は既存テストで保持。
- 非world/別章/未知種/偽ID/戦闘同時開始を拒否。敵攻撃力・報酬・coins・eventLog・fieldKind改ざんとRPG削除をJSON読込みで拒否。
- 旧642工程セーブを読み、既存金融・報酬・工程を変更せず野外戦闘開始/逃走/JSON往復。

全回帰も作業中の共有ツリーで実行し251件中250PASS/1FAIL。唯一の失敗は、world担当の教会追加中に既存tests/rooms.test.mjsが家を3件固定と期待し、実際4件になった点。親へ報告済みで、最終統合版の全回帰は親が改めて行う。担当22件の合格を最終全体合格へ読み替えない。

## 未確認と統合の条件

ブラウザーの歩数・遭遇頻度・砂漠への導線・教会室内表示・戦闘後ボタン・公開反映は本担当では確認していない。実機と実参加者の面白さ観察も未実施。親がUI/worldを統合し、独立QAが再現/保存/復活を確認する。エンジン担当はこれ以降、割当ファイルの所有権を親へ返す。
