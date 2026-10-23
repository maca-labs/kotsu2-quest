# KQ-042 — 独立QA（保存・境界・回帰）

担当 /root/qa_tester。2026-10-23 JST。作者とは別の通常サブエージェントとして agents/qa_reviewer.md を適用した。依頼にあった agents/qa_tester.md は存在しないため、対応する実ファイルを親へ通知して使用した。製品コード・既存テストは変更せず、新 tests/qa-extension.test.mjs と本報告のみ編集。孫エージェントなし。

## 一次判定（修正前）

追加課題の保存再開、旧保存からの追加継続、期限、重複防止、独立review、多タブ競合・保存不可・破損保護、相対依存URLの8件はPASS。時計逆行のちょうど5分境界で仕様差異を1件発見した。著者修正と同じ回帰条件の再確認までは当該時間特典の判定を合格としない。

## 参照と環境

AGENTS.md、agents/qa_reviewer.md、docs/PRODUCTION.md・CONTRACTS.md・WORKBOARD.md、KQ-040-learning.md、KQ-041-finance.md、pointquest §§11/14/15/受入条件、hyperliquidの独立snapshot・費用・再実行・保存の条件を参照した。Windows、Node.js v24.14.1、ローカルES Modules。親のブラウザー作業を妨げないため、本担当はCUA・外部ブラウザー・画面自動操作を使っていない。

対象hash（QA開始〜一次報告、SHA-256）:

|対象|SHA-256|
|---|---|
|js/engine.js|cd649f7401453cd521af5812ef69fefd5693b78cbcc9ea8c062d7e6eb4ecf5cf|
|js/finance.js|570f27bab8730d5cc522262399c4f0bdd62b3fbee4a1a043a372427783e14e06|
|js/finance-extension.js|bd28ebe5722d369ea57bead28eb327e1d2345b7fbca17d110d018f8eada0191b|
|js/storage.js|1ba44877015f4dbe9145376bac8f4520786cfecff8c396c9d43537cdbd63a51f|
|js/content-extension.js|e94e6f8f03f1a8c63adb5ba7797eea4c519d1a6a8294080ad012e35493e4ac43|

phoneの板表/決済履歴は監査開始時に編集進行中だったため、本QAではその表示合格を宣言していない。金融/学習の担当再確認と親のブラウザー確認へ引き継ぐ。

## 実行結果

コマンド: node --test tests/qa-extension.test.mjs（時計閾値の9件目追加前）。pass8 / fail0 / skipped0、75,689.257ms。

|条件|結果と独立した期待値|
|---|---|
|新176工程の途中保存|全7課題を個別STEPで実行。入力/選択/金融処理/最終工程の74地点でJSON往復したaggregateを比較。各地点で直前STEPの再送を拒否し、元stateを変えない。最終XP638 = 176×2＋7×40＋NPC2名×3。初期装備だけ、章印0。元の入金/運用ラボは未履修のまま。|
|任意期限の境界|LD30練習日を進めた課題を受注24時間−1ms、一致、＋1msで完了。前2件だけ10XP。すべて基本90XP/元利1000.986301。受注後設定を1時間に変えても受注時24時間と期限は固定。JSON後も一致。|
|5分を超える逆行|300001msの逆行でclock-unverified。基本XP/金融結果を維持し、10XPだけ保留。|
|旧642完了保存→追加176|fixtureを現parseSaveで再生し、追加全7課題を完了。旧全financialScenarios/questStates/rewardEventsの既存部分/bossStates/装備/6章印を比較して一致。追加XPは632。保存版・navigationVersionを変更しない。|
|独立review|7課題176操作を各2周。入力/選択/金融処理67地点×2周でJSON往復。主資金・初回quest・XP・装備・実時計は変化しない。終了状態もJSON一致。|
|破損・不正import|壊れたJSONをreplaceしても既存localStorageが変わらない。架空999XP付き保存はloadで保護し、通常saveによる上書きを拒否。|
|多タブ|新しいrevisionがlocalStorageにある時に古いstateをsaveすると拒否してwritable=false。新しいrawを保持。実ブラウザーの2タブではなく、SaveStoreと独立Mapストレージでの検証。|
|保存不可|読書きが例外になるストレージでavailable=false。aggregateをmemoryへ保ち、JSONへ退避して再生できる。|
|相対URL|indexから再帰的にJS/CSS/asset参照を解決し、repository/サブパス内に留まり実ファイルが存在することを確認。新金融/content moduleと両新CSSの到達を確認。HTTP配信・GitHub Pages公開の実機確認の代用にはしない。|

