import {quests as catalogQuests, steps as catalogSteps} from './content.js';
import {getHelpTopics,humanFieldLabel,displayPracticeValue} from './help.js';
import {getExtensionView} from './finance-extension.js';

// A seal belongs to a meaningful, validated result. Reading clues can prompt a
// character message, but never damages an enemy or changes learning rewards.
const stage = (end, title, text, kind = 'seal', worldKind = null) => ({end, title, text, kind, worldKind});
const story = (client, enemyName, kind, incident, goal, stages) => ({client, enemyName, kind, incident, goal, stages});
export const adventureCatalog = {
  'PR-01': story('郵便屋ミナ', 'ことば隠しのコロリ', 'letter', '郵便の合言葉が、メモから消えてしまった。', 'メールの言葉を写し、村の掲示板へ戻そう。', [
    stage(6, '言葉のかけら', 'コピーできたね。まだメモには残っていないよ。', 'clue'),
    stage(12, '手帳の最初のページ', '保存した言葉が届いた！ 村の掲示板に用事を書けるよ。', 'seal', 'noticeboard'),
  ]),
  'PO-01': story('店主ハル', '未読びんのコウモリ', 'letter', '商店の連絡帳が閉じ、注文の知らせを受け取れない。', '練習メールで登録を確かめ、商店の連絡帳を開こう。', [
    stage(7, '練習の名前札', '練習用の情報がそろったね。次は届いたメールを見よう。'),
    stage(13, '届いた六つの数字', 'メールは見つかったよ。読むだけで登録完了にはならないんだ。', 'clue'),
    stage(19, '連絡帳の鍵', '認証が通った！ お店へ知らせを送る道が開いたよ。', 'seal', 'postbox'),
  ]),
  'PO-02': story('店主ハル', 'おまけ札のキツネ', 'shop', '大きなポイントの札に、余分な出費が隠れている。', '必要な買い物に合う案件を選び、正しい入口を通ろう。', [
    stage(7, 'おまけより手元の価値', '送料まで比べてAを選べたね。大きな数字だけでは決めなかった！'),
    stage(13, '商店へつづく足あと', '参加してから店へ来た記録が残った。商店の道しるべを立てるよ。', 'seal', 'shop-sign'),
  ]),
  'PO-03': story('店主ハル', '値引きのまぼろし', 'parcel', '日用品の荷箱に「条件不足」の封がついている。', '割引と送料を分けて見直し、必要な日用品だけを注文しよう。', [
    stage(6, '送料を外して数える', 'クーポンを外すと対象の金額が戻ったね。条件の封が一つ解けた！'),
    stage(13, '日用品の出発', '2,000円の注文ができた。町へ運ぶ日用品の荷箱が動きだしたよ。', 'seal', 'supply-crate'),
  ]),
  'PO-04': story('郵便屋ミナ', '控えさらいのネズミ', 'ledger', '買った証しが散らばり、注文を探せなくなっている。', '注文メールと控えを集め、ポイントの待ち時間を確かめよう。', [
    stage(5, 'なくならない注文控え', '注文の番号・金額・日付を集めたよ。郵便棚にしまっておくね。', 'seal', 'mail-shelf'),
    stage(10, 'まだ待っている印', '予定日を過ぎても判定待ちだね。次は控えを使って問い合わせよう。', 'clue'),
  ]),
  'PO-05': story('郵便屋ミナ', '返事止めのクモ', 'letter', '遅れた知らせが、商店街の郵便道をふさいでいる。', '控えを添えて問い合わせ、返事と承認を見届けよう。', [
    stage(6, '伝わる問い合わせ', '注文番号と理由と条件の控えがそろった。何を調べてほしいか伝えられるね。'),
    stage(12, '返ってきた知らせ', '今回の注文の確認が終わったよ。承認された印まで受け取れた！', 'seal', 'mail-road'),
  ]),
  'PO-06': story('店主ハル', '受取忘れのツボ', 'gift', '交換したはずの贈り物が、受取所で待っている。', '使える期限を見て選び、贈り物を手元まで受け取ろう。', [
    stage(5, '使う日から選ぶ', '30日使える交換先だね。申請しても、受取はもう一歩あるよ。', 'clue'),
    stage(10, '手元に届いた贈り物', '履歴にも受取済みの印がある。交換所の窓を開けられるよ！', 'seal', 'exchange-window'),
  ]),
  'BK-01': story('帳場のスイ', '白紙を食べる紙ムシ', 'document', '城門へ出す申込書の空欄が、次々に増えてしまう。', '練習人物のカードと同じ情報で申込書を作ろう。', [
    stage(8, '返事を受け取る入口', '銀行からの練習メールが届いたね。コードを確かめよう。', 'clue'),
    stage(14, 'メールの持ち主', '認証できた！ 次は朝日ミナトさんの情報を写す番だよ。'),
    stage(20, '人物の三つのしるし', '氏名・カナ・生年月日をカードと合わせたね。'),
    stage(26, '住まいと仕事', '部屋番号まで入れ、カードどおりの仕事を選べたよ。'),
    stage(32, '白紙の通行証を提出', '申込書を受け付けたよ。受付と利用開始は別だから、本人確認と結果まで見届けよう。', 'seal', 'document-desk'),
  ]),
  'BK-02': story('帳場のスイ', 'うつし鏡の番犬', 'identity', '城門の鏡が、人物と書類が同じか確かめたがっている。', '内蔵カードと人物を確かめ、利用可能の通知まで見よう。', [
    stage(5, '使える練習書類', '本人の練習カードを選べた。文字の中身も見比べよう。'),
    stage(10, '期限まで一致', '名前も住所も日付も合うね。有効期限も教材の今日より先だよ。'),
    stage(16, '読めたカード', '枠に置いたカードの読取結果を受け取れた！'),
    stage(23, '開いた鏡の門', '顔合わせと審査が終わり、利用可能を確認できた。城門の灯りをともすよ。', 'seal', 'gate-light'),
  ]),
  'BK-02-R': story('帳場のスイ', 'ぼやけ雲のコグモ', 'identity', '別の練習写真が暗く、輪郭が読めなくなった。', '画面の人物を明るい場所へ置き、鮮明な画像を使おう。', [stage(6, '輪郭が戻った写真', '撮り直した画像は読み取れるね。本編の口座はそのまま大切に残しているよ。', 'seal', 'photo-lamp')]),
  'TR-01': story('橋守レン', '名義すりかえのカニ', 'bridge', '二つの金庫をつなぐ橋の札が、別の名前に変わっている。', '自分の口座へ送り、受取側の明細まで照合しよう。', [
    stage(6, '橋の行き先', '受取銀行を選べたよ。支店と口座も同じか確かめよう。'),
    stage(12, '金庫の番号', '口座の種類と番号がそろった。まだ送金はしていないよ。'),
    stage(18, '渡す金額と日付', '3,000円を今日送る内容だね。手数料を足した合計も見よう。'),
    stage(24, '一度だけの承認', '名義と金額を確かめて承認した。橋の送り側がつながった！', 'seal', 'bridge-half'),
    stage(26, '向こうの金庫にも印', '受取側にも3,000円の明細がある。二つの金庫の橋がつながった！', 'seal', 'bridge'),
  ]),
  'FX-01': story('船長ナギ', '桁ずらしのヤドカリ', 'compass', '港の積荷札が、通貨の名前と数量を混ぜてしまう。', '通貨・買い売り・lotの単位を注文前に合わせよう。', [
    stage(6, '二つの値札', '売る値段と買う値段を見分ける手がかりがそろったね。', 'clue'),
    stage(12, '小さな積荷の単位', '0.1lotは100通貨。この教材の単位で確かめられた！'),
    stage(18, '注文前の羅針盤', '米ドル円・買い・1,000通貨の準備を確かめた。この準備では発注はしていないよ。', 'seal', 'harbor-sign'),
  ]),
  'FX-02': story('船長ナギ', '建玉つかみのタコ', 'anchor', '閉じていない取引が、港のいかりに絡みついている。', '持っている建玉から決済し、残量ゼロの記録を残そう。', [
    stage(4, '新規の積荷', '確認した買い注文が成立した。今ある建玉を見失わないでね。'),
    stage(9, '値動きの波', '今閉じたときの損失が変わった。損失があっても練習は続けられるよ。', 'clue'),
    stage(14, 'いかりをほどく決済', '新規売りではなく、同じ建玉の全数量を決済できた！', 'seal', 'harbor-rope'),
    stage(20, '残量ゼロの航海日誌', '損失も正直に残したね。閉じた取引の記録で船を整えられるよ。', 'seal', 'boat-ready'),
  ]),
  'FX-02-S': story('航海士イト', '逆風のコウイカ', 'anchor', '売りから始める別の航海で、閉じる向きが分からない。', '独立したユーロ円の売りを、決済買いで閉じよう。', [stage(6, '別の港の積荷', 'この別練習は1,000ユーロ。元の米ドル円とは混ぜないよ。'), stage(12, '売りからの値動き', '売り建玉は買う値段で閉じるんだ。今の表示を見よう。', 'clue'), stage(18, '逆風の航海記録', '決済買いと記録がそろった。利益の大きさではなく、確かめた手順が力になるよ。', 'seal', 'side-log')]),
  'FX-03': story('港番ウミ', '条件札のウツボ', 'ledger', '港の番人が、注文回数と約定した数量を取り違えている。', '事前の条件と、新規・全決済の記録を照合しよう。', [stage(6, '先に読んだ条件札', '対象は米ドル円の新規量だね。決済量を新規へ足さないよ。', 'clue'), stage(12, '記録で開く出港札', '条件と承認の明細が一致した。港の出港札を掲げられる！', 'seal', 'harbor-open')]),
  'TC-01': story('道具屋コハク', '見かけ値のヤモリ', 'cards', '星札の値札が高く見えても、費用を引くと足りなくなりそうだ。', '同じ版と状態を比べ、全費用を入れて仕入を判断しよう。', [stage(7, '売れた値段の手がかり', '出品中の値段ではなく、同じ条件で売れた記録を集めたね。', 'clue'), stage(13, '裏側と送料の手がかり', '傷と仕入送料も分かった。ここから費用を全部並べよう。', 'clue'), stage(19, '隠れた費用の封', '発送と梱包まで数えたね。想定利益は、売れる保証とは分けよう。'), stage(21, '市場に届く星札', '内容を確かめて仕入れた。まだ売上でも利益確定でもないよ。', 'seal', 'market-crate')]),
  'TC-02': story('梱包屋シノ', '未入金のハコガメ', 'parcel', '売れた星札の荷物が、発送と入金の間で止まっている。', '傷を伝え、守って送り、受取と入金まで見届けよう。', [stage(5, '正直な検品札', '裏面の傷をメモに残した。届く人が迷わない説明にできるね。'), stage(10, '写真と商品名', '表と裏の写真、商品名がそろったよ。'), stage(16, '傷を隠さない説明', '版と状態が合い、傷の場所も伝えられた！'), stage(22, '正しい出品札', '確認した内容で出品できた。売れた印とはまだ別だよ。', 'seal', 'market-stall'), stage(28, '守って送る荷箱', '台紙と防水袋で守って発送した。受取の知らせを待とう。', 'seal', 'parcel-road'), stage(32, '届いた売上の印', '受取と入金を確認した。売上と利益を分けて、市場の帳面を閉じられる！', 'seal', 'market-light')]),
  'FI-01': story('船便係セナ', '円箱かくしのモグラ', 'bank', '群島へ向かう支度金が、どこにあるか分からなくなった。', '円の現在地を見て、教材コインの購入履歴までたどろう。', [stage(8, '支度金の出発カード', '120,000円の送り方を用意できた。まだ入金前なので、確認へ進もう。'), stage(15, '国内の窓口へ到着', '国内の練習窓口に120,000円が届いた！', 'seal', 'funding-desk'), stage(23, '購入した教材コイン', '104枚の購入履歴を確認できた。次は自分の練習財布へ運ぼう。', 'seal', 'funding-token')]),
  'FI-02': story('船便係セナ', '宛先かくしのヤドカリ', 'wallet', '購入した教材コインを運ぶ荷札から、自分の宛先が消えている。', '自分の練習財布と送る道を合わせ、受取を確認しよう。', [stage(7, '受取口の手がかり', '自分の財布で受け取る準備を見つけたね。道と宛先を照合しよう。', 'clue'), stage(9, '自分へ続く宛先', '自分の練習用の宛先を選べた！'), stage(17, '財布へ向かう荷物', '費用1枚を引く出庫が受け付けられた。到着の知らせが来たら、今回の明細も見比べよう。', 'seal', 'funding-dock'), stage(21, '財布の中の103枚', '自分の練習財布に103枚が届いた。残高だけでなく今回の明細も合うね。', 'seal', 'wallet-supply')]),
  'FI-03': story('船便係セナ', '道替えのミズヘビ', 'network', '持っているコインの種類と道が、次の島の入口に合っていない。', '交換・道替え・ガス準備を分け、入口に合う荷物へ整えよう。', [stage(6, '使うコインへ交換', '種類を替える操作を確定した。道を替える操作とは別だね。'), stage(8, '交換後の受取', '1,030の教材USDCを確認できた。次は送り道を合わせよう。', 'seal', 'swap-sign'), stage(16, '別の道へ到着', '道替えの費用20を引き、Arbitrumに1,010が届いた！', 'seal', 'network-bridge'), stage(23, '道を使うための小さな燃料', 'USDC1,000とガス用ETH0.001を別々に用意できた。', 'seal', 'gas-lamp'), stage(26, '群島へ渡す準備帳', '種類・道・ガス・現在地がそろった。次の島へ同じ残高のまま進めるよ。', 'seal', 'island-gateway')]),
  'CR-01': story('灯台守ルカ', '居場所まぜのフクロウ', 'map', '島の資産地図が混ざり、荷物がどこにあるか分からない。', '銀行・サービス・財布の違いを地図に残そう。', [stage(6, '町と島の手がかり', '銀行とサービスは別の置き場所だね。地図の道が見えてきたよ。', 'clue'), stage(12, '荷物の現在地', 'ウォレットとサービスの中身も別々に見られたね。', 'clue'), stage(18, '灯台の資産地図', '送る前に見る地図を残せた。島の案内板に灯りをともすよ。', 'seal', 'asset-map')]),
  'CR-02': story('灯台守ルカ', 'にせ案内のカラス', 'letter', '親切そうな手紙が、秘密の情報を聞き出そうとしている。', '接続と送金を分け、危ない要求から離れよう。', [stage(7, '入口で許可すること', '接続の許可は、資産を送る許可ではないと分かったね。', 'clue'), stage(13, '練習できる入口', '練習の有効化まで進めた。お金を動かした印とは別だよ。'), stage(19, '秘密を渡さない扉', '要求を閉じて離れられた！ 秘密の入力はしなくていいんだ。', 'seal', 'safe-post'), stage(25, '確かめた接続状態', '接続済み、送金はまだ。入口の状態を分けて残せたよ。', 'seal', 'wallet-gate')]),
  'CR-03': story('灯台守ルカ', '道まちがいのクラゲ', 'network', '島へ送る荷物の札に、違う資産と送り道が混ざっている。', '資産・道・宛先を合わせ、今回の到着明細を見よう。', [stage(6, '受取島の荷札', '受取先の条件が見つかった。送る側の札と合わせよう。', 'clue'), stage(12, '種類と道の一致', '受け取れる資産と同じ道を選べた！'), stage(18, '送る数量の準備', '100を入力できた。別の燃料代と受取予定も確かめよう。'), stage(25, '島へ出発した荷物', '三つを照合して送信を受け付けた。到着の知らせと、今回の明細まで見届けよう。', 'seal', 'island-route'), stage(32, '島に届いた99', '今回の明細で99を受け取った。灯台へ続く道がつながった！', 'seal', 'island-dock')]),
  'CR-04': story('学者ソラ', '急ぎ道のマイマイ', 'map', '天空城へ行く道が多く、待つ時間も値下がりも見えにくい。', '使いたい時期と値下がりを比べ、自分の学ぶ道を選ぼう。', [stage(6, '待つ時間の手がかり', '固定の利息ではないことと、出せない時間を見つけたね。', 'clue'), stage(12, '数量と値段の手がかり', '量が増えても、値段次第で評価は下がるんだね。', 'clue'), stage(18, '自分で選ぶ天空の道', '選んだ道の用意をするよ。運用しない道にも、帰りの船がある。', 'seal', 'route-board')]),
  'HY-SPOT': story('学者ソラ', '値札かくしの小竜', 'cards', '天空市場の値札が、保有と売却の意味を混ぜている。', '買った資産を見届け、売却と注文取消を区別しよう。', [stage(8, '買う量を決める', '数量2の用意ができた。支払額を確かめてから買おう。'), stage(16, '持っている間の値下がり', '保有の評価が180になった。まだ売った結果ではないね。', 'clue'), stage(24, '売って確かめた残高', '売却後の980を照合できた。値下がりも正しく記録したよ。', 'seal', 'spot-stall'), stage(32, '待つ注文の札', '別の練習で、指値の価格と数量を用意できた。'), stage(38, '買えなかった注文の取消', '保留中の注文を取り消した。売却とは違う操作で解放できたね。', 'seal', 'order-shelf'), stage(41, '主ラボへ戻る道', '元の980へ戻れた。別の小練習を足さずに帰り支度できるよ。', 'seal', 'spot-return')]),
  'HY-HLP': story('学者ソラ', '待ち刻みの石ゴロ', 'clock', '共有の蔵に預けた荷物が、いつ出せるのか分からない。', '手元と預入を分け、最後の預入からの待ち時間を見よう。', [stage(7, '蔵へ預ける準備', '300を預ける用意ができた。手元に残す700も見よう。'), stage(15, '蔵の評価が変わった', '評価は291だね。増えると決まった利息ではないんだ。', 'clue'), stage(21, '引き出せる時刻', '待つ日数を確かめて、引出しの全額を選べた！'), stage(27, '蔵と手元の合計', '700と291を合わせて991。帰りに使える残高を確かめられたよ。', 'seal', 'vault-open')]),
  'HY-STAKE': story('学者ソラ', '置き場かくしのコンドル', 'tower', '委ねた荷物が、待機場所と手元の間で見失われている。', '委任と帰りの待機を分け、現物へ戻ったことを確かめよう。', [stage(8, '置き場所を移す準備', '現物10を移す数量を用意した。同じ10を二重に数えないよ。'), stage(16, '委ねる相手と数量', '候補の条件を見て、委ねる数量も選べたね。'), stage(24, '委任から戻す数量', '数量が増えても評価は下がった。今ある全数量を見て戻そう。'), stage(32, '帰りの待機場所', '現物へ戻す申込が受け付けられた。待機の記録と、到着した明細を見届けよう。', 'seal', 'staking-wait'), stage(40, '現物へ戻った荷物', '到着してから売却した808を確認できた。帰りの荷物が整ったよ。', 'seal', 'staking-return')]),
  'HY-PERP': story('学者ソラ', '倍率かくしのコウモリ竜', 'anchor', '天空のいかりが、配分したお金と建玉の大きさを混ぜている。', '損失対応を決め、建玉を閉じて残高を確かめよう。', [stage(6, '練習の舞台', '独立した残高と銘柄が見つかった。ほかのラボとは混ぜないよ。', 'clue'), stage(12, '配分する100', '使う100を入力できた。倍率と値動きの数量も別々に見よう。'), stage(19, '計画のある注文', '損失対応を決めて注文した。大きな倍率は報酬の条件ではないよ。'), stage(26, '自分で閉じた建玉', '全数量を決済した！ 残ったいかりをゼロにできたね。', 'seal', 'perp-anchor'), stage(32, '別練習の損失対応', '自動注文の発動価格を用意できた。元の残高とは別の練習だよ。'), stage(37, '発動と約定の違い', '発動97でも成立は96.5。必ず同じ値段で止まるわけではないね。', 'clue'), stage(42, '保有中の費用', '保有中に動く費用も別の記録で見つけたよ。', 'clue'), stage(48, '元の残高へ帰る', '小練習を混ぜず、元の990へ戻れた。帰りの船へ進めるよ。', 'seal', 'perp-return')]),
  'HY-EXIT': story('灯台守ルカ', '受取止めの舟オバケ', 'boat', '帰りの船が「申請しただけ」の荷物で止まっている。', '選んだ経路の残高を、自分の財布の明細まで見届けよう。', [stage(6, '帰りに運ぶ種類', '出金する資産を合わせた。選んだ道の残高だけを使うよ。'), stage(12, '自分へ戻る全額', '道と宛先と全額を合わせた。費用を引いた到着予定も見よう。'), stage(18, '帰りの船が出発', '確認して申請した！ 申請の記録と受取明細を分けて、到着まで見届けよう。', 'seal', 'return-boat'), stage(24, '自分の財布に到着', '今回の明細と受取予定が一致した。帰りの桟橋に灯りがともった！', 'seal', 'return-dock'), stage(26, '村長へ渡す明細', 'ここまでの道を見届けたよ。最後の章の試練へ進もう。', 'clue')]),
};

