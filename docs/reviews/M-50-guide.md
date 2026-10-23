# M-50 — いま操作する実物の欄へ矢印を付ける

担当: phone_engineer / 2026-10-23。ユーザーの「同じ位置を連打するだけでは意味が分からない。実画面で矢印と短文を示してトレースしたい」という指定のうち、親が選んだ実操作要素へ矢印と囲みを重ねる module を担当した。

編集は新 `js/operation-guide.js`、新 `tests/operation-guide.test.mjs`、専用 `styles/phone-extension.css` の追加部分、本報告のみ。字幕つき実操作のお手本動画、app/native/extension における操作対象の選定と接続は親の担当。孫・ブラウザー操作は行っていない。

## 接続契約

`mountOperationGuide({document,phone,step}) → {destroy,scrollToTarget}`。`phone.querySelector('[data-guide-target]')` の最初の1要素だけを対象にする。親は guided 本編だけへ data 属性を付け、レビュー/ボスに使用しない。画面を交換する前に現在の controller.destroy() を呼ぶ。同じ phone への再 mount は既存の装飾を解除してから開始する。

- 実 target の getBoundingClientRect を使い、通常は直上に「ここをタップ」または編集できる入力欄なら「ここへ入力」と下向き矢印を出す。
- phone の内側8pxへ左右を収める。上端に余白がない場合は対象を覆わないため直下と上向き矢印に替える。極端に低い phone でラベルの安全な余白がない場合、矢印ラベルを隠して対象の囲みを残す。見えていない対象へ、画面端の別ボタンを指す矢印を出さない。
- marker と子は pointer-events:none。既存のボタン/ラベル/入力欄の名前、readonly、フォーカス、44px操作寸法へ触れない。視覚上の装飾は aria-hidden で、実操作要素のアクセシビリティ名を変更しない。
- window resize/scroll、phone 内部 scroll/load/transition、ResizeObserver、子DOM変更を監視して位置を読み直す。requestAnimationFrame で同じフレームの更新をまとめる。文字が変わらない時には textContent を書き直さず、装飾が自身の監視を延々と起動しない。
- destroy は予約フレーム、すべての listener と observer、追加した class、marker を解除する。親や別 module が元から付けた class は保持する。
- scrollToTarget は現 target の scrollIntoView だけを呼ぶ。入力、選択、クリック、STEP、focus、キーボード起動を代行しない。動きは auto で、装飾自体のアニメーションはなく reduced-motion にも従う。

## 確認

`node --test tests/operation-guide.test.mjs`: **6 PASS / 0 FAIL**。`node --check js/operation-guide.js` 成功。

最小DOMで、複数候補の先頭1つだけの囲み、クリック透過、元の名前と44px寸法を維持、320pxの左右クランプ、スクロール/リサイズ/観測による矢印移動、上端での退避、隠れた対象や狭すぎる枠、入力/readonly/選択/ラベル、scrollのみの呼出し、リスナー/observer/予約フレーム解除、対象交換、二重 mount、対象なしを確認した。初回に左右クランプのテスト座標が実際には余白内だったため、境界外の座標へ修正して再実行した。

この確認は位置計算とDOM契約の自動検証。実ブラウザーの描画寸法、実機のOSキーボード、公開URL、字幕動画、人間がトレースできるかは親の統合確認へ渡した。面白さや小6の理解を実証した結果ではない。

## M-61 — 販売所/板の切替対象の抜けを修正

QAが DX-03 などの venueSwitch 工程では handlesAction:true なのに両タブが非 primary で、矢印の対象がないと指摘した。親から `js/phone-extension.js` の所有権を受け、**本編の通常DX工程で、いま要求された方のタブだけ**へ data-guide-target を付けた。primary の見た目、元の押下イベント、金融/state/IDは変更していない。

見学中の切替タブ、要求と違う見学先タブ、独立復習、ボス用に複製した工程、通常の閲覧工程へ正答の target は付けない。見学から元へ戻る既存ボタンの扱いは維持する。

`node --test tests/operation-guide.test.mjs tests/phone-guide.test.mjs tests/phone-funding.test.mjs`: **21 PASS / 0 FAIL**。operation-guide 単独は追加1件を含む **7 PASS**。全 venueSwitch 工程で要求タブ1個だけの target、要求先/別見学先の実コールバック値、preview/review/boss/非切替の抑止、表示で state が変わらないことを確認。phone-extension の構文確認も成功した。実ブラウザー再確認は親へ返した。
