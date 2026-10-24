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
|T-20|親:メニュー/一周/公開|integrated_published|travel5公開、旧版と新版のPR12一周・報告・武器購入・砂漠/教会・320/390確認、travel-verification|
|U-01|engine:野道/砂漠/復活|integrated|rpg/engine/new field tests、担当22件成功、U-01-field-engine|
|U-02/03|world:砂漠/教会/山脈/衝突|integrated|rpg-world/world/rooms/担当tests|
|TU-QA|QA:独立再確認|reviewed|TU-qa、親ブラウザーとは分離|

T/U最終261PASS/0FAIL。公開版の受注→街道→洞窟→戦闘→12工程→帰還→報告を実操作し、砂漠敗北/教会復活と装備・XP保持、最終色/出口修正も公開で確認。実機/実参加者の面白さは未確認。


## 看板位置の修正 — V

V-01 親: 旧看板の扉重なりを解消し共通ラベルへ移行。world/rooms/index/運用docsを担当。独立レビューはtavern_sign_review、製品編集なし。ローカル/公開画面の再確認へ進む。

V-02 world/UI: encounter_intro_ui が js/rpg-ui.js・styles/rpg-ui.css・専用testを所有。敵登場・押下解放・新規操作だけを受理し、親がappと配信入口を統合。
V-03 QA: encounter_input_review が入力境界/復帰経路を独立確認。製品コード編集なし。V-01と合わせてローカルと公開で確認する。

V統合: V-01看板レビュー合格、V-02提出、V-03独立37件合格・重大残件0。QA発見の同一ID再利用を修正し、全277テスト成功。公開の反映/実操作確認中。

V公開: sign-intro6のPages成功と公開320/390実操作を確認。開始dblclickはターン1に留まり、明示guard後のreloadはターン2、67XP/0coin/攻撃10を維持。詳細sign-intro-verification。全277PASS、独立QA重大残件0、実機/人間観察は未実施。


## 戦闘演出 — W

|ID|役/担当|状態|編集範囲・受入|
|---|---|---|---|
|W-01|world:encounter_intro_ui|implementing|rpg-ui/CSS/newbattle-effects/専用test。攻撃/反撃/数字/消滅、軽減・破棄・実結果一致|
|W-02|QA:encounter_input_review|reviewing|独立報告のみ。重複・上限ログ・砂漠復活・途中復帰|
|W-10|親統合|implementing|app/index/共通docs/統合test。先保存・busy・公開確認|

W統合: W-01提出25件成功、W-02独立52件＋3ケース・重大残件0。全npm292成功。親ローカルで数字/反撃/overkill/消滅/途中reload/320位置を確認し、skip縦行を解消。公開確認へ進む。

W公開: W-01/W-10 integrated_published、W-02 reviewed。battlefx7の公開390/320で数字9/反撃3/強打13・敵消滅・reloadターン保持・再戦coin0・位置不変を確認。全292成功、独立QA重大残件0。詳細battle-effects-verification。


## 町名と町別の酒場 — X

X-01 world担当: rooms/getTavern/7町の短い看板と室内名を実装、rooms+world10件成功。X-02 QAは独立確認、製品未編集。親X-10はapp/UI相談/CSS/入口を統合。町の入口バナーは保存外・2800ms・操作を遮らず、場所が変われば破棄。固定HUDの現在地を拡大し、室内では町名も残す。公開/320/390確認へ進む。

X統合: X-01提出・X-02独立レビュー重大残件0。関連54テスト成功。親320/390で帰還/章選択/店内/相談/長い店名を実操作し、地図と十字キーの位置を保持。公開反映へ進む。

X公開: X-01/X-10 integrated_published、X-02 reviewed。town8の公開320/390で旅立ちの村/通貨の港の入町名、町の固定HUD、港バーしおかぜのメニュー/店内/相談の一致、横はみ出し0を確認。関連54件、独立38件と70UI導出ケース成功。詳細town-name-verification。実機と人間観察は未実施。

## 町ごとの建物・景色・酒場 — Y / 2026-10-24

|ID|担当|状態|編集範囲/受入|
|---|---|---|---|
|Y-01|world:desert_world|implementing|towns/world/world・towns tests、7町独自配置・海船・全入口到達|
|Y-02|world:encounter_intro_ui|implementing|rooms/rooms test、7酒場家具・衝突・扉対応|
|Y-03|QA:encounter_input_review|reviewing|独立報告のみ、固定座標残存・導線・復帰|
|Y-10|親統合|implementing|app/rpg-world/index/統合test/docs、可変配置操作・保存互換・狭幅・公開|

