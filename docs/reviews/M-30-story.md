# M-30 ストーリー付きミッションガイド

実装したもの：町の最上部へ出す「いまやる一つ」の読み取り情報。始まった理由、困っている人、次の行動、完了の見通しを1主ボタンへまとめる。家へ入る/室内NPCに話す/出口へ戻る画面とCSSは親が統合する。

変更範囲は新規js/story-guide.js、新規tests/story-guide.test.mjs、本書のみ。工程ID、XP、金融台帳、保存版、既存の学習条件は変更していない。AGENTS、PRODUCTION、CONTRACTS、quest_designerの役割と親からの最新の家/室内の指示に従った。孫なし。

## 接続契約

`getStoryGuide(state,{chapterId?,view='world'})` は純粋関数。dispatchやstorageを呼ばず、既存quest/step/journalとgetAdventure/questBrief/chapterResumeKey等を読む。

返却：eyebrow/title/story/instruction/actionLabel/action、milestones（labelとdone/current/later）、controlsHint、houseName。対象がある場合はquestId/client、再開/報告の場合はrecordKey/routeIdも返す。ID類は親の接続用であり画面の説明文には出さない。

|主行動|親の接続先|
|---|---|
|house / id client / questId|家へ入り、対象questの依頼人へ話す。報告時はactionにもrecordKey/routeIdを持つ|
|resume / id 保存キー|resumeFromChapter(id)。HY-EXITの経路別記録をそのまま使う|
|chapter / id 章|好きな章へ移動。初回homeは序章を推薦するが、別章の選択を閉じない|
|boss / id 章またはhidden|既存の章試練/隠しボスへ|

室内の家名はhouseName、人物名はclient/questBriefを使う。HY-EXITの報告は現在選択している道ではなくstate.questStates[recordKey]のcompletedを読む。別の道へ切り替えても、報告のためにselectedRouteや金融台帳を変更しない。

## 主な分岐

- 初回の推薦：序章→郵便屋の家でミナの困りごとを聞く。家の扉と地図下の同名ボタンを説明する。
- 受注中：その章の中断記録を優先。「次の操作：…」と、入力が残ることを説明してスマホへ戻す。別章の中断作業へ誤送しない。
- 序章完了：既存の旅人の手帳を確認する流れの後、第1章の商店へ。別章を選ぶ余地も示す。
- 案件完了：未報告なら、その章の依頼人へ結果を知らせる案内を主行動にする。別入口の受注はロックしない。
- 章の終点：通常クエストと報告後は既存の5課題へ。章印/装備を先に与えず、章試練後に次の町を示す。
- 第5章：DX登録→DX本人確認→FI円の入金へ案内。FIは申込済み設定の別窓口/別財布と明記し、まだ運んでいないお金を現在残高として説明しない。
- 第6章：選んだ1ラボまたは見送りの道と帰りの受取、章試練。未選択のラボを学習済みにしない。6章印で任意の虹の守護竜へ案内する。

報告済は追加fieldを作らず、対象questの最終STEPより後にある同章NPC index0の会話をjournalから読む。候補はactiveだけでなく章内の全完了recordから最終STEP順に選ぶため、別章へ寄り道して再読込しても報告先を失わない。途中の受注記録がある場合は、そのスマホを優先。章ボス前の古い報告を再要求せず、章ボス後に新しく終えた任意講座の報告だけは残す。

## 実行した確認

コマンド：`node --test tests/story-guide.test.mjs`。最終実行10件すべてPASS、失敗0。

初回推薦と他章のhouse入口、凍結stateの不変性、中断/JSON再開、PR12と既存67 XP/手帳、別NPCから紹介された有効な序章経路、未報告/報告済、別章への寄り道/再読込、途中受注の優先、章ボス前後、DX→FI、見送りと選択ラボ、経路別HY-EXIT再開、旧章クリア後の追加講座報告、spot出口完了後にhlpへ切替えた報告を確認した。説明表示やNPC再会話から、新しい工程/依頼XPや資金を発生させない。

独立学習レビューM-32から返された報告の保持、家名の一致、経路別出口の記録キーを接続へ反映した。親の室内/ボタン実装とブラウザー確認は、この単体テストの実施結果へ混ぜない。

## 最終対象

- js/story-guide.js SHA256 459b7f98ffa77a6ab759bcea6137ac610d1a3a73a357b374fb67d3ac8a6a3924
- tests/story-guide.test.mjs SHA256 072d8e79e7a1df4f0980135774c45c5115dc648f5e75a6ab7ccb1587c8edff6a

未確認：この任務でのブラウザー実操作、スマホ実機、人間プレイ観察。実参加者0人。初見の目的を見失いにくくする実装であり、小6が理解した/面白くなったという効果の実証ではない。
