/** Original fictional learning content. Each row is one specified user action. */
const rawRows = [
  ["PR-01-001","スマホホーム","メモを押す","買い物メモが開く"],
  ["PR-01-002","メモ","下方の「今日の用事」を開く","スクロール先の内容を表示"],
  ["PR-01-003","スマホ下部","ホームを押す","スマホホームに戻る"],
  ["PR-01-004","スマホホーム","メールを押す","受信一覧"],
  ["PR-01-005","受信一覧","郵便屋の練習メールを押す","本文と合言葉"],
  ["PR-01-006","メール本文","「合言葉をコピー」を押す","内部clipboardに保存"],
  ["PR-01-007","スマホ下部","アプリ切替を押す","直近のアプリ一覧"],
  ["PR-01-008","アプリ切替","メモを押す","元のメモ画面"],
  ["PR-01-009","メモ","合言葉の欄を押す","入力パネル"],
  ["PR-01-010","入力パネル","「練習コードを貼り付け」を押す","合言葉を入力"],
  ["PR-01-011","メモ","「メモを保存」を押す","保存状態が表示"],
  ["PR-01-012","スマホ外の教材枠","町へ戻るを押す","郵便屋との完了会話と手帳"],
  ["P001","スマホホーム","ブラウザーのアイコンを押す","ブラウザー開始画面"],
  ["P002","ブラウザー開始画面","コツコツモールのブックマークを押す","サイトトップ"],
  ["P003","サイトトップ","無料会員登録を押す","登録フォーム"],
  ["P004","登録フォーム","メール欄を押す","練習入力候補"],
  ["P005","入力候補","練習メールのチップを押す","メール入力済み"],
  ["P006","登録フォーム","パスワード欄を押す","パスワード候補"],
  ["P007","入力候補","練習用パスワードを押す","伏せ字で入力済み"],
  ["P008","登録フォーム","この架空サービスの利用条件を開く","短い条件の表示"],
  ["P009","登録フォーム","内容を確認して同意欄を押す","登録送信可能"],
  ["P010","登録フォーム","登録メールを送信を押す","認証コード入力画面＋メール到着"],
  ["P011","練習スマホ下部","ホームを押す","スマホホームに戻る"],
  ["P012","スマホホーム","メールのアイコンを押す","受信一覧"],
  ["P013","受信一覧","会員登録メールを押す","6桁コードを含む本文"],
  ["P014","メール本文","「このメールの練習コードをコピー」を押す","ゲーム内コピー済み"],
  ["P015","練習スマホ下部","アプリ切替を押す","最近使ったアプリの一覧"],
  ["P016","アプリ切替","ブラウザーを選ぶ","認証コード入力画面へ復帰"],
  ["P017","認証画面","確認コード欄を押す","入力パネル"],
  ["P018","入力パネル","練習コードを貼り付けを押す","6桁入力済み"],
  ["P019","認証画面","認証して登録を完了を押す","登録済みサイトトップ"],
  ["P020","ポイントサイト","お買い物でためるを押す","案件一覧"],
  ["P021","案件一覧","案件Aの詳細を押す","300Pと条件・追加費用"],
  ["P022","案件A","比較に入れるを押す","比較候補Aを保存"],
  ["P023","ブラウザー","戻るを押す","案件一覧へ復帰"],
  ["P024","案件一覧","案件Bの詳細を押す","500Pと送料600円"],
  ["P025","案件B","比較に入れるを押す","比較候補A・B"],
  ["P026","案件B","比較を見るを押す","追加費用込みの比較表"],
  ["P027","比較表","今回の買い物ではAを選ぶを押す","案件Aに戻る"],
  ["P028","案件A","ポイント獲得条件を押す","条件詳細"],
  ["P029","条件詳細","下方の対象外になる場合を開く","対象金額・割引・取消の条件"],
  ["P030","学習ガイド","この画面を控えるを押す","条件が画面メモに保存される"],
  ["P031","案件A","参加登録を押す","参加済み表示"],
  ["P032","案件A","ショップへ進むを押す","経由状態を記録し、新しい通販タブを開く"],
  ["P033","通販タブの商品一覧","日用品セットを押す","商品詳細と内訳"],
  ["P034","商品詳細","カートに入れるを押す","カート件数が1になる"],
  ["P035","商品詳細","カートのアイコンを押す","カートと金額内訳"],
  ["P036","カート","クーポンを選ぶを押す","架空クーポン一覧"],
  ["P037","クーポン一覧","100円引きを試すを押す","対象金額1,900円・条件未達"],
  ["P038","カート","このクーポンを使わないを押す","対象金額2,000円へ戻る"],
  ["P039","カート","購入手続きへを押す","お届け先フォーム"],
  ["P040","お届け先フォーム","お届け先の入力欄を押す","練習情報の候補"],
  ["P041","入力候補","練習用のお届け先を押す","氏名・住所等の架空データが入る"],
  ["P042","お届け先フォーム","支払い方法へを押す","決済方法一覧"],
  ["P043","決済方法","登録済みのDEMOカードを選ぶ","練習カードの選択状態"],
  ["P044","決済方法","注文内容を確認を押す","商品・支払額・住所・決済の確認"],
  ["P045","注文確認","注文を確定を押す","注文番号と注文完了・メール到着"],
  ["P046","注文完了画面","注文メールの通知を押す","メールアプリの注文本文"],
  ["P047","注文メール","スターを押す","注文メールを後から見つけられる"],
  ["P048","学習ガイド","注文の控えを保存を押す","注文番号・金額・日付のメモ"],
  ["P049","練習スマホ下部","アプリ切替を押す","アプリ一覧"],
  ["P050","アプリ切替","ブラウザーを選ぶ","注文完了の通販タブへ復帰"],
  ["P051","ブラウザー","タブ数ボタンを押す","ポイントサイトと通販のタブ一覧"],
  ["P052","タブ一覧","コツコツモールを選ぶ","ポイントサイトに復帰"],
  ["P053","ポイントサイト","ポイント通帳を押す","判定待ち300P・交換可能0P"],
  ["P054","ポイント通帳","今回の取引行を押す","注文と承認予定日の詳細"],
  ["P055","学習ガイド","15日目まで進めるを押す","予定日経過・まだ判定待ち"],
  ["P056","取引詳細","この取引について問い合わせを押す","問い合わせフォーム"],
  ["P057","問い合わせフォーム","注文番号欄を押す","保存した注文情報の候補"],
  ["P058","入力候補","PQ-001を選ぶ","注文番号入力済み"],
  ["P059","問い合わせフォーム","問い合わせ理由の選択欄を押す","理由一覧"],
  ["P060","理由一覧","承認予定を過ぎているを選ぶ","理由選択済み"],
  ["P061","問い合わせフォーム","資料を添付を押す","画面メモの選択一覧"],
  ["P062","画面メモ一覧","保存した案件条件を選ぶ","添付済み"],
  ["P063","問い合わせフォーム","確認画面へを押す","注文番号・理由・添付の確認"],
  ["P064","問い合わせ確認","問い合わせを送るを押す","架空受付番号と受付済み"],
  ["P065","学習ガイド","回答日まで進めるを押す","16日目・回答と承認メール到着"],
  ["P066","練習スマホの通知","回答メールを押す","この教材シナリオの回答"],
  ["P067","回答メール","ポイント通帳を見るを押す","承認済み300P・判定待ち0P"],
  ["P068","ポイント通帳","ポイントを交換を押す","交換先一覧"],
  ["P069","交換先一覧","まいにちストアのギフトを選ぶ","交換条件・期限・フォーム"],
  ["P070","交換フォーム","ポイント数の欄を押す","数字入力パネル"],
  ["P071","入力パネル","300の候補を押す","300Pと受取予定300円分"],
  ["P072","交換フォーム","確認画面へを押す","交換先・数量・手数料・期限の確認"],
  ["P073","交換確認","交換を申請を押す","承認済み0P・受取待ち300円分"],
  ["P074","練習スマホの通知","特典案内メールを押す","受取方法を示すメール"],
  ["P075","特典メール","特典を受け取るを押す","ブラウザーの教材ギフトページ"],
  ["P076","ギフトページ","練習ギフトに追加を押す","受取済み300円分"],
  ["P077","ギフトページ","受取履歴を押す","受取済みの明細・レッスン修了"],
  ["BK-01-001","スマホホーム","ほしあかり銀行アイコンを押す","架空銀行の入口が開く"],
  ["BK-01-002","銀行入口","「口座をつくる」を押す","申込条件の案内が開く"],
  ["BK-01-003","申込条件","「申込できる人」の詳細を開く","架空成人プロフィールと対象条件が並ぶ"],
  ["BK-01-004","条件確認","「この練習人物で申し込む」を押す","メール登録欄が開く"],
  ["BK-01-005","メール登録","メール入力欄を選ぶ","メール欄が入力待ちになる"],
  ["BK-01-006","メール登録","練習メールのチップを押す","lesson@example.invalidが入力される"],
  ["BK-01-007","メール登録","「認証メールを送る」を押す","模擬認証メールが1通だけ生成される"],
  ["BK-01-008","ゲーム内通知","銀行の認証メール通知を押す","メールアプリで該当本文が開く"],
  ["BK-01-009","認証メール","「このメールの練習コードをコピー」を押す","ゲーム内クリップボードに練習コードが入る"],
  ["BK-01-010","スマホ共通バー","アプリ切替を押す","起動中アプリ一覧が開く"],
  ["BK-01-011","アプリ切替","銀行画面のカードを押す","入力中の銀行画面へ戻る"],
  ["BK-01-012","メール認証","認証コード欄を選ぶ","コード欄が入力待ちになる"],
  ["BK-01-013","メール認証","ゲーム内の「貼り付け」を押す","練習コードが入力される"],
  ["BK-01-014","メール認証","「認証する」を押す","emailVerified=trueになり申込フォームが開く"],
  ["BK-01-015","申込フォーム","氏名欄を選ぶ","氏名欄が入力待ちになる"],
  ["BK-01-016","申込フォーム","練習氏名のチップを押す","朝日 ミナトが入力される"],
  ["BK-01-017","申込フォーム","フリガナ欄を選ぶ","フリガナ欄が入力待ちになる"],
  ["BK-01-018","申込フォーム","練習カナのチップを押す","アサヒ ミナトが入力される"],
  ["BK-01-019","申込フォーム","生年月日欄を選ぶ","日付の選択欄が開く"],
  ["BK-01-020","申込フォーム","練習生年月日のチップを押す","1990-04-12が入力される"],
  ["BK-01-021","申込フォーム","住所欄を選ぶ","住所欄が入力待ちになる"],
  ["BK-01-022","申込フォーム","部屋番号を含む練習住所のチップを押す","練習住所が入力される"],
  ["BK-01-023","申込フォーム","電話欄を選ぶ","電話欄が入力待ちになる"],
  ["BK-01-024","申込フォーム","練習電話のチップを押す","000-0000-0000が入力される"],
  ["BK-01-025","申込フォーム","職業の選択欄を開く","職業候補が開く"],
  ["BK-01-026","職業候補","プロフィールどおり「会社員」を選ぶ","occupation=employeeになる"],
  ["BK-01-027","申込フォーム","利用目的の選択欄を開く","利用目的候補が開く"],
  ["BK-01-028","利用目的候補","「給与の受け取り」を選ぶ","purpose=salaryになる"],
  ["BK-01-029","申込フォーム","模擬利用規約の詳細を開く","この演習の取扱い説明が表示される"],
  ["BK-01-030","模擬利用規約","同意チェックを入れる","termsAccepted=trueになりフォームへ戻る"],
  ["BK-01-031","申込フォーム","「入力内容を確認」を押す","全必須項目を一覧で確認できる"],
  ["BK-01-032","申込確認","「この内容で申し込む」を押す","app-001が一度だけ提出され、受付控えと本人確認への入口が表示される"],
  ["BK-02-001","申込受付控え","「本人確認へ」を押す","本人確認の入口が開く"],
  ["BK-02-002","本人確認入口","本人確認方法の選択欄を開く","方法候補が表示される"],
  ["BK-02-003","方法候補","「IC読取＋顔合わせ」を選ぶ","書類選択画面が開く"],
  ["BK-02-004","書類選択","使う書類の一覧を開く","練習用書類候補が表示される"],
  ["BK-02-005","書類候補","練習用の運転免許証を選ぶ","架空カードと確認項目が表示される"],
  ["BK-02-006","書類確認","カードの詳細を開く","文字を読める大きさでカードが表示される"],
  ["BK-02-007","書類確認","氏名の照合タブを押す","申込氏名とカード氏名の一致が分かる"],
  ["BK-02-008","書類確認","住所の照合タブを押す","申込住所とカード住所の一致が分かる"],
  ["BK-02-009","書類確認","生年月日の照合タブを押す","申込日付とカード日付の一致が分かる"],
  ["BK-02-010","書類確認","有効期限の詳細を押す","教材内の今日と有効期限を比較できる"],
  ["BK-02-011","書類確認","模擬データ利用への同意チェックを入れる","同意済みになり練習暗証番号欄が開く"],
  ["BK-02-012","IC読取準備","練習暗証番号欄を選ぶ","入力待ちになる"],
  ["BK-02-013","IC読取準備","DEMO番号のチップを押す","用意された練習番号が入力される"],
  ["BK-02-014","IC読取準備","「練習の読み取りを始める」を押す","画面内のカード配置パネルが開く"],
  ["BK-02-015","カード配置","画面内カードを読み取り枠へ移動する","模擬IC読取が成功し読取結果が表示される"],
  ["BK-02-016","読取結果","「この読取結果を使う」を押す","icReadAccepted=trueになる"],
  ["BK-02-017","本人確認","「顔合わせへ」を押す","ゲーム内人物の撮影パネルが開く"],
  ["BK-02-018","顔合わせ","人物を顔の枠へ合わせる","架空人物が枠内へ収まる"],
  ["BK-02-019","顔合わせ","撮影ボタンを押す","鮮明な教材画像が生成された状態になる"],
  ["BK-02-020","画像確認","「この画像を使う」を押す","faceImageAccepted=trueになる"],
  ["BK-02-021","本人確認確認","「本人確認を提出」を押す","kyc-001が一度だけ提出され審査中になる"],
  ["BK-02-022","審査中","「練習の審査時間を進める」を押す","模擬審査が承認され口座bank-001が生成される"],
  ["BK-02-023","ゲーム内通知","開設完了の通知を押す","口座番号と利用可能状態が表示され、結果確認済みになる"],
  ["BK-02-R-001","画像確認","不鮮明な画像の詳細を開く","文字や顔の輪郭がぼやけていると分かる"],
  ["BK-02-R-002","画像確認","「撮り直す」を押す","撮影パネルへ戻る"],
  ["BK-02-R-003","撮影パネル","画面内人物を明るい指定位置へ動かす","鮮明に撮れる配置になる"],
  ["BK-02-R-004","撮影パネル","撮影ボタンを押す","鮮明な教材画像へ更新される"],
  ["BK-02-R-005","画像確認","撮影画像の詳細を開く","輪郭が読み取れる状態を確認できる"],
  ["BK-02-R-006","画像確認","「この画像を使う」を押す","副課題の画像確認が完了する"],
  ["TR-01-001","スマホホーム","旅立ち銀行アイコンを押す","送金元銀行が開く"],
  ["TR-01-002","送金元銀行","残高明細を開く","開始残高10,000円を確認できる"],
  ["TR-01-003","銀行メニュー","「振込」を押す","振込先選択画面が開く"],
  ["TR-01-004","振込先選択","「新しい振込先」を押す","銀行選択フォームが開く"],
  ["TR-01-005","振込先フォーム","銀行一覧を開く","練習用銀行一覧が表示される"],
  ["TR-01-006","銀行一覧","ほしあかり銀行を選ぶ","受取銀行が設定される"],
  ["TR-01-007","振込先フォーム","支店一覧を開く","練習用支店一覧が表示される"],
  ["TR-01-008","支店一覧","口座カードと同じ支店を選ぶ","受取支店が設定される"],
  ["TR-01-009","振込先フォーム","口座種別の選択欄を開く","普通・当座の候補が表示される"],
  ["TR-01-010","口座種別","「普通」を選ぶ","accountType=ordinaryになる"],
  ["TR-01-011","振込先フォーム","口座番号欄を選ぶ","入力待ちになる"],
  ["TR-01-012","振込先フォーム","架空口座番号のチップを押す","bank-001に対応する番号が入力される"],
  ["TR-01-013","振込先フォーム","「受取人を確認」を押す","このゲーム内の照合結果が表示される"],
  ["TR-01-014","受取人確認","名義が一致する行の「この口座」を押す","受取先がbank-001として確定する"],
  ["TR-01-015","振込内容","金額欄を選ぶ","金額が入力待ちになる"],
  ["TR-01-016","振込内容","「3,000円」のチップを押す","transferAmount=3000になる"],
  ["TR-01-017","振込内容","振込日の選択欄を開く","今日・予約日の候補が表示される"],
  ["TR-01-018","振込日","「今日」を選ぶ","本演習の当日振込が設定される"],
  ["TR-01-019","振込内容","「内容を確認」を押す","受取先・3,000円・手数料110円・合計3,110円が表示される"],
  ["TR-01-020","振込確認","手数料の詳細を開く","この演習で手数料110円が別に必要だと分かる"],
  ["TR-01-021","手数料詳細","振込確認へ戻る","確認した内容を保持したまま戻る"],
  ["TR-01-022","振込確認","「この内容で認証へ」を押す","ゲーム内の承認通知が生成される"],
  ["TR-01-023","ゲーム内通知","取引承認の通知を押す","名義・金額・手数料を示す模擬認証画面が開く"],
  ["TR-01-024","模擬認証","「この振込を承認」を押す","transfer-001が一度だけ実行される"],
  ["TR-01-025","振込結果","受付票を開く","送金元残高6,890円と完了した振込内容が表示される"],
  ["TR-01-026","振込結果","「自分の受取口座の明細」を押す","bank-001の入金3,000円を確認できる"],
  ["FX-01-001","スマホホーム","ほしぞらFXアイコンを押す","通貨レート一覧が開く"],
  ["FX-01-002","レート一覧","通貨ペア一覧を開く","取扱う2ペアが表示される"],
  ["FX-01-003","通貨ペア一覧","EUR/JPYを選ぶ","ユーロ円の画面と通貨の説明が表示される"],
  ["FX-01-004","ユーロ円","Bid・Askの詳細を開く","売る値段と買う値段の違いが表示される"],
  ["FX-01-005","用語詳細","「買いと売りの向き」を開く","新規買い・新規売りの意味が短く表示される"],
  ["FX-01-006","レート画面","通貨ペア一覧を開く","ペア候補が再表示される"],
  ["FX-01-007","通貨ペア一覧","USD/JPYを選ぶ","米ドル円の画面が開く"],
  ["FX-01-008","米ドル円","「新規注文」を押す","発注前の設定画面が開く"],
  ["FX-01-009","注文設定","lot欄を選ぶ","数量が入力待ちになる"],
  ["FX-01-010","注文設定","0.1lotのチップを押す","数量100ドル、取引額15,000円が表示される"],
  ["FX-01-011","注文設定","数量の内訳を開く","0.1×1,000=100ドルを確認できる"],
  ["FX-01-012","数量内訳","注文設定へ戻る","0.1lotを保持して戻る"],
  ["FX-01-013","注文設定","lot欄を選ぶ","数量が再入力待ちになる"],
  ["FX-01-014","注文設定","1lotのチップを押す","数量1,000ドル、取引額150,000円が表示される"],
  ["FX-01-015","注文設定","新規「買い」を選ぶ","買い設定と買う価格150.00円が表示される"],
  ["FX-01-016","注文設定","新規「売り」を選ぶ","売り設定と売る価格149.98円へ切り替わる"],
  ["FX-01-017","注文設定","新規「買い」へ戻す","buy、USD/JPY、1lotに設定される"],
  ["FX-01-018","注文設定","「注文の確認」を押す","未発注の確認画面が表示される"],
  ["FX-02-001","注文下書き","注文確認を開く","USD/JPY・買い・1lotの内容が表示される"],
  ["FX-02-002","注文確認","数量・証拠金の内訳を開く","1,000ドル・取引額150,000円・必要証拠金30,000円が表示される"],
  ["FX-02-003","数量・証拠金内訳","注文確認へ戻る","確認中の注文が保持される"],
  ["FX-02-004","注文確認","「この買い注文を確定」を押す","fx-usdjpy-001がAsk150.00円で一度だけ約定する"],
  ["FX-02-005","ゲーム内通知","約定通知を押す","買い1,000ドルの約定内容が表示される"],
  ["FX-02-006","FXメニュー","建玉一覧を開く","保有中の買い建玉が1件表示される"],
  ["FX-02-007","建玉一覧","該当する建玉を選ぶ","建玉の価格・数量・方向が表示される"],
  ["FX-02-008","建玉詳細","評価損益の詳細を開く","現時点で閉じると−20円になることが表示される"],
  ["FX-02-009","先生の練習操作","「次の値動きへ」を押す","Bid149.88／Ask149.90へ進み評価損益−120円になる"],
  ["FX-02-010","建玉詳細","「この建玉を決済」を押す","新規注文とは別の決済フォームが開く"],
  ["FX-02-011","決済フォーム","決済数量欄を選ぶ","決済数量が入力待ちになる"],
  ["FX-02-012","決済フォーム","全数量1lotのチップを押す","決済数量1,000ドルが設定される"],
  ["FX-02-013","決済フォーム","決済確認を開く","対象建玉・決済売り・数量・Bid149.88円が表示される"],
  ["FX-02-014","決済確認","「この決済を確定」を押す","同じ建玉が一度だけ全決済される"],
  ["FX-02-015","ゲーム内通知","決済約定通知を押す","決済売り1,000ドルの成立が表示される"],
  ["FX-02-016","FXメニュー","建玉一覧を開く","未決済建玉0件が表示される"],
  ["FX-02-017","FXメニュー","取引履歴を開く","今回の新規・決済履歴が表示される"],
  ["FX-02-018","取引履歴","fx-usdjpy-001の取引を開く","新規・決済の対応と残高99,880円が表示される"],
  ["FX-02-019","取引詳細","確定損益の内訳を開く","（149.88−150.00）×1,000=−120円が表示される"],
  ["FX-02-020","先生の記録帳","この取引記録を保存する","案件判定に使える改変不可の練習記録が保存される"],
  ["FX-02-S-001","副実習入口","「独立した売り練習を始める」を押す","専用残高100,000円と建玉0のFX画面が開く"],
  ["FX-02-S-002","レート一覧","通貨ペア一覧を開く","ペア候補が表示される"],
  ["FX-02-S-003","通貨ペア一覧","EUR/JPYを選ぶ","ユーロ円のレートが表示される"],
  ["FX-02-S-004","ユーロ円","「新規注文」を押す","新規注文フォームが開く"],
  ["FX-02-S-005","新規注文","数量欄を選ぶ","入力待ちになる"],
  ["FX-02-S-006","新規注文","1lotのチップを押す","数量1,000ユーロが設定される"],
  ["FX-02-S-007","新規注文","「売り」を選ぶ","新規売りの説明とBid160.00円が表示される"],
  ["FX-02-S-008","新規注文","注文確認を開く","売り・1,000ユーロ・必要証拠金32,000円が表示される"],
  ["FX-02-S-009","注文確認","売り注文を確定する","fx-eurjpy-side-001が160.00円で約定する"],
  ["FX-02-S-010","FXメニュー","建玉一覧を開く","ユーロ円の売り建玉が表示される"],
  ["FX-02-S-011","建玉一覧","該当する売り建玉を選ぶ","新規時点では評価損益−30円と表示される"],
  ["FX-02-S-012","先生の練習操作","「次の値動きへ」を押す","Ask159.93円となり評価損益＋70円になる"],
  ["FX-02-S-013","建玉詳細","「この建玉を決済」を押す","決済買いのフォームが開く"],
  ["FX-02-S-014","決済フォーム","「全数量1lot」を選ぶ","決済買い1,000ユーロが設定される"],
  ["FX-02-S-015","決済フォーム","決済確認を開く","Ask159.93円で閉じる内容が表示される"],
  ["FX-02-S-016","決済確認","決済買いを確定する","売り建玉が閉じ、現金100,070円になる"],
  ["FX-02-S-017","決済結果","「この取引の履歴」を開く","新規売り・決済買い・＋70円の計算が表示される"],
  ["FX-02-S-018","先生の記録帳","副実習の取引記録を保存する","副実習の完了が記録される"],
  ["FX-03-001","スマホホーム","ポイントアプリを開く","架空案件メニューが表示される"],
  ["FX-03-002","案件メニュー","「練習した案件」を開く","fx-offer-001が表示される"],
  ["FX-03-003","案件一覧","FX練習案件を開く","300Pと達成条件の概要が表示される"],
  ["FX-03-004","案件詳細","達成条件を開く","新規数量・通貨ペア・全決済の3条件が表示される"],
  ["FX-03-005","達成条件","新規取引量の詳細を開く","約定した新規1,000通貨が必要だと分かる"],
  ["FX-03-006","達成条件","対象通貨ペアの詳細を開く","USD/JPYだけが対象だと分かる"],
  ["FX-03-007","達成条件","全決済の詳細を開く","対象建玉の残量0が必要だと分かる"],
  ["FX-03-008","案件詳細","「練習記録を選ぶ」を押す","保存した記録の一覧が開く"],
  ["FX-03-009","記録一覧","FX-02のUSD/JPY記録を選ぶ","新規1,000・全決済・損益−120円の記録が添付される"],
  ["FX-03-010","判定確認","「この記録で判定」を押す","条件に一致して300Pが付与予定になる"],
  ["FX-03-011","判定結果","「練習の承認時間を進める」を押す","付与予定300Pが承認済300Pへ移る"],
  ["FX-03-012","ポイント通帳","承認された300Pの明細を開く","案件の達成と受取結果を確認できる"],
  ["TC-01-001","スマホホーム","星札マーケットを開く","検索画面が開く"],
  ["TC-01-002","検索画面","商品名欄を選ぶ","検索語が入力待ちになる"],
  ["TC-01-003","検索画面","星の旅人セットのチップを押す","練習商品が検索される"],
  ["TC-01-004","検索結果","「売れた商品」フィルターを選ぶ","未成約の出品価格と区別された履歴になる"],
  ["TC-01-005","検索結果","同じ版のフィルターを選ぶ","別の版の商品が除外される"],
  ["TC-01-006","検索結果","同じ状態のフィルターを選ぶ","小さな傷ありの成約例が表示される"],
  ["TC-01-007","検索結果","成約比較を開く","2,900・3,000・3,100円の条件を並べて見られる"],
  ["TC-01-008","仕入候補一覧","候補Aを開く","仕入2,000円の固定セットが表示される"],
  ["TC-01-009","商品詳細","表面画像を開く","カードの版と枚数を確認できる"],
  ["TC-01-010","商品詳細","裏面画像を開く","小さな傷を確認できる"],
  ["TC-01-011","商品詳細","状態説明を開く","傷の位置と程度の説明が表示される"],
  ["TC-01-012","商品詳細","仕入送料の詳細を開く","送料200円が別に必要だと分かる"],
  ["TC-01-013","先生の収支メモ","収支計算パネルを開く","仕入と売却費用の入力欄が表示される"],
  ["TC-01-014","収支計算","仕入価格2,000円のチップを押す","purchasePrice=2000になる"],
  ["TC-01-015","収支計算","仕入送料200円のチップを押す","inboundShipping=200になる"],
  ["TC-01-016","収支計算","販売想定3,000円のチップを押す","expectedSalePrice=3000になる"],
  ["TC-01-017","収支計算","販売手数料10%を選ぶ","想定販売手数料300円が表示される"],
  ["TC-01-018","収支計算","発送送料200円を選ぶ","outboundShipping=200になる"],
  ["TC-01-019","収支計算","梱包費50円を選ぶ","想定利益250円が表示される"],
  ["TC-01-020","仕入候補","「仕入の確認」を押す","支払2,200円・状態・数量・想定利益が表示される"],
  ["TC-01-021","仕入確認","「この練習セットを仕入れる」を押す","card-purchase-001が成立し、現金7,800円・到着待ち在庫原価2,200円になる"],
  ["TC-02-001","注文状況","「練習の到着時間を進める」を押す","固定セットが到着済みになる"],
  ["TC-02-002","ゲーム内通知","到着通知を押す","検品する教材カードが表示される"],
  ["TC-02-003","検品画面","表面を拡大する","版・枚数・表の状態が確認できる"],
  ["TC-02-004","検品画面","裏面を拡大する","説明どおりの小さな傷が確認できる"],
  ["TC-02-005","検品画面","「小さな傷あり」を状態メモに記録する","正直な検品結果が保存される"],
  ["TC-02-006","市場メニュー","「このセットを出品」を押す","出品フォームが開く"],
  ["TC-02-007","出品写真","用意された表面写真を選ぶ","表面写真が添付される"],
  ["TC-02-008","出品写真","用意された裏面写真を選ぶ","傷が分かる裏面写真が添付される"],
  ["TC-02-009","出品フォーム","商品名欄を選ぶ","商品名が入力待ちになる"],
  ["TC-02-010","出品フォーム","正しい練習商品名のチップを押す","セット名と枚数が入力される"],
  ["TC-02-011","出品フォーム","版の選択欄を開く","版候補が表示される"],
  ["TC-02-012","版候補","検品した版を選ぶ","実際の教材カードと一致する版になる"],
  ["TC-02-013","出品フォーム","状態の選択欄を開く","状態候補が表示される"],
  ["TC-02-014","状態候補","「小さな傷あり」を選ぶ","状態が検品結果と一致する"],
  ["TC-02-015","出品フォーム","状態説明欄を選ぶ","説明が入力待ちになる"],
  ["TC-02-016","出品フォーム","傷の位置を含む練習説明文のチップを押す","写真に対応した説明が入力される"],
  ["TC-02-017","出品フォーム","販売価格欄を選ぶ","販売価格が入力待ちになる"],
  ["TC-02-018","出品フォーム","3,000円のチップを押す","販売価格3,000円が設定される"],
  ["TC-02-019","出品フォーム","配送方法一覧を開く","送料と追跡の有無が表示される"],
  ["TC-02-020","配送方法","この演習の追跡あり200円の方法を選ぶ","配送方法が設定される"],
  ["TC-02-021","出品フォーム","出品確認を開く","写真・版・状態・説明・価格・費用が表示される"],
  ["TC-02-022","出品確認","「この内容で出品」を押す","listing-card-001が公開された模擬状態になる"],
  ["TC-02-023","出品状況","「練習の購入通知まで進める」を押す","購入者が現れ注文card-sale-001が成立する"],
  ["TC-02-024","ゲーム内通知","購入通知を押す","発送準備の画面が開く"],
  ["TC-02-025","発送準備","50円の梱包セットを選ぶ","梱包費が一度だけ支払われ現金7,750円になる"],
  ["TC-02-026","梱包画面","折れを防ぐ台紙を取り付ける","折れ対策済みになる"],
  ["TC-02-027","梱包画面","防水袋へ入れる","水濡れ対策済みになる"],
  ["TC-02-028","発送確認","「模擬発送を確定」を押す","発送済みとなり追跡番号が表示される"],
  ["TC-02-029","配送状況","「練習の配達・受取まで進める」を押す","配達・受取承認・模擬精算が順に成立する"],
  ["TC-02-030","ゲーム内通知","受取完了の通知を押す","購入者の受取承認を確認できる"],
  ["TC-02-031","売上メニュー","入金明細を開く","売上3,000−手数料300−送料200=入金2,500円を確認できる"],
  ["TC-02-032","先生の収支メモ","確定した収支を開く","最終現金10,250円・利益250円・在庫0を確認できる"]
];

