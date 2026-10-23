# 根拠と適用範囲

制作パック記載の確認日: 2026-10-23。
この参考資料一覧は添付パックを保存したものです。今回の実装作業で全リンクの現行内容を再確認したという意味ではありません。金融の追加値は[追加対応](./extension-coverage.md)の架空設定です。
以下は一次資料。作品の社内体制を丸ごと再現した仕様ではなく、
公開された制作上の考え方から、この学習RPGへ適用した提案である。
本作の所要時間、面白さ、継続率、学習効果はまだ実測していない。

## 開発者の話

G1. 任天堂「社長が訊く ドラゴンクエストIX」4. お客さんの立場でプレイ
https://www.nintendo.co.jp/ds/interview/ydqj/vol1/index4.html
堀井雄二氏は、何をすればよいか分かること、自分で触って確認することを重視している。
本作への提案: 監督が報告書だけで判断せず、序盤と復帰を実際に通す。

G2. 任天堂「社長が訊く ドラゴンクエストX」2. 毎日、遊ばなくていい
https://www.nintendo.co.jp/wii/interview/s4mj/vol1/index2.html
説明の細部、不安への配慮、気持ちよく終えられる設計が語られている。
本作への提案: 任意の24時間特典と、保存・再開・自分のペースを両立する。

G3. 任天堂「開発者に訊きました スーパーマリオブラザーズ ワンダー」Chapter 1
2023-10-18
https://www.nintendo.com/jp/interview/aqmxa/index.html
少人数での初期開発、職種を越えるアイデアと試作が説明されている。
本作への提案: 最初の一周を作り、編集の所有権は分けても改善案は横断して出す。

G4. 同インタビュー Chapter 3
2023-10-18
https://www.nintendo.com/jp/interview/aqmxa/03.html
開発側が気づかなかった難しさを、ゲームが苦手なメンバーの声から認識した話がある。
本作への提案: 実装者の「簡単」と初心者の実際の行動を分けて観察する。

G5. 任天堂「開発者に訊きました ゼルダの伝説 ティアーズ オブ ザ キングダム」Chapter 2
2023-05-11
https://www.nintendo.com/jp/interview/totk/02.html
遊び・システム・物語をまとめるテーマと、絵や音への反映が説明されている。
本作への提案: 依頼、判断、報酬、世界の変化に一つの方針を通す。

## Codexの公式情報

O1. Subagents
https://developers.openai.com/codex/subagents
転送先: https://learn.chatgpt.com/docs/agent-configuration/subagents
独立した作業への委譲、複数の編集作業への注意、カスタムエージェントのTOML、
子エージェント数の上限、親からの権限継承を確認した。
本キットのTOMLはname、description、developer_instructionsのみを使い、
モデル・推論量・権限を上書きしない。設定例の子上限3は親を含まない。
対応状況は利用するクライアントで確認する。未対応なら役割文書を通常任務へ渡す。

O2. Custom instructions with AGENTS.md
https://developers.openai.com/codex/agent-configuration/agents-md
転送先: https://learn.chatgpt.com/docs/agent-configuration/agents-md
プロジェクトの継続的な作業指示を置くための仕組み。
AGENTS.mdを置く行為そのものは、常駐エージェントの起動ではない。

O3. Best practices
https://developers.openai.com/codex/learn/best-practices
転送先: https://learn.chatgpt.com/guides/best-practices
目的、文脈、制約、完了条件を明確にし、指示を簡潔に保ち、必要な検証とレビューを行う。
本キットは共通指示を短くし、任務別の詳細を別ファイルに分けた。

## このキットで確認していないこと

利用者PCでのカスタムエージェント起動、ゲーム本体の実装・実機操作・公開、
人間による学習効果や面白さ、DQ IV内部の制作手法や未公開の数式。
Hyperliquid等の金融仕様は既存詳細仕様の出典と確認日を参照する。
今回の制作体制追加だけを理由に、金融の確認日を新しくしたことにはしない。

