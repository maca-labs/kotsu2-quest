# 共通契約 — production extension 1 (2026-10-23)

制作運用 team-1。製品は既存Vanilla JSを継続し、src/への作り直しは行わない。親がこの文書・入口・集約を所有する。

## 基準と互換性
- 既存27標準618工程＋追加24=642工程、元の24/548を全保持。保存キーkotsukotsuQuest.save.v3 / schemaVersion3 / contentVersion kotsukotsu-rpg-3、既存quest/step/event/reward IDs、固定金額とXPを維持。
- 以前のnavVersion2と初期v3のJSONを保持し、新しい無操作台帳だけを補完する。既知台帳の欠落・改ざん・未知ID・重複は拒否する。
- 全章は初回から訪問可。POINT-START/CRYPTO-START互換。新講座の未受講分を自動学習済みにしない。
- 新questはextension:true/optionalCourse:trueを付ける。旧章内自動sequenceと章ボス要件から除く。新quest間は明示prerequisitesで順序を守る。推奨の最初の国内導線はDX01→DX02→既存FI。旧FIは開設済み口座からの独立練習として残し、口座が未受講ならその旨とDX入口を示す。

## 追加のIDと所有者
- DX-01:国内取引所の登録/メール認証/架空成人情報/申込。DX-02:独立した国内取引所KYC/模擬ID・人物/審査待ち/利用可能を確認。
- DX-03:販売所と板取引所を切替/相手と価格差/販売所で買う・売る。DX-04:板の成行買い・売り/約定履歴。DX-05:板の指値買いの保留・取消・再注文・約定、指値売りの保留・約定。未約定の予約金・予約枚数を可視化。
- LD-01:貸出条件/申込/貸出中/早期返還不可/30日満期/返還申請と受取。HLP/stakingとは別。貸先が返せない危険と今回が成功例であることを説明。
- LV-01:新しい独立練習。long/shortと1/2/5倍を全て有効選択にし、100の証拠金/数量/値動き/全決済を体験。固定HY-PERP48工程は変更しない。別条件の確認課題を何度でも再開して方向・倍率を変えられる。
- 各step IDはDX-01-S001形式。必要工程は個別操作とし、単なる説明表示を操作へ水増ししない。正確な新工程数はcontent提出時に確定。新通常quest40XP/初回step2XP/任意時間10、反復review無加点。追加の章印・装備を前倒ししない。

## 実際の共通入口
- js/engine.js createState/dispatch/activeStep/questState/parseSaveが唯一の更新口。UIはdispatch({type:'STEP',id,value})、復習はREVIEW_ACTION/RESTART_REVIEWを使う。失敗はthrowし元stateは不変。
- js/content-extension.js（phone担当）がquests/steps/objectives/applyContentEffectをexport。js/content.js（親）が集約。extensionのchapterはDX=CH5、LD/LV=CH6、part crypto。
- js/finance-extension.js（engine担当）はinitialExtensionScenarios, applyExtensionStep, validateExtensionScenarios, extensionScenarioSummary, getExtensionView, applyExtensionReviewをexportする。
- 新scenario IDs: domestic-account, domestic-dealer, domestic-market, domestic-limit, lending-lab, leverage-choice。
- 既存finance.js（engine担当）は初期値・STEP・summary・validationで新moduleへ接続する。reviewはengineのREVIEW_ACTIONからapplyExtensionReviewを呼ぶ。
- 構造は既存scenarioのinitialSnapshot/accounts/data/simulationTime/eventLog/phoneStateを継続。金額・数量は有限のnumber、原則6桁固定精度、表示は金融moduleの読み取り結果を使う。フォーム文字列は必ず正規化か変更前拒否。
- content stepはscenarioId / field / valueまたはacceptAnyChoice / choices / extensionAction（必要な確定処理名）を持つ。extensionAction名とeventKeyの一覧はengine/phoneが親に短く提出して確定し、メッセージで同期する。
- getExtensionView(state,step,{reviewSnapshot?})はタイトル、残高・予約・価格・注文/口座/貸出/建玉の状態、現在の見積結果を返す純粋関数。phoneは金額式を独自定義しない。
- js/phone-extension.js（phone担当） renderExtensionPanel({document,state,step,quest,onAction,onNavigate}) → {element,handlesAction}。通常input/focus/select/checkは既存renderActionが担当。新moduleは実際の注文表・入出金/貸出明細・模擬IDを描く。専用実操作が必要な画面だけhandlesAction:trueにする。
- タブを押して別画面へ行く、戻る、メールを読む等の寄り道で金銭/XPを動かさない。選ばれた販売所/板と確定見積の一致はengineが確認する。必要な場合の表示用NAV契約は先に親へ返す。
- 主課題と別条件reviewはそれぞれ別snapshot。LV reviewはside/L/値動きの選択を有効にし、同一コードを正解として固定しない。再開・反復で初回資金・時刻・装備・報酬を変えない。