export const practiceProfile = Object.freeze({
  name: '朝日 ミナト', kana: 'アサヒ ミナト', birthday: '1990-04-12',
  address: '練習県れんしゅう市サンプル町1-2-3 ゲーム館101',
  email: 'lesson@example.invalid', phone: '000-0000-0000',
  occupation: '会社員', purpose: '給与の受け取り', adult: true,
  bank: 'ほしあかり銀行', branch: '旅立ち支店', branchCode: '101', accountType: '普通', accountNumber: '1234567',
  documentId: 'demo-license-001', documentExpires: '2030-12-31', simulationToday: '2026-10-22',
  icPin: '1234', introPhrase: '一歩ずつ', registrationCode: '246810', bankCode: '864200',
  demoPassword: 'DEMO-kotsu-26',
});
export const practiceProfileDisplay = Object.freeze({
  '氏名（架空の成人）': practiceProfile.name,
  'フリガナ': practiceProfile.kana,
  '生年月日': practiceProfile.birthday,
  '住所・部屋番号': practiceProfile.address,
  '練習メール': practiceProfile.email,
  '練習電話': practiceProfile.phone,
  '職業': practiceProfile.occupation,
  '利用目的': practiceProfile.purpose,
});
export const practiceBankCardDisplay = Object.freeze({
  '受取銀行': practiceProfile.bank, '支店': `${practiceProfile.branch}（${practiceProfile.branchCode}）`,
  '口座種別': practiceProfile.accountType, '架空口座番号': practiceProfile.accountNumber,
  '受取名義': practiceProfile.kana,
});