Object.assign(adventureCatalog,{
 'DX-01':story('船便係セナ','申込さらいのフデモグラ','account-gate','仕入れ窓口の申込書が白紙になり、どこへ返事を届けるか分からない。','銀行とは別の利用申込を整え、受付の控えを残そう。',[
  stage(8,'連絡の約束','架空データだけで練習する約束を読めたね。次は確認メールを届けよう。','clue'),
  stage(15,'戻れるメールの道','届いたメールから、入力中の窓口へ戻れた。今回のコードを確かめよう。','clue'),
  stage(18,'確かめた連絡先','メールの認証が通った！ 返事を受け取る道がつながったよ。','seal','domestic-mail'),
  stage(25,'同じ人の申込書','氏名・生年月日・部屋番号まで写せた。残りの項目と確認画面も見よう。','clue'),
  stage(32,'一度だけの申込','利用申込を受け付けたよ。本人確認と審査は、これからだね。','seal','domestic-desk'),
  stage(33,'受付の控え','受付履歴も残った。まだ利用可能ではないと分けて確かめられたね。','clue')]),
 'DX-02':story('帳場のスイ','うつし札のガラスフクロウ','identity-gate','窓口の鏡が、申込書とカードと人物を別の人だと取り違えている。','内蔵書類と人物を照合し、利用可能の履歴まで見届けよう。',[
  stage(8,'書類の四つのしるし','氏名・生年月日・住所・期限がそろった。同じ人の書類だと確かめられたね。'),
  stage(14,'読める書類と顔合わせ','表・裏の文字と、明るい枠の人物を確かめた。本物のカメラは使っていないよ。'),
  stage(17,'審査へ届けた三つの証し','本人確認を提出できた！ 受付と審査と利用開始は、別の段階だよ。','seal','domestic-review'),
  stage(23,'開いた仕入れ窓口','利用可能の通知と履歴が合った。仕入れ窓口の灯りをともせるよ。','seal','domestic-open')]),
 'DX-03':story('船便係セナ','二枚値札のフタバギツネ','dealer-scales','仕入れ係が二つの窓口を混ぜて、同じ枚数なら同じ円が戻ると思っている。','販売所と板を見分け、販売所の買値と売値の差を明細で見よう。',[
  stage(5,'二つの窓口の手がかり','販売所は窓口の相手、板は並んだ注文を見るんだね。まだ売買はしていないよ。','clue'),
  stage(12,'窓口から届くコイン','確認した買いを確定した。届いた枚数も履歴で見よう。','seal','dealer-sign'),
  stage(19,'コインを渡して戻る円','持っていた枚数を売れた。買ったときと売ったときの値段を比べよう。','seal','dealer-return'),
  stage(21,'二枚の値札を見分けた','値段の差で手元の円が減ったと分かった。価格差をもう一度手数料として引かないよ。','seal','dealer-ledger')]),
 'DX-04':story('船便係セナ','板まぜのテダカニ','market-board','注文の掲示板で、受付の札と売買が成立した札が混ざってしまった。','板の成行買いと成行売りを、別々の約定履歴で確かめよう。',[
  stage(7,'今ある注文で買う準備','板・買い・成行・枚数がそろった。まだ注文確定ではないよ。','clue'),
  stage(10,'成立した成行買い','成行買いが成立した！ 約定履歴で価格と枚数を見よう。','seal','market-buy-board'),
  stage(12,'次の教材価格','値段が動いた。持っているコインと、まだ確定していない評価を分けよう。','clue'),
  stage(19,'成立した成行売り','持っていたコインの売りが成立した。今回の受取額を履歴で見よう。','seal','market-sell-board'),
  stage(21,'二つの約定札','買いと売りの履歴が残高と合った！ 利益の大きさではなく、確認した手順が力になるよ。','seal','market-history')]),
 'DX-05':story('船便係セナ','予約かくしのフダコガネ','limit-board','待っている注文の予約箱が、使えるお金や届いたコインと混ざっている。','予約・取消・買い約定・売り予約・売り約定を、別の記録で見届けよう。',[
  stage(6,'待つ値段の手がかり','買いたい値段を決めた。条件が合うまで待つ注文だね。','clue'),
  stage(13,'買いを待つ予約箱','円は予約したけれど、まだコインは買えていない。未約定の札を見分けられた！','seal','order-reserve-board'),
  stage(15,'取り消して戻った円','未約定の買いを取り消し、円の予約が解けた。売却したわけではないよ。','seal','order-cancel-board'),
  stage(20,'条件が合って届いたコイン','再注文した買いが成立し、コインが届いた。予約中とは違う明細だね。','seal','limit-buy-board'),
  stage(26,'持つ枚数で売る準備','売る値段と枚数を用意した。今度は円ではなく、コインの枚数を予約するよ。','clue'),
  stage(31,'売りを待つ予約箱','持っているコインの一部は売り注文用の予約中。まだ売却の円は届いていないよ。','seal','order-sell-board'),
  stage(34,'売れて届いた円','売りが成立し、予約がなくなって円を受け取った。待つ・取消・成立を区別できた！','seal','limit-complete-board')]),
 'LD-01':story('学者ソラ','早返しのトケイマイマイ','lending-clock','貸出倉庫の時計が、貸している分を手元へ戻ったことにしてしまう。','貸す条件と危険を知り、元本と利息を受取明細まで見届けよう。',[
  stage(4,'返らない危険も読む','今回は成功する教材例。相手が返せない危険もあると確かめられたね。','clue'),
  stage(10,'貸出先へ渡した元本','貸出が成立した。手元と貸出中は別々の箱だよ。','seal','lending-clock'),
  stage(14,'満期の時刻','教材の時間だけを進めた。満期でも、まだ手元へ届いたことにはならないよ。','clue'),
  stage(17,'帰りを頼んだ荷箱','元本と利息の返還を申請した。処理中と受取を分けて待とう。','seal','lending-return-cart'),
  stage(22,'元本と利息が帰る道','受取明細と手元が合った。元本と利息を分けて、貸出中の残りも確かめられた！','seal','lending-returned')]),
 'LV-01':story('学者ソラ','帆まぜのフタムカイドリ','leverage-sails','練習船の帆が向きと大きさを混ぜ、同じ風の揺れ方が分からない。','好きな向きと倍率を選び、建玉を閉じて違いを記録しよう。',[
  stage(6,'選んだ向きと帆','向きと倍率を選べた。選んだだけでは取引も利益も始まっていないよ。','clue'),
  stage(12,'自分の条件で出す帆','選んだ条件で建玉ができた！ 数量と手元の未配分資金は別々に見よう。','seal','leverage-sails'),
  stage(17,'同じ風で違う揺れ','値動き後の含み損益を照合できた。まだ閉じていないので、確定した結果とは分けよう。'),
  stage(22,'帆をたたんだ航海記録','全決済して残量ゼロを確認した！ 別条件の確認課題で、向きや倍率を変えて比べられるよ。','seal','leverage-return')]),
});

