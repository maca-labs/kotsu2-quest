# Z-04 — 道案内・退店・保存への独立コード確認

担当qa_reviewer。2026-10-24（日本時間）。製品・テスト・refsは変更せず、本報告だけを編集。孫、ブラウザー、実機の操作は実施していない。

## 対象版と範囲

基準04976d5からwalk10の差分。最初に確認したHEADは`9bed99444021f9638d47dee1e1be84ada49e138e`。

|対象|SHA-256（初回確認時）|
|---|---|
|js/town-guidance.js|39cf081d034b1a732cfa4f33c72cb4859d23c09eda004e0fb1bedad622990162|
|js/app.js|60220f360fe678c087db5326d67841d346e982e1c166e3039cf158889dd3018e|
|js/rpg-ui.js|18aa8e8110fa657d0ccb847023a1c6049a9ad52ee8bd7229338581acc8da3bbd|
|js/towns.js|43eb8e042f1dbfc8a69619fe72871526d35a2671b17f408ab6845696df17bbaf|
|js/story-guide.js|c469d263b2568afc1cbe004100dfc37914501e132f5126574ee6a3ff547bada1|
|index.html|dcdd0f6b9a38046eaaf261a9c4252666e52cb6fc25cf18e7f135a2514e962e59|

AGENTS、PRODUCTION、CONTRACTSのZ、qa_reviewer役を読み、BFS、町の描画・歩行、退店、上部/下部ボタン、港のNPC、CH6の案内、相対配信版を確認した。金融/engine/storageの製品差分はなく、呼出順序と保存境界を重点とした。

## 確認できた条件

- 独立したNode小ケースで7町・全29施設について南門側12,16から案内どおり361回の移動を実行。次の一歩は実world.moveで通れ、各扉の南隣に到達し最後は「上で入ろう」と表示。金融snapshot・報酬・工程・rpg台帳は不変。
- BFSの固体集合はworld.moveのwater/tree/house/fountainと一致し、同じgetTownLayoutのNPCも除外。扉を途中経路に使わず、最後の入室1歩だけを案内に付ける。直線歩数は残り経路から再計算する。
- 初期worldCanvasと各walkの再描画の両方でdrawTownWalkGuideを呼ぶ。目的家の枠/旗はcanvasの6矩形だけであり、描画前後のstate全体が一致することを小ケースで確認。
- resume/boss/chapter/expedition/questはgetTownWalkGuideがnull。元のstoryGuide.titleへ戻るので非house目的を家への案内に置き換えない。
- 実appのact/saveQuiet/leaveShopをVMへ取り出し、本物dispatch/parseSaveと結合。通常の退店は7町すべてで現在の店の南隣に保存・復元。座標はCH0=12,6、CH1=18,6、CH2=19,15、CH3=11,15、CH4=19,6、CH5=14,6、CH6=17,14。
- 退店の最初の保存をthrowさせた場合は、state全体・shop画面・前の位置を保持し、エラーだけを出した。
- 上部「店の外へ」と下部「店を出て町へ戻る」は同じonLeaveを使い、親のrenderShopViewは同じleaveShopを渡す。購入・装備の既存callbackは差分なし。
- 港のNPCはindex2/3の座標だけを8,10/17,9へ変更し、人数・index・会話定義・報酬IDを変更していない。旧642工程fixtureからNPC2/3と再会話を実行してJSON再生。index2は初回3 XP/再会話0、index3は既存の対象外話題のため0/0、保存IDはnpc:CH-3:2:firstとnpc:CH-3:3:firstのまま。
- CH6案内の実質差分は「メニューの依頼帳」内の「学びたい道」へ所在を明示した1文。条件や運用の判定を変更していない。
- indexの全31 runtime importは./js/相対、同じv=20261024-walk10で実ファイルが存在。CSS・入口も同じ版。repoサブパスからのURL解決を壊す絶対ルート指定を追加していない。

## Z04-F01 — 退店の2回目保存失敗で画面と再開位置が異なる

