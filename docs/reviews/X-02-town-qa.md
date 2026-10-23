# X-02 — 町名と章別の酒場・独立QA

2026-10-23。基準 `c22e20e55cde8ef2044153716db734b246269e2c`。担当 qa_reviewer、製品コードは編集しない。編集は本レポートのみ。親がapp/探索CSS/入口/共通契約、UI担当がrooms/getTavernを所有する。AGENTS/PRODUCTION/CONTRACTS/qa_reviewerの指示を踏まえ、実ブラウザー/実機/人間の理解度はコード・自動検証と分ける。

## 初期の経路点検

町の名前は既存chapter.titleと世界地図の町feature.labelが対応している。`getRpgMap('town:CH-*')` は町描画の入口ではなくnullとなるので、町名取得をその戻り値だけへ依存させない。

|経路|既存の実装入口|今回の確認点|
|---|---|---|
|世界地図から町へ|walkExpedition/interactFeature → travelArea|CHAPTERと現在地が確定した後の町名を示す|
|最初/ホームの章選択|enterChapter または CHAPTER|最初から好きな町へ行っても正しい名前|
|町へ近道|nav('world')、旅の目的/戦闘結果からtravelArea|別入口でも同じ町名と入町表示|
|家・酒場から町へ|leaveRoom|roomを消した後に現在町が分かる|
|保存読込・再読込|store.replace、startup|保存された章/町の名前、旧表示の取り残しなし|
|教会復活から外へ|wakeAtChurch / leaveRoom|元の敗北章でなくCH-0の町。室内に町バナーを残さない|
|野外・洞窟・店・設定|nav/render/travel|町の入場バナーをこれらの画面へ持ち越さない|

## 初期に親へ返した取り残し

`js/ui-adventure.js` の tavern() は相談画面の題名を「冒険者の酒場 · こもれび亭」に固定している。rooms.jsの7店を変えただけでは、CH-1〜6で酒場の人へ相談すると室内/HUDと違う店名へ変わる。getTavern(state.currentChapter)を使う共通名称へ揃える必要がある。親へ通知済み。

appのplaceName/renderRoomViewはroomTitleの第3chapterId、町のmenuと看板はgetTavernが必要。これらの呼出漏れを差分固定後に再検索する。

## 最低受入条件

- 7章それぞれに別の酒場名があり、kindを含む正式名/短い看板名を共通データから取得する。室内/HUD/メニュー/相談の店が一致する。名称だけの変更で通行・扉・会話先・IDを変更しない。
- 町への全入口と再開で現在町の名前が見える。入町バナーは受動的な表示で、移動/十字キー/メニューを止めず、焦点を奪わない。
- バナーを室内・野外・戦闘・店・設定へ持ち越さず、敗北前の町や前章を表示しない。画面の再描画だけでSTEP/XP/金融/報酬を追加しない。
- 320/390pxの看板・名前・HUDが横にはみ出ず、十字キーが操作できる。コードの寸法確認と実ブラウザー測定は分ける。
- 永続保存のschema/既存ID/クエスト進捗/数値は変えない。バナー/酒場名はUI導出であり、毎描画の保存イベントを増やさない。

## 統合後の確認

差分固定後の確認完了。重大残件0。製品コードは編集していない。

### X-02-01 — 相談先だけ旧店名となる取り残し（解消）

- 根拠: 利用者の「全町の酒場別名」と、看板/メニュー/室内の整合。
- 再現条件: CH-1〜6の酒場へ入り、酒場の人の相談画面を開く。
- 初期の実際: 相談の題名だけ「冒険者の酒場 · こもれび亭」に固定され、章別の店と異なった。
- 期待/影響: 同じ店の看板と題名が一致し、別の場所へ移ったと誤解させない。
- 修正: 親がui-adventureの題名を `getTavern(state.currentChapter).name` へ統一した。
- 再確認: 実際のopenHelpを模擬DOMで7章とも実行し、その章の正式名と一致、state不変。合格。