QAテストのJSON比較では、任意command.value=undefinedがJSONによって省略される通常動作だけを検証側で正規化した。金銭・報酬・工程の差異を無視する比較にはしていない。

## 指摘票 QA-01 / Major — 時計逆行の閾値が仕様より1ms外側

- 仕様根拠: pointquest §11「最後に観測した実時刻より5分以上過去へ戻ったと検出した時は期限判定を保留」。基本報酬は維持し timeBonusStatus=clock-unverified。
- 対象: js/engine.js observeClock。条件が now < lastObservedAt - 300000 である。
- 再現: TでLV-01をtimed受注。SETTINGS hideTime=falseをT+600000で処理して観測時刻を進める。全22STEPをT+300000で処理する。最後の観測からちょうど300000msの逆行で、完了時刻は受注後なので通常の期限内条件も満たす。
- 期待: clock-unverified、timeBonusAwarded=false。1NPCの再現では87XP（STEP44＋quest40＋NPC3）。
- 実際: status=awarded、timeBonusAwarded=true、97XP。基本資金990とクエスト完了は正常。
- 影響: 任意の時間特典の境界判定。主資金・基本報酬の破損はないが、明示された受入条件と異なる。
- 証跡: node --test --test-name-pattern=threshold tests/qa-extension.test.mjs → pass0 / fail1 / 2467.1052ms。rollback 300000ms の期待clock-unverified / 実際awarded。製品を修正せず回帰テストを追加した。
- 修正後合格条件: 299999msでは通常の期限内加点を維持、300000msおよび300001msでは保留。期限±1ms・基本XP・金融結果・JSON再生を維持。著者修正を親へ依頼済み。

## 未確認

本担当の実ブラウザー/320・390px/キーボード/実機/公開GitHub Pages/2実タブは未確認。親の確認は本報告と別証跡にする。全suiteの最終一括実行は親が行う。金融12通りの独立検算と板/決済履歴表示はfinance/learning担当の該当報告に分離している。

人間参加者の観察を行っていないため、小6が意味を追えた、面白い、またやりたいといった実証は含まない。AIによるSTEP完走やコードレビューは実人間の反応を示さない。

## 修正後再確認

QA-01は著者が observeClock の判定を <= へ修正。2026-10-23 JST、独立QAが同じ回帰条件を再実行し、解消を確認した。製品コードをQAが編集することはなかった。

実行: node --test --test-name-pattern=boundar tests/qa-extension.test.mjs → tests2 / pass2 / fail0 / skipped0、316.9595ms。5分逆行の299999msは通常の加点、300000ms/300001msはclock-unverified・加点なし。全ケースで基本報酬・金融結果・JSON再生を維持。貸出30練習日後の24時間−1ms/一致/＋1ms、受注後の設定固定も再確認した。

最終判定: 本担当の8件既合格とQA-01修正後2件のfocused再確認により、指摘の重大残件は0。これは9件全体を修正版で再実行したという意味ではなく、最終全suiteは親の別ログへ委ねる。画面/実機/人間観察に関する未確認は上記のまま。

修正後の最終SHA-256:

|対象|SHA-256|
|---|---|
|js/engine.js|73659743cc004e15b72f2e14f795633cf67e721628e133a555e6aa3dd097cc79|
|js/finance.js|570f27bab8730d5cc522262399c4f0bdd62b3fbee4a1a043a372427783e14e06|
|js/finance-extension.js|bd28ebe5722d369ea57bead28eb327e1d2345b7fbca17d110d018f8eada0191b|
|js/storage.js|1ba44877015f4dbe9145376bac8f4520786cfecff8c396c9d43537cdbd63a51f|
|js/content-extension.js|e94e6f8f03f1a8c63adb5ba7797eea4c519d1a6a8294080ad012e35493e4ac43|
|tests/qa-extension.test.mjs|f12a210df23a831880818361885008d5906a502512b23eb821fc594c63ed47fd|