export const comparisonPanels = {
  shoppingOffers: [
    { id: 'A', name: '案件A', points: 300, additionalCost: 0, netValue: 300, description: '必要な日用品だけを買う' },
    { id: 'B', name: '案件B', points: 500, additionalCost: 600, netValue: -100, description: '別に送料600円が必要' },
    { id: 'C', name: '案件C', points: 600, additionalCost: 1000, netValue: -400, description: '不要な追加購入1,000円が必要' },
  ],
  exchangeTargets: [
    { id: 'A', name: 'まいにちストアのギフト', minimum: 100, unit: 100, fee: 0, factor: 1, expiresDays: 30, plannedUse: true },
    { id: 'B', name: 'よりみちショップのギフト', minimum: 100, unit: 100, fee: 0, factor: 1.1, expiresDays: 7, plannedUse: false },
    { id: 'C', name: '現金交換', minimum: 500, unit: 100, fee: 0, factor: 1, expiresDays: null, plannedUse: false },
  ],
  cartOptions: {
    sets: [{ value: 'daily-standard', label: '洗剤900円・ティッシュ600円・石けん大500円', amount: 2000 }, { value: 'daily-small', label: '石けん小へ変更したセット', amount: 1900 }],
    shipping: [0, 100], coupons: [0, 100], eligibleFormula: '商品代金 − クーポン', paymentFormula: '対象金額 ＋ 送料',
  },
  cards: {
    productName: '星の旅人セット（星版2026・3枚）', edition: '星版2026', condition: '小さな傷あり',
    soldComparables: [2900, 3000, 3100], purchasePrice: 2000, inboundShipping: 200,
    expectedSalePrice: 3000, feeRate: 0.1, outboundShipping: 200, packagingCost: 50,
    expectedProfit: 250, skipExample: { salePrice: 2500, sellingFee: 250, profit: -200 },
    description: '裏面右下に小さな傷があります。3枚セットです。',
  },
};
export const comparisonDisplay = Object.freeze({
  '通販案件': comparisonPanels.shoppingOffers.map(item => `${item.name}：${item.points}P − 追加費用${item.additionalCost}円 ＝ ${item.netValue}円分。${item.description}`),
  '交換先': [
    'A まいにちストア：300Pで300円分。最低100P・100P単位・手数料0円・受取後30日。利用予定あり。',
    'B よりみちショップ：300Pで330円分。最低100P・100P単位・手数料0円・受取後7日。利用予定なし。',
    'C 現金交換：最低500P・100P単位・手数料0円。承認済み300Pでは交換できません。',
  ],
  'カート': ['標準セット2,000円／石けん小の比較セット1,900円。', '対象金額＝商品代金−クーポン。支払総額＝対象金額＋送料。', '送料100円を加えても対象金額は変わりません。'],
  'トレカの見送り例': ['販売想定2,500円−手数料250円−発送200円−梱包50円−仕入2,000円−仕入送料200円＝−200円。', '見送ることも、費用を確かめた適切な判断です。標準練習の在庫や支払は変わりません。'],
});

const questDefinitions = [
  ['PR-01', 'intro', 'CH-0', '端末操作の練習 — 旅人の手帳', 'mina', 'intro-phone', []],
  ['PO-01', 'points', 'CH-1', '会員登録 — はじめの小窓', 'haru', 'points-shopping', ['PR-01']],
  ['PO-02', 'points', 'CH-1', '案件比較と経由 — 見通しの道', 'haru', 'points-shopping', ['PO-01']],
  ['PO-03', 'points', 'CH-1', '注文 — 日用品を届けよう', 'haru', 'points-shopping', ['PO-02']],
  ['PO-04', 'points', 'CH-1', '証拠と通帳 — 注文の足あと', 'mina', 'points-shopping', ['PO-03']],
  ['PO-05', 'points', 'CH-1', '問い合わせ — 遅れた知らせ', 'mina', 'points-shopping', ['PO-04']],
  ['PO-06', 'points', 'CH-1', '交換と受取 — 手元までの一歩', 'haru', 'points-shopping', ['PO-05']],
  ['BK-01', 'points', 'CH-2', '口座申込 — 白紙の通行証', 'sui', 'bank-application', ['PO-06']],
  ['BK-02', 'points', 'CH-2', 'KYC — 鏡の門', 'sui', 'bank-application', ['BK-01']],
  ['BK-02-R', 'points', 'CH-2', 'ぼやけた写真を直そう', 'sui', 'bank-kyc-retake', ['BK-02']],
  ['TR-01', 'points', 'CH-2', '振込と着金 — ふたつの金庫', 'sui', 'bank-transfer', ['BK-02']],
  ['FX-01', 'points', 'CH-3', '通貨ペア・方向・lot — 通貨の関所', 'nagi', 'fx-order', ['TR-01']],
  ['FX-02', 'points', 'CH-3', '建玉と決済 — ロット・キマイラ', 'nagi', 'fx-order', ['FX-01']],
  ['FX-02-S', 'points', 'CH-3', 'ユーロ円を売りから始める', 'nagi', 'fx-sell-variant', ['FX-02']],
  ['FX-03', 'points', 'CH-3', '架空案件の条件 — 条件の番人', 'nagi', 'fx-offer', ['FX-02']],
  ['TC-01', 'points', 'CH-4', '相場・状態・仕入 — 星札の目利き', 'kohaku', 'cards-trade', ['FX-03']],
  ['TC-02', 'points', 'CH-4', '出品・梱包・発送・入金 — ミカケノ利益竜', 'kohaku', 'cards-trade', ['TC-01']],
];

function questForStep(id) {
  if (id.startsWith('P') && !id.startsWith('PR')) {
    const n = Number(id.slice(1));
    return n <= 19 ? 'PO-01' : n <= 32 ? 'PO-02' : n <= 45 ? 'PO-03' : n <= 55 ? 'PO-04' : n <= 67 ? 'PO-05' : 'PO-06';
  }
  return id.replace(/-\d{3}$/, '');
}
const options = (...pairs) => pairs.map(([label, value]) => ({ label, value }));
const O = {};
const set = (id, config) => { O[id] = { ...O[id], ...config }; };
const field = (id, key, label, value, type = 'input', choices) => set(id, { field: key, fieldLabel: label, value, type, ...(choices ? { choices } : {}) });
const focus = (id, key, label) => set(id, { field: key, fieldLabel: label, type: 'focus' });
const select = (id, key, label, value, choices) => field(id, key, label, value, 'select', choices);
const check = (id, key, label) => field(id, key, label, true, 'check');

// Display the screen the learner is leaving until they actually switch apps.
set('PR-01-007', { appId: 'mail', displayAppId: 'mail', navigationAction: 'switcher' });
set('PR-01-008', { displayAppId: 'switcher', phoneScreen: 'switcher', openAppId: 'memo' });
set('P015', { appId: 'mail', displayAppId: 'mail', navigationAction: 'switcher' });
set('P016', { displayAppId: 'switcher', phoneScreen: 'switcher', openAppId: 'browser' });
set('PR-01-003', { navigationAction: 'home' });
set('P011', { navigationAction: 'home' });

