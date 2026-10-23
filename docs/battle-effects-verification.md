# 戦闘演出の検証 — W / 2026-10-23

基準は公開0f8cfef。今回の製品差分はbattlefx7。戦闘数式・難易度・報酬・金融・学習工程・保存schemaは変更しない。

## 自動確認

`npm test`: **292 PASS / 0 FAIL**。[実行ログ](./battle-effects-test-results.txt)。新規15件は演出10＋統合5。既存の金融・XP・重複・時間・保存・相対URLを含む。[実装担当](./reviews/W-01-effects.md)、[独立QA](./reviews/W-02-effects-qa.md)は別に記録。独立QA52件と追加3ケース、重大残件0。

各ケースはreal engineで確定した結果とfake clockで演出順を確認。通常6/反撃3、防御2、強打10、overkill、勝利回復、10行ログ、砂漠88/防御44と復活、逃走、破棄/skip、動き軽減を区別。演出は一度もdispatchせず、親が一度保存した結果だけを示す。

## ローカル実ブラウザー

静的HTTP `http://127.0.0.1:8781/`、in-app Chromium、390×844と320×720。物理端末とは区別する。

- 歩く→敵登場→開始→通常攻撃6→反撃3の数字と斬撃/点滅を実画面で確認。ダブルクリックでも一度の攻撃、HP30→27・敵14→8。
- 2回目の攻撃演出中にreload。turn3・敵HP2・自HP27で復帰し、攻撃を再実行しない。敵の力ためで反撃被害を出さない。
- 強打10を残り2HPの敵へ当て、0HPとなり敵spriteが消える。勝利後も敵canvas0個、初勝利12coin。
- 初期のskip縦行追加を修正。既存intent領域へ重ね、案内文の実高も保持。320座標タップでscrollY0、actionsTop479.5が演出前後同じ。4行動の下端689.3/720、横はみ出しなし。
- locator clickの自動スクロールと実際の座標タップを区別し、最終の位置確認は座標タップで実施。

## 公開

[公開版](https://maca-labs.github.io/kotsu2-quest/)で `20261023-battlefx7` を確認。製品JS afc4f550、入口/README 797b2bad93f86a057d15e4f001bf46599a977e98、[Pages run39928551760](https://github.com/maca-labs/kotsu2-quest/actions/runs/39928551760) completed/success。後続は同じ製品のtests/reviews/docs追加。

親が公開UIを実操作:

- 390×844、町メニューから世界地図へ出て20歩で遭遇。登場画面を経て戦闘開始。
- 座標タップで通常攻撃。点滅class/斬撃/実数字9/敵14→5を撮影。aria-busy=true・menu disabled。scrollY0、actionsTop487.5のまま、挿入による位置の変化なし。
- 反撃3の後reload。ターン2、HP33/36、敵5/14で再開。敵に二度ダメージを与えない。
- 320×720を実測。横はみ出しなし、4行動下端689.3。座標タップで強打13、敵0/14となり消滅。勝利画面の敵sprite0個、busy解除、scrollY0。
- 再戦なので冒険コイン0を維持。装備込み攻撃10を維持。公開タブconsole error/warn 0。

写真は `C:/Users/shudi/Documents/Beauty_photo/kotsukotsu-public-battle-hit.png`（390）と `kotsukotsu-public-battle-victory.png`（320）。ブラウザー確認を物理端末や人間の感想として扱わない。

## 未確認

物理iPhone/Android/Safari/支援技術、小学6年生の理解や実参加者の楽しさは未確認。動き軽減と詳細境界の自動検証は、人間の感想・実機タッチの証明にはしない。