- 優先度: **Major → 修正後の同ケース再確認で解消**。親へ通知し、親が修正。本担当は製品を編集していない。
- 根拠: CONTRACTS Z「leaveShopは移動と店先座標を保存/描画」「失敗時の現在地保持・保存復帰一致」という任務受入条件。
- 対象: 上記app SHA、app.jsのleaveShop/act/saveQuiet、変更のないSaveStore.save。
- 再現: CH3の町座標12,10からメニュー経由でshop:CH-3へ入る。実leaveShopを呼び、localStorage.setItemの1回目を成功、2回目だけQuotaExceededErrorにする。実SaveStore、実dispatch、保存文字列の実parseSaveを用いたNode/VMで再現した。
- 期待: 移動と店先座標を一つの保存として扱い、成功時は現在表示位置とJSON復元位置が一致する。throwする競合では店と前の位置を保持する。保存不可をfalseで返す端末は、従来どおり通知付きでメモリ継続するが、旧保存へ移動の途中だけを書き込まない。
- 実際: 1回目のact内保存がtown:CH-3/12,10を確定。その後の店先座標11,15をsaveQuietで保存すると失敗し、SaveStore.saveはfalseを返す。画面はtown:CH-3/11,15へ進むが、保存から再開すると12,10。saveQuietはfalseを見ないので通知もなく、観測した呼出はrenderだけ。writes=2、available=false。
- 影響: 金融・XP・購入品は変わらないが、退店の保存と復帰が一致しない。従来のオフライン継続一般ではなく、新しい2段保存の途中だけ失敗する境界である。
- 合格条件: 移動＋店先座標を同じ一回の保存へまとめ、通常7店で復元一致。throw競合はshopと前位置を保持。false保存不可は旧保存のshopと旧位置を一貫して保持し、メモリ上の継続には保存不可/JSON書出しの明示通知。購入/装備/金融/XP不変、上部/下部の同じ入口を再確認する。

## 修正後の再確認

親がappのactへworldPositionオプションを追加し、dispatchで作成したnext.worldStateへ店先座標を適用してから、一回のstore.saveへ渡すよう変更した。leaveShopの2回目saveQuietを削除。修正後app SHA-256は`05b1edfa413e3dcecda11ec7d4c73bc7bfb1c3b84e2d25ae013401ba107173a8`。この再確認時のHEADは9bed994で、上記変更は未commitの親差分。

実SaveStore/dispatch/parseSaveと実app関数を使う独立小ケースを再実行した。

- 7店すべてwrites=1、保存と表示の町/店先座標が一致。金融snapshot不変。
- 別タブの実競合: writes=0、旧state全体とshop画面を保持、競合エラーを表示。外部の新しい保存も書き換えない。
- 実QuotaExceededError: writes=1、旧保存はshop:CH-3/12,10のまま。メモリはtown:CH-3/11,15へ継続し、ui.storageWarned=trueと「この環境では保存できません。保存データからJSONを書き出せます。」のtoast。途中town＋旧位置を保存しない。
- 既存の対象回帰を `node --test --test-name-pattern "leave action|actual canvas|leaving the shop" tests/rpg-ui.test.mjs tests/town-navigation.test.mjs` で実行。15件成功、失敗0、約4.18秒。上部/下部の同じ退出入口、初期描画と実ハンドラー、7町の店先復帰と一歩再入を含む。

以上によりZ04-F01の重大な残件は解消。この変更範囲で新たな金融/XP/工程/報酬の不整合は確認していない。

### 小さいVM再現ハーネスの参考

リポジトリ直下で `node --input-type=module` のstdinとして実行できる。書込みは偽localStorageだけで、製品ファイルや実ブラウザー保存は変更しない。chapterを0〜6、modeをsuccess/conflict/quotaへ変えて同じ境界を確認する。