const routeNames = {journey:'運用を見送る道',spot:'現物の道',hlp:'HLPの道',stake:'ステーキングの道',perp:'先物の道'};
const effectNames = {'noticeboard':'村の掲示板に用事が戻る','postbox':'商店街の郵便受けが開く','shop-sign':'商店へ続く道しるべが立つ','supply-crate':'日用品の荷箱が町へ動きだす','mail-shelf':'注文控えの郵便棚が整う','mail-road':'返事を運ぶ道が通る','exchange-window':'交換所の窓が開く','document-desk':'城下町の申込机が整う','gate-light':'城門の灯りがともる','photo-lamp':'撮影台の明かりがつく','bridge-half':'橋の送り側がつながる','bridge':'二つの金庫を結ぶ橋がつながる','harbor-sign':'港の通貨案内が立つ','harbor-rope':'船を止めていた縄がほどける','boat-ready':'船の出発準備が整う','side-log':'港の副練習の記録が増える','harbor-open':'港に出港札が立つ','market-crate':'仕入れた星札の荷箱が着く','market-stall':'正直な出品の露店が開く','parcel-road':'市場の荷物道が通る','market-light':'星札市場の明かりがともる','funding-desk':'円を受け取る準備机が開く','funding-token':'教材コインの支度箱が整う','funding-dock':'財布へ向かう桟橋が開く','wallet-supply':'自分の財布に支度品が届く','swap-sign':'コイン交換の道しるべが立つ','network-bridge':'送り道を替える橋がつながる','gas-lamp':'道を使う燃料の灯りがともる','island-gateway':'群島の入口へ道がつながる','asset-map':'灯台の資産地図が光る','safe-post':'安全な案内の郵便道が開く','wallet-gate':'練習財布の入口が整う','island-route':'島へ向かう荷物道が通る','island-dock':'受取島の桟橋がつながる','route-board':'自分で選ぶ道の案内板が立つ','spot-stall':'現物市場の出入口が整う','order-shelf':'保留注文の棚が片づく','spot-return':'現物ラボから帰る道が開く','vault-open':'共有の蔵の出口が開く','staking-wait':'帰りの待機場所に目印が立つ','staking-return':'委任から帰る桟橋が整う','perp-anchor':'天空のいかりが外れる','perp-return':'先物ラボから帰る道が開く','return-boat':'帰りの船が出発する','return-dock':'帰りの桟橋に灯りがともる'};
Object.assign(effectNames,{'domestic-mail':'仕入れ窓口に返事の鳥が戻る','domestic-desk':'仕入れ窓口に受付の控えが並ぶ','domestic-review':'鏡の窓口に審査中の札がかかる','domestic-open':'国内の仕入れ窓口が開く','dealer-sign':'販売所の二枚値札が立つ','dealer-return':'販売所の帰りの荷箱が届く','dealer-ledger':'買値と売値の帳面が整う','market-buy-board':'板の買い約定札が掲示される','market-sell-board':'板の売り約定札が掲示される','market-history':'板取引の履歴棚が整う','order-reserve-board':'注文板に買いの予約札が並ぶ','order-cancel-board':'注文板に取消と解放の控えが並ぶ','limit-buy-board':'指値の買い約定札が届く','order-sell-board':'注文板に売りの予約札が並ぶ','limit-complete-board':'指値の約定帳が完成する','lending-clock':'貸出倉庫に満期の時計がかかる','lending-return-cart':'貸出倉庫から帰る荷車の準備ができる','lending-returned':'元本と利息の荷車が町へ帰る','leverage-sails':'練習船に選んだ向きの帆が立つ','leverage-return':'練習船が帆をたたんで帰港する'});