focus('PR-01-009', 'introPhrase', 'メールの合言葉');
field('PR-01-010', 'introPhrase', 'メールの合言葉', practiceProfile.introPhrase);
focus('P004', 'email', '練習メール');
field('P005', 'email', '練習メール', practiceProfile.email);
focus('P006', 'password', '練習用パスワード');
field('P007', 'password', '練習用パスワード', practiceProfile.demoPassword);
set('P007', { inputType: 'password' });
check('P009', 'termsAccepted', 'この架空サービスの利用条件を確認しました');
focus('P017', 'registrationCode', 'メールの確認コード');
field('P018', 'registrationCode', 'メールの確認コード', practiceProfile.registrationCode);
select('P027', 'selectedOffer', '今回の案件', 'A', options(['A 300P・追加費用0円', 'A'], ['B 500P・送料600円', 'B'], ['C 600P・不要な追加購入1,000円', 'C']));
set('P031', { field: 'participated', value: true });
set('P032', { field: 'viaRecorded', value: true });
set('P034', { field: 'cartItem', value: 'daily-standard' });
select('P037', 'coupon', 'クーポン', 100, options(['100円引きを試す', 100], ['使わない', 0]));
select('P038', 'coupon', 'クーポン', 0, options(['使わない・対象商品2,000円', 0], ['100円引き・対象商品1,900円', 100]));
focus('P040', 'deliveryAddress', '架空のお届け先');
field('P041', 'deliveryAddress', '架空のお届け先', `${practiceProfile.name}／${practiceProfile.address}`);
select('P043', 'payment', '支払い方法', 'DEMO', options(['登録済みのDEMOカード（教材専用）', 'DEMO'], ['未選択に戻す', 'none']));
focus('P057', 'orderNumber', '注文番号');
field('P058', 'orderNumber', '注文番号', 'PQ-001');
focus('P059', 'inquiryReason', '問い合わせ理由');
select('P060', 'inquiryReason', '問い合わせ理由', 'overdue', options(['承認予定を過ぎている', 'overdue'], ['まだ承認予定日前', 'before-due'], ['注文を取り消したい', 'cancel']));
select('P062', 'attachment', '添付する画面メモ', 'offer-conditions', options(['保存した案件条件・0日目', 'offer-conditions'], ['日用品の紹介画面', 'product-page']));
select('P069', 'exchangeTarget', '交換先', 'A', options(['A まいにちストア・30日・利用予定あり', 'A'], ['B よりみちショップ・7日・利用予定なし', 'B'], ['C 現金交換・最低500P', 'C']));
focus('P070', 'exchangePoints', '交換するポイント数');
field('P071', 'exchangePoints', '交換するポイント数（P）', 300);

focus('BK-01-005', 'email', '練習メール');
field('BK-01-006', 'email', '練習メール', practiceProfile.email);
focus('BK-01-012', 'bankCode', '銀行メールの認証コード');
field('BK-01-013', 'bankCode', '銀行メールの認証コード', practiceProfile.bankCode);
for (const [pick, enter, key, label, value] of [
  ['015', '016', 'name', '氏名', practiceProfile.name], ['017', '018', 'kana', 'フリガナ', practiceProfile.kana],
  ['019', '020', 'birthday', '生年月日', practiceProfile.birthday], ['021', '022', 'address', '住所・部屋番号', practiceProfile.address],
  ['023', '024', 'phone', '練習電話', practiceProfile.phone],
]) { focus(`BK-01-${pick}`, key, label); field(`BK-01-${enter}`, key, label, value); }
set('BK-01-020', { inputType: 'date' });
set('BK-01-024', { inputType: 'tel' });
select('BK-01-026', 'occupation', 'プロフィールの職業', 'employee', options(['会社員', 'employee'], ['自営業', 'self-employed'], ['学生', 'student']));
select('BK-01-028', 'purpose', '利用目的', 'salary', options(['給与の受け取り', 'salary'], ['生活費の支払い', 'living'], ['未選択', 'none']));
check('BK-01-030', 'termsAccepted', '模擬利用規約を確認して同意します');
select('BK-02-003', 'kycMethod', '本人確認の方法', 'ic-face', options(['IC読取＋顔合わせ（この練習の主経路）', 'ic-face'], ['方法の説明へ戻る', 'back']));
select('BK-02-005', 'document', '練習用書類', 'demo-license-001', options(['朝日ミナト・有効期限2030年12月31日', 'demo-license-001'], ['期限切れの比較カード・2025年12月31日', 'demo-expired-001']));
check('BK-02-011', 'mockDataConsent', '画面内の架空データで練習します');
focus('BK-02-012', 'icPin', '画面内のDEMO暗証番号');
field('BK-02-013', 'icPin', '画面内のDEMO暗証番号', practiceProfile.icPin);
select('BK-02-015', 'cardPosition', '画面内カードの位置', 'inside', options(['カードを読み取り枠に置く', 'inside'], ['枠の外に置く', 'outside']));
select('BK-02-018', 'facePosition', '画面内人物の位置', 'inside', options(['人物を顔の枠に合わせる', 'inside'], ['枠の左へずらす', 'left']));
select('BK-02-R-003', 'facePosition', '画面内人物の位置', 'bright', options(['明るい指定位置に置く', 'bright'], ['暗い隅に置く', 'dark']));
select('TR-01-006', 'bank', '受取銀行', 'hoshi', options(['ほしあかり銀行', 'hoshi'], ['旅立ち銀行（送金元）', 'departure'], ['ゆうやけ銀行', 'sunset']));
select('TR-01-008', 'branch', '受取支店', 'tabidachi', options(['旅立ち支店 101', 'tabidachi'], ['港支店 102', 'port']));
select('TR-01-010', 'accountType', '口座種別', 'ordinary', options(['普通', 'ordinary'], ['当座', 'current']));
focus('TR-01-011', 'accountNumber', '架空口座番号');
field('TR-01-012', 'accountNumber', '架空口座番号', practiceProfile.accountNumber);
select('TR-01-014', 'recipient', '受取名義', practiceProfile.kana, options(['アサヒ ミナト・bank-001', practiceProfile.kana], ['アサヒ ミナミ・別の比較口座', 'アサヒ ミナミ']));
focus('TR-01-015', 'transferAmount', '振込金額');
field('TR-01-016', 'transferAmount', '振込金額（円）', 3000);
select('TR-01-018', 'transferDate', '振込日', 'today', options(['今日（教材日付2026年10月22日）', 'today'], ['予約日（まだ実行されない）', 'reserved']));

const pairChoices = options(['USD/JPY 米ドル／日本円', 'USDJPY'], ['EUR/JPY ユーロ／日本円', 'EURJPY']);
select('FX-01-003', 'pair', '通貨ペア', 'EURJPY', pairChoices);
select('FX-01-007', 'pair', '通貨ペア', 'USDJPY', pairChoices);
focus('FX-01-009', 'lots', 'lot数（1lot＝1,000通貨）');
field('FX-01-010', 'lots', 'lot数（1lot＝1,000通貨）', 0.1);
focus('FX-01-013', 'lots', 'lot数（1lot＝1,000通貨）');
field('FX-01-014', 'lots', 'lot数（1lot＝1,000通貨）', 1);
const sideChoices = options(['新規買い', 'buy'], ['新規売り', 'sell']);
select('FX-01-015', 'side', '新規注文の方向', 'buy', sideChoices);
select('FX-01-016', 'side', '新規注文の方向', 'sell', sideChoices);
select('FX-01-017', 'side', '新規注文の方向', 'buy', sideChoices);
select('FX-02-007', 'positionId', '決済する建玉', 'fx-usdjpy-001', options(['fx-usdjpy-001 USD/JPY 買い1,000ドル', 'fx-usdjpy-001'], ['新規注文へ戻る', 'new-order']));
focus('FX-02-011', 'closeLots', '決済lot数');
field('FX-02-012', 'closeLots', '決済lot数（残量1lot）', 1);
select('FX-02-S-003', 'pair', '通貨ペア', 'EURJPY', pairChoices);
focus('FX-02-S-005', 'lots', '新規lot数（1lot＝1,000ユーロ）');
field('FX-02-S-006', 'lots', '新規lot数（1lot＝1,000ユーロ）', 1);
select('FX-02-S-007', 'side', '新規注文の方向', 'sell', sideChoices);
select('FX-02-S-011', 'positionId', '決済する売り建玉', 'fx-eurjpy-side-001', options(['fx-eurjpy-side-001 EUR/JPY 売り1,000ユーロ', 'fx-eurjpy-side-001'], ['新規注文へ戻る', 'new-order']));
select('FX-02-S-014', 'closeLots', '決済買いの数量', 1, options(['全数量1lot・1,000ユーロ', 1], ['半分0.5lot・500ユーロ', 0.5]));
select('FX-03-009', 'evidenceId', '提出する練習記録', 'fx-usdjpy-001', options(['FX-02 USD/JPY 新規1,000・残量0・損益−120円', 'fx-usdjpy-001'], ['副実習 EUR/JPY 新規1,000・残量0・損益＋70円', 'fx-eurjpy-side-001']));

focus('TC-01-002', 'query', '検索する商品名');
field('TC-01-003', 'query', '検索する商品名', '星の旅人セット');
select('TC-01-004', 'salesFilter', '価格の種類', 'sold', options(['売れた商品・成約価格', 'sold'], ['出品中・まだ売れていない価格', 'listing']));
select('TC-01-005', 'edition', '比較する版', '星版2026', options(['星版2026・3枚セット', '星版2026'], ['月版2025・1枚', '月版2025']));
select('TC-01-006', 'condition', '比較する状態', 'minor-scratches', options(['小さな傷あり', 'minor-scratches'], ['目立つ傷なし', 'mint']));
for (const [id, key, label, value] of [
  ['014', 'purchasePrice', '仕入価格（円）', 2000], ['015', 'inboundShipping', '仕入送料（円）', 200],
  ['016', 'expectedSalePrice', '販売想定（円・売却保証なし）', 3000],
]) field(`TC-01-${id}`, key, label, value);
select('TC-01-017', 'feeRate', '販売手数料率', 0.1, options(['教材手数料10%・想定300円', 0.1], ['0%で試算', 0]));
select('TC-01-018', 'outboundShipping', '発送送料', 200, options(['追跡あり200円', 200], ['送料を入れ忘れた試算0円', 0]));
select('TC-01-019', 'packagingCost', '梱包費', 50, options(['教材梱包セット50円', 50], ['梱包費を入れ忘れた試算0円', 0]));
select('TC-02-005', 'inspection', '検品結果', 'minor-scratches', options(['裏面右下に小さな傷あり', 'minor-scratches'], ['目立つ傷なし', 'mint']));
select('TC-02-007', 'frontPhoto', '用意された表面写真', 'card-front', options(['星版2026・3枚の表面', 'card-front'], ['別の版の比較画像', 'other-front']));
select('TC-02-008', 'backPhoto', '用意された裏面写真', 'card-back', options(['右下の傷が分かる裏面', 'card-back'], ['裏面写真を付けない', 'none']));
focus('TC-02-009', 'productName', '出品する商品名');
field('TC-02-010', 'productName', '出品する商品名', comparisonPanels.cards.productName);
select('TC-02-012', 'edition', '検品した版', '星版2026', options(['星版2026', '星版2026'], ['月版2025', '月版2025']));
select('TC-02-014', 'condition', '出品する状態', 'minor-scratches', options(['小さな傷あり', 'minor-scratches'], ['目立つ傷なし', 'mint']));
focus('TC-02-015', 'description', '状態の説明');
field('TC-02-016', 'description', '状態の説明', comparisonPanels.cards.description);
focus('TC-02-017', 'salePrice', '販売価格');
field('TC-02-018', 'salePrice', '販売価格（円）', 3000);
select('TC-02-020', 'delivery', '配送方法', 'tracked-200', options(['追跡あり・教材送料200円', 'tracked-200'], ['追跡なし・比較用100円', 'untracked-100']));
select('TC-02-025', 'packaging', '梱包セット', 'set-50', options(['台紙と防水袋の教材セット・50円', 'set-50'], ['梱包しない', 'none']));
check('TC-02-026', 'bendProtection', '折れを防ぐ台紙を取り付けました');
check('TC-02-027', 'waterProtection', '水濡れを防ぐ袋に入れました');

