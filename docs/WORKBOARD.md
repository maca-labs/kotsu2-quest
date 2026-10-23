# 制作状況 — 2026-10-23

親統合: /root。既存100tests版から追加。制作packは既存指示なしを確認して導入。共通契約はCONTRACTS.md。子同時最大3、各ファイル単一所有。製品保存版を運用版から変更しない。

|ID|任務/役|状態|編集範囲・証跡|
|---|---|---|---|
|KQ-000|親:環境/既存コード/2spec/pack確認|integrated|既存100tests、pack2spec SHA一致、上位/下位AGENTSなし。Beauty_photo本体未変更|
|KQ-010|quest_designer:最初の一周と追加体験|integrated|docs/reviews/KQ-010-quest.md、PR12→手帳→PO19→148XP/章印なし|
|KQ-011|learning_reviewer:言葉/操作/導線|integrated|docs/reviews/KQ-011-learning.md、PR最後外側戻ると利用条件・メール先出しを修正対象|
|KQ-012|finance_reviewer:固定例/追加数理|integrated|docs/reviews/KQ-012-finance.md、既存100PASSと別計算、新フォーム文字列不具合を修正対象|
|KQ-020|親:最小契約確定|integrated|docs/CONTRACTS.md、保存/既存固定式維持・追加独立scenario|
|KQ-030|engine_engineer:追加台帳/保存/選択|integrated|docs/reviews/KQ-030-engine.md、新33tests＋時計境界修正|
|KQ-031|phone_engineer:追加教材/スマホ|integrated|docs/reviews/KQ-031-phone.md、176工程と板・決済履歴の表示|
|KQ-032|world_engineer:反応/村人/長老|integrated|docs/reviews/KQ-032-world.md、40tests、確定後の古い発言補正|
|KQ-040|学習/金融/QA独立確認|integrated|KQ-040-learning/KQ-041-finance/KQ-042-qa、指摘7件と本文表示修正を担当へ戻し再確認。重大残件0|
|KQ-050|playtest_analyst:観察の区別と手順|integrated|docs/reviews/KQ-050-playtest.md、実参加者0、仮説と観察計画|
|KQ-080|親:ブラウザー/回帰/納品|integrated|全162tests PASS、352本編+121復習UI操作、旧642保存UI復元、320/390px、docs/extension-verification.md、README|

自動検証・ブラウザー・人間観察を混ぜない。基準版の既存100テスト成功は追加の合格を意味しない。

KQ030 /root/engine_engineer、KQ031 /root/phone_engineer、KQ032 /root/world_engineer が同時実装。初期3役の結果回収済み。基準の全642工程/6章印/旧XP2785をtests/fixtures/pre-extension-v3.jsonへ固定。

KQ060 最終quest_designerレビュー完了、軽微な旧FI再受注入口も修正・再確認。新176工程/35区切り/20町変化の実装と固定報酬を維持。最終阻害残件0、実参加者0。詳細はdocs/extension-verification.md。


## スマホ幅・初心者導線の公開後確認 — M / 2026-10-23

基準公開版011eab3。子は最大3、レビュー役は製品編集なし。親が公開IAB 390×844で操作し、実人間・実機との区別を維持する。

