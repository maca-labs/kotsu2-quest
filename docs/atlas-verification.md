# 旅人、町、戦闘、練習スマホのデザイン更新

2026年11月21日。配信タグは `20261121-atlas`。町を選んで歩き、依頼人の顔を覚え、練習中も次に押す部品を見つけられることを目標にした。

## 画面と人物

- 表紙から序章へ直接入れる。章を選ぶときは、その町の実際の地図と、そこで練習することを見比べられる。旅人の3種類の服には読み上げ用の名前を付けた。
- 会話の顔絵と地図上の人物を、話者名に結び付けた。ミナの羽根印の帽子、ナギの船長帽、コハクのゴーグル、オリベの白いひげと杖が目印になる。
- 町の屋根、扉、草地、水辺を描き直した。探索中はスマホ幅で地図の下に十字キーを置き、横に広い画面では地図の右へ移す。
- 野道、洞窟、砂漠の風景と14種の敵を別々に描く。ダメージと点滅は攻撃された敵の上に表示し、倒した後も風景が残る。
- 練習スマホでは、入力欄、入力を助ける候補、確定ボタン、アプリのアイコンを区別する。入力後とホームでは、矢印の案内用に行を確保する。

## 確認したこと

Node.jsの全421テストが合格した。失敗・スキップはいずれも0件。工程、金融計算、XP、保存、移動も回帰テストに含む。

- ローカルの静的HTTPサーバーでリポジトリ名付きのURLから起動した。親担当はアプリ内ブラウザーで表紙、章選択、序章への出発、村の目的と十字キーを確認した。
- 練習スマホの担当が専用のChromiumで幅320pxと1000pxを確認した。FXの数量を手入力し、消してから候補で再入力し、確定して100ドルの表示まで進んだ。入力候補と吹き出し、吹き出しと確定ボタンの間は各8px。ホームでは案内が他のアプリアイコンと重ならなかった。
- 町の背景、歩行姿、顔絵と装備、戦闘の輪郭と描画レイヤー、矢印の対象と後片付けを個別に検証した。7つの町のプレビューを繰り返し表示しても、セーブと描画結果が変化しないことを確認した。
- 別のQA担当は320×740の新規利用環境で、旅人を選択し、案内どおりに十字キーでミナの家へ入った。受注後はゲーム内の近道を使って南門へ進み、街道戦と洞窟の門番戦に勝利した。戦闘中の再読込みも行った。序章の練習スマホは12工程すべてを実操作し、町に戻って旅人の手帳を受け取り、ミナに報告した。報告時点で67 XP。確認した画面で横方向のはみ出し、コンソールエラー、HTTPエラーは0件だった。
- 独立した初心者役が320pxと1180pxで旅人の選択と第5章への出発を操作した。320pxでタイトル末尾だけが改行される問題を直し、1行に収まることを確認した。2つの出発ボタンの高さは44px。章選択には各章の学習内容を関連付け、全7件の説明をブラウザーのアクセシビリティツリーで確認した。
- 戦闘で以前の探索用CSSが優先され、320px幅で敵の背景が90pxになっていた。重複スタイルを取り除き、洞窟の戦闘で外枠274pxに対して背景272px、敵の描画領域約111pxを確認した。金色の攻撃ボタンの補足も濃い文字にした。
- 会話を確認して、依頼人が自分の名前を主語にしていた台詞を修正した。全36依頼について、顔絵の話者、受注時の台詞、スマホで最初に表示する台詞の組み合わせを照合した。
- 人物の識別、画面の読みやすさの判定には、実装担当と別のレビュー担当を置いた。実際の小学生による理解・楽しさの観察、iPhoneとAndroidの実機、Safari、実際の読み上げソフトでの確認は未実施。

## 素材

人物、装備、モンスター、町の地形はゲーム同梱の描画コードで作る。表紙の風景には組込みのImageGenを使い、配信用にWebPへ変換した。[表紙の画像](../assets/valley-cover.webp)

<details>
<summary>表紙イラストの制作指示</summary>

Original panoramic pixel art scenic key art for the Japanese indie adventure RPG Kotsukotsu Quest. A sunlit alpine river port seen from a wooded cliff: tiny terracotta-roof postal village with a tall postal tower and weather vane, stone bridge, winding turquoise water, layered jagged teal mountains, golden late afternoon peach clouds. In the right foreground a small traveler in a deep jade coat with a distinct flowing vermilion scarf and tan satchel stands back to viewer, holding a wooden staff, looks toward the village. Wide cinematic 2.6:1 horizontal composition; valley, buildings and focal traveler grouped in the middle-right; far left dark pine silhouettes provide quiet space for title to be overlaid in HTML. Art-directed nostalgic 1990s Japanese handheld JRPG world map illustrated with meticulous discrete square pixel clusters, intentional limited color ramps, hard pixel edges, rich detail and depth. Tiny sunlight on birch edges, river reflections, red banner. Bold silhouette and cohesive perspective. No lettering, no text, no border, no logo, no UI. Full bleed landscape.

</details>