const guidedMaps = {
  'PR-01': { smartphone: { 0: 'PR-01-002', 1: 'PR-01-011', 3: 'PR-01-008' } },
  'PO-01': { smartphone: { 2: 'P019', 3: 'P016' } },
  'PO-02': { points: { 0: 'P027' } },
  'PO-03': { points: { 1: 'P045' } },
  'PO-04': { points: { 2: 'P048' }, smartphone: { 3: 'P052', 4: 'P046' } },
  'PO-05': { points: { 3: 'P067' } },
  'PO-06': { points: { 4: 'P077' } },
  'BK-01': { bankKyc: { 0: 'BK-01-031', 1: 'BK-01-032' } },
  'BK-02': { bankKyc: { 2: 'BK-02-003', 3: 'BK-02-021', 4: 'BK-02-023' } },
  'TR-01': { transfer: { 0: 'TR-01-008', 1: 'TR-01-014', 2: 'TR-01-020', 3: 'TR-01-024', 4: 'TR-01-026' } },
  'FX-01': { fx: { 0: 'FX-01-007', 1: 'FX-01-017', 2: 'FX-01-014' } },
  'FX-02': { fx: { 3: 'FX-02-020' } },
  'FX-03': { fx: { 4: 'FX-03-012' } },
  'TC-01': { cards: { 0: 'TC-01-007', 2: 'TC-01-021' } },
  'TC-02': { cards: { 1: 'TC-02-022', 3: 'TC-02-028', 4: 'TC-02-032' } },
};
const completionPredicates = {
  'PR-01': 'introPhraseMatchesMail && introMemoSaved', 'PO-01': 'registrationVerified',
  'PO-02': 'offerASelected && offerConditionsSaved && participated && viaRecorded',
  'PO-03': 'order001Confirmed && payment==2000 && pendingPoints==300', 'PO-04': 'orderStarred && orderEvidenceSaved && simulationDay==15',
  'PO-05': 'inquirySubmitted && approvedPoints==300 && pendingPoints==0 && approvalMailViewed',
  'PO-06': 'receivedGiftValue==300 && pendingGiftValue==0 && approvedPoints==0 && receivedHistoryViewed',
  'BK-01': 'emailVerified && fieldsMatchPracticeProfile && termsAccepted && applicationAwaitingKyc && receiptVisible',
  'BK-02': 'identityMatches && icReadAccepted && faceImageAccepted && accountUsable && approvalResultViewed',
  'BK-02-R': 'retakePerformed && replacementImageClear && replacementImageAccepted',
  'TR-01': 'transferSettled && sourceBalance==6890 && targetBalance==3000 && receiptViewed && recipientStatementViewed',
  'FX-01': 'bothPairsVisited && bidAskInspected && bothDirectionsInspected && lots==1 && pair==USDJPY && side==buy && fills==0',
  'FX-02': 'newQuantity==1000 && closeQuantity==1000 && remainingQuantity==0 && realizedPnl==-120 && tradeEvidenceSaved',
  'FX-02-S': 'shortQuantity==1000 && closeBuyQuantity==1000 && remainingQuantity==0 && realizedPnl==70 && tradeEvidenceSaved',
  'FX-03': 'evidencePair==USDJPY && newFilledQuantity>=1000 && remainingQuantity==0 && approvedPoints==300 && approvalEntryViewed',
  'TC-01': 'comparablesMatch && inspected && expectedProfit==250 && cash==7800 && inTransitCost==2200',
  'TC-02': 'accurateListing && delivered && buyerReceiptApproved && cash==10250 && inventoryCost==0 && realizedProfit==250 && payoutAndProfitViewed',
};

export const quests = questDefinitions.map(([id, partId, chapterId, title, requesterId, scenarioId, prerequisites]) => {
  const extra = id === 'BK-02-R' || id === 'FX-02-S';
  return {
    id, partId, chapterId, title, requesterId, scenarioId, prerequisites,
    stepIds: rawRows.filter(([stepId]) => questForStep(stepId) === id).map(([stepId]) => stepId),
    guidedObjectiveMap: guidedMaps[id] || {}, completionRule: 'all-steps', completionPredicate: completionPredicates[id],
    bossLink: chapterId, reward: extra ? 0 : 40, extra,
    parentQuestId: id === 'BK-02-R' ? 'BK-02' : id === 'FX-02-S' ? 'FX-02' : undefined,
    timedChallenge: { enabled: !extra && id !== 'PR-01', durationHours: 24 },
    reviewVariant: { id: `${id}-review`, independentSnapshot: true, questReward: 0, stepReward: 0, bossChapterId: chapterId, usesChangedConditions: true },
    offerCardRequired: id === 'FX-01',
  };
});

const commonDetails = {
  'PR-01': ['郵便屋ミナの練習メール', '届いたメールを開き、合言葉をメモに写そう。', 'ゲーム内コピーを使います。端末の情報は読みません。'],
  'PO-01': ['コツコツモール　kotsukotsu.example.invalid', `練習メール：${practiceProfile.email}`, '確認コードは、登録送信のあとに届くゲーム内メールで確かめます。'],
  'PO-02': ['案件A：300P − 追加0円 ＝ 300円分', '案件B：500P − 送料600円 ＝ −100円分', '案件C：600P − 不要な追加購入1,000円 ＝ −400円分', '条件：商品代金−クーポンが2,000円以上。送料は含みません。参加登録と経由が必要です。'],
  'PO-03': ['まいにちストア　shop.example.invalid', '洗剤900円＋ティッシュ600円＋石けん大500円＝2,000円', '今回の注文：送料0円・クーポン0円・DEMOカード', '商品代金−クーポン＝対象金額。対象金額＋送料＝支払総額。'],
  'PO-04': ['注文番号PQ-001／order-001／0日目／支払い2,000円', '承認予定は14日目まで。問い合わせは15日目から。', '判定待ち300Pはまだ交換できません。'],
  'PO-05': ['注文番号PQ-001／注文額2,000円／購入0日目', '承認予定14日目を過ぎた15日目から問い合わせできます。', '注文メールと保存した案件条件を照合して送ります。'],
  'PO-06': ['今回の架空設定：1P＝1円分。交換は100P以上・100P単位。', 'まいにちストア：300P→300円分／手数料0／受取後30日／利用予定あり', 'よりみちショップ：300P→330円分／手数料0／受取後7日／利用予定なし', '現金交換：最低500P。承認済み300Pでは不足します。'],
  'BK-01': ['ほしあかり銀行　bank.example.invalid', 'この練習の人物は架空の成人「朝日ミナト」です。', '申込受付と口座の利用開始は別です。'],
  'BK-02': ['KYC（本人確認）：申し込んだ人が本人か確かめること。', 'この架空銀行の主経路：画面内IC読取＋画面内人物の顔合わせ', '教材日付2026年10月22日／練習免許証の期限2030年12月31日', `画面内DEMO暗証番号：${practiceProfile.icPin}。カメラやNFCは使いません。`],
  'BK-02-R': ['別の練習コピーです。元の申込や口座は変わりません。', 'ぼやけた画面内画像を、明るい位置で撮り直します。'],
  'TR-01': ['ここからは別の練習。送金元10,000円・受取口座0円。', '受取：ほしあかり銀行 旅立ち支店101 普通1234567 アサヒ ミナト', '今回の振込3,000円＋手数料110円＝支払合計3,110円'],
  'FX-01': ['ほしぞらFX／この練習は1lot＝1,000通貨', 'USD/JPY：米ドルを日本円の値段で取引', '買う価格Ask150.00円／売る価格Bid149.98円', '案件条件：USD/JPYの新規約定1,000通貨以上・全決済・記録提出で架空300P。'],
  'FX-02': ['開始残高100,000円／USD/JPY 買い1lot＝1,000ドル', '新規Ask150.00円／取引額150,000円／教材証拠金30,000円', '決済は建玉から行います。同量の新規売りとは別です。', '教材の取引手数料0円・スワップ0円。利益の大きさはXPに影響しません。'],
  'FX-02-S': ['独立した売り練習。開始残高100,000円・建玉0。', 'EUR/JPY 売り1lot＝1,000ユーロ／新規Bid160.00円', '必要証拠金32,000円／新規時Ask160.03円／決済時Ask159.93円', '主経路の資金や300P案件の記録には合算しません。'],
  'FX-03': ['架空案件fx-offer-001／報酬300P', 'USD/JPYの新規約定1,000通貨以上・対象建玉の全決済・記録提出', '決済量や注文ボタンを押した回数は、新規量に足しません。', 'FXの損失120円と承認ポイント300Pは別に表示します。'],
  'TC-01': ['星札マーケット／固定の「星の旅人セット」3枚／星版2026／小さな傷あり', '同じ版・枚数・状態の成約例：2,900円／3,000円／3,100円', '仕入2,000円＋仕入送料200円。想定売値3,000円は予測です。', '教材費用：手数料10%・発送200円・梱包50円。想定利益250円。'],
  'TC-02': ['星の旅人セット（星版2026・3枚）／裏面右下に小さな傷あり', '販売3,000円−手数料300円−発送送料200円＝入金2,500円', '梱包50円は先に払います。入金時に二度引きません。', '出品・売却成立・発送・受取承認・入金はそれぞれ別の状態です。'],
};

function appFor(id, screen, instruction) {
  if (/メール|受信一覧/.test(screen) || /メール.*(?:通知|本文)|回答メール|特典案内メール|注文メールの通知/.test(instruction)) return 'mail';
  if (id.startsWith('PR')) return 'memo';
  if (id.startsWith('P')) return 'browser';
  if (id.startsWith('BK') || id.startsWith('TR')) return 'bank';
  if (id.startsWith('FX')) return id.startsWith('FX-03') ? 'browser' : 'fx';
  return 'market';
}
function inferType(instruction) {
  if (/時間を進める|まで進める|次の値動きへ/.test(instruction)) return 'wait';
  if (/確定|申請を|提出|申し込む|登録を完了|この内容で出品|仕入れる|この振込を承認/.test(instruction)) return 'confirm';
  if (/欄を(?:押す|選ぶ)|入力欄を選ぶ/.test(instruction)) return 'focus';
  return 'tap';
}

export const steps = rawRows.map(([id, screenTitle, instruction, result]) => {
  const questId = questForStep(id);
  const q = quests.find(item => item.id === questId);
  const index = q.stepIds.indexOf(id);
  const appId = appFor(id, screenTitle, instruction);
  const override = O[id] || {};
  return {
    id, questId, screenId: `${questId}:${screenTitle}`, screenTitle, appId,
    tabId: id.startsWith('P') ? Number(id.slice(1)) >= 33 && Number(id.slice(1)) <= 51 ? 'daily-store' : 'kotsukotsu-mall' : `${appId}-main`,
    instruction, targetAction: id, label: instruction, type: inferType(instruction),
    details: [...(commonDetails[questId] || []), result], result,
    preconditions: index > 0 ? [q.stepIds[index - 1]] : [], completionRule: 'action',
    nextStepIds: q.stepIds[index + 1] ? [q.stepIds[index + 1]] : [], equivalentRoutes: [],
    checkpoint: (index + 1) % 6 === 0 || index === q.stepIds.length - 1,
    hintIds: [`${id}:purpose`, `${id}:place`, `${id}:action`],
    hints: [`今は「${result}」に進む練習です。`, `「${screenTitle}」の${override.fieldLabel || '操作する場所'}を見よう。`, instruction],
    panel: /比較/.test(screenTitle + instruction) ? 'comparison' : /カート/.test(screenTitle) ? 'cart' : /書類|読取|顔合わせ|撮影/.test(screenTitle) ? 'identity' : /フォーム|確認|入力/.test(screenTitle) ? 'form' : 'service',
    effect: id, inputMode: typeof override.value === 'number' ? 'decimal' : /Code|Pin|Number/.test(override.field || '') ? 'numeric' : 'text', ...override,
  };
});

const npc = (id, name, role, dialogue, afterDialogue) => ({ id, name, role, topicId: `${id}:first-help`, dialogue, afterDialogue });
export const chapters = [
  { id: 'CH-0', title: '旅立ちの村', subtitle: '序章 · 小さな一歩', npcId: 'mina', npcName: '郵便屋ミナ', dialogue: '大切な合言葉が届いたよ。\nメモへ写すところを手伝ってくれる？', area: '緑の村', color: '#6f985c',
    equipment: { id: 'traveler-notebook', name: '旅人の手帳', slot: 'tool', description: '受けた依頼と、途中のスマホへすぐ戻れる。' },
    questIds: ['PR-01'], worldChange: '村の掲示板に旅人の手帳の印が灯る。',
    npcs: [npc('mina', '郵便屋ミナ', 'requester', '合言葉をメールで送ったよ。\nメモへ写してみよう。', 'メモが残ったね。\nこの手帳を旅のおともにして。'), npc('toto', '先生トト', 'hint', 'ひとつ押したら、何が変わったか見よう。', '困ったときは何度でも聞いてね。'), npc('kohaku-intro', '道具屋コハク', 'reflection', '依頼帳なら、歩かずにも人を訪ねられるよ。', '手帳があれば途中から続けられるね。')] },
  { id: 'CH-1', title: 'ポイントの商店街', subtitle: '第1章 · 見通しの道', npcId: 'haru', npcName: '店主ハル', dialogue: '必要な日用品を買いたいんだ。\n追加の出費と受取まで一緒に見よう。', area: '商店街', color: '#c99760',
    equipment: { id: 'insight-loupe', name: '見通しのルーペ', slot: 'tool', description: '案件と費用を並べる比較メモを開ける。' },
    questIds: ['PO-01', 'PO-02', 'PO-03', 'PO-04', 'PO-05', 'PO-06'], worldChange: '商店の雨戸が開き、広場の荷物が片づく。',
    npcs: [npc('haru', '店主ハル', 'requester', 'ポイントがまだ届かないんだ。\n買った日のメールから見てくれる？', '受取まで確かめてくれて助かった。\n見通しのルーペをどうぞ。'), npc('mina-shop', '郵便屋ミナ', 'hint', '通知を消しても、メールは残るよ。', '注文メールのスターが役に立ったね。'), npc('aya', '仕立屋アヤ', 'reflection', '大きなポイントでも、余分な出費を引いて比べたいね。', '必要な物だけ買えた。店を開けられるよ。')] },
  { id: 'CH-2', title: '証しの城下町', subtitle: '第2章 · 一致する証し', npcId: 'sui', npcName: '帳場のスイ', dialogue: '申込と本人確認がごちゃごちゃでね。\n朝日ミナトさんの練習カードを確かめよう。', area: '石の城下町', color: '#aeb7b5',
    equipment: { id: 'identity-shield', name: '証しの盾', slot: 'shield', description: '情報を見比べる枠と、旅人の盾の姿が変わる。' },
    questIds: ['BK-01', 'BK-02', 'TR-01'], worldChange: '城門が開き、水路に石橋が架かる。',
    npcs: [npc('sui', '帳場のスイ', 'requester', '受付はできたけれど、口座はまだ使えない。\n最後の知らせまで見届けてほしい。', '名義も着金も確かめられたね。\n証しの盾を受け取って。'), npc('yura', '門番ユラ', 'hint', '有効期限は教材の日付と比べよう。', '自分の口座へ届いた印がそろったね。'), npc('ren', '橋守レン', 'reflection', '送ったお金と手数料を分けて帳面に残すよ。', '町の橋を直せた。港へ渡れるよ。')] },
  { id: 'CH-3', title: '通貨の港', subtitle: '第3章 · 数と向きを読む', npcId: 'nagi', npcName: '船長ナギ', dialogue: 'ドルとユーロ、買いと売りが混ざってね。\n注文前の条件から一つずつ確かめよう。', area: '海の港', color: '#5e9caf',
    equipment: { id: 'tide-compass', name: '潮読みの羅針盤', slot: 'tool', description: '新規・建玉・決済の比較メモへ戻れる。' },
    questIds: ['FX-01', 'FX-02', 'FX-03'], worldChange: '港に船が戻り、灯台の明かりがともる。',
    npcs: [npc('nagi', '船長ナギ', 'requester', '先に案件の条件を保存しよう。\n数量を増やすほどよい練習ではないよ。', '損失も正しく記録できたね。\n潮読みの羅針盤をどうぞ。'), npc('ito', '航海士イト', 'hint', '1lotが何通貨か、数量の隣で見よう。', '新規と決済の履歴がつながった。'), npc('umi', '港番ウミ', 'reflection', '建玉は、まだ閉じていない取引の記録だよ。', '残量ゼロを確認して船を出せるね。')] },
  { id: 'CH-4', title: 'カードの市場', subtitle: '第4章 · 手元に届くまで', npcId: 'kohaku', npcName: '道具屋コハク', dialogue: '星札の売上と利益が合わないんだ。\n傷と送料、それから入金まで見てほしい。', area: '星札市場', color: '#ad89a6',
    equipment: { id: 'star-abacus', name: '星のそろばん', slot: 'tool', description: '仕入と販売の費用を、一項目ずつたどれる。' },
    questIds: ['TC-01', 'TC-02'], worldChange: '星札の露店が開き、市場の星飾りが灯る。',
    npcs: [npc('kohaku', '道具屋コハク', 'requester', '同じ版と状態の、売れた値段を見よう。\n出品しただけの値段とは違うんだ。', '正直な説明と梱包が助かったよ。\n星のそろばんをどうぞ。'), npc('shino', '梱包屋シノ', 'hint', '台紙は折れ対策。袋は水濡れ対策だよ。', '無事に受け取ってもらえたね。'), npc('moku', '記録係モク', 'reflection', '売上、入金、利益を別々に書いてみよう。', '未入金を残さず帳面を閉じられた。')] },
];

