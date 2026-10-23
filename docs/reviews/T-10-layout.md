# T-10 探索主画面のレイアウト実装

- 担当: world_engineer。編集した製品ファイルは `styles/exploration.css` のみ。
- 基準: T-03-learning-review の地図前の反復スクロール指摘と、親が指定した `.exploring` / `.playing` / `.game-bar` / `.exploration-content` / `.exploration-stage` / `.adventure-menu` 契約。
- 必読: AGENTS.md、docs/PRODUCTION.md、CONTRACTS.md、WORKBOARD.md、DECISIONS.md、agents/world_engineer.md、T-03-learning-review.md。T-02 は着手時点で未到着。

## 変更

- 共通 shell を1列にし、従来 sidebar を非表示。現在地・HP/Lv・メニューを高さ56pxを基準にした上部バーへ置く。
- 探索は上に短い次目的と44px以上の詳細ボタン、続いて地図・十字キー・短い位置説明を一つのstageにまとめる。
- canvas の25:18比と全体表示を維持。幅だけでなく画面高に応じてstage幅を制限し、短いデスクトップ画面で地図だけが巨大にならないようにする。引き伸ばし・画像の切り抜き・object-fitは使わない。
- 390px想定は既存64pxキー、320px想定は56pxキー。画面高650px以下では48pxキーにし、全キー44px以上を維持。中央「話す」の既存DOMと長押し処理をそのまま使う。
- 町・室内・野外・洞窟に同じstageルールを適用。探索のtoolbar/footer/map-labelを非表示にし、指示の重複を減らす。
- メニューは2列、詳細とステータスをまとめ、長い内容はdialog内をスクロール。メニューを閉じた後の地図位置保持は親のJS担当。
- 旅戦闘は敵の絵とHPを横にまとめ、予告と4行動を先に見渡せる余白へ整理。各行動の説明を消さずに残す。スマホの入力文字の大きさと入力画面レイアウトは変更しない。

## 確認

- NodeによるCSS括弧の対応検査: PASS。ソース7467bytes。
- ソース点検: キーサイズ64/56/48px、全button最小44px以上、canvas `height:auto; aspect-ratio:25/18`、メニュー2列 `minmax(0,1fr)`、長文折返しを確認。
- この担当ではブラウザー表示・公開一周・実機操作は未実施。親のDOM統合後に320×720と390×844で、町/室内/野外/洞窟の地図と十字キー下端、横overflow、戦闘4行動、メニュー開閉を実測する必要がある。
- 保存・XP・学習工程・装備/資金の状態更新には触れていない。面白さや人間の理解を実証したものではない。

## 統合依頼

`index.html` のCSS末尾に相対URLで `styles/exploration.css` を追加し、他の配信ファイルと同じ版queryにする。親が持つappで各クラスを付ける。探索stage内の余分な家一覧・町説明はmenuへ移す。stage内に別の長い説明が残る場合、その高さは本CSSの第一画面想定に含まれないので、親の実測後に調整する。
