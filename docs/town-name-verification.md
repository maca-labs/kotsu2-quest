# 町名と酒場名の検証 — X / 2026-10-23

基準c22e20e。配信版town8。保存schema3/rpg.version1、工程・金融・XP・報酬ID・町の扉と衝突は変更しない。

## 実装

入町時の表示は地図上部のoverlay、2800ms、自動消去。移動を止めず、上下の行やscrollを増やさない。HUDの場所は18px/狭幅16pxへ拡大。室内では章+町名と店名がそろう。看板短名と正式名はrooms/getTavernへ集約し、メニュー・室内・相談も同じ店を使う。

|章|酒場の正式名|看板|
|---|---|---|
|序章|居酒屋 ひとつぶ|ひとつぶ|
|1|立ち呑み 銅貨横丁|銅貨横丁|
|2|酒処 あかし灯|あかし灯|
|3|港バー しおかぜ|しおかぜ|
|4|大衆酒場 星札小路|星札小路|
|5|島バル 鍵の入り江|鍵の入り江|
|6|雲上亭|雲上亭|

## 自動・独立確認

`node --test --test-concurrency=1`でrooms/world/help/rpg-navigation/travel-navigation/paths/story-guide/encounter-routingの8ファイル、**54 PASS / 0 FAIL**。[ログ](./town-name-test-results.txt)。全7章の店名唯一性、看板中心/扉との非重複、既存扉・移動、ヘルプ、相対URL、戦闘・復帰・ガイドを確認。前回全292件の結果は今回の全件再実行として数えない。

[X-01実装](./reviews/X-01-town.md)、[X-02独立QA](./reviews/X-02-town-qa.md)に範囲を記録。独立38テストと70UI導出ケースが成功。相談dialogに旧固定店名が残る箇所を修正後、7町の表示と保存state不変を確認。

## ローカル実ブラウザー

静的HTTP http://127.0.0.1:8781/、in-app Chromium。

- 320×720、町への帰還で「旅立ちの村」のバナーと大きなHUDを確認。バナーpointer-events:none、pad下端540.4、横はみ出しなし。
- 居酒屋ひとつぶへ入ると「序章 · 旅立ちの村 / 居酒屋 ひとつぶ」。相談dialogも正式名が一致。
- 章選択でポイントの商店街へ。390×844のバナーとHUD、看板銅貨横丁、pad下端613.1、横はみ出しなし。
- 320の最長メニュー「酒場で聞く · 大衆酒場 星札小路」は幅117.5、高さ85、scrollWidth=clientWidth116で読める。店内ではバナー0、町名と正式名を表示し、pad下端540.4を維持。

## 公開確認

所有者Chrome UIからJS `064ead51ef12f5b8bb2b0c8a143e9f244889fafe`、入口/README `31ad17abc7c152da46eb33104d98b636eeb02994`を反映。[Pages #39931796069](https://github.com/maca-labs/kotsu2-quest/actions/runs/39931796069) success。公開rootのapp読込みが `20261023-town8`であることを確認。

- 320×720の旅立ちの村で入町バナーとHUDを確認。pad下端540.4、横はみ出しなし。
- メニューの章選択には序章〜第6章の7町を表示。通貨の港へ出発し、390×844で「町に入りました / 通貨の港」、HUD「第3章 / 通貨の港」、看板「しおかぜ」を確認。pad下端613.1、横はみ出しなし。
- 320で「酒場で聞く · 港バー しおかぜ」から入店。室内HUDは「第3章 · 通貨の港 / 港バー しおかぜ」、canvas名と相談dialogの見出しも同名。室内の入町バナーは0、pad下端540.4、横はみ出しなし。
- 公開コンソールの警告/エラー0。テスト保存の67XP・0コイン・HP36/36を保持。

公開画面の記録: `C:/Users/shudi/Documents/Beauty_photo/kotsukotsu-public-town-start.png`、`C:/Users/shudi/Documents/Beauty_photo/kotsukotsu-public-town-name.png`。ブラウザー操作の接続待ちと画面更新前の画像は製品不具合として数えず、操作後のDOMと次の画像で確認した。

## 未確認

実iPhone/Android/Safari/支援技術、実参加者の理解や楽しさは未確認。狭幅ブラウザーの結果を物理タッチや人間観察として扱わない。