function recordFor(state, quest) {
  if(quest.id==='HY-EXIT') {
    const active=state.questStates?.[state.activeQuestKey];
    if(active?.questId===quest.id)return {record:active,route:active.routeId??state.selectedRoute??'journey',recordKey:state.activeQuestKey};
    const route=state.selectedRoute??'journey';
    const recordKey=route==='journey'&&state.questStates?.['HY-EXIT:journey-main']?'HY-EXIT:journey-main':`${quest.id}:${route}`;
    return {record:state.questStates?.[recordKey],route,recordKey};
  }
  return {record:state.questStates?.[quest.id],route:state.selectedRoute??'journey'};
}
function contiguousProgress(quest, record) {
  const done=new Set(record?.completedSteps||[]);let count=0;
  for(const id of quest.stepIds||[]){if(!done.has(id))break;count++;}
  return count;
}
export function questBrief(quest) {
  const s=adventureCatalog[quest?.id];
  return s?{incident:s.incident,enemyName:s.enemyName,goal:s.goal,client:s.client,summary:`${s.client}「${s.incident}」`,chapterId:quest.chapterId}: {incident:'町の用事を一つずつ確かめよう。',enemyName:'見落としの影',goal:quest?.title||'依頼の内容を確かめよう。',client:'町の人',summary:'困っている人の用事を手伝おう。',chapterId:quest?.chapterId};
}