export const objectives = [
  { domain: 'smartphone', names: ['移動とスクロール', '入力と訂正', 'メール認証', 'アプリとタブ切替', '通知・履歴からの復帰'], questIds: ['PR-01', 'PO-01', 'PO-04'] },
  { domain: 'points', names: ['案件条件の比較', '対象金額と経由', '証拠保存', '判定待ち・問い合わせ', '交換・受取'], questIds: ['PO-01', 'PO-02', 'PO-03', 'PO-04', 'PO-05', 'PO-06'] },
  { domain: 'bankKyc', names: ['必要事項', 'プロフィールとの一致', '本人確認方法', '書類・顔等の確認', '申請・審査・利用可能の区別'], questIds: ['BK-01', 'BK-02'] },
  { domain: 'transfer', names: ['銀行・支店', '種別・番号・名義', '金額・手数料', '認証と一度だけの実行', '受取照合'], questIds: ['TR-01'] },
  { domain: 'fx', names: ['通貨ペア', '買い・売りとBid/Ask', 'lotと通貨量', '新規と建玉・決済', '条件と履歴'], questIds: ['FX-01', 'FX-02', 'FX-03'] },
  { domain: 'cards', names: ['成約相場と版', '状態の確認・説明', '全費用と利益', '梱包・発送', '売上・未収・入金の区別'], questIds: ['TC-01', 'TC-02'] },
];

const bf = (key, label, type, value, initialValue, choices) => ({ key, label, type, value, initialValue, ...(choices ? { choices } : {}) });
const task = (chapter, n, title, instruction, fields, details, domain, objectiveIndex, snapshot) => ({ id: `${chapter}-task-${n}`, title, instruction, fields, details, domain, objectiveIndex, mastery: { domain, objectiveIndex }, independentSnapshot: true, snapshot, completionRule: 'all-fields-match', actionLabel: 'この内容で確認する' });
export const bosses = [
  { chapterId: 'CH-1', name: '条件隠しの番人', tasks: [
    task('CH-1', 1, '追加費用まで比べる', '追加費用を引いて、今回の案件を選び直そう。', [bf('offer', '選ぶ案件', 'select', 'D', 'E', options(['D 400P・追加50円', 'D'], ['E 650P・追加500円', 'E'], ['F 800P・追加900円', 'F'])), bf('netValue', '選んだ案件の実質価値（円分）', 'number', 350, 650)], ['D=400−50=350。E=650−500=150。F=800−900=−100。'], 'points', 0, { offers: [{ id: 'D', reward: 400, fee: 50 }, { id: 'E', reward: 650, fee: 500 }, { id: 'F', reward: 800, fee: 900 }] }),
    task('CH-1', 2, '送料を対象金額から外す', '送料を含めず、クーポン後の対象金額を直そう。', [bf('eligibleAmount', '対象金額（円）', 'number', 2200, 2500), bf('payment', '支払総額（円）', 'number', 2500, 2200)], ['商品2,400円−クーポン200円＝対象2,200円。送料300円を足して支払2,500円。'], 'points', 1, { goods: 2400, coupon: 200, shipping: 300, minimum: 2200 }),
    task('CH-1', 3, '注文の経由を直す', '必要な二つの記録を付けて、注文前の道をつなごう。', [bf('participated', '参加登録の記録', 'select', 'yes', 'no', options(['参加登録済み', 'yes'], ['未参加', 'no'])), bf('via', 'ショップへの行き方', 'select', 'point-link', 'direct', options(['ポイントサイトの「ショップへ」から移動', 'point-link'], ['ショップを直接開く', 'direct']))], ['参加登録→ポイントサイトのボタン→ショップで購入の順です。確定前なので修正できます。'], 'smartphone', 3, { registration: false, via: false, orderSubmitted: false }),
    task('CH-1', 4, '控えを使って問い合わせる', '予定日を過ぎた記録に、合う控えを添えよう。', [bf('order', '問い合わせる注文番号', 'text', 'PQ-204', 'PQ-001'), bf('evidence', '添付する控え', 'select', 'condition-order', 'product', options(['保存した案件条件とPQ-204の注文控え', 'condition-order'], ['商品紹介だけ', 'product'])), bf('day', '問い合わせる教材日', 'number', 10, 8)], ['承認予定9日目まで。10日目から問い合わせ可能。注文PQ-204・金額2,400円。'], 'points', 3, { orderId: 'PQ-204', expectedThroughDay: 9, currentDay: 10, pendingPoints: 400 }),
    task('CH-1', 5, '使える期限と受取を確かめる', '使う日を考えて交換し、受取確認まで進めよう。', [bf('target', '交換先', 'select', '30-days', '3-days', options(['400円分・受取後30日', '30-days'], ['440円分・受取後3日', '3-days'])), bf('receipt', '特典の状態', 'select', 'received-viewed', 'requested', options(['受取済みの明細を確認', 'received-viewed'], ['交換申請済み・未受取', 'requested']))], ['使う予定は受取から10日後。数量400P、手数料0。申請だけでは完了しません。'], 'points', 4, { points: 400, plannedUseAfterDays: 10, requested: true, received: false }),
  ] },
  { chapterId: 'CH-2', name: '書類迷宮の守り手', tasks: [
    task('CH-2', 1, '申込と人物の情報を一致させる', '練習カードを見て、カナと住所を直そう。', [bf('kana', 'フリガナ', 'text', 'アサヒ ミナト', 'アサヒ ミナミ'), bf('address', '住所・部屋番号', 'text', practiceProfile.address, '練習県れんしゅう市サンプル町1-2-3')], [`練習カード：${practiceProfile.kana}`, practiceProfile.address], 'bankKyc', 1, { ...practiceProfile, applicationKana: 'アサヒ ミナミ', applicationAddress: '練習県れんしゅう市サンプル町1-2-3' }),
    task('CH-2', 2, '有効な練習書類を選ぶ', '氏名と期限が合う書類を選び、方法を確かめよう。', [bf('document', '使う練習書類', 'select', 'valid-license', 'expired-license', options(['朝日ミナト・期限2031年3月31日の練習免許証', 'valid-license'], ['朝日ミナト・期限2026年9月30日の比較カード', 'expired-license'])), bf('method', 'この架空銀行の方法', 'select', 'ic-face', 'photo-only', options(['画面内IC読取＋顔合わせ', 'ic-face'], ['写真だけを出す', 'photo-only']))], ['教材日付2026年10月22日。本人の情報が一致し、有効期限内の練習書類を使います。'], 'bankKyc', 2, { today: '2026-10-22', validExpiry: '2031-03-31', expiredExpiry: '2026-09-30' }),
    task('CH-2', 3, '提出と利用可能を区別する', '審査中から、結果確認までの状態を選ぼう。', [bf('current', '本人確認を提出した直後', 'select', 'reviewing', 'usable', options(['審査中・まだ使えない', 'reviewing'], ['利用可能', 'usable'])), bf('finish', '口座を使える最後の確認', 'select', 'approval-viewed', 'submitted', options(['承認通知を開き利用可能を確認', 'approval-viewed'], ['提出ボタンを押しただけ', 'submitted']))], ['申込受付→本人確認提出→審査→承認通知と利用可能の確認。預金はまだ増えません。'], 'bankKyc', 4, { application: 'received', kyc: 'submitted', account: 'not-yet-usable', cashChange: 0 }),
    task('CH-2', 4, '口座名義の違いを修正する', '口座カードと同じ名義・番号へ直そう。', [bf('recipient', '受取名義', 'text', 'アサヒ ミナト', 'アサヒ ミナミ'), bf('accountNumber', '架空口座番号', 'text', '7654321', '7654320')], ['練習受取カード：ほしあかり銀行 港支店102 普通7654321 アサヒ ミナト。'], 'transfer', 1, { recipient: 'アサヒ ミナト', branch: '港支店102', accountNumber: '7654321', amount: 4500 }),
    task('CH-2', 5, '手数料と着金を照合する', '送金元と受取の残高を計算して確認しよう。', [bf('source', '送金元の残高（円）', 'number', 7320, 7500), bf('received', '受取口座の入金（円）', 'number', 4500, 4680), bf('fee', '手数料（円）', 'number', 180, 0)], ['開始12,000円−振込4,500円−手数料180円＝7,320円。受取は4,500円。', '両口座合計11,820円。手数料180円だけ資産が減ります。'], 'transfer', 4, { source: 12000, recipient: 0, amount: 4500, fee: 180 }),
  ] },
  { chapterId: 'CH-3', name: '桁違いの海獣', tasks: [
    task('CH-3', 1, '指定された通貨ペアへ', '条件カードの通貨ペアに切り替えよう。', [bf('pair', '通貨ペア', 'select', 'EURJPY', 'USDJPY', pairChoices), bf('base', '数量が表す通貨', 'select', 'EUR', 'USD', options(['ユーロ', 'EUR'], ['米ドル', 'USD']))], ['この確認課題の指定はEUR/JPY。ユーロを日本円の値段で取引します。'], 'fx', 0, { requestedPair: 'EURJPY', currentPair: 'USDJPY' }),
    task('CH-3', 2, '新規売りと決済買い', '売りから始め、同じ建玉を閉じる操作を設定しよう。', [bf('open', '新規注文の向き', 'select', 'sell', 'buy', options(['新規売り・Bid161.00円', 'sell'], ['新規買い・Ask161.04円', 'buy'])), bf('close', '売り建玉を閉じる操作', 'select', 'position-close-buy', 'new-buy', options(['建玉から決済買い', 'position-close-buy'], ['同量の新規買い', 'new-buy']))], ['新規売りはBid。売り建玉の決済買いはAsk。新規の反対注文とは区別します。'], 'fx', 1, { pair: 'EURJPY', bid: '161.00', ask: '161.04', requestedSide: 'sell' }),
    task('CH-3', 3, '指定通貨量をlotへ', 'この練習の単位で2,000通貨に合わせよう。', [bf('lots', 'lot数（1lot＝1,000通貨）', 'number', 2, 0.2), bf('quantity', '実際の通貨数量', 'number', 2000, 200)], ['2lot×1,000通貨＝2,000通貨。これはボス用の別の条件です。実際の取引量を増やす目標ではありません。'], 'fx', 2, { unit: 1000, requestedQuantity: 2000 }),
    task('CH-3', 4, '建玉を全数量で閉じる', '対象建玉を指定して、残量をゼロにしよう。', [bf('position', '対象建玉', 'select', 'boss-fx-002', 'new-order', options(['boss-fx-002 USD/JPY 買い0.5lot', 'boss-fx-002'], ['新規売りの画面', 'new-order'])), bf('closeLots', '決済lot数', 'number', 0.5, 0.1), bf('remaining', '決済後の残量（通貨）', 'number', 0, 400)], ['対象買い建玉500ドル。決済売り500ドルで残量0。新規150.00円・決済149.90円なら損益−50円。'], 'fx', 3, { positionId: 'boss-fx-002', lots: 0.5, quantity: 500, entry: '150.00', close: '149.90' }),
    task('CH-3', 5, '約定履歴で条件を確かめる', '新規だけを合計し、残量ゼロの記録を提出しよう。', [bf('newQuantity', '対象の新規約定量（通貨）', 'number', 2000, 4000), bf('remaining', '対象建玉の残量（通貨）', 'number', 0, 2000), bf('evidence', '提出する記録', 'select', 'usd-complete', 'eur-complete', options(['USD/JPY 新規2,000・決済2,000・残量0', 'usd-complete'], ['EUR/JPY 新規2,000・決済2,000・残量0', 'eur-complete']))], ['確認用案件：USD/JPY、新規2,000通貨以上、全決済、記録提出。決済量は新規量に足しません。'], 'fx', 4, { requiredPair: 'USDJPY', minimum: 2000, newFills: [1000, 1000], closeFills: [2000] }),
  ] },
  { chapterId: 'CH-4', name: '赤字の宝箱', tasks: [
    task('CH-4', 1, '同じ版・状態の成約を比べる', '出品中の価格を外して、比べる履歴をそろえよう。', [bf('filter', '価格の種類', 'select', 'sold', 'listing', options(['売れた商品', 'sold'], ['出品中の商品', 'listing'])), bf('edition', '版と枚数', 'select', 'moon-3', 'star-1', options(['月版2026・3枚', 'moon-3'], ['星版2026・1枚', 'star-1'])), bf('condition', '状態', 'select', 'minor', 'mint', options(['小さな傷あり', 'minor'], ['目立つ傷なし', 'mint']))], ['この課題の商品：月版2026・3枚・小さな傷あり。合う成約例3,600円／3,800円／4,000円。'], 'cards', 0, { edition: '月版2026', count: 3, condition: 'minor', soldPrices: [3600, 3800, 4000] }),
    task('CH-4', 2, '傷を正直に説明する', '写真と合う状態と説明に直そう。', [bf('condition', '出品する状態', 'select', 'scratched', 'mint', options(['小さな傷あり', 'scratched'], ['目立つ傷なし', 'mint'])), bf('description', '状態説明', 'text', '裏面左上に小さな傷があります。', '傷はありません。')], ['教材写真：裏面左上に小さな傷。裏面写真も添付済みです。'], 'cards', 1, { frontPhoto: true, backPhoto: true, scratchLocation: '裏面左上' }),
    task('CH-4', 3, '送料も含めた利益', 'すべての費用を引いて利益を直そう。', [bf('sellingFee', '販売手数料（円）', 'number', 380, 0), bf('profit', '想定利益（円）', 'number', 290, 840)], ['販売想定3,800−手数料380−発送250−梱包80−仕入2,500−仕入送料300＝290円。', '売れる保証ではありません。費用が合わなければ見送れます。'], 'cards', 2, { expectedSale: 3800, feeRate: 0.1, outbound: 250, packaging: 80, purchase: 2500, inbound: 300 }),
    task('CH-4', 4, '折れと水濡れを防ぐ', '必要な二つの梱包を選んで発送前を整えよう。', [bf('bend', '折れ対策', 'select', 'board', 'none', options(['台紙を付ける', 'board'], ['対策しない', 'none'])), bf('water', '水濡れ対策', 'select', 'bag', 'paper', options(['防水袋へ入れる', 'bag'], ['紙だけで包む', 'paper']))], ['カードを曲がりにくくし、水濡れも防いでから模擬発送します。'], 'cards', 3, { packed: false, shipped: false }),
    task('CH-4', 5, '売上と入金を分ける', '精算前後の金額を照合して、受取まで確かめよう。', [bf('unpaid', '売却成立・精算前の未入金売上（円）', 'number', 3800, 0), bf('payout', '手数料と送料を引いた入金（円）', 'number', 3170, 3800), bf('receipt', '最後に確認する状態', 'select', 'paid-viewed', 'listed', options(['受取承認・入金明細を確認', 'paid-viewed'], ['出品しただけ', 'listed']))], ['売上3,800円−手数料380円−発送送料250円＝入金3,170円。梱包80円は先払い済み。'], 'cards', 4, { sale: 3800, fee: 380, shipping: 250, packagingPaid: 80, settlement: 'unpaid' }),
  ] },
];

