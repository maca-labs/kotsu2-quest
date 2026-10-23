import {glossary as fundingGlossary} from './content-funding.js';
const topic=(id,title,short,why,how,example,diagram=[])=>({id,title,short,why,how,example,diagram:diagram.map(label=>typeof label==='string'?{label}:label)});
const library=[
 topic('phone','練習スマホって何？','この画面の中だけで動く練習用の電話です。','本物のお金や個人情報を使わず、操作を試すためです。','まず上の画面名を見て、今の一文に合う場所を押そう。','町へ戻っても、受けた依頼と入力は残ります。',['町の依頼','練習スマホ','結果を見る','町へ報告']),
 topic('phone-input','入力と確認は何が違う？','入力は下書き、確認は送る前の見直しです。','数字が入っても、まだ注文や振込は終わっていません。','練習カードを見て欄へ入れ、確認画面で相手・数量・費用を見比べよう。','住所の部屋番号を直してから、申込の確認へ進めます。',['欄を押す','練習値を入れる','確認する','確定する']),
 topic('phone-mail','メールを見直したい','メールには、コードや注文の控えが残ります。','通知を閉じても、本文をもう一度見られます。','スマホのメールを開き、件名が合う手紙を選ぼう。','注文の控えなら、買った日・番号・金額を探します。',['通知','受信一覧','メール本文','元のアプリへ戻る']),
 topic('phone-copy','コピーと貼り付けって何？','言葉を一時的なメモへ入れ、別の欄へ写すことです。','長い宛先やコードの写し間違いを減らせます。','本文のゲーム内コピーを押し、元のアプリの欄へ貼り付けよう。','このゲームは端末のクリップボードを読みません。',['メールの言葉','ゲーム内コピー','入力欄へ貼り付け']),
 topic('phone-tabs','アプリとタブは何が違う？','アプリは道具、タブはブラウザーの中の別のページです。','メールと通販を行き来しても、元の入力へ戻るためです。','メールからはアプリ切替、通販とポイントサイトの間はタブ一覧を使おう。','本を替えるのがアプリ、同じ本のしおりを替えるのがタブに近いよ。',['メールアプリ','ブラウザーアプリ','ポイントのタブ','通販のタブ']),
 topic('membership','会員登録は何をしている？','そのサービスで使う練習用の連絡先を登録しています。','後から注文や確認の知らせを受け取るためです。','自分の情報ではなく、画面にある練習メールと練習パスワードを使おう。','登録メールを送っただけでは、認証はまだ終わりません。'),
 topic('mail-auth','メール認証はなぜする？','届いたコードで、使える連絡先か確かめます。','知らない連絡先のまま申し込まないためです。','件名を確認し、コードをゲーム内コピーして元の認証欄へ戻ろう。','違うコードなら、その欄を直せます。申込全体をやり直す必要はありません。',['認証メールが届く','コードを確認','元の欄へ戻る','認証する']),
 topic('points-conditions','ポイントの条件って何？','どんな注文なら特典の対象になるかを決めた約束です。','ポイントが大きくても、余計な出費で損をする場合があるからです。','特典だけでなく、送料や追加購入も並べて比べよう。','400Pでも追加費用500円なら、差し引きはマイナスです。',['特典の価値','追加費用を引く','必要な買い物に合うか']),
 topic('eligible','対象金額と支払額は別？','対象金額は条件の数え方、支払額は実際に出す合計です。','送料を足した額が、そのまま条件の対象になるとは限りません。','商品代金からクーポンを引き、その後に送料を足して見よう。','商品2,500円−割引100円＝対象2,400円。送料200円なら支払2,600円。',['商品代金','− クーポン','＝ 対象金額','＋ 送料 ＝ 支払額']),
 topic('via','経由するってどういうこと？','指定の入口を通ってショップへ進むことです。','どの案件から注文したかを、この教材で記録するためです。','条件を見て参加登録し、ポイントサイトの「ショップへ」から進もう。','ショップを直接開いただけでは、今回の経由記録は付きません。',['参加登録','ポイントサイトの入口','通販タブ','注文']),
 topic('evidence','控えは何に使う？','後から同じ注文か確かめるための記録です。','番号や金額が分からないと、問い合わせる相手も調べにくいためです。','注文メールと案件条件を残し、必要な場面で見比べよう。','注文番号・買った日・金額がそろうと、どの注文か伝わります。'),
 topic('approval','判定待ちと承認済みは違う？','判定待ちは調べている途中、承認済みは確認が終わった分です。','待っているポイントを、交換できる残高と混ぜないためです。','通帳の欄と予定日を見よう。教材の時間送りで待ち時間を進められます。','判定待ちの300Pと、交換できる300Pは同じ状態ではありません。',['注文','判定待ち','承認済み','交換へ']),
 topic('inquiry','問い合わせはどう伝える？','どの注文の何を調べてほしいか、控えと一緒に伝えます。','困った理由が分かるほど、内容を確認しやすくなります。','予定日を過ぎたか見て、番号・理由・条件の控えをそろえよう。','問い合わせれば必ず承認される、という意味ではありません。'),
 topic('exchange','交換先は何を比べる？','数量・手数料・期限・使う予定を比べます。','おまけが多くても、使う前に期限が来る場合があるからです。','最低数と単位を見て、使う日に間に合う交換先を選ぼう。','10日後に使うなら、期限3日の特典は使いにくいね。',['必要なポイント','費用','使える期限','自分の使う予定']),
 topic('gift','交換したら終わり？','申請の後に、受取の操作や明細確認が残ることがあります。','送ったつもりと、手元に届いたことを区別するためです。','案内メールから受け取り、受取済みの履歴まで開こう。','ポイントの特典は、現金残高へ勝手に加わりません。',['交換申請','受取案内','特典を受け取る','履歴を見る']),
 topic('profile','だれの情報を入れる？','画面にある架空の成人の情報を使います。','申込と本人確認の文字が同じか、練習するためです。','氏名・カナ・生年月日・部屋番号を練習カードと見比べよう。','自分の名前や住所を入れる練習ではありません。'),
 topic('bank-application','申込受付なら口座を使える？','受付、本人確認、審査、利用開始は別の段階です。','提出ボタンを押しただけで使えると誤解しないためです。','受付控えを残し、本人確認と最後の通知まで順番に見よう。','この練習では、口座を作るだけでお金は増えません。',['申込受付','本人確認を提出','審査中','利用可能を確認']),
 topic('kyc','本人確認（KYC）って何？','申し込んだ人が本人かを確かめることです。','違う人の情報や、古い書類で進めないためです。','内蔵カードの名前・住所・日付・期限を申込と比べよう。','使う方法はサービスごとに違います。この教材は内蔵の書類と人物を使い、本物のカメラは使いません。',['申込の情報','練習書類と照合','画面内で読取・顔合わせ','審査結果']),
 topic('kyc-photo','撮影をやり直すのはなぜ？','文字や顔が読めない画像は、確認に使いにくいためです。','送った枚数より、読める画像かどうかが大切だからです。','画面内の人物を明るい位置の枠へ置き、撮り直した画像を確かめよう。','本物のカメラや、自分の顔の画像は使いません。'),
 topic('bank-transfer','振込は何を確かめる？','銀行・支店・種類・番号・名義・金額・費用です。','同じ番号でも、違う銀行や支店なら別の口座になるからです。','受取カードと一つずつ合わせ、承認後は受取側の明細も見よう。','5,000円を送り費用200円なら、送る側は合計5,200円を使います。',['自分の送金元','相手の口座を照合','金額と費用を確認','承認','受取明細']),
 topic('fx-pair','通貨ペアって何？','どの通貨を、どの通貨の値段で取引するかの組合せです。','ドルとユーロを取り違えないためです。','通貨ペアの名前と、数量が何の通貨かを並べて見よう。','USD/JPYは米ドルと日本円、EUR/JPYはユーロと日本円です。'),
 topic('fx-lot','lot（ロット）は何の数？','注文する量の、ひとまとまりを表す単位です。','lotの数字だけでは、実際の通貨量が分からないからです。','この教材では1lot＝1,000通貨。lotと実際の量を一緒に見よう。','0.2lotなら200通貨。実サービスでは1lotの定義が違う場合があります。',['lot数','× 1,000','実際の通貨量']),
 topic('bid-ask','BidとAskは何が違う？','Bidは売る値段、Askは買う値段です。','同じ時でも、買う値段と売る値段に差があるからです。','買いで始めるときはAsk、売りで始めるときはBidを見よう。','買った建玉を閉じる売りはBid、売った建玉を閉じる買いはAskです。',['売る値段 Bid','二つの値段の差','買う値段 Ask']),
 topic('fx-position','建玉（たてぎょく）って何？','売買が成立して、まだ閉じていない取引の記録です。','注文の下書きや、すでに終えた取引と区別するためです。','建玉一覧で、通貨・買い売り・数量・始めた値段を見よう。','注文を確認しただけでは、建玉はまだできません。',['注文の下書き','確定・約定','保有する建玉','決済']),
 topic('fx-close','決済（けっさい）は何をする？','持っている建玉を閉じ、値動きの結果を確定します。','反対向きの新しい注文と、元の建玉を閉じる操作は別だからです。','建玉一覧から対象を選び、決済する数量と残量を見よう。','買い建玉を閉じるなら決済売りです。利益でも損失でも、残量ゼロを確認できます。'),
 topic('offer-evidence','案件の取引量はどう数える？','条件に合う新規の約定量だけを数えます。','決済した量や、ボタンを押した回数を足さないためです。','先に保存した条件と、新規・決済が対応する履歴を比べよう。','新規500通貨と決済500通貨でも、新規量は500通貨です。'),
 topic('card-market','相場は何を比べる？','同じ版・枚数・状態で、実際に売れた値段を比べます。','高く出品されていても、その値段で売れたとは限らないからです。','売れた商品の絞り込みを使い、写真と状態も合わせよう。','傷のない1枚と、傷のある3枚セットは、そのまま同じ条件では比べません。'),
 topic('card-costs','売上と利益は何が違う？','利益は売上から、仕入や送料などの費用を引いた分です。','売れた金額を全部、増えたお金だと思わないためです。','仕入・入荷送料・販売手数料・発送送料・梱包を全部並べよう。','売上4,000円でも、全費用が3,800円なら利益は200円です。',['売上','− 仕入と入荷送料','− 販売・発送・梱包の費用','＝ 利益']),
 topic('card-description','傷はどう説明する？','写真で見える状態を、見たまま短く伝えます。','買う人が思っていた状態と違う、という困りごとを減らすためです。','裏面も見て、版・枚数・傷の場所を正直に書こう。','「裏面左上に小さな傷があります」のように場所も伝えます。'),
 topic('card-shipping','梱包は何を防ぐ？','台紙は折れ、防水袋は水濡れを防ぎます。','発送した後も、品物を守って届けるためです。','台紙と袋を別々に確認し、模擬発送の内容を見よう。','包んだ、発送した、相手が受け取った、は別の段階です。'),
 topic('card-payment','売れたのに、まだ未入金？','未入金は、売上が決まってもお金をまだ受け取っていない状態です。','売上と、今使える現金を分けて数えるためです。','受取承認と精算を待ち、手数料・送料を引いた入金明細を見よう。','先に払った梱包費は、入金時にもう一度引きません。',['出品','売却成立・未入金','発送・受取承認','精算・入金']),
 topic('yen-funding','円の準備から教えて','まず円を国内の練習窓口へ運び、教材コインを買います。','銀行の円と、買ったコインを同じ残高だと思わないためです。','円の送金先と入金を見てから、購入内容を確認しよう。','これは架空の教材ルートです。口座や資金は接続しません。',['銀行の円','国内の練習窓口','教材コインを購入','自分の練習財布']),
 topic('self-wallet','自分の財布へ出すって何？','サービスの中から、自分の練習用の宛先へ資産を移します。','買った場所と、自分の財布の残高は別だからです。','財布の受取カードを開き、資産・道・宛先・費用を合わせよう。','出庫を申し込んだだけでは、財布へ届いたことにはなりません。',['購入した場所','出庫申請','移動中','自分の財布の受取明細']),
 topic('asset-location','お金は今どこにある？','銀行、サービス、財布、運用先はそれぞれ別の置き場所です。','場所を移した資産を、両方にあるように数えないためです。','残高の場所を先に見て、移動前と移動後を比べよう。','財布から50を送ったら、届くまでの分は移動中として分けます。',['銀行の円','国内サービス','自分の財布','HyperCore','選んだ運用先']),
 topic('wallet','ウォレットって何？','資産を操作するための道具です。ここでは画面内の練習財布です。','サービス内の口座や銀行預金と混ぜないためです。','使う資産と送り道を選び、受取カードを見て操作しよう。','ゲームは本物の財布や秘密の情報には接続しません。'),
 topic('usdc','USDCって何？','米ドルの値に近づくことを目指す暗号資産の名前です。','円、ドルの預金、別のコインとは区別して数えるためです。','今回は「教材USDC」という架空の単位として見よう。','USDCとETHは別の資産なので、同じ残高へ足しません。'),
 topic('eth','ETHって何？','別の暗号資産の名前です。この練習では道を使う費用にも使います。','送る資産がUSDCでも、費用にETHが必要な場面があるからです。','送るUSDCと、ガス用の教材ETHを別々の欄で確かめよう。','コインを持っているのに動かせないときは、必要な道のガスを見ます。'),
 topic('network','ネットワークって何？','資産を送るための道の種類です。','同じ資産名でも、受け取れる道が違う場合があるからです。','送る側と受取カードのネットワーク名を同じにしよう。','同じ人の宛先でも、道の条件を確認してから送ります。',['資産の種類','送り道','宛先','受取できる条件']),
 topic('arbitrum','Arbitrum（アービトラム）って何？','資産を動かす道の名前の一つです。','今回の受取先が使う道を、名前で見分けるためです。','この教材の受取カードがArbitrumなら、送る側もその道を選ぼう。','サービスごとに使える道は違います。名前が似た別の道にしません。'),
 topic('hypercore','HyperCoreってどこ？','取引や運用を行う仕組み側の、資産の置き場所です。','自分の財布にある分と、入金後の分を分けるためです。','この練習では、入金の処理後にサービス側の明細を見よう。','接続しただけでは、財布の資産がここへ移ったことにはなりません。'),
 topic('hyperevm','HyperEVMって何？','HyperCoreとは別の仕組み側です。名前が似ても同じ場所ではありません。','名前だけで同じ資産の場所と思い込まないためです。','今回の演習は受取カードで指定された道と場所を使おう。','このゲームではHyperEVM上の実操作をしません。'),
 topic('swap','交換（スワップ）は何を替える？','持っている資産の種類を、別の資産へ替えることです。','コインの種類と送り道を、別々に考えるためです。','渡す種類と数量、受け取る種類と数量、費用を確認しよう。','教材コインをUSDCへ替えても、道まで自動で合うとは限りません。',['元のコイン','交換','別のコイン']),
 topic('bridge','道替え（ブリッジ）は何？','別のネットワークへ移すための操作です。','受取先の道に合った残高を用意するためです。','元の道と次の道、費用、到着した数量を見よう。','種類を替えるスワップと、道を替えるブリッジは別です。',['元の道','道替え・費用','次の道の受取明細']),
 topic('gas','ガスって何を入れる？','ネットワークで処理するための費用です。車の燃料とは別です。','資産を送る量と、道を使う費用を分けるためです。','受取カードの指定を見て、使う道に合うガス用資産を用意しよう。','この練習では、Arbitrumの道で教材ETHをガス用に持ちます。',['送りたいUSDC','別に用意したガス用ETH','道の処理','受取']),
 topic('crypto-transfer','送信と受取は何が違う？','送信は出発、受取は向こうの明細に着いたことです。','移動中の資産を、届いた分として数えないためです。','資産・道・宛先を照合し、確定後は今回の受取明細を開こう。','教材の費用が送信額から引かれる例では、引いた残りが届きます。',['送信の準備','照合して確定','移動中','受取通知・明細']),
 topic('wallet-connect','接続したら、お金が動く？','接続の許可と、資産を送る操作は別です。','入口を開いただけで送金済みと思わないためです。','何を許可する表示か読み、接続・有効化・送信を分けて見よう。','練習用の識別子を見せる許可は、送金の記録ではありません。'),
 topic('secret-safety','秘密を教えてと言われたら？','復元の言葉や秘密鍵は、相手に渡しません。','親切そうな名前でも、資産を操作される危険があるからです。','その要求から離れ、ゲーム内ヘルプへ戻ろう。ここには秘密の入力欄はありません。','本文の中の案内を信じる前に、何を求められているかを見ます。'),
 topic('operation-choice','どの運用が正解？','いつ使うか、値下がりや待つ時間を受け入れられるかで考えます。','利益率だけで決めると、必要な時に戻せない場合があるからです。','違いを並べて、学びたい一つか「運用しない」を選ぼう。','全部のラボを終えなくても、選んだ道と出口で章を終えられます。'),
 topic('spot','現物（げんぶつ）は何を持つ？','買った資産そのものを持ちます。','保有数量と、その時の値段で計算した評価を分けるためです。','買う前に支払を見て、買った後は数量と評価、売った後は結果を見よう。','2枚の数量が同じでも、1枚の値段が下がれば合計評価も下がります。'),
 topic('orders','成行・指値・取消は何？','成行は今の条件で注文、指値は値段を指定、取消は保留注文をやめることです。','注文しただけで、必ず買えたとは限らないからです。','未約定の一覧で、保留か成立かを見てから取り消そう。','指値の取消は、買った資産を売る操作ではありません。'),
 topic('valuation','数量・評価・確定損益は別？','数量は持つ量、評価は今の値段、確定損益は売却などで決まった結果です。','量が増えても、評価が増えたとは限らないためです。','今持つ数量と価格を掛け、売る前と売った後を分けて見よう。','数量が少し増えても、大きく値下がりすれば評価は減ります。'),
 topic('hlp','HLPは預金の利息と同じ？','戦略の利益も損失も共有する練習です。固定の利息ではありません。','預けた分が必ず増えると思わないためです。','手元と預入分を分け、評価と最後の預入からの待ち時間を見よう。','この教材の引出しロックは、最後の預入から4日です。',['手元の残高','預入分の評価','最後の預入から4日','引出し']),
 topic('staking','ステーキングと委任って何？','HYPEで運営を支える相手を選び、委ねる仕組みを練習します。','現物・委任中・帰りの待機を、同じ残高に混ぜないためです。','場所を移した量を見て、委任の解除と現物へ戻す待機を分けよう。','教材では委任の1日ロックと、現物へ戻る7日の待機が別です。',['現物','ステーキング','委任中','待機','現物へ到着']),
 topic('perpetual','無期限先物は何をする？','配分したお金で、値動きに対する取引を持つ任意の練習です。','現物を買って持つ操作と、仕組みが違うためです。','証拠金・倍率・建玉金額・数量・損失対応を分けて確認しよう。','このラボを選ばず、別の道や運用見送りで終えられます。'),
 topic('collateral','証拠金と倍率は何？','証拠金は取引へ割り当てる分、倍率はどれだけの値動きを持つかです。','建玉金額を、手元の現金と取り違えないためです。','割り当てた額、倍率、建玉金額、値動きの数量を別々に見よう。','教材で証拠金50・2倍なら建玉金額100。取引数量は価格で割ります。'),
 topic('funding','資金調達料って何？','取引を持っている間に、反対側へ払ったり受け取ったりするお金です。','値動きの損益とは別に、保有中の費用があるためです。','方向・数量・計算に使う価格・率を見て、値動きの損益と分けよう。','この教材の基本場面と、資金調達料を学ぶ小練習は別の状態です。'),
 topic('stop','SL・TPって何？','条件に届くと動く注文です。SLは損失への対応、TPは利益を確かめる対応です。','発動する値段と、実際に成立する値段が同じとは限らないためです。','発動の条件と、成立した明細の価格を別々に見よう。','急な値動きでは、発動価格より不利な値段で成立する例があります。'),
 topic('liquidation','清算（せいさん）って何？','取引を保つのに必要な額を下回るなどして、建玉が終わることです。','損失対応の注文だけで、必ず希望どおり終われるとは限らないためです。','この教材では自己資本と維持に必要な金額を見比べよう。','実市場の詳しい清算価格を予測する計算ではありません。'),
 topic('crypto-exit','帰りの資金はどう見る？','選んだ道から使える状態へ戻し、自分の財布へ受け取ります。','保有・委任・建玉・拘束中の分を、そのまま出金できると数えないためです。','使える残高、資産・道・宛先、費用、今回の到着を順に見よう。','運用していない道なら、売却や委任解除を余分にする必要はありません。'),
];
library.push(topic('mchi','ミチコイン（MCHI）って何？','国内の架空窓口で買って出庫する、実在しない教材コインです。','円で買った後、財布へ運ぶ手順を分けて練習するためです。','円で購入した場所と、出庫後の財布の枚数を別々に見よう。','この教材だけで1枚1,000円。実在コインの価格や購入先の案内ではありません。',['銀行の円','国内窓口のMCHI','自分の財布のMCHI','USDCへ交換']));
const fundingBase={location:'asset-location',exchange:'yen-funding',mchi:'mchi',purchase:'yen-funding',withdraw:'self-wallet',network:'network',address:'self-wallet',fee:'crypto-transfer',pending:'crypto-transfer',usdc:'usdc',swap:'swap',bridge:'bridge',eth:'eth',gas:'gas',handoff:'asset-location'};
for(const item of fundingGlossary){const base=library.find(t=>t.id===fundingBase[item.id.slice('funding.'.length)]);library.push(topic(item.id,item.term,item.description.split('。')[0]+'。',base.why,base.how,item.description,base.diagram));}
// These are independent fictional courses; their examples are not service rates.
library.push(
 topic('domestic-account','国内取引所の口座って何？','暗号資産を売買する架空サービスの、利用者用の記録です。銀行口座とは別です。','銀行の申込が済んでも、取引所を利用できるとは限らないためです。','練習メールの認証、成人カードの入力、本人確認、利用可能の通知を順に見よう。','受付の控えは「申込を受けた」の印。利用できるかは後の通知で分かります。',['メール認証','架空成人の情報','本人確認','審査','利用可能の通知']),
 topic('dealer','販売所って何？','サービスの窓口を相手に、表示された値段で売買する場所です。','利用者同士で注文を並べる板取引所とは、相手と価格の決まり方が違うためです。','買う値段と売る値段を見比べ、同じ枚数の支払額と受取額を見よう。','売値と買値の差は、さらに同じ額の手数料を取るという意味ではありません。',['販売所の窓口','買う値段・売る値段','注文確認','成立した明細']),
 topic('order-book','板（いた）って何？','買いたい人と売りたい人の、値段と枚数を並べた一覧です。','希望する値段で、すぐ相手が見つかるとは限らないためです。','販売所から板取引所へ切り替え、注文の値段・枚数・相手側の注文を見よう。','掲示板に「この値段で買いたい」と札を並べる感じです。札を置くだけでは購入完了ではありません。',['買いたい注文','売りたい注文','条件が合う','売買が成立']),
 topic('market-order','成行（なりゆき）は何？','今ある相手の注文で、売買を進める注文方法です。','入力中の目安価格と、成立した価格は違う場合があるためです。','買いか売りか、枚数、見積りを確認し、確定後は約定履歴を見よう。','この教材は価格と枚数を固定しています。実際にも同じ値段で買えるという約束ではありません。',['向きと枚数','見積り','注文を確定','約定履歴']),
 topic('limit-order','指値（さしね）は何？','買う上限や売る下限の値段を決めて、相手を待つ注文です。','値段を決めて出しても、必ず売買が成立するとは限らないためです。','現在価格と指定価格を見て、未約定一覧・予約分・成立後の明細を分けよう。','買いの指値より高い値段しかなければ、注文は待っています。待っている間に取り消すこともできます。',['値段と枚数を指定','未約定で待つ','条件が合えば約定','合わなければ待機・取消']),
 topic('order-state','未約定と約定は何が違う？','未約定はまだ売買が成立していない状態。約定は売買が成立したことです。','注文受付の知らせを、コインの受取や売上の入金と取り違えないためです。','未約定一覧で待っている注文を見て、約定履歴で実際に成立した枚数を確かめよう。','受付番号が出ても、コインを手に入れた印とは限りません。',['注文受付','未約定','約定','約定履歴・残高']),
 topic('order-reserve','予約金・予約枚数って何？','待っている注文のために、ほかに使えないよう取り分けた円やコインです。','未約定なのに使える残高が減った理由と、二重注文できない理由を知るためです。','買いなら円、売りなら枚数の予約を見よう。取消後は使える分へ戻ったか確かめよう。','お店に取り置きを頼むときのしるしです。予約しただけでは、まだ品物の交換は終わっていません。',['使える残高','注文の予約分','取消なら解放','約定なら支払・受取']),
 topic('lending','レンディング（貸出）って何？','持っている暗号資産を相手へ貸し、決まった条件で返してもらう仕組みです。','手元で使える分と、相手に貸している分を混ぜないためです。','貸す相手・数量・期間・返還条件・返せない危険を確認してから申し込もう。','HLPの共有損益や、ステーキングの委任とは別の仕組みです。',['手元','貸出中','返還申請','返還待ち','受取']),
 topic('annual-rate','年率（ねんりつ）って何？','1年間に対する割合です。30日間の割合そのものではありません。','年率の数字を、そのまま短期間の増える割合にしないためです。','年率、貸す期間、計算の条件を見よう。この教材では365日で割る単利の例を使います。','「1年の量」と「30日分の量」は違います。利息の見積りも、必ず受け取れる約束とは分けます。',['元本','年率','日数を365日と比べる','教材の利息見積り']),
 topic('principal','元本と利息は何が違う？','元本は最初に貸した量、利息は条件に応じて付く分です。','戻った合計を全部利益と思わず、元から持っていた分を分けるためです。','返還明細で元本、利息、合計を別々に見よう。手元へ届く前は受取済みにしません。','荷箱そのものが元本、お礼に付く分が利息という分け方です。',['返る元本','付く利息','返還合計','手元の受取明細']),
 topic('lending-return','貸したらいつでも戻せる？','返してもらえる時期と方法は、サービスの条件で決まります。','必要な日に使えないことや、貸した相手が返せない危険があるためです。','この教材は30日の満期前に戻せません。時間送り後、申請と実受取を分けて見よう。','今回の成功例だけで、実際も必ず元本と利息が返るとは限りません。',['貸出中・早く戻せない','満期','返還申請','処理中','実受取']),
 topic('long-short','ロングとショートって何？','ロングは上がると有利、ショートは下がると有利になる取引の向きです。','同じ値動きでも、選んだ向きで利益と損失が逆になるためです。','向きを選び、建玉の表示で確認しよう。取引を終えるときは、その建玉から決済します。','追い風に向く帆と、逆向きの帆を比べる感じです。どちらなら必ず勝てる、という向きはありません。',['ロング：上昇が有利','ショート：下落が有利','同じ値動きで比較']),
 topic('leverage-choice','1倍・2倍・5倍は何が違う？','同じ証拠金でも、値動きの影響を受ける取引の大きさが変わります。','倍率は利益だけでなく、損失も大きくするためです。','向きと倍率を選び、建玉金額・数量・損益を別々に見よう。倍率で報酬は変わりません。','帆を大きくすると同じ風でも大きく揺れます。この自由練習は手数料と資金調達料を0にした例です。',['同じ証拠金','選んだ倍率','違う取引の大きさ','利益も損失も変わる']),
 topic('practice-repeat','別の条件でもう一度試したい','初回の用事を終えたら、条件を変えた確認課題を何度でも開けます。','前の資金や報酬を変えずに、違いを落ち着いて比べるためです。','依頼帳の確認課題へ進み、完了後は「もう一度」を選ぼう。自由レバなら向きと倍率を変えられます。','復習は別の練習用コピーです。未受講の講座まで達成した記録にはなりません。',['初回を完了','別条件の確認課題','結果を比べる','もう一度練習'])
);
const byId=Object.fromEntries(library.map(t=>[t.id,t]));
const fieldLabels={email:'練習メール',password:'練習用パスワード',registrationCode:'メールの確認コード',bankCode:'銀行メールの確認コード',introPhrase:'メールの合言葉',name:'氏名',kana:'フリガナ',birthday:'生年月日',address:'練習用の宛先・住所',phone:'練習電話',occupation:'職業',purpose:'利用目的',termsAccepted:'利用条件への同意',kycMethod:'本人確認の方法',document:'練習書類',icPin:'画面内の練習暗証番号',cardPosition:'画面内カードの位置',facePosition:'画面内人物の位置',bank:'銀行',branch:'支店',accountType:'口座種別',accountNumber:'架空口座番号',recipient:'受取名義',transferAmount:'振込金額',transferDate:'振込日',selectedOffer:'選ぶ案件',coupon:'クーポン',payment:'支払い方法',orderNumber:'注文番号',inquiryReason:'問い合わせ理由',attachment:'添付する控え',exchangeTarget:'交換先',exchangePoints:'交換するポイント数',pair:'通貨ペア',lots:'lot数',closeLots:'決済するlot数',positionId:'対象の建玉',evidenceId:'提出する取引記録',query:'検索する商品名',salesFilter:'比較する価格の種類',edition:'商品の版',condition:'商品の状態',purchasePrice:'仕入価格',inboundShipping:'仕入送料',expectedSalePrice:'販売の想定価格',feeRate:'販売手数料率',outboundShipping:'発送送料',packagingCost:'梱包費',inspection:'検品の記録',frontPhoto:'表面の教材写真',backPhoto:'裏面の教材写真',productName:'出品する商品名',description:'状態の説明',salePrice:'販売価格',delivery:'配送方法',packaging:'梱包セット',bendProtection:'折れ対策',waterProtection:'水濡れ対策',asset:'送る資産',receiveAsset:'受け取る資産',network:'送るネットワーク',receiveNetwork:'受け取るネットワーク',quantity:'数量',sellQuantity:'売却する数量',withdrawQuantity:'引き出す数量',moveDestination:'移動先',delegateQuantity:'委任する数量',undelegateQuantity:'委任を解除する数量',returnQuantity:'現物へ戻す数量',validator:'預け先の候補',collateral:'割り当てる証拠金',leverage:'倍率',side:'買い・売りの向き',symbol:'銘柄',orderType:'注文方法',stopPrice:'自動注文の発動価格',closeQuantity:'決済する数量',limitPrice:'指値の価格',limitQuantity:'指値の数量',returnHorizon:'戻したい時期',route:'学ぶ経路',wallet:'練習用ウォレット',available:'使える残高',received:'受け取った数量',expected:'受取予定の数量',valuation:'評価額',profit:'確定した利益',loss:'損失額',funding:'資金調達料',notional:'建玉金額',totalHype:'HYPEの合計数量',receivedSpot:'現物に届いた数量',extraQuantity:'追加で預ける数量',fiatAmount:'送る円の金額',yenAmount:'円の金額',purchaseQuantity:'買う教材コインの数量',destination:'移動先',baseQuantity:'実際の通貨数量',sourceNetwork:'移動元の道',targetNetwork:'移動先の道',amount:'金額',deliveryAddress:'練習用のお届け先',phrase:'合言葉',code:'確認コード',tab:'開くタブ',mailId:'読むメール',placement:'画面内人物の位置',quality:'教材画像の鮮明さ'};
const valueLabels={employee:'会社員','self-employed':'自営業',student:'学生',salary:'給与の受け取り',living:'生活費の支払い',ordinary:'普通預金',current:'当座預金',today:'今日の教材日付',reserved:'予約日',hoshi:'ほしあかり銀行',tabidachi:'旅立ち支店',port:'港支店',departure:'旅立ち銀行',sunset:'ゆうやけ銀行','ic-face':'IC読取と顔合わせ',inside:'枠の中',outside:'枠の外',bright:'明るい指定位置',left:'左へずれた位置',dark:'暗い位置','minor-scratches':'小さな傷あり',mint:'目立つ傷なし',sold:'売れた商品',listing:'出品中の商品',buy:'買い',sell:'売り',market:'成行',limit:'指値',overdue:'承認予定を過ぎている','before-due':'まだ承認予定日前',cancel:'取り消す','offer-conditions':'保存した案件条件','product-page':'商品紹介画面','daily-standard':'標準の日用品セット','daily-small':'石けん小の比較セット','tracked-200':'追跡ありの教材配送','untracked-100':'追跡なしの比較用配送','set-50':'台紙と防水袋の梱包セット','card-front':'教材カードの表面写真','card-back':'教材カードの裏面写真',none:'未選択',all:'使える全額',journey:'運用を見送る',spot:'現物',hlp:'HLP',stake:'HYPEステーキング',perp:'任意の無期限先物',lighthouse:'灯台ノード',forest:'森の歯車',starwave:'星波ノード','bright-centered':'明るい場所で枠に合わせた位置',clear:'輪郭が読める画像',blurred:'ぼやけた画像'};
const aliases={'MCHI':'mchi','USDC':'usdc','ETH':'eth','Arbitrum':'arbitrum','HyperCore':'hypercore','HyperEVM':'hyperevm','KYC':'kyc','lot':'fx-lot','Bid/Ask':'bid-ask','Bid':'bid-ask','Ask':'bid-ask','swap':'swap','bridge':'bridge','gas':'gas','wallet':'wallet','network':'network','HLP':'hlp','SL':'stop','TP':'stop','funding':'funding'};
Object.assign(aliases,{'販売所':'dealer','板':'order-book','板取引所':'order-book','取引所':'domestic-account','成行':'market-order','指値':'limit-order','未約定':'order-state','約定':'order-state','予約金':'order-reserve','予約枚数':'order-reserve','レンディング':'lending','貸出':'lending','年率':'annual-rate','元本':'principal','返還':'lending-return','ロング':'long-short','ショート':'long-short','倍率':'leverage-choice','long':'long-short','short':'long-short','leverage':'leverage-choice'});
Object.assign(fieldLabels,{participated:'案件への参加記録',viaRecorded:'ショップへ進んだ経由記録',cartItem:'カートの商品',mockDataConsent:'架空データで練習する同意',depositRecipient:'円の入金先',depositJPY:'入金する円の金額',purchaseAsset:'購入する教材資産',withdrawAsset:'出庫する資産',withdrawNetwork:'出庫する道',withdrawAddress:'自分の練習財布の宛先',swapPair:'交換する資産の組合せ',swapQuantity:'交換に使う数量',bridgeNetwork:'道替えの移動先',gasPayment:'ガス準備に使う数量',yenLocation:'円の置き場所',assetType:'資産の種類',walletRole:'ウォレットの役割',networkRole:'ネットワークの役割',coreLocation:'サービス内の資産の場所',destinationLayer:'移動先の仕組み',recentApp:'最近使ったアプリ',clipboard:'ゲーム内でコピーした内容',limitSide:'指値の買い・売り',limitType:'指値の注文方法',openOrder:'保留している注文',marginMode:'証拠金の使い方',lossPlan:'損失が出たときの計画'});
Object.assign(valueLabels,{isolated:'分離証拠金',cross:'口座内で共有する証拠金',long:'買い（ロング）',short:'売り（ショート）',memo:'メモ',browser:'ブラウザー',mail:'メール',bank:'銀行',wallet:'練習財布',hyper:'取引練習のサービス',approved:'承認済み',pending:'判定待ち',received:'受取済み'});
Object.assign(fieldLabels,{venue:'使う売買の窓口',domesticEmail:'国内窓口の練習メール',domesticPassword:'国内窓口の練習パスワード',domesticCode:'国内窓口のメール確認コード',exchangeCode:'国内窓口のメール確認コード',dealerQuantity:'販売所で売買する枚数',marketQuantity:'成行で売買する枚数',lendingQuantity:'貸し出す数量',lendingAmount:'貸し出す数量',lendingTerm:'貸出期間',annualRate:'教材の年率',principal:'貸し出した元本',interest:'利息',returnAmount:'返還される合計',returnPolicy:'返還の条件',markPrice:'値動き後の価格',priceMove:'教材の値動き',availableJPY:'使える円',reservedJPY:'注文用に予約した円',reservedCoin:'注文用に予約した枚数',closeAll:'建玉の全決済',documentFront:'練習書類の表',documentBack:'練習書類の裏',documentQuality:'書類画像の読みやすさ',reviewPrice:'確認課題の教材価格'});
Object.assign(fieldLabels,{fullName:'氏名',birthDate:'生年月日',verificationCode:'国内窓口のメール確認コード',idType:'使う教材カード',idFront:'カード表面の置き方',idBack:'カード裏面の置き方',selfie:'画面内人物の位置'});
Object.assign(valueLabels,{dealer:'販売所',board:'板取引所',exchange:'板取引所',open:'未約定',filled:'約定済み',cancelled:'取消済み',lending:'貸出中',matured:'満期',returning:'返還処理中',closed:'決済済み'});

