# R-02 戦闘・冒険コイン・装備の共通契約

担当engine_engineer。既存 `js/engine.js`、`js/content.js`、`js/adventure.js`、保存再生、CONTRACTSを読んで作成。親の採用した契約に基づき `js/rpg.js` とengine接続を実装する。金融・学習・章ボスを戦闘へ置き換えない。

## 独立した保存

`state.rpg` はversion1、location `{mapId}`、coins、hp、battle、defeatedIds、ownedGear、equipped `{weapon,armor}`、attempts、eventLogを持つ。初期coins0、HP32。mapIdはworldまたはtown/cave/shop:CH-0〜6。毎タイルの位置と歩行アニメーションはUI側で持ち、保存命令を増やさない。

既存save.v3/schema3/contentVersion・818工程・固定XP・金融snapshot・既存報酬IDを維持する。コインはRPG初勝利だけから得る。Mock USDC、ポイント、円、金融利益、XPから換算しない。新アイテムを既存chapter inventoryに混ぜずRPG側ownedGearへ記録する。

RPG命令も既存journalへ記録し、parseSaveは初期値から再実行してrpg全体を照合する。残高、HP、戦闘turn、敵HP、装備、購入、イベントの改ざん・欠落・重複は拒否。RPG記録のない旧保存のみ未操作のrpgを補完し、過去の学習にコインを遡及配布しない。既存の2MiB/10,000件の保存上限は維持し、RPGイベントも件数へ含める。

既存のcurrentChapterはjournal外の表示位置も受け入れる保存契約なので、初回のRPG命令にengineがoriginMapIdを付ける。再生はこの既知のmapIdを初回だけ適用してからRPGを再構成する。旧journal・revisionを書き換えず、初期コイン・HP・装備を外部値から引き継がない。RPG命令なし旧保存の初期位置は受理済みcurrentChapterの村。新しい保存版やbootstrap用stateフィールドは追加しない。

## 入口と読み取りAPI

更新はdispatchだけ。

- RPG_TRAVEL `{mapId}`。CHAPTERでも対応するtownへ同期。RPG_TRAVELの非world移動はcurrentChapterも同期。
- RPG_BATTLE_START `{encounterId}`。
- RPG_BATTLE_ACTION `{battleId,turn,action}`。actionはattack/guard/skill/flee。battleIdとturnは必須で、古いクリックを次ターンへ流用しない。
- RPG_BUY `{gearId}`。価格や能力をクライアント値から読まない。
- RPG_EQUIP `{gearId}`。新購入品と、実際に所有する既存章装備を装備できる。
- RPG_REST。村の宿で無料回復。戦闘・学習報酬なし。

active戦闘中はRPG_BATTLE_ACTIONとSETTINGS以外のmutationを拒否する。章移動、受注、工程、NPC、復習、装備変更で戦闘中の選択がずれない。BATTLE_STARTは対象encounterのrecordKeyをactiveQuestKeyへ、当該routeIdをselectedRouteへ、当該chapterをcurrentChapterへ同期する。複数受注・HY-EXIT経路別でも、勝利後にその案件の実際の続きへ戻れる。

読み取りは `getRpgView(state)`、`getBattleStats(state)`、`getAvailableEncounters(state)`、`shopGear`。UIでHP・攻撃力・コイン・購入可能判定を別計算しない。

viewはcoins/hp/maxHp/stats/location/battle/encounters/shop/ownedGear/equipped/canRestを返す。battleのactionsは `{id,label,enabled}` 配列、logは日本語文字列配列。battleにid/turn/status/enemy/playerHP/enemyHP/coins/firstVictory/skillUsed/enemyIntentを返す。statusはactive/won/lost/fled。shopはid/name/slot/price/attack/defense/description/owned/equipped/canBuy。

## 敵と学習の結び付き