// Some chapter tasks demonstrate two domains. Award only the skills actually used.
const bossEvidence = {
  'CH-1': [[['points', 0]], [['points', 1], ['smartphone', 1]], [['points', 1], ['smartphone', 3]], [['points', 2], ['points', 3]], [['points', 4]]],
  'CH-2': [[['bankKyc', 0], ['bankKyc', 1]], [['bankKyc', 2], ['bankKyc', 3]], [['bankKyc', 4]], [['transfer', 0], ['transfer', 1]], [['transfer', 2], ['transfer', 3], ['transfer', 4]]],
  'CH-3': Array.from({ length: 5 }, (_, index) => [['fx', index]]),
  'CH-4': Array.from({ length: 5 }, (_, index) => [['cards', index]]),
};
for (const boss of bosses) boss.tasks.forEach((t, index) => {
  t.objectiveEvidence = bossEvidence[boss.chapterId][index].map(([domain, objectiveIndex]) => ({ domain, objectiveIndex }));
});
bosses.find(b => b.chapterId === 'CH-2').tasks[3].fields.unshift(
  bf('bank', '受取銀行', 'select', 'hoshi', 'departure', options(['ほしあかり銀行', 'hoshi'], ['旅立ち銀行（送金元）', 'departure'])),
  bf('branch', '受取支店', 'select', 'port102', 'departure101', options(['港支店102', 'port102'], ['旅立ち支店101', 'departure101'])),
);

export const smartphoneReview = {
  id: 'smartphone-transfer-review', independentSnapshot: true, questReward: 0, stepReward: 0,
  details: ['条件の違う確認課題。初回の資金と時計は変わりません。', '学習済みの操作だけを、必要ならヒント付きで練習します。'],
  tasks: [
    { id: 'phone-review-1', instruction: 'メモの下方にある「明日の用事」を開こう。', type: 'tap', label: '明日の用事を開く', result: 'スクロール先の用事「持ち物の確認」を表示', domain: 'smartphone', objectiveIndex: 0 },
    { id: 'phone-review-2', instruction: '古い合言葉を、新しいメールの「たしかめよう」へ直そう。', type: 'input', field: 'phrase', value: 'たしかめよう', initialValue: '一歩ずつ', label: '合言葉を保存', domain: 'smartphone', objectiveIndex: 1 },
    { id: 'phone-review-3', instruction: '確認用メールの練習コード735921を入力して認証しよう。', type: 'input', field: 'code', value: '735921', label: 'このコードで認証', domain: 'smartphone', objectiveIndex: 2 },
    { id: 'phone-review-4', instruction: 'アプリ切替からブラウザーへ戻り、通販タブを選ぼう。', type: 'select', field: 'destination', value: 'browser-shop', choices: options(['ブラウザー／通販タブ', 'browser-shop'], ['メール／受信一覧', 'mail']), label: 'このタブを開く', domain: 'smartphone', objectiveIndex: 3 },
    { id: 'phone-review-5', instruction: '消した通知の受取案内を、メールの履歴から開こう。', type: 'select', field: 'mail', value: 'receipt-review', choices: options(['受取案内・確認課題のメール', 'receipt-review'], ['古い注文紹介メール', 'old-order']), label: 'メールの受取案内を開く', domain: 'smartphone', objectiveIndex: 4 },
  ],
};
const reviewAction = (label, type = 'tap', extra = {}) => ({ label, instruction: label, type, completionRule: 'action', ...extra });
const phoneReviewTask = (number, title, instruction, actions) => ({
  id: `phone-review-${number}`, title, instruction, domain: 'smartphone', objectiveIndex: number - 1,
  actions: actions.map((action, index) => ({ id: `phone-review-${number}-a${index + 1}`, ...action })),
});
smartphoneReview.title = 'もう一通のメール — 条件を変えたスマホ確認';
smartphoneReview.initialSnapshot = { clipboard: '', phrase: '一歩ずつ', saved: false, code: '735921', verified: false, activeApp: 'home', activeTab: 'points', receiptViewed: false, eventLog: [] };
smartphoneReview.tasks = [
  phoneReviewTask(1, 'スクロール先の用事', '新しいメモの「明日の用事」を開こう。', [
    reviewAction('メモを開く', 'tap', { details: ['今日の用事：郵便を受け取る。', '下方に「明日の用事」があります。'] }),
    reviewAction('下方の「明日の用事」を開く', 'tap', { result: '持ち物の確認が表示される', effect: 'points-review:scroll' }),
  ]),
  phoneReviewTask(2, '古い合言葉を直す', '確認用メールの新しい合言葉へ直して保存しよう。', [
    reviewAction('メモの合言葉欄を押す', 'focus', { field: 'phrase', fieldLabel: '合言葉', details: ['古いメモ：一歩ずつ。新しいメール：たしかめよう。'] }),
    reviewAction('新しい合言葉を入力する', 'input', { field: 'phrase', fieldLabel: '合言葉', value: 'たしかめよう', effect: 'points-review:phrase' }),
    reviewAction('この合言葉を保存', 'confirm', { effect: 'points-review:save-phrase' }),
  ]),
  phoneReviewTask(3, '別の確認メールで認証', '確認用メールを開き、コピーして元の認証画面へ戻ろう。', [
    reviewAction('メールを開く'), reviewAction('確認用の認証メールを開く', 'tap', { details: ['確認用メール：練習コード735921。別の確認課題だけのコードです。'] }),
    reviewAction('確認用コードをゲーム内でコピー', 'tap', { effect: 'points-review:copy-code' }),
    reviewAction('アプリ切替を押す'), reviewAction('入力中のブラウザーを選ぶ'),
    reviewAction('確認コード欄を押す', 'focus', { field: 'code', fieldLabel: '確認用メールのコード' }),
    reviewAction('ゲーム内コードを貼り付け', 'input', { field: 'code', fieldLabel: '確認用メールのコード', value: '735921', effect: 'points-review:paste-code' }),
    reviewAction('確認用の認証を確定', 'confirm', { effect: 'points-review:verify-code' }),
  ]),
  phoneReviewTask(4, 'アプリとタブを分ける', 'メールからブラウザーへ戻り、通販タブを開こう。', [
    reviewAction('アプリ切替を開く'), reviewAction('ブラウザーのカードを選ぶ'), reviewAction('タブ一覧を開く'),
    reviewAction('まいにちストアのタブを選ぶ', 'select', { field: 'tab', fieldLabel: '開くタブ', value: 'shop', choices: options(['まいにちストア・確認用の通販タブ', 'shop'], ['コツコツモール・ポイントサイト', 'points']), effect: 'points-review:shop-tab' }),
  ]),
  phoneReviewTask(5, '消した通知から復帰する', '通知がなくても、メール履歴から受取案内を開こう。', [
    reviewAction('メールの受信履歴を開く', 'tap', { details: ['通知は閉じています。確認用の受取案内は受信履歴に残っています。'] }),
    reviewAction('確認用の受取案内を選ぶ', 'select', { field: 'mailId', fieldLabel: '受信履歴のメール', value: 'receipt-review', choices: options(['確認課題の受取案内', 'receipt-review'], ['古い注文の紹介', 'old-order']) }),
    reviewAction('本文から受取履歴を開く', 'tap', { effect: 'points-review:receipt', result: '受取済みの確認用明細が開く' }),
  ]),
];
quests.find(q => q.id === 'PR-01').reviewVariant = smartphoneReview;

export function applyReviewEffect(snapshot, action, value) {
  const effect = action?.effect;
  if (!effect?.startsWith('points-review:')) return false;
  snapshot.eventLog ||= [];
  if (snapshot.eventLog.includes(effect)) return false;
  const need = (condition, message) => { if (!condition) throw new Error(message); };
  switch (effect) {
    case 'points-review:scroll': snapshot.scrollPosition = 400; snapshot.tomorrowViewed = true; break;
    case 'points-review:phrase': snapshot.phrase = value ?? action.value; break;
    case 'points-review:save-phrase': need(snapshot.phrase === 'たしかめよう', '新しいメールの合言葉を入れよう。'); snapshot.saved = true; break;
    case 'points-review:copy-code': snapshot.clipboard = '735921'; break;
    case 'points-review:paste-code': need(snapshot.clipboard === '735921', '確認用メールでゲーム内コピーをしよう。'); snapshot.enteredCode = String(value ?? action.value); break;
    case 'points-review:verify-code': need(snapshot.enteredCode === '735921', '確認用のコードをメールと比べよう。'); snapshot.verified = true; break;
    case 'points-review:shop-tab': snapshot.activeApp = 'browser'; snapshot.activeTab = 'shop'; break;
    case 'points-review:receipt': snapshot.receiptViewed = true; break;
  }
  snapshot.eventLog.push(effect);
  return true;
}