// Milestones are historical evidence. The live bubble must still agree with a
// financial event that happened between that milestone and the next check.
// This changes only words: no stage, shield, world effect or reward is earned.
function currentFinancialReaction(state,quest,count,length,view){
 if(!view||!count||count>=length)return null;
 const phase=state.financialScenarios?.[quest.scenarioId]?.data?.status;
 if(quest.id==='LV-01'&&count>=20&&view.position?.open===false&&view.leverageHistory?.length)
  return '全決済は終わったよ。履歴の方向・倍率・戻った額と、いまの残量ゼロを確かめよう。最後の照合まで、落ち着いて見届けよう。';
 if(quest.id==='DX-05'){
  const buy=view.orders?.find(order=>order.id==='buy-2'),firstBuy=view.orders?.find(order=>order.id==='buy-1'),sell=view.orders?.find(order=>order.id==='sell-1');
  if(count>=32&&sell?.status==='filled')return '指値売りが成立し、予約が解けて円を受け取ったよ。約定履歴と、残る円・コインの枚数を最後に照合しよう。';
  if(count>=29&&sell?.status==='pending')return '売り注文を受け付けたよ。コインは予約中で、まだ売却の円は受け取っていない。未約定の札と予約枚数を見よう。';
  if(count>=18&&count<20&&buy?.status==='filled')return '出し直した買い注文が成立し、コインが届いたよ。予約の円と受け取った枚数を、約定履歴で照合しよう。';
  if(count>=17&&count<18&&buy?.status==='pending')return '買い注文を出し直したよ。円はもう一度予約中。まだ購入済みではないので、教材の値動きと約定結果を見届けよう。';
  if(count===14&&firstBuy?.status==='cancelled')return '買い注文の取消が終わり、円の予約が解けたよ。使える円へ戻ったか、控えと残高を照合しよう。';
 }
 if(quest.id==='LD-01'){
  if(phase==='received'&&count>=21)return '元本と利息は手元へ戻ったよ。受取明細と使える残高を合わせ、貸出中や処理中の残りがゼロか最後に照合しよう。';
  if(phase==='arrived'&&count>=19)return '返還処理が終わり、到着の知らせが用意されたよ。元本と利息の受取明細を開こう。手元への受取確認は、この次の操作だよ。';
 }
 if(quest.id==='DX-02'&&count>=22&&view.account?.kycStatus==='approved')return '利用可能の通知を確かめられたよ。最後に口座の履歴も見て、通知と状態が一致するか照合しよう。';
 return null;
}
function buildAdventure(state, quest) {
  const s=adventureCatalog[quest.id];if(!s)return null;
  const {record,route,recordKey}=recordFor(state,quest),count=contiguousProgress(quest,record),length=quest.stepIds?.length||0;
  const stages=s.stages.filter(m=>m.end<=length).map((m,index)=>{
    const start=index?s.stages[index-1].end:0;
    const id=`adventure:${quest.id}:${index+1}${quest.id==='HY-EXIT'?`:${recordKey?.slice('HY-EXIT:'.length)||route}`:''}`;
    const worldEffect=m.worldKind?{id:`${id}:world`,chapterId:quest.chapterId,kind:m.worldKind,label:effectNames[m.worldKind]||m.title,questId:quest.id,milestoneId:id}:null;
    const text=quest.id==='CR-04'&&m.end===18?`${routeNames[route]||'選んだ道'}を選んだね。ほかの道は未受講のまま、帰り道を用意するよ。`:m.text;
    return {id,title:m.title,startStepId:quest.stepIds[start],endStepId:quest.stepIds[m.end-1],startIndex:start,endIndex:m.end,kind:m.kind,damage:m.kind==='seal'?20:0,completed:count>=m.end,meaning:text,reaction:{id,speaker:s.client,text,kind:m.kind,worldEffect},worldEffect};
  });
  const maxHp=stages.reduce((sum,m)=>sum+m.damage,0);
  const hp=maxHp-stages.filter(m=>m.completed).reduce((sum,m)=>sum+m.damage,0);
  const completed=stages.filter(m=>m.completed),currentStage=stages.find(m=>!m.completed)||null;
  const financialView=quest.extension?getExtensionView(state,catalogSteps.find(step=>step.questId===quest.id)):null;
  const selection=quest.id==='LV-01'?financialView?.metrics:null;
  const lastReaction=completed.at(-1)?.reaction||{id:`adventure:${quest.id}:intro`,speaker:s.client,text:s.incident,kind:'intro',worldEffect:null};
  const currentText=currentFinancialReaction(state,quest,count,length,financialView);
  return {enemy:{id:`enemy:${quest.id}`,name:s.enemyName,hp,maxHp,kind:s.kind},stages,milestones:stages,currentStage,selection,
    latestReaction:currentText?{...lastReaction,text:currentText,currentStatus:true}:lastReaction,
    nextGoal:currentStage?.title||(length?'結果を町の人へ伝えよう。':s.goal),
    chapterChanges:completed.flatMap(m=>m.worldEffect?[m.worldEffect]:[]),
    clues:[{id:`${quest.id}:goal`,title:'この依頼で助けること',text:s.goal},{id:`${quest.id}:seal`,title:'封印が解けるとき',text:'ただ読んだだけでは攻撃しません。正しい入力・照合・確定・受取の区切りで進みます。'}],
    completedStages:completed.length,totalStages:stages.length,progress:count,stepCount:length,routeId:route,recordKey,
  };
}
export function getAdventure(state, quest, step) {
  if(!quest)return null;
  const adventure=buildAdventure(state,quest);if(!adventure)return null;
  return {...adventure,chapterChanges:getChapterChanges(state,quest.chapterId),nextGoal:step?.instruction||adventure.nextGoal};
}
export function getChapterChanges(state, chapterId) {
  const changes=[];
  for(const quest of catalogQuests.filter(q=>q.chapterId===chapterId)) {
    if(quest.id==='HY-EXIT'){
      for(const [key,record]of Object.entries(state.questStates||{}).filter(([,record])=>record.questId==='HY-EXIT')){
        const adventure=buildAdventure({...state,activeQuestKey:key,selectedRoute:record.routeId},quest);if(adventure)changes.push(...adventure.chapterChanges);
      }
    }else{const adventure=buildAdventure(state,quest);if(adventure)changes.push(...adventure.chapterChanges);}
  }
  if(state.worldState?.seals?.includes(chapterId))changes.push({id:`chapter:${chapterId}:flag`,chapterId,kind:'chapter-flag',label:'章印の旗が立つ',questId:null,milestoneId:null});
  return [...new Map(changes.map(change=>[change.id,change])).values()];
}
export function recoveryReaction(step, error = '') {
  const field=String(step?.field||''),instruction=String(step?.instruction||'');
  let text='入力は残っているよ。練習カードと違うところを、一つずつ直そう。';
  if(/venue/i.test(field))text='売買の窓口を見直そう。販売所の値段か、板の注文か、いま使う画面の名前を確かめるよ。';
  else if(/leverage|side|markPrice/i.test(field)&&step?.questId==='LV-01')text='向きと倍率、次の教材価格は選べるよ。画面にある候補から選んで、注文の内訳を確かめよう。大きな利益を当てる課題ではないんだ。';
  else if(/idFront|idBack|selfie/i.test(field))text='画面の中の書類や人物を、明るく読める枠内へ置こう。本物のカメラや画像は使わなくて大丈夫。';
  else if(/network/i.test(field))text='送り道が違うみたい。送る側と受け取る側のネットワーク名を見比べよう。';
  else if(/address|accountNumber|recipient/i.test(field))text='宛先の札を見直そう。番号だけでなく、受取人や送り道も同じかな？';
  else if(/gas|eth/i.test(field))text='ガス用の資産を見よう。送るUSDCと、道を使うためのETHは別々に確かめるよ。';
  else if(/asset|swapPair/i.test(field))text='コインの種類が合うかな？ 渡す資産と受け取る資産を、練習カードの名前と見比べよう。';
  else if(/quantity|lots|amount|points|price|collateral/i.test(field))text='数量の札を見直そう。数字と、その隣の単位を練習カードと比べよう。';
  else if(/code|pin|コード|貼り付け/i.test(field+instruction))text='届いた練習メールや画面内の番号をもう一度見よう。ゲーム内でコピーして戻れるよ。';
  else if(/position|撮影|枠/i.test(field+instruction))text='枠から少しずれたみたい。画面内の人物やカードを、明るい指定位置へ戻そう。';
  else if(/edition|condition|description|photo/i.test(field))text='写真と説明を見比べよう。版・枚数・傷の場所を、見えたとおりに直せば大丈夫。';
  return {id:`recovery:${step?.id||'practice'}`,speaker:'先生トト',kind:'recovery',text,nextGoal:step?.instruction||'同じ欄で直そう。',enemyText:'見落としの影が札を揺らした。落ち着いて見比べよう。',hpChange:0,penalty:0,detail:String(error).slice(0,300)};
}

