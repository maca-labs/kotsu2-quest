# AA-05 独立統合QA

担当: qa_reviewer（親とは別の確認役）。2026-10-24、Windows / Node.js v24.14.1。
基準 HEAD: `a270c78e5875d511818f2a0a55d62cfedeec86a4`。以下はその版からの作業ツリー差分を対象とする。製品・テスト・refs は編集していない。本報告のみを編集した。

## 結論

9つのホーム入口、寄り道からの通常復帰、入力/選択後の確定への矢印、場所名の導出、相対モジュール参照を小ケースで確認した。金融台帳・XP・保存版・工程IDの変更はない。

独立に Major `AA05-F01`（置換後の古い入力表示）と、追加変更で生じた `AA05-F02`（寄り道の実アイコンと矢印の指示不一致）を再現して親へ返した。両方とも親が修正し、以下の小ケースで再確認済み。この担当範囲で未解決のMajorは残っていない。

親が実UIで発見した `readonly="false"` / `hidden="false"` のHTML boolean属性問題については、修正後の実 `h()` と入力表示を独立確認し、反映を確認した。

## 確認したこと

### ホーム入口と寄り道

- `PR-01-001`→memo、`PR-01-004`→mail、`P001`→browser、`P012`→mail、`BK-01-001`→bank、`TR-01-001`→bank、`FX-01-001`→fx、`FX-03-001`→points、`TC-01-001`→market。
- 既存の単体テストでは各ホームの実DOMに対象アイコン/guide targetが1つあり、対象外ではonActionなし、対象clickでonActionが1回であることを確認した。
- それとは別に、実 `dispatch` で前提クエストを進めて各入口直前を作り、実 `chooseDivertedApp` をVMで実行。9件すべて対象clickで工程+1 / XP+2。対象外ではstate全体不変。同じ旧工程をもう一度clickすると実engineが拒否し、工程/報酬/残高は増えない。
- `FX-01-010`、`FX-03-009`、`P005`、`BK-01-004` の通常復帰はSTEPを呼ばず、state全体不変。FX-03は保存上のappId=browserを保ち、画面/復帰先はpoints。

### 入力/選択、矢印、保存復帰

独立の最小DOM（HTML boolean属性の存在反射を実装）で、実 `h()` / `renderAction()` / `mountOperationGuide()` / `parseSave()` を接続した。

- `FX-01-010` 入力と `FX-01-003` 選択の2件。空欄は実field、入力/選択後は実submit、消去後はfieldへ戻る。描画・入力・矢印・scrollだけではcallback/工程/XP/金融処理は0回。
- 入力途中をJSON化して実parseSaveで再開し、ui.inputsを持たない再描画でも保存draftが戻る。非空の復帰時は最初から実submitを指す。
- 金融stateとrewardEventsは開始時から不変、合計XPは0。下書きだけが保存される。
- `readOnly`、`hidden`、`disabled`、`checked` のtrue/false各8ケースと、aria/data属性のfalse文字列2ケース。通常入力はeditable、focus/貼付用はreadonlyを保ち、aria/dataのfalseをboolean属性へ変換しない。

### 場所名・話者・保存/金融への影響

- 実 `arrivalPlace()` / `renderTownArrival()` をVMで呼び、7章×町/洞窟/店/依頼人宅/長老宅/酒場/教会の49ケースのキー識別を確認。町/洞窟/店は実map、部屋は章+room IDを使う。settingsで隠しても実場所キーは維持する。
- 店のhostは `.rpg-shop`、anchorは `.rpg-pixel-shop`。世界/部屋は `.world-view`。上部退店ボタンをanchorに使わない。
- 既存place-presentationテストで同一keyの再描画/表示名変更/非表示中でも最初の2800msを延ばさず、room入退場だけ新期限になること、resize/detach/destroy/resetの後片付けを確認。
- 話者カードはtextContentで名前/役割と既存portraitを描く。酒場一覧/用語本でspeakerをnullへ戻し、長老の案件/工程の記録では長老を維持する。表示コードからdispatch/金融/XPへの新しい呼出しはない。
- 差分にengine/finance/finance-extension/finance-funding/storage/rpg/content各教材ファイルは含まれない。createStateはschemaVersion=3 / rpg.version=1 / contentVersion=kotsukotsu-rpg-3、818工程を維持。
- 全JSの静的import 78参照とimportmap 33件について相対URL、実ファイル存在、importmapの対応を確認。indexの新CSS/JSも相対参照。