## 架空の固定値（実サービス仕様ではない）
- 国内3売買scenarioは各JPY100000からの別練習。販売所ask102/bid100、各10枚買→売は99980。価格差を別手数料として二重徴収しない。板成行は100で10枚買→105で10枚売=100050、教材手数料0。
- 板指値は現在100、買95×10で予約950→取消で元通り。再注文後価格95で10枚取得。売105×10で枚数予約、価格105で約定し100100。注文予約/取消/成立を別操作とeventにする。
- lendingは元手1000USDC、貸出本金100USDC、教材年率12%、30/365の単利、6桁丸め利息0.986301、元利100.986301、受取後利用可能1000.986301。元本と利息を分け、満期前・境界・再受取を確認。実時計で30日待たせない。
- LVは元手1000、証拠金100、entry100、L1/2/5、side±1、quantity100*L/100。選択した教材値動き95または105。fee/funding0の例と明記。95ならlong995/990/975、short1005/1010/1025。105は逆。既存SL/funding/清算の固定演習は残す。自由練習の数値を固定HY-PERPへ混ぜない。

## 世界と初心者支援
- world担当はjs/adventure.js/help.js/ui-adventure.js/world.jsと専用styles/world-extension.cssを単一所有。各追加questの区切りを実完了stepから描く。money/XPへ直接触らない。
- 村人は直近の用事、長老は実完了工程の一覧/意味/つまずき。新scenario・reviewでも資金や未学習を混ぜない。
- 最初のPR01/PO01も再確認する。PR01最後の外側『町へ戻る』でSTEPと手帳を確定。メールコードや合言葉を届く前から常時表示しない。アプリ切替前に元アプリへ自動で戻らない。利用条件本文を読める。

## 編集の排他
親: js/app.js,js/content.js,index.html,styles.css,README,運用docs/集約テスト。
engine: js/engine.js,js/finance.js,js/storage.js,js/finance-extension.js,tests/extension-engine.test.mjs,tests/extension-finance.test.mjs。
phone: js/content-extension.js,js/phone-extension.js,js/phone-panels.js,js/content-points.jsの表示定義のみ,styles/phone-extension.css,tests/extension-content.test.mjs。
world: js/adventure.js,js/help.js,js/ui-adventure.js,js/world.js,styles/world-extension.css,tests/adventure.test.mjs,tests/help.test.mjs,tests/world.test.mjs。
review役は製品コード変更不可。共通契約変更・不具合は親へ返す。孫作成禁止。

## 統合で確定した補足 — 2026-10-23

- 新講座DX-01/02/03/04/05は33/23/21/21/34工程、LD-01/LV-01は22/22。追加176、標準34依頼794工程＋extra24＝全818。
- 板はgetExtensionView.orderBook（asks/bids各price,quantity）由来。現在の建玉positionと決済履歴leverageHistoryは分離。表示で資金を動かさない。
- LVの同条件復習も完了できるが、本編とside/leverage/markPriceがすべて同じ場合はtransfer証拠を増やさない。changedConditionsは保存フィールドを増やさず純粋に導出。既存証拠と初回XPは維持。
- reviewSnapshotは最初の操作前からrv.initialSnapshotを使う。独立したメール見直しに本編クリップボードを使わない。
- 実時計が観測値から300000ms以上戻れば時間特典保留。299999msは保留しない。基本進行/XPは維持。
- 新しい口座づくり→FI入口の案内は、申込済設定のこみち窓口と独立財布を明示。元のFI/CRの資金を追加配布しない。