/** Changed-condition reviews reuse fixed independent task cards, never main ledgers. */
function reviewFromBossTask(quest, sourceTask, index) {
  const id = `RV-${quest.id}-${index + 1}`;
  const actions = [];
  for (const sourceField of sourceTask.fields || []) {
    const common = { field: sourceField.key, fieldLabel: sourceField.label };
    if (sourceField.type === 'select') {
      actions.push(reviewAction(`${sourceField.label}を選び直す`, 'select', {
        ...common, value: sourceField.value, choices: structuredClone(sourceField.choices),
        initialValue: sourceField.initialValue,
      }));
    } else {
      actions.push(reviewAction(`${sourceField.label}の欄を押す`, 'focus', {
        ...common, details: [`修正前：${sourceField.initialValue ?? '未入力'}`],
      }));
      actions.push(reviewAction(`${sourceField.label}を入力して直す`, 'input', {
        ...common, value: sourceField.value, inputMode: sourceField.type === 'number' ? 'decimal' : 'text',
      }));
    }
  }
  actions.push(reviewAction('変更した条件と結果を照合して記録する', 'check', {
    value: true, result: 'この確認課題だけの記録を保存しました。本編の資金は変わりません。',
  }));
  return {
    id, title: sourceTask.title, instruction: sourceTask.instruction,
    details: ['本編とは別の条件・別の確認用コピーです。', ...sourceTask.details],
    independentSnapshot: true, snapshot: structuredClone(sourceTask.snapshot),
    domain: sourceTask.domain, objectiveIndex: sourceTask.objectiveIndex,
    objectiveEvidence: structuredClone(sourceTask.objectiveEvidence || [{ domain: sourceTask.domain, objectiveIndex: sourceTask.objectiveIndex }]),
    actions: actions.map((action, actionIndex) => ({ id: `${id}-a${actionIndex + 1}`, ...action })),
  };
}
function reviewFromPhoneTask(quest, sourceTask, index) {
  const id = `RV-${quest.id}-${index + 1}`;
  return {
    ...structuredClone(sourceTask), id,
    objectiveEvidence: [{ domain: 'smartphone', objectiveIndex: sourceTask.objectiveIndex }],
    actions: sourceTask.actions.map((action, actionIndex) => ({ ...structuredClone(action), id: `${id}-a${actionIndex + 1}` })),
  };
}
for (const quest of quests.filter(item => item.id !== 'PR-01')) {
  const wanted = new Set(Object.entries(quest.guidedObjectiveMap).flatMap(([domain, map]) => Object.keys(map).map(index => `${domain}:${index}`)));
  const sourceBoss = bosses.find(boss => boss.chapterId === quest.chapterId);
  let sources = sourceBoss.tasks.filter(t => t.objectiveEvidence.some(e => e.domain !== 'smartphone' && wanted.has(`${e.domain}:${e.objectiveIndex}`)));
  if (quest.id === 'FX-02-S') sources = [sourceBoss.tasks[1], sourceBoss.tasks[3]];
  if (quest.id === 'BK-02-R') sources = [{
    id: 'retake-review-copy', title: '別のぼやけた画像を直す', instruction: '暗くて枠のずれた練習写真を直そう。',
    fields: [
      bf('placement', '画面内人物の位置', 'select', 'bright-centered', 'dark-left', options(['明るい位置で顔の枠に合わせる', 'bright-centered'], ['暗い隅の枠外に置く', 'dark-left'])),
      bf('quality', '撮り直して使う画像', 'select', 'clear', 'blurred', options(['文字と顔の輪郭が読める教材画像', 'clear'], ['ぼやけたままの比較画像', 'blurred'])),
    ],
    details: ['暗い隅で顔が枠からずれ、輪郭がぼやけた別の教材画像から始めます。', '明るい指定位置で枠に合わせ、鮮明な画像を確認して使います。実カメラは使いません。'],
    domain: 'bankKyc', objectiveIndex: 3, objectiveEvidence: [{ domain: 'bankKyc', objectiveIndex: 3 }],
    snapshot: { quality: 'blurred', position: 'dark-left', originalKycSubmittedAgain: false },
  }];
  const tasks = sources.map((sourceTask, index) => reviewFromBossTask(quest, sourceTask, index));
  for (const phoneTask of smartphoneReview.tasks) {
    if (wanted.has(`smartphone:${phoneTask.objectiveIndex}`)) tasks.push(reviewFromPhoneTask(quest, phoneTask, tasks.length));
  }
  quest.reviewVariant = {
    id: `${quest.id}-changed-review`, title: `${quest.title} — 条件を変えた確認`,
    description: '固定の別条件で確かめます。本編の残高・受注時計・XP・装備は変わりません。',
    independentSnapshot: true, stepReward: 0, questReward: 0,
    initialSnapshot: { ...structuredClone(smartphoneReview.initialSnapshot), scenarioId: `review:${quest.id}`, originalScenarioUntouched: true },
    tasks,
  };
}

/** Phone effects are local simulation only. Monetary effects are owned by finance.js. */
export function applyContentEffect(state, step, value, context = {}) {
  if (!quests.some(q => q.id === step.questId)) return;
  const p = state.phoneState ||= {};
  p.formDrafts ||= {}; p.mailById ||= {}; p.notifications ||= []; p.recentApps ||= []; p.browserTabs ||= {}; p.scrollPositions ||= {};
  if (Array.isArray(p.browserTabs)) p.browserTabs = Object.fromEntries(p.browserTabs.filter(tab => tab?.id).map(tab => [tab.id, tab]));
  const draft = p.formDrafts[step.questId] ||= {};
  if (step.field && step.type !== 'focus') draft[step.field] = value === undefined ? step.value : value;
  p.activeApp = step.appId;
  p.recentApps = [step.appId, ...p.recentApps.filter(id => id !== step.appId)].slice(0, 9);
  p.currentScreen = step.screenId;
  if (step.type === 'focus') { p.keyboard = { open: true, field: step.field, questId: step.questId }; p.focusedField = step.field; }
  else if (['input', 'select', 'confirm'].includes(step.type)) p.keyboard = { open: false };
  if (step.appId === 'browser') {
    const tab = p.browserTabs[step.tabId] ||= { id: step.tabId, history: [], forms: {}, scrollPosition: 0 };
    if (tab.history.at(-1) !== step.screenId) tab.history.push(step.screenId);
    tab.forms[step.questId] = { ...draft }; p.activeTabId = step.tabId;
  }
  const mail = (id, subject, body, code) => {
    p.mailById[id] = { ...(p.mailById[id] || {}), id, subject, sender: '教材の郵便局', body, code, unread: true, read: false, starred: false };
    if (!p.notifications.some(item => item.id === id)) p.notifications.push({ id, appId: 'mail', title: subject, read: false });
  };
  const openMail = id => { if (!p.mailById[id]) throw new Error('先に届いた練習メールを確認しよう。'); p.mailById[id].unread = false; p.mailById[id].read = true; p.activeMailId = id; p.activeApp = 'mail'; const notice = p.notifications.find(item => item.id === id); if (notice) notice.read = true; };
  const flag = key => { p[key] = true; };
  switch (step.id) {
    case 'PR-01-001': if (!p.mailById['intro-mail']) mail('intro-mail', 'ミナからの合言葉', `合言葉は「${practiceProfile.introPhrase}」だよ。メモに写してね。`, practiceProfile.introPhrase); break;
    case 'PR-01-002': p.scrollPositions['intro-memo'] = 400; break;
    case 'PR-01-004': p.activeApp = 'mail'; break;
    case 'PR-01-005': openMail('intro-mail'); break;
    case 'PR-01-006': p.clipboard = practiceProfile.introPhrase; break;
    case 'PR-01-010': if (p.clipboard !== practiceProfile.introPhrase) throw new Error('メールの「合言葉をコピー」へ戻ろう。'); break;
    case 'PR-01-011': if (draft.introPhrase !== practiceProfile.introPhrase) throw new Error('合言葉をメールと比べよう。'); flag('introMemoSaved'); break;
    case 'P010': mail('registration-mail', 'コツコツモールの会員登録', `練習コードは${practiceProfile.registrationCode}です。実在サービスでは使えません。`, practiceProfile.registrationCode); break;
    case 'P012': p.activeApp = 'mail'; break;
    case 'P013': openMail('registration-mail'); break;
    case 'P014': p.clipboard = p.mailById['registration-mail']?.code; break;
    case 'P018': if (p.clipboard !== practiceProfile.registrationCode) throw new Error('会員登録メールのコードをコピーしよう。'); break;
    case 'P019': if (draft.registrationCode !== practiceProfile.registrationCode) throw new Error('確認コードが違います。メールと比べて直そう。'); if (!draft.termsAccepted) throw new Error('利用条件の同意欄を確認しよう。'); flag('registrationVerified'); break;
    case 'P022': p.comparedOffers = ['A']; break;
    case 'P025': p.comparedOffers = [...new Set([...(p.comparedOffers || []), 'B'])]; break;
    case 'P029': p.scrollPositions['offer-A'] = 500; flag('exclusionsViewed'); break;
    case 'P030': p.conditionMemo = { id: 'offer-conditions', minimumEligible: 2000, excludesShipping: true, validProduct: 'daily-standard', canceledIneligible: true, simulationDay: 0 }; break;
    case 'P031': flag('participated'); break;
    case 'P032': if (!p.participated) throw new Error('先に案件の参加登録をしよう。'); flag('viaRecorded'); break;
    case 'P045': mail('order-mail', '注文PQ-001の控え', '0日目／日用品セット2,000円／送料0円／クーポン0円／DEMOカード／注文番号PQ-001'); break;
    case 'P046': openMail('order-mail'); break;
    case 'P047': p.mailById['order-mail'].starred = true; break;
    case 'P048': if (!p.mailById['order-mail']) throw new Error('注文メールを確認しよう。'); p.orderMemo = { orderId: 'order-001', orderNumber: 'PQ-001', amount: 2000, day: 0 }; break;
    case 'P052': p.activeTabId = 'kotsukotsu-mall'; break;
    case 'P064': if (!p.orderMemo || !p.conditionMemo) throw new Error('注文控えと案件条件を保存してから送ろう。'); flag('inquirySubmitted'); break;
    case 'P065': mail('approval-mail', '問い合わせへの回答', 'この教材シナリオでは条件を満たす注文の確認が終わり、300Pが承認されました。'); break;
    case 'P066': openMail('approval-mail'); flag('approvalMailViewed'); break;
    case 'P067': p.activeApp = 'browser'; p.activeTabId = 'kotsukotsu-mall'; break;
    case 'P073': mail('gift-mail', 'まいにちストアの教材ギフト', '300円分の教材ギフトです。リンクから受取を確認してください。受取後30日。'); break;
    case 'P074': openMail('gift-mail'); break;
    case 'P075': p.activeApp = 'browser'; p.activeTabId = 'daily-gift'; break;
    case 'P077': flag('receivedHistoryViewed'); break;
    case 'BK-01-007': mail('bank-verification', 'ほしあかり銀行の練習認証', `コードは${practiceProfile.bankCode}です。`, practiceProfile.bankCode); break;
    case 'BK-01-008': openMail('bank-verification'); break;
    case 'BK-01-009': p.clipboard = practiceProfile.bankCode; break;
    case 'BK-01-013': if (p.clipboard !== practiceProfile.bankCode) throw new Error('銀行の練習メールでコードをコピーしよう。'); break;
    case 'BK-01-014': if (draft.bankCode !== practiceProfile.bankCode) throw new Error('銀行の練習コードが違います。'); flag('bankEmailVerified'); break;
    case 'BK-02-007': case 'BK-02-008': case 'BK-02-009': case 'BK-02-010': p.identityComparisons ||= []; if (!p.identityComparisons.includes(step.id)) p.identityComparisons.push(step.id); break;
    case 'BK-02-016': if (draft.cardPosition !== 'inside') throw new Error('カードを読み取り枠に置こう。'); flag('icReadAccepted'); break;
    case 'BK-02-019': if (draft.facePosition !== 'inside') throw new Error('画面の人物を顔の枠に合わせよう。'); p.faceImage = { assetId: 'demo-face', quality: 'clear' }; break;
    case 'BK-02-020': if (p.faceImage?.quality !== 'clear') throw new Error('先に画面内の撮影をしよう。'); flag('faceImageAccepted'); break;
    case 'BK-02-023': flag('bankApprovalResultViewed'); break;
    case 'BK-02-R-004': if (draft.facePosition !== 'bright') throw new Error('画面内人物を明るい指定位置へ動かそう。'); p.retakeImage = { assetId: 'demo-face-clear', quality: 'clear' }; break;
    case 'BK-02-R-006': if (p.retakeImage?.quality !== 'clear') throw new Error('明るい場所で撮り直そう。'); flag('retakeAccepted'); break;
    case 'TR-01-025': flag('transferReceiptViewed'); break;
    case 'TR-01-026': flag('recipientStatementViewed'); break;
    case 'FX-02-020': p.tradeEvidence ||= {}; p.tradeEvidence['fx-usdjpy-001'] = { id: 'fx-usdjpy-001', questId: 'FX-02', pair: 'USDJPY', newFilledQuantity: 1000, remainingQuantity: 0, realizedPnl: -120 }; break;
    case 'FX-02-S-018': p.tradeEvidence ||= {}; p.tradeEvidence['fx-eurjpy-side-001'] = { id: 'fx-eurjpy-side-001', questId: 'FX-02-S', pair: 'EURJPY', newFilledQuantity: 1000, remainingQuantity: 0, realizedPnl: 70 }; break;
    case 'FX-03-010': if (!p.tradeEvidence?.[draft.evidenceId] || draft.evidenceId !== 'fx-usdjpy-001') throw new Error('この案件はUSD/JPYの標準練習記録が対象です。'); break;
    case 'FX-03-012': flag('fxApprovalEntryViewed'); break;
    case 'TC-01-009': case 'TC-01-010': case 'TC-02-003': case 'TC-02-004': p.cardInspections ||= []; if (!p.cardInspections.includes(step.id)) p.cardInspections.push(step.id); break;
    case 'TC-02-030': flag('cardReceiptNoticeViewed'); break;
    case 'TC-02-031': flag('cardPayoutEntryViewed'); break;
    case 'TC-02-032': flag('cardProfitReportViewed'); break;
  }
  if (/ホームを押す/.test(step.instruction)) { p.activeApp = 'home'; p.keyboard = { open: false }; }
  if (/アプリ切替を押す/.test(step.instruction)) p.appSwitcherOpen = true;
  if (step.screenTitle === 'アプリ切替') p.appSwitcherOpen = false;
  const scenario = state.financialScenarios?.[quests.find(q => q.id === step.questId).scenarioId];
  if (scenario) { scenario.phoneState ||= {}; scenario.phoneState.formDrafts ||= {}; scenario.phoneState.formDrafts[step.questId] = { ...draft }; }
}