const advisors=[
 {id:'mina',name:'郵便屋ミナ',role:'手紙と控えの案内役',topicId:'phone-mail',line:'おかえり。手紙は、急いで読まなくても逃げないよ。件名から一緒に探そう。',before:'初めての手紙なら、件名と差出人を見よう。コードや注文の控えは本文に残るよ。',ids:['PR-01-005','P013','P048','P066','BK-01-008','CR-02-S017']},
 {id:'haru',name:'店主ハル',role:'条件と使う予定の相談役',topicId:'points-conditions',line:'大きな特典の札より、いらない出費がないか気になるんだ。比べる時間も大切だよ。',before:'条件は、注文する前に見る約束だよ。対象の金額と送料は、同じ数え方とは限らないんだ。',ids:['P027','P030','P038','P069','P077']},
 {id:'sui',name:'帳場のスイ',role:'申込と本人確認の相談役',topicId:'kyc',line:'一息つこう。むずかしい書類も、名前と住所を一つずつ比べればいいんだ。',before:'これから申し込むなら、練習カードの人物と同じ情報を使おう。受付と利用開始は別だよ。',ids:['BK-01-031','BK-02-010','BK-02-016','BK-02-023','TR-01-014','TR-01-020','TR-01-026']},
 {id:'nagi',name:'船長ナギ',role:'数量と取引の終わりの相談役',topicId:'fx-lot',line:'港の酒場へようこそ。茶でも飲みながら、数字の隣の単位を見よう。急ぐ航海じゃないよ。',before:'これから取引を学ぶなら、先に条件と単位を見よう。新規と決済は別の操作なんだ。',ids:['FX-01-011','FX-01-018','FX-02-002','FX-02-020','FX-02-S-018','FX-03-012']},
 {id:'kohaku',name:'道具屋コハク',role:'商品の状態と費用の相談役',topicId:'card-costs',line:'表のきれいさだけじゃ分からないこともあるよ。裏面と、送料の小さな欄も見てみよう。',before:'初めて売買するなら、同じ版と状態の成約を比べよう。出品しただけの値段とは違うよ。',ids:['TC-01-007','TC-01-019','TC-01-021','TC-02-005','TC-02-016','TC-02-031','TC-02-032']},
 {id:'luka',name:'灯台守ルカ',role:'送り道と受取の相談役',topicId:'crypto-transfer',line:'遠い島でも、荷札は三つ。種類と道と宛先が合うか、灯りの下で見比べよう。',before:'初めて送るなら、先に受取カードを見よう。送り道の名前と、自分の宛先を合わせるんだ。',ids:['CR-01-S017','CR-02-S025','CR-03-S006','CR-03-S023','CR-03-S032','HY-EXIT-S024']},
 {id:'sora',name:'学者ソラ',role:'選ぶ道と待ち時間の相談役',topicId:'operation-choice',line:'選ばない道があってもいいんだ。いつ使いたいかを考えて、自分の道を選ぼう。',before:'運用を学ぶ前に、値下がりと戻すまでの待ち時間を見よう。今回は運用しない道もあるよ。',ids:['CR-04-S017','CR-04-S018','HY-HLP-S012','HY-HLP-S027','HY-STAKE-S040','HY-PERP-S048']},
 {id:'senna',name:'船便係セナ',role:'円からの支度と荷物の現在地の相談役',topicId:'yen-funding',line:'ようこそ。円から始める支度は、長い道を一歩ずつたどる旅だよ。いま荷物はどこかな？',before:'円で買う、財布へ出す、種類を替える、道を替える、ガスを用意する。別々の用事として見よう。',ids:['FI-01-S008','FI-01-S015','FI-01-S023','FI-02-S009','FI-02-S021','FI-03-S008','FI-03-S016','FI-03-S023','FI-03-S026']},
 {id:'elder',name:'長老オリベ',role:'冒険の記録庫',topicId:'phone',line:'おかえり、旅人。できた道も、途中で休んだ道も、ここに残しておこう。何を確かめたのか、つまずきやすい所と一緒に読み返せるぞ。',before:'まだ白いページだ。依頼で一つ操作を終えたら、その一歩から記録に残るぞ。',ids:[]},
];
const referenceCopy={
 P030:'保存した条件：割引後の商品代金が2,000円以上。送料は対象に入れず、参加と経由が必要。',
 P038:'クーポンを外すと、対象金額は1,900円から2,000円へ戻った。',
 P048:'注文控え：PQ-001、0日目、支払2,000円。案件条件の控えと別に保存した。',
 P069:'交換先は、使う予定と受取後の期限を比べた。',
 'TR-01-020':'振込3,000円とは別に、この教材の手数料110円が必要だった。',
 'TR-01-026':'自分の受取口座の明細に3,000円の入金があった。',
 'FX-01-011':'この教材の1lotは1,000通貨。0.1lotは100通貨として確認した。',
 'FX-02-020':'米ドル円の新規1,000通貨と、同じ建玉の全決済を保存した。損失も記録に含めた。',
 'TC-01-019':'仕入・入荷送料・販売手数料・発送送料・梱包を全部入れて比べた。',
 'TC-02-031':'売上3,000円から手数料300円と送料200円を引き、入金2,500円を確認した。',
 'FI-01-S015':'国内の練習窓口へ120,000円が届いたことを確認した。',
 'FI-01-S023':'円で104枚の教材コインを買った履歴を確認した。',
 'FI-02-S021':'出庫費用1枚を引いた103枚が、自分の練習財布へ届いた。',
 'FI-03-S008':'教材コインを種類交換し、教材USDC1,030の明細を確認した。',
 'FI-03-S016':'送り道を替えた後、費用20を引いた教材USDC1,010を確認した。',
 'FI-03-S023':'教材USDC1,000と、ガス用の教材ETH0.001を別々に確認した。',
};
const plain=text=>String(text||'').replace(/snapshot/gi,'練習用コピー').replace(/validator/gi,'預け先').replace(/funding/gi,'資金調達料').replace(/network/gi,'送り道').replace(/route/gi,'選んだ道').replace(/\bbuy\b/gi,'買い').replace(/\bsell\b/gi,'売り');
/** Free hints, derived only from actually completed operations or a saved card. */
export function getTavernAdvice(state={},quest,step) {
  state ||= {};
  const known=Object.fromEntries(catalogSteps.map(s=>[s.id,s]));
  const done=new Set(Object.values(state.questStates||{}).flatMap(record=>record.completedSteps||[]).filter(id=>known[id]));
  return advisors.map(advisor=>{
    if(advisor.id==='elder'){
      const history=getAdventureChronicle(state),hasRecall=history.length>0;
      return {id:'elder',name:advisor.name,role:advisor.role,line:advisor.line,topicId:advisor.topicId,
        recallStepIds:[],recallTitle:'冒険の記録庫を開く',recallText:hasRecall?`${history.length}件の冒険で、${history.reduce((n,q)=>n+q.entries.length,0)}工程を確かめた記録があるぞ。途中の仕事は途中と分けてある。`:advisor.before,
        hasRecall,unseen:!hasRecall,isArchive:true,evidence:[],hintCost:0,readOnly:true,canResume:true};
    }
    const relevant={mina:/^(PR-|PO-|BK-01|DX-01)/,haru:/^PO-/,sui:/^(BK-|TR-|DX-0[12])/,nagi:/^(FX-|LV-)/,kohaku:/^TC-/,luka:/^(CR-0[123]|HY-EXIT)/,sora:/^(CR-04|HY-|LD-|LV-)/,senna:/^(FI-|DX-)/}[advisor.id].test(quest?.id||'');
    const currentEvidence=relevant?(quest?.stepIds||[]).filter(id=>done.has(id)&&(['input','select','confirm','check','wait'].includes(known[id].type)||/明細|条件|受取カード|控え|照合/.test(known[id].instruction))):[];
    const recallStepIds=[...new Set(currentEvidence.length?currentEvidence:advisor.ids.filter(id=>done.has(id)))].slice(-2);
    const evidence=recallStepIds.map(id=>({source:'completed-step',stepId:id,title:plain(known[id].screenTitle||known[id].instruction),text:referenceCopy[id]||chronicleRecordText(known[id],state)}));
    const hasCard=advisor.id==='nagi'&&Number.isFinite(state.phoneState?.offerConditionsSavedAt);
    if(hasCard)evidence.unshift({source:'saved-condition-card',stepId:null,title:'手帳のFX条件カード',text:'対象は米ドル円。新規の約定1,000通貨以上、対象建玉の全決済、記録提出。ボタンの回数は足さない。'});
    const hasRecall=evidence.length>0;
    const recent=relevant&&quest?buildAdventure(state,quest):null;
    const currentTopic=relevant&&quest?getHelpTopics(step,quest)[0]?.id:null;
    return {id:advisor.id,name:advisor.name,role:advisor.role,line:recent?`${recent.latestReaction.text} ${currentAdvice(quest,step)}`:advisor.line,topicId:currentTopic||advisor.topicId,
      recallStepIds,recallTitle:hasRecall?'前に残した控えを見よう':'初めてなら、ここから知ろう',
      recallText:hasRecall?evidence.map(item=>item.text).join('\n'):advisor.before,
      evidence,hasRecall,unseen:!hasRecall,currentGoal:step?.instruction||quest?.title||'いまの用事をゆっくり確かめよう。',
      hintCost:0,canResume:true,readOnly:true};
  });
}