## スマホ導線・家・操作案内の補足 — M / 2026-10-23

- ミッションは既存questStates・NPC会話記録・worldStateから導出する。報告済みフラグを追加せず、既存NPC会話記録を使う。HY-EXITのrecordKey/routeIdを室内の報告先まで保持する。
- 室内の部屋・位置はui.roomのみ。家への出入り、説明・動画・矢印・スクロールではSTEP/XP/金融イベントを発火しない。再読込み後は町に戻り、案件の保存された続きから再開できる。
- world-controlsはmountごとにdestroyし、pointerup/cancel・画面外・blur・hidden・ダイアログ開始で長押しを停止する。移動は学習状態を変更しない。
- 実操作対象にdata-guide-targetを一つ付け、operation-guideは矢印と枠の装飾だけを担当する。入力やクリックを代行しない。確認課題・ボスには正答の矢印を追加しない。
- コピー済み表示は対象メール既読＋対象コピー工程完了＋そのメールとclipboardの一致を要する。本編と確認課題のメール・clipboard・入力記録を混ぜない。貼付前は空欄、貼付後は保存された実draftを表示する。
- ナレーションは36教材の目的と最初の操作を短く表示する。約30秒のローカルWebMは序章の実画面を用いた共通コピー操作の見本。再生・終了・説明への復帰は工程を進めない。保存schema3・保存キー・818工程ID・固定報酬を維持する。

## 旅戦闘の共通契約 — R / 2026-10-23

- state.rpg.version=1は独立した旅戦台帳。製品schema3と保存キーは不変。location.mapIdはworld/town:CH-0..6/cave:CH-0..6/shop:CH-0..6。毎tileの座標はUI、エリアだけをjournalへ記録。旧進捗のある案件は入口のために学習を巻き戻さない。
- RPG_TRAVEL{mapId}、RPG_BATTLE_START{encounterId}、RPG_BATTLE_ACTION{action,battleId,turn}、RPG_BUY{gearId}、RPG_EQUIP{gearId}、RPG_REST。旧EQUIPも残すが製品UIはRPG_EQUIPを使い、購入剣と旧武器の実効を一致させる。active戦闘ではBATTLE_ACTIONとSETTINGSだけを受理する。
- 門番cp0は同章洞窟、進捗敵は同章洞窟か現在章の世界地図。encounterIdはrecordKey/cpの安定値、battleIdとturnは二重操作防止のtoken。開始時に対象recordKey/routeIdを再選択し、別案件の資金へ戻らない。
- 初勝利のみ12＋進捗tier×3の冒険コイン。金融scenarios、学習XP、工程、章印へ加減しない。店の武器/防具4品は各一度だけ購入、未所持は装備不可。statと被害はrpg.jsの一つの計算から表示する。
- 新規未着手案件は門番→説明→操作。既存工程の安全な区切りで旅戦を出す。逃げた記録は自動再提示から除外し、地図の再会は可能。敗北は町へ戻り、コイン/学習を失わず無料RESTで再挑戦する。
- RPGが欠けた旧保存でRPGコマンドもなければ初期補完。最初のRPGコマンドにengineがoriginMapIdを記録してUI由来の旧現在章をbootstrapし、コイン・HP・購入・装備は初期値から全再構成。RPG履歴ありの欠落・合計改ざんは拒否する。
- rpg-worldは純粋な地図/衝突/描画。町の店壁10..14/2..5と扉12,5、南門12,17は親walkが判定する。描画と店/戦闘UIからstateを直接変更しない。
- indexのimport mapは全runtime JSを同じ配信版queryへ解決し、入口/CSSも同じ版にそろえる。すべてリポジトリ相対URLで、外部依存やビルドを追加しない。配信版は保存schema/contentVersion/IDとは独立。

