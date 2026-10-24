# AB-06 公開監査

担当: deployment_verify / qa_reviewer。2026-10-24。製品コード・Git参照・認証設定・公開設定は変更しない。

## 中間確認

最終の全ツリーは未判定。以下は製品・入口・READMEの変更7ファイルだけを対象にした確認であり、最終公開合格ではない。

- 基準: `863201a96a4d977d9c88c5cf3b376029b4acd0e3`。
- 確認時のremote main: `c2fc3b7bc094fb73d97922d56fc487957ef89085`。
- `README.md`、`index.html`、`js/app.js`、`js/fx-guidance.js`、`js/help.js`、`js/lesson-guide.js`、`js/phone-panels.js` の7件はGit blob SHAが全件一致。欠落・相違0。
- runtimeと入口のcommit `da22879810fa387e38f0022ec10bf1ab0a461325` の[Pages run40084300937](https://github.com/maca-labs/kotsu2-quest/actions/runs/40084300937)はsuccess。確認時の最新run40084361527はin_progress。
- CLI: git2.53.0、gh2.96.0。ログインはKou-no1、repository権限はpull=true/push=falseを読取確認。権限や認証の変更なし。

guide15の限定再照合でも、基準 `07847fdb5cdbbe0d16a943aba408090a63be0e61` と確認時remote `49a0c41b0d11e201ea1de4e91900dcc54500d2ad` の上記7件は全blob一致、欠落・相違0。同remoteの[Pages run40085823532](https://github.com/maca-labs/kotsu2-quest/actions/runs/40085823532)はcompleted/success。追加2画面の実操作・最終docsを含む全ツリーの合格は、この部分照合では判定しない。

## 最終監査の手順

親から最終prepared SHAと全アップロード完了通知を受けた後、`git ls-tree -r`で得る全path・blob SHA・modeを、GitHub APIで固定したremote mainのrecursive treeと照合する。件数、欠落、相違、余分、mode差とtruncatedの有無を確認し、リポジトリpublic、Pages mainルートとHTTPS、同SHAの最新Pages成功を記録する。既存worktreeのCRLFは比較基準に使わない。数値や行末が異なればblob SHAの相違として扱う。

この監査結果を追記公開した後は、その報告も含むツリーをもう一度読取照合し、最後の照合結果は親への返信だけに残す。

## 確認範囲

本担当はread-only Git/gh API監査と本報告だけを担当。ブラウザーのゲーム操作・実機・実参加者の理解や面白さは確認していない。親・専門役の自動テストや公開操作とは別の証跡として扱う。