## AA05-F01 — JSON/新冒険の置換後も古い画面入力が表示される（Major）

根拠: 途中復帰とJSON読込みでは、置き換えた保存の入力内容が画面に戻り、新冒険では以前の記録を表示しない必要がある。AA契約は置換成功時にUIの表示ライフサイクルもリセットする。

再現:

1. 通常入力 `FX-01-010` の `ui.inputs['step:FX-01-010']` に `OLD-11` がある状態で設定を開く。
2. 同じfieldの保存draftが `IMPORT-22` である正規JSONを読み込む。
3. その入力欄を再表示する。または設定の「新しい冒険にする」を確定し、同じ欄へ到達する。

期待: 取込後はIMPORT-22、新冒険後は空欄。読込み/消去失敗時は以前の入力を保つ。

実際: 実 `renderSettings` のonChange / reset callbackと実 `parseSave` を使った小ケースで、保存stateはIMPORT-22なのに表示値はOLD-11。新冒険stateではdraftがないのに表示はOLD-11。banner.resetは正常にそれぞれ1回呼ばれる。

原因: 置換成功後もui.inputsを残し、renderActionが保存draftよりui.inputsを優先する。selectのui.inputs[step.id]も同じ構造。

影響: 古い値を新しい記録の値と思って確定する。金融台帳をこの時点で直接変更はしないが、保存と画面の不一致は復帰の主要問題。

修正後の合格条件: 取込/reset成功後のみui.inputsを空へ戻す（古いエラーも残さない）。input/selectが新しいdraft/空を表示し、失敗時は既存入力・state・banner期限を保つ。

親へ再現と修正条件を連絡し、親が修正した。JSON取込/resetの成功直後にui.inputsとui.errorを初期化し、失敗時は触らない。

修正後の独立再確認: 実renderSettings、実parseSave、実renderActionを接続し、取込成功/失敗・新冒険成功/失敗の4ケースを実行。取込成功はinput=IMPORT-22 / select=USDJPY、新冒険成功は両方空。成功時のみbanner.resetが1回、エラーは空。失敗時はstate参照、ui.inputs、既存エラーが保持され、banner.resetは0回。合格。

## AA05-F02 — 寄り道のアイコンに元の入力指示を重ねる（Major、修正済み）

対象: 初回レビュー後に親が加えたshowInstruction=true。根拠は、AA契約の「寄り道でも復帰先を1つ示す」と「実controlの指示と一致する」こと。

再現: FX-01-010の入力途中でホームへ寄り道する。実guide targetはFXのアイコンなのに、矢印の説明は元工程の「0.1lotのチップを押す」。アイコンとlotチップを混同する表示となる。実mountOperationGuideでこの文字列を再現した。

修正条件: 保存工程は変えず、寄り道の表示コピーのみ、その画面に表示された復帰指示を使う。通常工程の指示は維持する。復帰でSTEPを代行しない。

親の修正: phoneGuideStepがui.divert中だけ実DOM `.current-operation h2` の文字列を表示用copyへ入れ、mountへ渡す。あわせて貼付けbuttonがdata-guide-targetとdata-guide-submitを兼ねる際は「入力した内容で進もう」へ誤変換しないよう、fieldからsubmitへ移った場合だけ確認文を使う。