## T/U — 地図を中心にした探索・野道と教会

2026-10-23の利用者追加に基づく。画面上部は現在地・HP・Lv・メニューボタン、探索の次目的を短く1つ。長い案内、章選択、依頼帳、装備、相談、宿、近道は既存dialog内から開く。探索の表示/メニュー開閉だけでSTEP/XP/金融/報酬を進めない。dialog中は全歩行入口を止め、Escで閉じてメニューボタンへフォーカスを戻す。町・室内・野外の地図25:18を維持し、キャンバスの表示とクリック座標を合わせる。

RPG_FIELD_START {kind:'road'|'desert',chapterId}を既存RPG命令に追加。worldかつ現在章一致のみ。getFieldEncounter(kind,chapterId)が安定IDと敵を返す。field battleはkind:'field',fieldKind、recordKey:null。XPや金融を付与しない。各IDの初勝利のみ冒険コイン、再戦・逃走で配り直さない。歩数は成功歩行だけをUI内で数え、初回4歩、その後20歩で街道戦。砂漠2歩で強敵、逃走後8歩の猶予。毎歩の保存ログは追加しない。

野道/砂漠の敗北はCH-0 townへ戻しHP全回復。教会の扉19,15、外の復活点19,16。reviveイベントとbattle-action lostを残し、UIが教会室内を表示する。後続travelで復活演出を消化する。装備・コイン・案件・入力・固定XP・金融残高を保持。schema3/rpg.version1/既存IDは維持。

isDesert(location)、getTerrainLabel(location)をworld側から公開。砂漠はx53..59/y27..33、標識52,29。既存7町/7洞窟の徒歩到達を保ち、山脈と峠で章順の道を作る。章選択からの自由開始は維持。教会doorはCH-0のみ、doorAt/drawTownDoorsへ章引数を渡す。噴水/建物/水の描画と衝突を一致させる。


## V — 敵の登場と入力の区切り

遭遇演出は保存外のUI状態。trackEncounterInputs(document)を歩行操作の登録前に常時起動し、遭遇前から押されていたpointer/keyの解放を把握する。mountEncounterIntro({document,state,onStart,minimumDisplayMs=600})は敵名・絵と一つの開始ボタンを表示し、600ms経過と全入力の解放後に新しい操作だけを受理する。pointercancel、blur、hiddenでも押下を消去し、destroyで購読・タイマーを解除する。

renderCombatViewが全入口を集約し、activeかつturn1かつ当該battle.idの未確認時に登場画面を出す。開始はstateを進めず、明示的に押した後だけ戦闘行動へ切替。350msは行動を無効化し、開始の連打が逃走や攻撃へ通らないようにする。途中のsettings/hash再描画は残り時間を引き継ぐ。turn2以降の保存復帰はそのターンへ戻る。schema3/rpg.version1/工程・金融・XP・報酬は不変。

JSON置換と冒険リセットの成功時は、同じbattle.idが再利用されても古い確認が残らないようUIのacknowledgedBattleId/combatReadyAtを消去する。失敗時は現在の冒険を保持する。


## W — 戦闘の手応えと保存順

mountBattleTurn({document,root,beforeState,afterState,action,onComplete,reducedMotion=false})→{destroy} は旧戦闘DOMだけに演出する。親はUI busyを同期設定し、既存RPG_BATTLE_ACTIONを一度だけrender:falseでdispatch/saveした後にcontrollerを呼ぶ。数字は確定済ログの当該行から読み、HP差をraw damageの代用にしない（overkill・winHeal・砂漠教会revive）。演出はSTEP/XP/金融/コイン/stateを変更しない。