export function getGlossary(){return library.map(t=>structuredClone(t));}
export function explainTerm(id){const key=aliases[id]||String(id||'').toLowerCase();return byId[key]?structuredClone(byId[key]):null;}
export function humanFieldLabel(field){return fieldLabels[field]||'練習する項目';}
export function displayPracticeValue(step={}){
 const value=step.value;
 if(value===undefined||value===null||value==='any'||value==='*')return '条件を見て選ぶ';
 const choice=step.choices?.find(c=>String(typeof c==='object'?c.value:c)===String(value));
 if(choice)return String(typeof choice==='object'?choice.label:choice);
 if(typeof value==='boolean')return value?'確認済み':'未確認';
 if(valueLabels[value])return valueLabels[value];
 if(step.field==='side'&&(value===1||value===-1))return value===1?'買い（ロング）':'売り（ショート）';
 if(typeof value==='number')return value.toLocaleString('ja-JP',{maximumFractionDigits:6});
 if(typeof value==='object')return Object.entries(value).map(([k,v])=>`${humanFieldLabel(k)}：${valueLabels[v]||String(v)}`).join('／');
 const text=String(value);if(/^[a-z]+(?:[-_][a-z0-9]+)*$/.test(text))return '練習カードにある項目';
 return text;
}
function questTopics(id){
 if(id==='PR-01')return ['phone','phone-copy','phone-tabs'];
 if(id==='PO-01')return ['membership','mail-auth'];
 if(id==='PO-02')return ['points-conditions','via'];
 if(id==='PO-03')return ['eligible','phone-input'];
 if(id==='PO-04')return ['evidence','approval'];
 if(id==='PO-05')return ['inquiry','evidence'];
 if(id==='PO-06')return ['exchange','gift'];
 if(id==='BK-01')return ['profile','bank-application'];
 if(id==='BK-02-R')return ['kyc-photo','kyc'];
 if(id==='BK-02')return ['kyc','bank-application'];
 if(id==='TR-01')return ['bank-transfer','profile'];
 if(id==='FX-01')return ['fx-pair','fx-lot','bid-ask'];
 if(id==='FX-02'||id==='FX-02-S')return ['fx-close','fx-position','bid-ask'];
 if(id==='FX-03')return ['offer-evidence','approval'];
 if(id==='TC-01')return ['card-market','card-costs'];
 if(id==='TC-02')return ['card-payment','card-description','card-shipping'];
 if(id==='FI-01')return ['yen-funding','asset-location'];
 if(id==='FI-02')return ['self-wallet','network'];
 if(id==='FI-03')return ['swap','bridge','gas'];
 if(id==='DX-01')return ['domestic-account','mail-auth','profile'];
 if(id==='DX-02')return ['kyc','domestic-account','kyc-photo'];
 if(id==='DX-03')return ['dealer','order-book','valuation'];
 if(id==='DX-04')return ['market-order','order-state','order-book'];
 if(id==='DX-05')return ['limit-order','order-reserve','order-state'];
 if(id==='LD-01')return ['lending','lending-return','annual-rate','principal'];
 if(id==='LV-01')return ['long-short','leverage-choice','collateral','practice-repeat'];
 if(id==='CR-01')return ['asset-location','wallet','hypercore'];
 if(id==='CR-02')return ['wallet-connect','secret-safety'];
 if(id==='CR-03')return ['crypto-transfer','network','gas'];
 if(id==='CR-04')return ['operation-choice','valuation'];
 if(id==='HY-SPOT')return ['spot','orders','valuation'];
 if(id==='HY-HLP')return ['hlp','valuation'];
 if(id==='HY-STAKE')return ['staking','valuation'];
 if(id==='HY-PERP')return ['perpetual','collateral'];
 if(id==='HY-EXIT')return ['crypto-exit','crypto-transfer'];
 return [];
}
export function getHelpTopics(step={},quest={}){
 step ||= {}; quest ||= {};
 const detailRows=Array.isArray(step.details)?step.details:step.details&&typeof step.details==='object'?Object.values(step.details):[step.details||''];
 const qid=quest.id||step.questId||'',text=`${step.instruction||''} ${step.field||''} ${detailRows.join(' ')}`,focused=[];
 if(/コピー|貼り付け|clipboard/.test(text))focused.push('phone-copy');
 if(/認証|Code|コード/.test(text))focused.push('mail-auth');
 if(/アプリ切替|タブ|ブラウザー/.test(step.instruction||''))focused.push('phone-tabs');
 if(/network|Network|ネットワーク|送り道/.test(text))focused.push('network');
 if(/Arbitrum/.test(text))focused.push('arbitrum');
 if(/ガス|gas/.test(text))focused.push('gas');
 if(/USDC/.test(step.instruction||'')||step.value==='USDC')focused.push('usdc');
 if(/MCHI/.test(step.instruction||'')||step.value==='MCHI')focused.push('mchi');
 if(/ETH/.test(step.instruction||'')||step.value==='ETH')focused.push('eth');
 if(/HyperEVM/.test(step.instruction||''))focused.push('hyperevm');
 if(/HyperCore/.test(step.instruction||''))focused.push('hypercore');
 if(/スワップ|交換/.test(step.instruction||'')&&qid==='FI-03')focused.push('swap');
 if(/ブリッジ|道替え/.test(step.instruction||''))focused.push('bridge');
 if(/lot|ロット/.test(text))focused.push('fx-lot');
 if(/Bid|Ask/.test(step.instruction||''))focused.push('bid-ask');
 if(/資金調達|funding/.test(step.instruction||''))focused.push('funding');
 if(/清算/.test(step.instruction||''))focused.push('liquidation');
 if(/SL|TP|発動/.test(step.instruction||''))focused.push('stop');
 if(/送料|クーポン/.test(step.instruction||'')&&qid.startsWith('PO'))focused.push('eligible');
 if(/梱包|発送|台紙|防水/.test(step.instruction||''))focused.push('card-shipping');
 if(/傷|状態|写真/.test(step.instruction||'')&&qid.startsWith('TC'))focused.push('card-description');
 if(/画像|撮り直|人物|顔/.test(step.instruction||'')&&qid.startsWith('BK'))focused.push('kyc-photo');
 if(/販売所/.test(text))focused.push('dealer');
 if(/板取引|板の|注文板/.test(text))focused.push('order-book');
 if(/成行/.test(text))focused.push('market-order');
 if(/指値/.test(text))focused.push('limit-order');
 if(/未約定|約定/.test(text))focused.push('order-state');
 if(/予約|拘束/.test(text))focused.push('order-reserve');
 if(/年率|annualRate/.test(text))focused.push('annual-rate');
 if(/元本|利息|principal|interest/.test(text)&&qid==='LD-01')focused.push('principal');
 if(/満期|返還|早期/.test(text)&&qid==='LD-01')focused.push('lending-return');
 if(/ロング|ショート|side/.test(text)&&qid==='LV-01')focused.push('long-short');
 if(/倍率|leverage|証拠金/.test(text)&&qid==='LV-01')focused.push('leverage-choice');
 const contextual=questTopics(qid),appTopic={memo:'phone-copy',mail:'phone-mail',browser:'phone-tabs',points:'points-conditions',bank:'bank-transfer',fx:'fx-pair',market:'card-market',wallet:'wallet',hyper:'operation-choice',gift:'gift'}[step.appId];
 const ids=[...new Set([contextual[0],...(step.helpKeys||[]),...focused,...contextual.slice(1),appTopic].filter(Boolean))].filter(id=>byId[id]);
 return (ids.length?ids:['phone']).slice(0,5).map(id=>structuredClone(byId[id]));
}