修正後の独立再確認: 実renderDiverted / phoneGuideStep / mountOperationGuideを接続し、home/switcher/mail/memo/bank/browser-tabの6画面で、矢印文と実DOMの復帰指示が一致。元stepのJSONは不変。通常画面では元stepをそのまま返す。実renderActionのPR-01-010貼付けでも「『練習コードを貼り付け』を押す」の工程文を保つ。表示/scrollでcallbackは0回、state全体不変。合格。

orientPhoneも小ケースで、通常呼出しは実targetへのscrollだけでfocusなし、従来のfocus=true呼出しだけfocusを1回維持することを確認した。視覚上の長い矢印や実画面の位置はブラウザー担当へ委ねる。

## テストの実行範囲と未確認

実行: `node --test tests/phone-navigation.test.mjs tests/place-presentation.test.mjs tests/operation-guide.test.mjs`。初回は17/18成功、残る1件は新しいFX-03テストのDOM stubにchildNodesがなくphone-panelsのbody.childNodes.lengthでTypeError。ブラウザー製品のエラーとは分類せず、親へテストfixture補完を依頼した。修正後の再実行は追記する。

親によるfixture/製品修正後、最終安定差分で `node --test tests/phone-navigation.test.mjs tests/place-presentation.test.mjs tests/operation-guide.test.mjs tests/app-dom.test.mjs` を実行し、22/22成功（fail=0）。full suiteはこの役では実行していない。

独立小ケースはNode stdinの一時実行であり、新テストファイルや製品ファイルは作っていない。実app関数をソースからVMに読み、表示DOM以外には実engine/parseSaveを用いた。これは実ブラウザー/実機/人間観察の代わりではない。

Chromeは別担当AA-04が使用中のため、この役では操作していない。320px実配置、キーボード/タッチ、公開Pagesのキャッシュ更新、初心者が迷わない/面白いという実人間の反応はこの報告では未確認。親のfull npm testもこの役の実行結果として数えない。

## 対象ファイルの指紋（初回独立確認時）

```text
js/app.js b75b870be4c7e1586c5fd2d9085c27f8bb16663ec4f4e0ca6469e112a8f73378
js/phone-navigation.js c8af2af67d94a96a1a87cad07505873f07a2c4f0b1a8cd4277dfd473cb3ba02a
js/phone-panels.js 4ad0035aae971973ea8a670d3c058fbc455f7d43b7300613cb0255aedde9eaed
js/operation-guide.js 095a65e83b0e8e02c497db9b3321d46dceb199a79da3499f67de2b4cc6e8487c
js/ui-adventure.js 310c976bda10d483d929cb7c150b1a13267d69fdf085168c9fc8001e92892ed7
js/place-presentation.js a5d03a217137324438bb4ff9c6b93335a8c94731c04d12a7b2a6556d04e05556
index.html 89cb0885bd0ac23d32437c390d86e26f670f4c575a2a6bbf3c0a38130ba5a814
```

初回レビュー中に親から、AA05-F01の置換後入力/エラー初期化、showInstructionとmobile orientPhoneの実target scrollの追加連絡を受けた。以下がその修正後の指紋。

## 修正後の最終指紋

HEADは引き続きa270c78。親が製品凍結を宣言した後に上記F01/F02・貼付け・22テストを確認した。phone-panelsには序章メールの表示名を郵便屋の練習メール/郵便屋ミナへ明示する追加も含む（工程やメールIDは不変）。金融/保存/教材ファイルの差分なしを再確認した。

```text
js/app.js e2d959be772dee9d7b5b07840f0f45524112c11543216efbca0b76de9633f94e
js/phone-navigation.js c8af2af67d94a96a1a87cad07505873f07a2c4f0b1a8cd4277dfd473cb3ba02a
js/phone-panels.js beeed6bfb57bd40302dfedfdc8d287340876dde022f92f830789139272947052
js/operation-guide.js 323ccc617fd102fb5a6a75a043e51562e0066988955a52f7222afc68f0769179
js/ui-adventure.js 310c976bda10d483d929cb7c150b1a13267d69fdf085168c9fc8001e92892ed7
js/place-presentation.js a5d03a217137324438bb4ff9c6b93335a8c94731c04d12a7b2a6556d04e05556
styles/place-presentation.css d9bc7bc989816af9c3683a9615b8ccad0749b66b9da08f933f453fd3a89d0855
index.html 89cb0885bd0ac23d32437c390d86e26f670f4c575a2a6bbf3c0a38130ba5a814
```

