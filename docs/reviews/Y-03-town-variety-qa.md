# Y-03 — 7町の配置・景色・酒場内装の独立QA

2026-10-24。基準 `8f19a894fd01ffd1fe380fdb2a6838408bb760e3`。担当 qa_reviewer兼導線レビュー。製品コード編集禁止、本レポートのみを編集する。孫エージェントは作らない。AGENTS/PRODUCTION/CONTRACTS/qa_reviewerの指示を読み、安定差分の連絡前は静的確認に限る。重いsuiteを親と重ねず、限定検証は `--test-concurrency=1` で実行する。

## 初期の固定座標点検

|対象|残っている基準の固定値|移行時の受入条件|
|---|---|---|
|app.worldCanvas|店10..14/2..6、依頼人3..8/2..6、酒場16..22/2..6、長老3..7/13..16、教会17..22/12..16のclick判定|getTownLayoutの実建物へ一致し、旧位置で別の家を開かない|
|app.walk|店12,5、店壁10..14/2..5、長老壁3..6/13..15、出口12,17|可変door/建物/出口を参照、歩行とclickで同じ行先|
|app.nearbyTalk|店12,5、出口12,16、townDoors/npcPositions|その町の扉と4人の実位置を参照|
|appの室内入口|roomStep、roomPeople、nearbyRoomPersonの呼出|全呼出に末尾chapterIdを渡し、内装と人・家具の衝突を同じ章で読む|
|world.move/renderWorld|npcPositionsと旧建物/噴水/水/章別小物の描画|同じlayout由来の衝突と描画。NPCのindex0..3は既存役割と報酬IDを維持|
|rpg-world.drawTownTravelFeatures|店本体/看板/世界への出口の固定pixel座標|新layoutの後へ旧建物を二重描画せず、同じ店/出口へ一致|
|復帰と初期位置|CHAPTER12,10、travelArea12,16、normalize避難先12,16|全7町で水/建物/噴水/人を避け、入口・店・NPCへつながる|
|教会復活|rpg.jsのCH-0/19,16|CH-0教会と外の復活位置を維持し、旧保存/JSONで回復・装備・学習を保持|

world.jsの達成後の橋・掲示板・講座小物にも固定pixel座標がある。新しい家の扉/看板/NPCへ重なると、衝突は正しくても見た目の導線が壊れるため、初期状態だけでなく進行済snapshotも確認する。

## 学習導線上の注意

- NPCの配列は移動しても0依頼人/1ヒント/2振り返り/3便りの役割を変えない。描画位置の並べ替えで初会話XPや相談相手を入れ替えない。
- 新しい町の家・店・酒場が見分けられ、近づく/話す/扉を押すの各操作が同じ先へ行くこと。メニューの近道と現在地/町名を維持する。
- 酒場は入口から出口に戻れるだけでなく、9人全員の相談範囲へ到達できること。家具の島へ一部の人を閉じ込めない。
- 旧版の座標が新しい水・建物・NPC上になっていたら安全な道へ復帰させる。その補正で案件/金融/XP/報酬を進めない。
- 景色の違いはAIの読み確認・描画データ/到達性確認であり、人間が迷わず進める/面白いという実証と混同しない。

## 統合後の確認

安定差分での独立確認完了。重大残件0。製品コードは編集していない。初期に挙げた固定座標の取り残しは次のように解消した。

- appの建物click、歩行、隣接会話はgetTownLayout/getTownDoors/getTownTravelFeaturesへ統一。室内のroomStep/roomPeople/nearbyRoomPerson全呼出に現在章を渡す。出る時はその町の実際の扉南隣へ戻る。
- world.mapTile/描画/衝突はtownsの不変tiles/buildings/npcs/landmarkを共用。getTownLayoutはCH文字列と章番号の両方に対応し、旧NPC/扉/旅入口の定数はCH-0互換用だけに残す。
- rpg-worldは店の位置から看板/扉を描き、旧店本体を重ね描きしない。達成の飾り/講座小物は建物内へ移し、歩行路/扉/水上の固体を増やさない。
- 全町の12,10/12,16/12,17と、CH-0教会19,15/復活19,16を維持。normalizeは旧座標の水/建物/噴水/外周/NPC重複を12,16へ避難させる。
- 酒場家具は同じタイル矩形で描画と衝突を行い、9人のindexと入口/出口は維持。家具以外の床模様/窓/敷物は装飾として通れる。

### 実行した限定検証