function currentAdvice(quest,step){
 const copy=`${step?.instruction||''} ${step?.field||''}`;
 if(quest.id==='DX-01')return /認証|コード/.test(copy)?'届いたメールの件名を見よう。コピーしたら、入力中の窓口へ戻れるよ。':'銀行口座とは別の申込だよ。カードを見ながら一つずつ。受付の後も本人確認が残るよ。';
 if(quest.id==='DX-02')return /審査|通知|利用/.test(copy)?'審査中と利用可能の札を分けよう。知らせの後は履歴も見られるよ。':'本人の名前・住所・期限をそろえ、画面内の書類と人物を見比べよう。';
 if(quest.id==='DX-03')return '画面の上は販売所かな、板かな？ 同じ枚数の買値と売値を、前の控えで見比べよう。';
 if(quest.id==='DX-04')return '注文受付の札と、成立した約定履歴を分けよう。買った分を売るときは、持つ枚数も見てね。';
 if(quest.id==='DX-05')return /売/.test(copy)?'売り注文ではコインを取り分けるよ。予約中と、売れて届いた円は別だね。':'待っている買いの円は予約中。取消なら円が戻り、約定ならコインが届く。控えで前の状態も見よう。';
 if(quest.id==='LD-01')return /受取|返還|満期/.test(copy)?'満期、返還申請、処理中、受取を分けよう。手元の明細に届いた分だけを戻った量として見るよ。':'貸す元本と、条件で付く利息は別だよ。早く返してもらえるか、貸した先が返せない危険も読もう。';
 if(quest.id==='LV-01')return '向きも倍率も候補から選べるよ。利益を当てなくていいんだ。全決済の後は、依頼帳の別条件の確認課題でもう一度比べよう。';
 return '前の控えと今の画面を並べて見よう。入力途中でも、そのまま戻れるよ。';
}

