# Y-02 — 歩ける7つの酒場と可変の町の扉

担当: world_engineer室内 / 2026-10-24。基準 `8f19a894fd01ffd1fe380fdb2a6838408bb760e3`。編集は `js/rooms.js`・`tests/rooms.test.mjs`・本報告のみ。コミット・公開・孫エージェントは行っていない。

## 実装

別担当Y-01の `getTownLayout(chapterId)` を使い、`getTownDoors(chapterId)` でshop以外の建物の扉を導出。`townDoors` はCH0の既存座標を保つ互換export。`doorAt` と `drawTownDoors` は各町の扉を使い、以前rooms側で描いていた固定の長老家を削除した。建物本体はworld側が所有する。看板は各扉の真上中央に短い店名を一度描く。CH0教会の扉19,15と既存看板を保持。従来引数省略のdoorAt/drawTownDoorsでは教会を表示しない互換挙動も保持した。

`roomPeople(id,chapterId='CH-0')`・`roomStep(id,position,dx,dy,chapterId='CH-0')`・`nearbyRoomPerson(id,position,chapterId='CH-0')` に後方互換の章引数を追加。`renderRoom` は `state.currentChapter` を参照する。全名/短名は既存getTavernと同じ定義であり、number/string/未知fallbackはgetTownLayoutへそろえた。

|章|歩ける酒場の特徴|
|---|---|
|序章・ひとつぶ|中央の炉端、左右の小卓、樽、木の床|
|第1章・銅貨横丁|長い立飲みカウンターと細長いサイドカウンター|
|第2章・あかし灯|石柱、石卓、床置きランプ、石の壁|
|第3章・しおかぜ|広い海窓、船具、船形の飾り、港のカウンター|
|第4章・星札小路|カードが並ぶ長机と木箱、壁の札板|
|第5章・鍵の入り江|開けたテラスの欄干、植物、水鉢、離れた卓|
|第6章・雲上亭|雲の見える窓、ソファ、低い卓、中央の敷物|

家具はtile矩形の同一定義から描画と衝突を作る。窓・床模様・敷物は歩行を止めない壁/床の飾り。酒場のNPCは9件/index0〜8を保持し、spawn12,12とexit12,15を変えない。client/elder/churchの配置と挙動は既存のまま。相談用の小さい `drawTavern` canvasは別担当のworld.jsであり、本担当は400×288の実際に歩ける部屋だけを変更した。

金融・XP・state・工程・保存へ更新を加えていない。

## 限定確認

`node --test tests/rooms.test.mjs` **7成功 / 0失敗**。

- 7町の可変扉がgetTownLayoutの建物定義と一致し、shopを含まない。CH0既存座標と教会限定、室内名を保持。
- 各扉の看板を動的座標で一度だけ描く。旧来の「全章で312,y73」という仮定を取り除いた。
- 7室内の家具矩形配置がすべて異なり、描画した家具の全tileがroomStepで通過不可。特徴的な炉端/カウンター/柱/船具/長机/植物/ソファも個別確認。
- spawnからのBFSで、全章とも9人全員がnearbyRoomPersonの返り値として実際に選べる。全NPCへの近接と出口への到達、NPC自体の衝突を確認。
- renderRoomとroomStepが入力state/固定spawnを書き換えない。既存の依頼人・長老・教会テストも成功。

## 未確認・親への統合

本担当のブラウザー・実機・公開確認は未実施。親はappからroomStep/nearbyRoomPerson/roomPeopleへ現在章を渡し、町からの入室/外へ出る先/各看板と室内見出し、実フォントでの看板幅を実画面で確認する。towns/world側がまだ作業中のため、全体の到達/衝突・全テスト・公開配信の最終結果は親の統合確認へ委ねる。

## 親の実画面指摘後の修正

320幅の「あかし灯」で石壁2段目が右の枠からはみ出す指摘を受けた。壁の端と、酒場/既存非酒場の床板・目地線をx368までにclampした。家具・人物・枠・会話・衝突は変更していない。既存室内テストへ全7酒場の床板/石壁の右端がx368以内である確認を追加し、`node --test tests/rooms.test.mjs` の再実行も **7成功 / 0失敗**。