Y統合: Y-01/Y-02 submitted、Y-03 reviewed、親の全318テスト成功。独立61件と最終14件、28役到達・進行済保存17座標の再開も成功。親は320/390で7町/7酒場を実見し、港の新扉で歩行入退室を確認。石壁の右はみ出しを担当修正後に再確認。townscapes9の公開確認へ進む。

Y公開: Y-01/Y-02/Y-10 integrated_published、Y-03 reviewed。townscapes9を公開しPages39992286537 success。公開390の港と320の港バー/群島を実見、新扉での退出と再入店、67XP/0coin/HP36保持、警告/エラー0を確認。詳細town-variety-verification、全318ログ。実機と人間観察は未実施。

## 公開版の町歩行 — Z / 2026-10-24

|ID|担当|状態|範囲|
|---|---|---|---|
|Z-01|QA:encounter_intro_ui|reviewed|CH0〜2の全建物/酒場/狭幅をChrome実操作、排他1番|
|Z-02|QA:encounter_input_review|reviewed|CH3〜4と全町の迂回/経路、排他2番|
|Z-03|learning:exploration_layout|reviewed|CH5〜6と目的地/言葉/案内、排他3番|
|Z-04|QA:engine_engineer|reviewed|純粋性・台帳不変・退店保存境界・相談context、製品編集なし|
|Z-10|親統合|integrated_published|港の狭路NPC・家名/次方向表示・ルート選択の案内、検証と公開|

子のIABは利用不可だったため、利用可能なChromeで公開ゲームの別タブを順に開く。未実施をIAB確認済みにせず、UI実歩行と静的BFSを別に記録。港の南門→バー32歩、章開始→店29歩の大迂回と、家名が主指示にない点を指摘。ローカル修正後に公開反映し、該当条件を再確認する。

Z公開: 全7町29施設を担当分けし公開9で徒歩入退室・酒場相談を実施。walk10のJS bcb5bbea/入口4874fa66、Pages40039251281 success。港の道順は親の公開再歩行で店29→11・南門から酒場32→16（入室込み）。全7店の上部退出/上1再入を親とZ03で確認、CH0/1/2/4は退出→reload→上1再入も成功。Z03はCH5/6の可視家名/次方向だけで15/11入力の入室、運用見送りのソラ相談一致を再確認。320/390で横overflow0。関連69＋help12＝81成功、Z04の退店二段保存Majorは一回保存へ修正後再確認、重大残件0。詳細public-walk-verification。実機と人間の理解/面白さは未確認。


## AA — 公開一周と初心者想定操作 / 2026-10-24

|ID|担当|状態|所有・受入|
|---|---|---|---|
|AA-01|QA:encounter_input_review|reviewed|公開walk10/PR12全一周・復帰・重複、reportのみ|
|AA-02|learning:exploration_layout|reviewed|FX03入口欠落と寄り道の指示/矢印、reportのみ|
|AA-03|world:encounter_intro_ui|integrated_published|place-presentation JS/CSS/専用tests、6件成功|
|AA-04|beginner_player|reviewed_replay|履歴を渡さない初回/guide11再一周を分離、reportのみ|
|AA-05|QA:engine_engineer|reviewed|実engine/parseとapp境界、F01/F02修正後22件成功、製品未編集|
|AA-06|QA:deployment_verify|waiting_final|最終prepared treeとremote全blob/公開設定/Pages、read-only|
|AA-10|親統合|published_rechecking|phone-navigation/panels/guide/app/index/共通docs・guide11公開|

AA01は通常技術QAとして村→世界遭遇→洞窟門番→PR12→帰還報告を実操作、67XP/24coins/HP26/36/手帳を確認。JSONを通常UIで退避後、AA04が新規テスト冒険を開始。AA04の準備時に自身のタイムアウト作成tabが重複し閲覧ロックとなった件はブラウザー準備問題として区別、重複tabを閉じて再開。親はFX03のpointsアイコン欠落を修正し、寄り道復帰/確定へ矢印/場所名/話者を統合中。

AA統合後: 全350自動テスト成功、AA05独立QAのF01/F02は修正後解消。保存/818工程/固定XP/金融は維持。guide11をowner Chrome UIで公開、入口版Pages40076374485とtests版40076456880 success。AA04は公開320で新規0XP→受注/街道戦/門番/PR12/帰還報告67XP/24coins/HP26/36。必要な主操作12は維持し、初回の補助移動8→再確認0。これは同じAI役の再プレイで、実人間の学習効果とはしない。AA01が第3章入力/アプリ入口を追加確認中。証跡はfirst-loop-verificationとAA各report。