演出中は行動とメニュー/navを止め、「結果をすぐ見る」だけ許可する。完了は同じafterState/画面のときだけrenderし、180msの行動/結果ボタンguardを置く。render/別画面/保存置換でdestroyし、古いonCompleteを無効にする。途中reloadは保存済afterターン・勝敗へ戻る。通常約1秒、動きを減らす設定/OS設定では点滅・揺れ・移動を抑え、短い文字数値で示す。勝利済の通常画面でも敵spriteを表示しない。既存schema3/rpg.version1/報酬ID/固定XP/金融/818工程は維持。


## X — 町名と酒場名

getTavern(chapterId)が{name,sign,kind}を一元管理。roomTitle第3chapterIdから店の全名を返し、扉看板は短いsign。未知章はCH0へfallbackし、既存の部屋/扉/NPC/保存契約を守る。appのHUD/メニュー/部屋見出し/相談dialogは同じ関数にそろえる。

入町表示はrender時の実場所（world view・town map・室内なし）から導出。場所切替でvisibleTown/期限を更新し、同じ町の再描画では2800msを延長しない。別画面でtimeoutを破棄。バナーはmap上のposition:absolute・pointer-events:none、行/スクロール/歩行を増やさない。町名・店名の表示でSTEP/XP/金融/報酬/セーブ版を更新しない。

## Y — 町別の地形・建物・酒場（2026-10-24）

`towns.js/getTownLayout(chapterId)`は不変のchapterId/theme/description/buildings/npcs/landmark/tilesを返す。number/stringを受付け未知章はCH0。建物は{id,x,y,w,h,door:{x,y}}の16pxタイル単位、doorは最下段。`townTile`をworld.mapTileの根拠にし、描画・衝突・クリック・隣接会話が同じ配置を使う。getTownDoorsはshopを除く建物の扉。rpg-world/getTownTravelFeaturesはshopと南門を導出する。旧townDoors/townTravelFeatures/npcPositionsはCH0互換のみで、実操作は章指定APIを使う。

CH0の教会19,15/復活19,16、全町の南門12,17/帰還12,16/章開始12,10を維持。既存保存の座標が新しい固体やNPCに重なった場合は12,16へ避難。UIの部屋は保存外、退出は今の章の扉南隣に戻る。金融/XP/ID/保存schema3・rpg.version1/全818工程に変更なし。

roomPeople(id,chapterId)、roomStep(id,position,dx,dy,chapterId)、nearbyRoomPerson(id,position,chapterId)は末尾chapterIdを追加し旧呼出をCH0互換とする。酒場の家具定義を描画と衝突で共有し、9人のindex、入口12,12と出口12,15を保つ。

## Z — 公開実歩行と道案内（2026-10-24）

town-guidance/getTownWalkGuide(state,guide)はhouse目的だけ、共通地形とNPCを避け扉南隣へのBFSを行い、家名/次方向/直線区間の歩数を導出する。扉前は上で入ると表示。操作を代行せず、進捗・XP・残高・新しい保存フィールドを追加しない。目的の家の金枠/旗は描画だけ。町歩行時に次の一歩の表示も更新する。非house目的の既存指示は維持。

港のNPC index2/3を8,10/17,9へ移し、7,12と14,10の狭路を開ける。会話index/報酬は変更しない。公開版の実歩行は専門役がChrome一つずつで実施し、保存ロックとviewportの競合を避ける。AIの観点レビューと実利用者の観察は区別する。

leaveShopはactのworldPositionへ実際のshop扉の南隣を渡し、dispatch後のnextに座標を適用してRPG_TRAVELと一回の保存で確定する。保存競合throwは旧stateと店画面を維持。容量不足falseは従来の保存不可通知＋JSON書出し可能なメモリ継続を保ち、途中の町＋旧座標は保存しない。上部「店の外へ」と既存下部の退出は同じ入口へ結ぶ。購入/装備/コインの処理は変更しない。酒場の近接操作は既存の相談一覧を開き、そこから話者を選ぶ設計を維持する。


## AA — 初心者の操作案内・入場名・話者（2026-10-24）