```javascript
import fs from 'node:fs';
import vm from 'node:vm';
import {createState,dispatch,totalXp,parseSave} from './js/engine.js';
import {SaveStore} from './js/storage.js';
import {getTownTravelFeatures} from './js/rpg-world.js';
const chapter=3, mode='quota';
let state=dispatch(createState(),{type:'CHAPTER',id:`CH-${chapter}`},1);
state=dispatch(state,{type:'RPG_TRAVEL',mapId:`shop:CH-${chapter}`},2);
let persisted=JSON.stringify(mode==='conflict'
  ? dispatch(state,{type:'SETTINGS',values:{sound:true}},3) : state);
let writes=0;
globalThis.localStorage={getItem:()=>persisted,setItem(k,v){
  writes++; if(mode==='quota')throw new Error('QuotaExceededError');
  persisted=v;
}};
const store=new SaveStore();store.writable=true;store.seenRevision=state.revision;
const messages=[];
const context={state,store,totalXp,dispatch,getTownTravelFeatures,
  ui:{view:'shop',room:null},toast:m=>messages.push(m),
  showError:m=>messages.push(m),render(){},window:{scrollTo(){}},setTimeout(){}};
const source=fs.readFileSync('./js/app.js','utf8').split('\n')
  .filter(line=>line.startsWith('function act(')||line.startsWith('function leaveShop('))
  .join('\n');
vm.createContext(context);vm.runInContext(source,context);context.leaveShop();
console.log({writes,messages,memory:context.state.worldState,
  memoryMap:context.state.rpg.location.mapId,
  restored:parseSave(persisted).worldState,
  restoredMap:parseSave(persisted).rpg.location.mapId});
delete globalThis.localStorage;
```

## 証拠の限界

親が行った関連66件成功のログは読んだが、この担当の再実行として数えない。全318件を今回再実行していない。独立確認は上記Node小ケース、ソース比較、VMでの実関数結合に限る。公開/ローカルのブラウザー実歩行は親とZ-01〜03の証跡であり、本担当の操作実績に合算しない。モバイル実機、Safari、支援技術、人間利用者の理解や楽しさは未確認。

この報告は上記SHAの範囲を対象とし、その後の製品変更には再確認が必要。

## 追加確認 — 天空城の未受注相談Context

Z-03が公開旧版で、CH6未受注・journey選択時に相談がHY-SPOTへ寄ることを発見。親がui-adventure.currentContextを「同章の現役unfinished記録 → getStoryGuideのquestId → 同章の完了記録 → 同章の最初quest」の優先へ変更した。追加確認対象 `js/ui-adventure.js` のSHA-256は`22139fecab289a9b4a72342c38faa2aed422a6934e336bcd862e32e1cc45587b`。確認時HEAD9bed994に対する親の未commit差分を読んだ。製品編集は行っていない。

実sourceからcurrentContext関数をVMへ取り出し、本物のengine状態、content、getStoryGuideと結合して12小ケースを確認した。各相談の読取り前後でstate全体のJSONが一致し、金融、XP、工程、報酬、選択、保存記録を動かさない。

|状態|得られた相談Context|
|---|---|
|CH6未受注・journey|HY-EXIT、stepなし。町の案内と一致|
|CH6未受注・spot/hlp/stake/perpの4条件|HY-SPOT/HY-HLP/HY-STAKE/HY-PERP、stepなし。各案内と一致|
|HY-SPOT受注途中、選択だけjourneyへ変更|途中のHY-SPOT-S001を維持|
|CH6に2件途中、activeは別章DX-01、CH6へ戻る|CH6の途中HY-SPOT-S001を選び、別章のactiveに引かれない|
|別章DX-01だけ途中、CH6未受注journey|HY-EXITを選ぶ|
|HY-SPOT完了・報告前|案内に合わせHY-SPOT、完了済みなのでstepなし|
|同じ完了記録を村人へ報告後・journey|次の案内HY-EXITへ進む|
|旧642工程fixtureのCH6完了、案内のquestIdなし|同章の完了HY-EXITへ安全にfallback|
|active HY-HLPは完了、同章HY-SPOTは途中|現役unfinishedのHY-SPOT-S001を優先|

静的importグラフでstory-guide.jsからui-adventure.jsへの戻り経路がなく、追加import辺による循環がないことを確認。ui-adventureモジュールのruntime importも成功した。

`node --test --test-name-pattern "unaccepted sky-town|help, tavern" tests/help.test.mjs` は2件成功、失敗0、約2.83秒。実openCurrentHelpの5route・途中保持、相談/酒場/長老のdialogと元state不変を含む。親の既存12件成功を本担当の再実行数へ加えていない。

この修正範囲の重大残件は確認していない。ブラウザー公開旧版の再現自体はZ-03の証跡であり、本担当はNode小ケース/実DOM相当fixtureとソース依存の確認に限る。