function chroniclePitfall(step,quest){
 const field=String(step.field||''),copy=`${step.instruction||''} ${step.fieldLabel||''}`;
 if(quest.id==='DX-01')return /コード|認証/.test(copy)?'今回届いたメールのコードを使います。届く前の見本や、別のメールの数字と混ぜません。':'銀行口座と取引所の口座は別です。利用申込の受付だけで売買できると思わず、本人確認と利用可能の知らせまで分けます。';
 if(quest.id==='DX-02')return /画像|表面|裏面|人物|顔|枠/.test(copy)?'この教材では画面内の書類と人物だけを使います。文字のぼけ、枠の外、別の人のカード、期限切れを確かめます。':'本人確認の提出、審査中、利用可能を分けます。通知の状態が変わっても、勝手に円やコインが増えるわけではありません。';
 if(quest.id==='DX-03')return '販売所と板では相手や値段の決まり方が違います。買値と売値の差を見て、同じ価格差をもう一度手数料として引きません。';
 if(quest.id==='DX-04')return '成行は入力中の目安と成立価格が違う場合があります。この固定価格の教材例を、実市場の価格保証と思わず、約定価格と枚数を履歴で確かめます。';
 if(quest.id==='DX-05')return /売/.test(copy)?'売りを待つ注文の予約はコインの枚数です。未約定なら、まだ売却の円は届いていません。':'買いを待つ注文の予約は円です。取消で予約が解ける操作と、約定でコインを受け取る操作を分けます。';
 if(quest.id==='LD-01')return /年率|利息/.test(copy)?'年率は1年の割合です。30日の割合そのものではありません。元本と利息を分け、この成功例を返還の保証と考えません。':'貸出中の元本を手元へ足しません。満期になった、返還を頼んだ、処理が済んだ、手元へ届いた、は別の段階です。';
 if(quest.id==='LV-01')return '上昇に有利なロングと下落に有利なショートを分けます。倍率は損失も大きくします。含み損益と確定損益を混ぜず、元の建玉から全決済します。';
 if(/network/i.test(field)||/ネットワーク|道替え/.test(copy))return '同じコインの名前でも、送り道が違えば別の条件です。受取カードの道と名前を合わせます。';
 if(/address|recipient|accountNumber|depositRecipient/i.test(field))return quest.id.startsWith('TR')||quest.id==='FI-01'?'番号だけで決めず、銀行・支店・種類・名義も同じか確かめます。':'宛先は自分の練習財布か確かめます。資産と送り道も合うまで確定しません。';
 if(/gas|eth/i.test(field)||/ガス/.test(copy))return '送るUSDCとガス用ETHは別の資産です。片方を持っていても、もう片方が足りるとは限りません。';
 if(/coupon/i.test(field)||/クーポン|対象金額/.test(copy))return 'この案件の対象金額に送料は足しません。値引き後の商品代金と、支払総額を分けます。';
 if(/fee|shipping|packaging/i.test(field)||/手数料|費用|送料|梱包/.test(copy)){
  if(quest.id.startsWith('TC'))return '仕入送料・発送送料・手数料・梱包を忘れません。先に払った梱包費を、入金時にもう一度引きません。';
  if(quest.id==='TR-01')return '振込金額だけでなく、手数料を足した合計が送金元にあるか確かめます。受取額に手数料を足しません。';
  return '送る量、費用、届く量を分けます。表示した費用がどこから引かれるかを、確定前に見ます。';
 }
 if(/Code|Pin/i.test(field)||/コード|貼り付け/.test(copy))return '別のメールや古い番号を写さないよう、今回の件名を確かめます。ゲーム内コピーから戻って直せます。';
 if(/quantity|lots|amount|price|collateral/i.test(field))return quest.id.startsWith('FX')?'lotと実際の通貨量を一緒に見ます。この教材は1lot＝1,000通貨で、決済量を新規量へ足しません。':'数字だけでなく、円・ポイント・コインの枚数などの単位も確かめます。違う資産の数量を一つに足しません。';
 if(/condition|description|edition|photo/i.test(field))return '同じ版・枚数・状態かを見ます。傷を見つけたら、写真と合う説明に直します。';
 if(/Position/i.test(field)||/画像|撮影|顔/.test(copy))return '枠からずれたり、暗くぼやけた画像をそのまま使わず、画面内で直してから確認します。';
 if(/受取|着金|入金明細|到着|受領/.test(copy))return '送信や申請が済んでも、受取確認とは別です。今回の受取先の明細で数量を照合します。';
 if(step.type==='focus')return '欄を開いた段階です。数字や文字を入れたこと、保存や確定が済んだこととは分けます。';
 if(step.type==='confirm')return '確認画面の相手・数量・費用と、実行する内容を合わせます。戻って直しても、確定済みの処理を重ねません。';
 if(step.type==='check')return '印を付ける前に、何と何を比べるのかを見ます。読んだだけと、実際に照合した結果を分けます。';
 if(quest.id.startsWith('FI'))return '銀行、交換所、財布、移動中を分けます。同じ資金を、二つの場所で使えるように重ねて数えません。';
 if(quest.id.startsWith('FX'))return '注文の確認、新規約定、建玉、決済を分けます。反対向きの新規注文を決済の代わりにしません。';
 if(quest.id.startsWith('PO'))return '条件の控えと注文の記録を分けます。判定待ちのポイントを、交換できる残高として数えません。';
 if(quest.id.startsWith('BK'))return '申込受付、本人確認の提出、審査、利用可能の通知を別の段階として見ます。';
 if(quest.id.startsWith('TC'))return '出品、売れたこと、発送、受取、入金を分けます。売上の全額が、そのまま利益ではありません。';
 return '画面の名前と資産の現在地を見ます。ひとつ先の処理まで済んだつもりにならず、結果を確かめます。';
}
function chronicleRecordText(step,state={}){
 if(step.acceptAnyChoice){
  const command=state.journal?.findLast(entry=>entry.command?.type==='STEP'&&entry.command.id===step.id)?.command;
  const value=command?.value;
  return value===undefined?'この場面で、自分が選んだ条件を確かめた記録です。未受講の別条件を試したことにはしません。':`「${step.fieldLabel||humanFieldLabel(step.field)}」で「${displayPracticeValue({...step,value})}」を選んだ記録です。`;
 }
 const result=plain(step.result||'');
 if(!result||/この一つの操作|操作を記録/.test(result)||/[A-Za-z_][A-Za-z0-9_.]*\s*=/.test(result))return step.field&&step.value!==undefined?`「${step.fieldLabel||humanFieldLabel(step.field)}」を「${displayPracticeValue(step)}」へ合わせた記録です。`:`「${plain(step.instruction)}」を終えた記録です。`;
 return result||`「${plain(step.instruction)}」を終えた記録です。`;
}
/** The elder reads only verified completed steps, never executes a past action. */
export function getAdventureChronicle(state={}){
 state ||= {};
 const known=Object.fromEntries(catalogSteps.map(step=>[step.id,step])),qMap=Object.fromEntries(catalogQuests.map(q=>[q.id,q]));
 const records=[];
 for(const [recordKey,record]of Object.entries(state.questStates||{})){
  const quest=qMap[record?.questId];if(!quest)continue;
  if(quest.id==='HY-EXIT'?!recordKey.startsWith('HY-EXIT:'):recordKey!==quest.id)continue;
  const count=contiguousProgress(quest,record);if(!count)continue;
  const completedStepIds=quest.stepIds.slice(0,count),completed=!!record.completed&&count===quest.stepIds.length;
  const routeId=record.routeId||'journey';
  const routeLabel=quest.id==='HY-EXIT'?`${routeNames[routeId]||'選んだ道'}${recordKey==='HY-EXIT:journey-main'?'・入金の旅から':routeId==='journey'?'・単独の練習':''}`:null;
  const adventure=buildAdventure({...state,activeQuestKey:recordKey},quest);
  records.push({questId:quest.id,recordKey,chapterId:quest.chapterId,title:`${quest.title}${routeLabel?` — ${routeLabel}`:''}`,completed,
    routeId:quest.id==='HY-EXIT'?routeId:null,routeLabel,statusLabel:completed?'完了':`途中まで（${count}/${quest.stepIds.length}工程）`,
    completedStepIds,stepCount:quest.stepIds.length,
    entries:completedStepIds.map(stepId=>{
      const step=known[stepId],explanation=getHelpTopics(step,quest)[0];
      return {stepId,title:plain(step.screenTitle||step.fieldLabel||'確かめた操作'),instruction:plain(step.instruction),
        meaning:explanation?`${explanation.short} ${explanation.why}`:'この場面の目的と結果を、一つずつ確かめました。',
        pitfall:chroniclePitfall(step,quest),recordText:chronicleRecordText(step,state)};
    }),
    milestones:(adventure?.stages||[]).filter(m=>m.completed).map(m=>({id:m.id,title:m.title,endStepId:m.endStepId,meaning:m.meaning,kind:m.kind,worldEffect:m.worldEffect})),
    readOnly:true,replayAction:false,hintCost:0,
  });
 }
 return records.sort((a,b)=>catalogQuests.findIndex(q=>q.id===a.questId)-catalogQuests.findIndex(q=>q.id===b.questId)||a.recordKey.localeCompare(b.recordKey));
}
