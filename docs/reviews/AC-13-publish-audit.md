# AC-13 — 公開リポジトリの全ツリー照合

担当: `/root/ac_qa` / qa_reviewer。実施: 2026-10-27 01:13〜01:15 JST。

**判定: GitHub上の対象コミットは、準備済みコミットの全222ファイルと一致した。Pagesの配信完了は、この確認時点では未確認。**

## 対象

| 対象 | 値 |
| --- | --- |
| ローカル保護ブランチ | `prepared-japanese16-20261027` |
| 準備済みコミット | `0ff5f2931dcb73e0e7fbf67b80453b5a83a76869` |
| GitHub mainの対象コミット | `4012728fed2c1543a998ef1af687b841714ffe56` |
| 両コミットのtree SHA | `48461957f09a823ab4949015a1cc27a9da004494` |
| 公開先 | [こつこつクエスト](https://maca-labs.github.io/kotsu2-quest/) |

公開操作は親が所有者Chromeの通常UIから行った。当担当は公開操作、Chrome操作、権限変更、mainのresetを行っていない。取得・比較・状態参照だけを実施した。

## 全ファイルの照合

`git fetch origin main`で対象オブジェクトを取得。両SHAに対して`git ls-tree -r -z --full-tree`を実行し、パス・mode・type・blob SHAを比較した。さらにGitHub APIの`git/trees/<公開SHA>?recursive=1`とも照合した。

| 確認項目 | 結果 |
| --- | --- |
| 準備済みファイル数 | 222 |
| 公開コミットのファイル数 | 222 |
| GitHub APIのファイル数 | 222、`truncated=false` |
| 欠落パス | 0 |
| 余分なパス | 0 |
| 同じパスの内容・mode・typeの相違 | 0 |
| fetchした公開オブジェクトとGitHub APIの相違 | 0 |
| GitHub mainのref | 対象SHA `4012728...`と一致 |

照合時刻: `2026-10-26T16:14:23.021Z`（2026-10-27 01:14:23 JST）。Gitが正規化したblobを対象にした比較であり、作業ファイルのCRLF/LF差やローカルの一時ファイルを混ぜていない。

機械照合結果はリポジトリ外の`C:/Users/shudi/AppData/Local/Temp/kotsukotsu-ac13-tree-audit.json`にも保存した。

## Pagesの状態

tree照合後に、[Pages run 40357004424](https://github.com/maca-labs/kotsu2-quest/actions/runs/40357004424)と最新Pages buildをread-only APIで確認した。

| APIの対象 | 確認時点の結果 |
| --- | --- |
| Actions run 40357004424 | `head_sha=4012728...`、`status=pending`、`conclusion=null` |
| 最新Pages build | `commit=4012728...`、`status=building`、`error.message=null` |
| Pagesの総合情報 | `build_type=legacy`、`status=errored` |

総合情報に`errored`がある一方、対象SHAの最新buildは`building`で、runの結論はまだ出ていなかった。この候補が失敗した、または配信に成功した、のどちらとも認定しない。短い間隔の不変ポーリングは続けず、この状態を親へ返した。配信完了と実ページの確認は親の後続確認が必要。

## この判定に含めないもの

この報告自身は、照合対象の222ファイルにはまだ含まれていない。後続の報告・記録を公開した場合、その新しいコミットまで本結果が自動的に適用されるわけではない。

公開ページのブラウザー描画、公開上の手操作、セーブ復元、人間の理解や面白さ、実機での挙動は当担当では未確認。ローカル411テストのAC-12とも区分した。製品・設定・既存文書は変更せず、この報告のみ作成した。
# 統合担当による配信完了の追記

独立監査後、Pages run40357004424は対象4012728でcompleted/successとなった。親は公開ページのjapanese16、IAB320でのFX010手入力→実submit名→100ドル表示、公開indexと変更JSの18バイト列一致を確認した。元のセーブは通常UIで復元し、再書出しJSONも元と完全一致。この追記は独立QA本人のブラウザー実施とは数えない。