安定IDは `enc:${recordKey}:cp:${checkpoint}`。recordKeyを含め、HY-EXITの経路とjourney-mainを混ぜない。entry0と最終Nを全教材に用意し、間は既存物語milestoneの安全な完了点、なければ確認・確定・明細等の区切りを選び、rpg.jsの表へ固定した。入力、選択、欄のフォーカス直後を一般checkpointにしない。物語台詞の変更だけで敵IDを動かさない。

受注済みquestStateの実completedStepsが先頭から連続して一致することを確認する。indexやcompletedフラグだけを信用しない。前の魔物の初勝利と必要な工程がそろうと次の魔物が開く。村では戦闘を始めず、entry0は対応洞窟、cp>0は対応洞窟または同章のworldで開始可能。

門番は章ごとのオリジナル名。道中は6種類、進捗tier0〜4。金融の値動き・レバレッジ・利益で敵や報酬を強くしない。元の確認型章ボスは別に残り、戦闘で章印や章装備を前倒し付与しない。

## 戦闘と店

基礎HP32・攻撃6・防御2。装備の実所持と実装備を根拠に補正。旅人の杖は攻撃+1。戦闘開始時に能力を確定し、戦闘中の装備変更を認めない。通常攻撃はmax(1,攻撃−敵防御)。各戦闘1回の強打は技能補正を加える。敵は通常攻撃→ためる→強攻撃の3ターン周期を予告。まもるはそのターンの被害を切り上げ半分にする。にげるは確実に離脱し無報酬。

初勝利は12＋tier×3枚、再戦は0枚。同じencounterのlootは一度だけ。attemptはengineが採番し、battleIdに含める。負けるとHP0で対応村の宿へ戻るがコイン・工程・金融記録は失わない。無料で休み、同じ敵へ再挑戦できる。

道具屋の新商品は銅剣24枚/攻撃+4、旅服20枚/防御+2、鉄剣60枚/攻撃+8、よろい50枚/防御+4。同一品の二重購入を拒否。装備スロットは武器と防具。購入した武器を選べば既存武器補正を置き換え、既存武器を再装備すれば購入武器のoverrideを外す。

章装備は必要な工程を飛ばさず戦闘を助ける。手帳HP+4、ルーペ攻撃+2、盾防御+3、羅針盤HP+4/強打+2、そろばん防御+1/強打+4、ランタン防御+1/勝利時HP3回復、冠HP+10/防御+1、虹誓の大剣攻撃+12/強打+4。実際に選んでいるtoolだけを適用し、未装備の全所持品を重ねない。

## 受入確認

初勝利/再戦/逃げ/負け/再挑戦、古いbattleIdとturnの拒否、購入不足・二重購入・未所持装備、装備で実damageが変わること、HP回復、旅戦と門番の場所制約、全章自由、実完了工程の解放、途中JSONと旧642工程保存、rpg改ざんと欠落、RPGだけでは金融/固定XP/章報酬が変わらないことを自動検証する。ブラウザーと実人間の楽しさはこの契約レビューでは確認していない。

## 実装検証結果

- `node --test tests/rpg.test.mjs`：14件成功、失敗0。実コイン・武器/防具の能力と被害、戦闘、逃走、敗北、無料休息、再挑戦、二重報酬防止、初回出発地の旧保存補完、HY-EXITの選択同期、RPG途中保存と改ざん拒否を確認。
- `node --test --test-name-pattern "legacy|old nav2|deadline|clock rollback|rollback threshold" tests/navigation.test.mjs tests/engine.test.mjs tests/extension-engine.test.mjs tests/qa-extension.test.mjs`：13件成功、失敗0。初期v3/旧642工程の再生、金銭/報酬/時刻保持、欠落・未知・重複拒否、24時間境界と5分巻戻り境界、独立復習を確認。
- UI担当へ実物viewを共有済み。ブラウザー、実機、人間プレイ観察は本担当では未実施。全体回帰・統合画面は親へ引き渡す。