```text
node --test --test-concurrency=1 tests/town-navigation.test.mjs tests/world.test.mjs tests/rooms.test.mjs tests/travel-navigation.test.mjs tests/rpg-world.test.mjs tests/rpg-field.test.mjs tests/rpg-navigation.test.mjs tests/world-controls.test.mjs tests/paths.test.mjs
61 tests / 61 pass / 0 fail / 2.364679 s
```

実appのcanvas/歩行/隣接会話をVMへ読み、全町の現建物/店/4人/南門を確認。屋外・室内のBFS、全9人を選べる酒場、旧位置避難、教会復活/旧保存/JSON、章ハッシュ、十字キー停止、相対パスを含む。これは実ブラウザーで61回プレイしたという意味ではない。

### QAが追加実行した独立ケース

製品やテストファイルを変更せず、stdinから本番関数と既存の最小fixtureを実行した。

1. **屋外NPCの選択優先まで確認。** 全7町の南門前からmoveでBFSし、実appのnearbyTalkを到達タイルごとに呼ぶ。単にNPCへ近づけるだけでなく、店/扉の優先に横取りされず0..3の4役を選べることを確認。28役すべて成功。到達タイル数はCH-0から順に245/257/240/142/251/215/173。12,10と12,16も同じ連結領域にある。
2. **API境界。** 章番号0..6とCH文字列は同じlayoutを返す。不正/未知章14種はCH-0へ安全にfallback。範囲外/小数/NaNの座標6件はtree、斜め/0歩/2歩/NaN/Infinity/文字列/null等の不正move8件はstateを変更せずfalse。全例成功。
3. **進行済み保存の復帰。** browser-lv-closed.jsonを実parseSave→実CHAPTERで各町へ移し、新しい壁/NPC/水上の17座標をJSONで復元。実normalize後12,16へ移り、もう一度JSON往復しても同じ。activeQuestKey、工程、報酬、熟練、装備、金融、スマホ、RPG、XPが補正前と一致した。17件すべて成功。

### 親の観測で戻した軽微修正と最終再確認

親の実ブラウザー確認で酒処あかし灯の石壁1行が室内右枠を越える表示問題が見つかり、Y-02が描画幅を右端368へclampした。家具/衝突/扉は不変。独立の読み確認で最後の石行・床行が端を越えず、負の幅を作らないことを確認した。

宝箱については提出時刻の異なる読取りを照合し、最終版にdrawChest呼出があることを確認した。Y-01の返答では最終43テストの直前には既に追加済みで、この確認後の製品差分は屋根内の位置をy+4からy+5へ調整したもの。未開/章印取得後/非重複の描画検証を追加し、進行や報酬の処理は追加していない。新しい描画テストは全7町の箱の位置/未開と開いた図/状態不変を確認する。

両修正後、必要な小範囲を再実行した。

```text
node --test --test-concurrency=1 tests/world.test.mjs tests/rooms.test.mjs
14 tests / 14 pass / 0 fail / 0.575179 s
```

これらの14件は先の61件へ重複加算しない。最終の製品差分を以下のblobで固定する。

### 最終対象の固定

`git hash-object --no-filters`:

|対象|blob|
|---|---|
|js/app.js|63639b70b6fd693f3f4ca9631eaebfa4bcdc6c42|
|js/towns.js|48f62e265a1d9dd44b62c2b24357ef0b18cabee7|
|js/world.js|cc9ab9150aae7da387f4719c7aa85444b82d9baf|
|js/rooms.js|3f78abf790b7ddc60ecde4aeea20ede50de74c74|
|js/rpg-world.js|5c4be17a2ba5d3cf88d7d1497557132453207589|
|index.html|402f0508c1330c07ddb2aa06c60dcb04492b6c91|
|tests/town-navigation.test.mjs|6be486d69af81cba0e476fa163701d2a1fe23e6c|
|tests/world.test.mjs|bc75ffbe0f20f9501f9e80bea996b8d57a55cc8c|
|tests/rooms.test.mjs|b04bb4f55d07c8fa20fa8584186993643d5fc413|

この担当は公開画面、320/390pxの実測、実機を操作していない。親のブラウザー証跡と全体suiteを合わせて統合する。人間が迷わないか/面白いかは本レポートで実証済みとしない。

親の納品準備補足: GitHubファイルアップロードとGitの改行変換の差を避けるためapp.js/index.htmlをLFへ統一した。意味・文字列・操作は同じで、最終raw blobはapp `2121b0219cb2e2dabe4aa950f4db2c99d32bb1e1`、index `a7ced214d70303c430843987a091ca711c06ebae`。上表の2件は正規化前に独立レビューした実バイトであり、保存版の変更ではない。