phone-navigationのgetStepOpenAppIdは明示openAppIdと既存9工程IDの互換対応を用い、ホームの実アイコンと矢印を同じapp IDで決める。FX-03の教材appId=browser/工程IDは維持し、表示先だけpointsとする。寄り道は現在の指示と復帰矢印を保ち、通常の復帰でSTEPを実行しない。元々『アプリを開く』工程だけ、対象アイコンの明示操作で一度STEPする。

操作ガイドは実data-guide-targetだけを装飾し、入力/選択が空でなければdata-guide-submitの実確定ボタンへ移る。消すと入力欄へ戻る。クリック・入力・focus・学習・金融処理を代行しない。コピー/確認課題の既存契約を保つ。

createPlaceBannerのplace{key,title,kind}はappが実場所から導出する。同一keyは2800ms期限を延ばさず、別画面ではvisible=falseでも実場所/期限を保持。店はrpg-shopの画像anchorへ配置し、上の退出ボタンを覆わない。JSON/冒険置換成功時だけreset。人物会話はrenderSpeakerIdentityの名前・役割・既存portraitを表示、酒場一覧/用語本を発話と混同しない。工程/保存schema3/rpg.version1/固定XP/金融台帳は不変。

初心者想定の操作役は別コンテキストで作り、攻略/ソース/他レビューを読ませず公開画面の判断を記録する。技術QA・AI想定レビュー・実人間観察は分離。Chromeゲームは排他1名、同時作成がtimeoutしても返却IDを再取得し重複tabを作らない。

AA追記: mobileのorientPhoneは実対象へscrollのみ行い、矢印そばに現在instructionを表示する。寄り道中は保存stepを変えず表示copyをDOMの復帰指示へ合わせる。readonly/hiddenはHTML boolean propertyで反映し、falseを属性として残さない。成功JSON取込/新規開始だけui.inputsとui.errorを消し、失敗時は保持する。

AA公開追試追記: 非ホーム/非アプリ切替の寄り道では実『練習中の画面へ戻る』を現在指示にも用い、標的はそのボタン1つ。元工程がホーム等のnav操作なら実navだけを標的とする。通常復帰にSTEP/saveを追加しない。ナレーションは一次開始を任意動画より先に置き、動画・相談を残す。配信guide12/13は保存契約を変更しない。FX03の固有住所はappId=pointsの実画面だけへ表示する。

## AB — 第3章の画面案内による一周確認

初心者想定役は新しいコンテキストとし、ゲーム画面以外の攻略・教材工程表・JSON内容・製品コード・他レビューを読ませない。準備の保存退避/JSON取込と、本番の予想→押下→結果を分ける。基本FX01/02/03の50工程と任意売り18工程を混ぜず、未受講の学習済み化をしない。入力・金額・金融数理・固定XP・保存版・IDは維持し、観察を根拠に表示と案内を直す。子ブラウザーの実操作可否はmetadataだけで合格にせず、通常UIで確かめる。Chromeは同時1名。

AB実装契約: fx-guidanceは表示専用。原stepを変えず数量入力の表示文/submit名/開いた定義/実選択サマリー/4確認画面の予定を返す。予定は実draft・完了工程・実position・tickイベントを読み、未入力や矛盾を期待値で補わない。確定画面は開始資料を折り畳み、定義→確認rows/cards→唯一の確定targetの順。表示/矢印/説明ではSTEP・保存・金融更新をしない。

入力補助は実inputイベントでdraftを保存するだけで、工程/XP/金融は変えない。明示submitが既存STEPへ進む。貼付け・独立確認課題の契約は保つ。洞窟歩行の自動遭遇はautomaticEncounterを共用し、現在の未完了recordと逃走ログを尊重する。手動再戦は可能。入口勝利済の進捗洞窟戦を逃走した時だけ、同じ未完了依頼のスマホ再開ボタンを結果欄へ出す（操作を完了させず、ナレーションから再開）。配信guide14と保存schema3/rpg.version1は独立。