### 最終の名称と呼出

7町の正式名は「居酒屋 ひとつぶ」「立ち呑み 銅貨横丁」「酒処 あかし灯」「港バー しおかぜ」「大衆酒場 星札小路」「島バル 鍵の入り江」「雲上亭」。短い固有名を同じgetTavernのsignから描く。看板は中心312/上端63/高さ13を保ち、扉描画上端77へ重ならない。

appのplaceName/renderRoomViewのroomTitle呼出は全て第3引数が現在章。メニューは最終文言「酒場で聞く · ＜正式名＞」を確認した。酒場の相談題名も同じ正式名。残る「こもれび」は既存の独立教材「こもれび貸出窓口」であり、酒場名の取り残しではない。

### 入町表示と経路

renderTownArrivalは `ui.view==='world' && !ui.room && map.startsWith('town:')` で町を導出し、全renderの最後から呼ぶ。visibleTownが変わった時だけ2800msを設定し、同じ町での再描画は残り時間を使う。親renderは先に旧timerをclearする。野外/洞窟/室内/店/設定/戦闘ではvisibleTownをnullにし、バナーを追加しない。

地図のworld-view内へabsoluteで表示し、新しい縦の段を作らない。pointer-events:none、tabindexなしで、移動を止めず焦点を移さない。HUDの町名を18px（360px以下は16px）にし、室内と店では小見出しに章＋町名も表示する。CSSのbox-sizing/折返し/max-widthを確認したが、画面幅の実測は親のブラウザー確認と分ける。

### 実行した限定検証

```text
node --test --test-concurrency=1 tests/rooms.test.mjs tests/world.test.mjs tests/rpg-world.test.mjs tests/help.test.mjs tests/paths.test.mjs tests/travel-navigation.test.mjs
38 tests / 38 pass / 0 fail / 1.418352 s
```

さらに、製品やテストファイルを編集せずstdinから、本番placeName/locationCaption/renderTownArrivalをVMで、openHelpを既存の模擬DOM fixtureで実行した。**独立70ケースが成功**。

- 7町それぞれの到着、2800msの表示、1000ms後の再描画で残1800ms、酒場へ入ると消去、室内の正式名/町の小見出し、町へ出ると再表示。
- 同じ7章で野外・洞窟・店・設定・戦闘はバナーなし/visibleTown=null。
- 7店の相談題名が正式名に一致し、表示前後のstate JSONが不変。

これらは表示関数の入力行列を検証したもので、70回実ブラウザーで旅をしたという意味ではない。CHAPTERによる町選択は実engineで作り、除外画面の場所はUI分岐用の独立snapshotとして与えた。実際の徒歩/近道/保存再開は既存経路の読取りと親のブラウザー証跡に合わせて判断する。

町名/酒場名/バナーの差分にSTEP/XP/金融/報酬/保存schemaの更新処理がないことを確認。関連map/室内移動/教会復帰/相対パスの回帰も上記38件で成功した。

### 対象の固定

`git hash-object --no-filters`:

|対象|blob|
|---|---|
|js/app.js|ddc8d6f38d1a4564bcccf558f5f63e6a80b4d1d7|
|js/rooms.js|c2ac9610f03583d566ef54193112838f7ca2024a|
|js/ui-adventure.js|64e7783bbcfc754cef0ec6694f3d5b91d832b39d|
|styles/exploration.css|d0e749c378c2a4c27d2d6c3583c091907b083127|
|index.html|c5fc2d74c7c410a657f065b5eda67842fb84c431|
|tests/rooms.test.mjs|12cf27c026700989ba7f643c86db0faebc98af95|

公開画面・320/390pxの実測・実機・人間の理解度/面白さは、本担当の実施結果として扱わない。親へ最長の店名のメニュー折返しも確認対象として伝えた。
