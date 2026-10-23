# M-31 押し続けて歩ける十字キー

- 担当: world_engineer / mobile_world_engineer
- 対象: 2026-10-23のスマホ操作改修後の作業差分
- 編集: `js/world-controls.js`、`styles/world-extension.css`、`tests/world-controls.test.mjs`、この記録。
- 必読: AGENTS、CONTRACTS、agents/world_engineer、既存app.jsのworldCanvas/walk/nearbyTalk/dpad/keydown、world.jsのmove。
- 親がapp.jsへ統合。ブラウザーは親が担当し、この担当では操作していない。

## APIと統合条件

```js
import {renderWorldControls} from './world-controls.js';
const controls=renderWorldControls({
  document,
  onMove:walk,
  onTalk:nearbyTalk,
  canMove:()=>!modal.open // 任意。省略時はtrue
});
world.append(controls.element);
// 全画面を描き直す前、または別画面へ移る前:
controls.destroy();
```

戻り値は `{element,stop,destroy}`。`stop()`は保持中の操作を止める。`destroy()`は停止に加えイベントと監視を解除し、繰り返し呼んでも安全。歩行時はpadを残し、地図だけを描き直す。

moduleは入力を既存のwalk/nearbyTalkへ渡すだけで、state、衝突判定、保存、XP、金融台帳へ直接触らない。屋内でも同じAPIを使用できる。

## 実装した操作

- 64×64 CSS pxの上・下・左・右と中央「話す」を3×3の十字配置にする。説明は「押し続けると歩く。指をずらして向きを変えよう。町の人の近くで『話す』。」。
- 押した瞬間に1歩、260ms後から145ms間隔で歩く。
- 同じ指を別の方向へずらすとすぐ方向変更。中央や隙間へずらすと反復を休止し、方向へ戻せば再開。中央へ滑らせただけでは話しかけない。
- 離す、キャンセル、padから外へ出る、pointer capture喪失、ウィンドウblur、非表示、DOM除去、destroyで停止する。
- 2本目の指、右マウスボタンでは別の移動を開始しない。pointer由来の後続clickによる2歩目を防ぎ、普通のclickとキーボード・支援技術のclickは1歩を維持。
- pad内フォーカスでも方向キーで歩ける。Enter/Spaceは通常のボタン操作で使用できる。
- `touch-action:none`と長押しメニュー抑制はpad内だけ。ページ全体のスクロール制限は追加しない。

## 実行した自動確認

`node --test tests/world-controls.test.mjs`

5件成功 / 失敗0件。最小DOMと決定的な時計で、次を確認した。

1. 初回1歩、260ms境界、145ms反復、離した後の合成click重複なし。
2. pointerup/cancel/leave、blur、hidden、capture喪失、DOM除去、destroyごとに予約タイマーがなくなり、その後2秒進めても歩数が増えない。
3. 同じ指で上→左、中央で休止→下、pad外で停止。矢印の子spanを触っても方向を認識する。
4. 通常click・フォーカス内方向キー・中央話す、破棄後は入力を受けない。
5. 2本目の指・右ボタンの無視、canMoveがfalseになったら反復停止。

## 未確認 / 親のブラウザー確認条件

最小DOMは実ブラウザーのPointerEvent生成、click生成、capture、フォーカス、画面寸法を再現するものではない。統合後の320/390px実測、マウス長押し・離した後の停止、キー、ページスクロール、町民への会話、画面遷移の停止を親が確認する。実機の指による方向スライドとソフトキーボードは別途未確認とする。

担当範囲の残件: なし。app.js統合と独立レビュー・ブラウザー確認は親へ引き継ぐ。