|ID|任務/役|状態|編集範囲・証跡|
|---|---|---|---|
|M-01|learning_reviewer: 初出語・照合・序章後|reviewed|docs/reviews/M-01-learning.md。コード必須に見える主導線、FI確認票欠落、DX三点照合欠落|
|M-02|qa_reviewer: 狭い画面と相談|reviewed|docs/reviews/M-02-mobile-qa.md。公開390×844で場面224px固定と次欄y834/h46を親が実測|
|M-03|quest_designer: 開始と復帰|reviewed|docs/reviews/M-03-quest.md。初回町入口から受注→再読込で開始画面へ戻る分岐を親も再現|
|M-10|phone_engineer: FI確認票・DX三点|integrated|js/phone-funding.js、js/phone-extension.js、専用CSSとテスト。金融処理は変更しない|
|M-11|world_engineer: 相談の題名と復帰|implemented|docs/reviews/M-11-world.md、41tests PASS、相談題名参照とstate不変|
|M-20|親: UI統合・実ブラウザー・公開反映|integrated_published|app/styles/README/運用docs。公開URLで再開・矢印・動画を確認。工程・固定XP・保存版不変|
|M-30/31|quest/world: ミッション・家・十字キー|integrated|M-30-story/M-31-controls、家の出入と章別ミッション、64px長押し操作|
|M-32/33|learning/QA: 世界導線の独立確認|integrated|M-32-learning/M-33-qa、旧保存・徒歩到達・報告復帰|
|M-40/41/42|quest/phone/learning: ナレーションとコピー|integrated|36教材の説明、対象メール識別、貼付前空→実draft、独立再確認|
|M-50/60/61|phone/quest/QA: 矢印と最終確認|integrated|実対象の装飾、販売所/板5工程の矢印修正、review/ボス除外|

M最終自動212PASS/0FAIL。親の実ブラウザーはPR12+PO19+DX18+KYC1+FI3+切替1の54工程、320/390/430幅、約30秒の実画面お手本を確認。詳細docs/mobile-verification.md。実機・人間理解/面白さは未確認。公開反映前に、利用者の追加RPG要求（R）を同じ完成版へ統合する。

## 野外・洞窟・旅戦闘の追加 — R / 2026-10-23

|ID|任務/役|状態|編集範囲・証跡|
|---|---|---|---|
|R-01|quest_designer: 町→野外→洞窟→教材→帰還|integrated|docs/reviews/R-01-rpg-design.md、製品編集なし|
|R-02|engine_engineer: 戦闘・装備・店と保存|integrated|js/rpg.js、engine.js、tests/rpg.test.mjs。金融資金/固定XPは不変|
|R-03|world_engineer: 全7町/洞窟の世界地図|integrated|js/rpg-world.js、styles/rpg-world.css、tests/rpg-world.test.mjs|
|R-04|phone_engineer: 旅戦・購入確認・装備UI|integrated|rpg-ui.js/CSS/tests、R-04-rpg-ui.md|
|R-10|親: UI・受注/再開・戦闘・店の統合|integrated_published|app/入口/README/共通契約。PR12+PO19をローカル実操作。公開版でも徒歩・門番戦・購入済み装備の保存復元・再開を確認|
|R-11/12/13|quest/finance/QAの独立確認|reviewed|R-11-flow-review/R-12-finance/R-13-final-qa。指摘を親へ返し、修正後再確認|

R最終242PASS/0FAIL。実ブラウザーと未確認の範囲はdocs/rpg-verification.md。M/Rは公開反映済みで、公開後の確認はdocs/PUBLISHING.mdへ記録。実人間の面白さ観察は未実施。

## 探索主画面・公開一周・野道追加 — T/U

|ID|担当/任務|状態|所有と証跡|
|---|---|---|---|
|T-01|quest_designer:一周と反復|integrated|story-guide/同test、PR報告→次町を修正、T-01-round-review|
|T-02|QA:縦積み原因とmenu条件|reviewed|T-02-layout-review、親公開390実測地図y1217|
|T-03|learning:次行動と意味|reviewed|T-03-learning-review、人間観察とは区別|
|T-10|world:地図先頭CSS|integrated|exploration.css/T-10-layout、親320/390測定|
|T-20|親:メニュー/一周/公開|in_progress|app/index/共通docs、公開旧版PR12+帰還報告一周済、新版再確認へ|
|U-01|engine:野道/砂漠/復活|integrated|rpg/engine/new field tests、担当22件成功、U-01-field-engine|
|U-02/03|world:砂漠/教会/山脈/衝突|integrated|rpg-world/world/rooms/担当tests|
|TU-QA|QA:独立再確認|reviewed|TU-qa、親ブラウザーとは分離|