## 追加QA — 別アプリ内fallback（guide12準備版）

公開guide11のあとAA-01が発見し、親が修正した別アプリ内の復帰指示/二重guide-targetを独立に再確認した。追加確認のHEADは `25e8a255981e62942eaeb173b13c52118a9b0047`、作業中 `js/app.js` SHA-256は `28049c9bbdc406b3bcdd4449ae4923ac8a35137aa7d639777f17324bd8cca49b`。phone-navigationとoperation-guideの指紋は直前の表から不変。これも製品編集なし、Chrome操作なし。

確認方法: 実dispatchで前提工程を通して対象直前を作り、実appの `renderPhone`（下部phone navigationも含む）、`renderDiverted`、`phoneGuideStep` を最小DOMへ描画し、実mountOperationGuideを接続した。対象はFX-03-001入口、FX-01-010入力途中、PR-01-003「ホームを押す」の3工程。それぞれfx/mail/memo/browser-tabへ寄り道した4画面、計12ケース。

結果:

- 12件すべてphone全体でdata-guide-targetは1つ。FX03入口とFX01入力では上部「練習中の画面へ戻る」だけが対象、指示と矢印は「『練習中の画面へ戻る』を押そう。」で一致。generic下部の戻るボタンには追加targetがない。
- PR-01-003はbody内fallbackを対象にせず、下部の実「⌂ ホーム」だけが対象。指示と矢印は「下の『ホーム』を押そう。」で一致。必要なホーム操作を通常の復帰ボタンが肩代わりしない。
- どのケースでもfallbackを押すとui.divertを解除してrender/orientするだけ。STEP/saveの呼出しは0回、stateのJSON全体（XP、金融、工程、報酬、時計、RPGを含む）は前後一致、保存用stepの原文も不変。矢印を表示/scrollした時点でも操作は発生しない。
- `node --test tests/phone-navigation.test.mjs` をこの追加差分で再実行し6/6成功。親のfull351テスト実行とは別の証跡。

親の同時追加は、ナレーションのprimary「この作業をはじめる」を任意動画より先に置く順序変更。差分の読取で、開始/動画の各callback、対象工程、動画の任意性は不変と確認した。この順序変更の実ブラウザー上の配置や押しやすさはこの役では未確認。

この追加確認で新しい不合格はない。AA-01の公開画面/親の配置確認と、ここでのNode/コード境界確認は分けて扱う。

## 追加QA — FX03の住所表示（guide13準備版）

親の公開IAB確認で、別アプリのFXにもコツコツモールのaddressbarが残る表示上の混同を発見し、親が `q.id==='FX-03'&&appId==='points'` に限定した。その修正のみをコード上で独立確認した。対象HEAD `75bf41e11c65811763289be876733f904e1f0735`、作業中app SHA-256 `92a0587c697cdf732ac665ab08e9817cd2aead55d787483a93a016c355f8ce71`。

実renderPhone内の住所表示分岐をソースからVMへ取り出し、FX-03で10個のappIdを渡す小ケースを実行。通常pointsには「▣ コツコツモール / FX練習案件」が1つ残る。fx/memo/home/mail/switcher/bank/wallet/hyperでは住所表示がなく、browserだけは共通ブラウザーの「▣ practice.example.invalid」となる。別FX/メモにpoints住所を残さず、通常ポイント画面の名前も維持する。10/10ケース合格。

表示分岐だけの変更で、STEP/保存/XP/金融処理を増やす呼出しはない。親が実行中のfull351はこの役の結果に数えない。製品編集・Chrome操作・公開版の視覚確認は行っていない。