AA公開追試の追加修正: 別アプリfallbackの現在指示/実ボタン不一致とPR開始の画面外をAA01が再現。親75bf41e/guide12で文言/一意target/開始と動画の順序を最小修正、AA05独立12ケース・関連6件成功。最終全351 PASS/0FAIL。app f5d069f6/入口a4d86e91/追加test28c03ddbを公開、入口同SHAのPages40078686538 success。AA01が公開guide12該当条件を再確認中。

AA最終統合: dd38ea2/guide13、全351 PASS。AA01のChrome追試は応答せず未確認として返却、親fresh IABで公開320の開始/復帰を再確認。画面名と住所の混同も最小修正しAA05追加10分岐合格、公開guide13の同文target1/住所なしを確認。app5e4c5d29/入口e18323df、同SHA Pages40079442231 success。AA04の序章初回/再一周は完了、第3章追加は子IAB非対応で未実施。AA01/03/05は受入済み、AA04の確認範囲を分離、AA10はruntime公開済み。reports/docs保存後のAA06最終tree/Pages照合を納品条件とする。実人間の理解・楽しさは未確認。

## AB — 第3章の初心者想定一周 / 2026-10-24

基準main aff2444/guide13（AAの最終監査は全200blob一致、Pages40080108196 success）。

|ID|担当|状態|所有・受入|
|---|---|---|---|
|AB-01|ch3_beginner / playtest_analyst|replayed_guide14|履歴なし。画面だけで第3章基本3件のアプリ開始→帰還報告。AB01reportのみ|
|AB-02|ch3_learning_review / learning_reviewer|reviewed_regression_pass|語句/入力/押下/受注帰還の根拠、AB02reportのみ。初心者へ正解を渡さない|
|AB-03|encounter_input_review / QA|returned_unavailable_old_tab|旧own検証tab3178のclose/resetのみ。製品・ユーザーtab変更なし|
|AB-04|ch3_finance_qa / finance_reviewer|reviewed|金融68工程/確認4画面/不変/重複拒否、AB04reportのみ|
|AB-05|ch3_phone_copy / phone_engineer|integrated|fx-guidance.js/専用19testを親へ返却|
|AB-06|deployment_verify / QA|audited_210|最終tree全blob/Pagesの読取監査、AB06reportのみ|
|AB-10|親統合|published_verified|正規engine/parse済み開始JSON、観察回収、最小修正、再確認・公開。共通契約と製品の所有は親|

第3章の事前状態はSTART/章選択/初会話/条件メモ/FX01受注/門番勝利を正規dispatchで作成。最初の学習操作は未実施で、工程0/3XP/12コイン/HP29。通常JSON取込で準備し、事前区間を初心者役の学習済み・実操作実績へ含めない。基本50工程を省かず、任意売り18工程は選択と実施を別記録。Chromeは排他、未対応の子IABを前提にしない。

AB実施: AB01はChrome320×720で基本50工程＋3報告完了（最初の受注/門番は準備JSONとして分離）。AB02は学習レビュー＋旧敵再遭遇Majorを実再現し修正後7/7、関連43/43成功。AB03は旧tabの別セッション所有で取得不可を報告、fresh AB01 tab3191は正常に操作できた。AB04は金融68工程/途中復帰/重複拒否、最終4確認表示の独立検算と不変を確認。AB05 phone_engineerは表示専用fx-guidanceと専用19テストを実装、親へ返却。親はinput送信分離・自動遭遇共用・確認表示・説明/矢印/ナレーションを統合し全382 PASS。公開反映とAB01修正後追試を継続する。詳細ch3-verification。

AB guide14再プレイ: 基本50工程/3報告を完了し、旧敵による依頼巻戻しなし・依頼帳回復なし。追加の損益内訳カード4件はguide15に分離、金融担当が時点/固定式/実描画/状態不変23/23を確認。最終全383 PASS/0FAIL。Chromeバトンは最終配信と2画面限定追試で順に渡し、最終tree監査を待つ。

AB最終操作: guide14で初心者役の基本50再一周/3報告を完了。guide15限定2画面は子の接続不調で未実施として分離し、親fresh Chrome3207で公開320の実計算カード/次target1/overflow0を確認。元164XP/48coins/HP20の保存を通常UI復元、親viewportreset/新tabclose。残る子旧tabcloseは未確認。製品383テスト/金融レビュー合格、公開docsと全treeの監査を残す。

AB納品監査: c8d425eと公開83ddd413の全210 path/blob/mode一致、欠落/相違/余分0、Pages40087167492同SHA success。最終監査報告と本状態記録の補記だけを公開し、その後はAB06が報告を編集せずread-onlyで全treeを再照合する。実機・人間の理解/楽しさと子旧タブのcloseは未確認のまま。実コード/383自動検証/AI初心者の50再一周/親の追加2画面/元保存復元は完了。
