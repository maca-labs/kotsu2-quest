import test from 'node:test';
import assert from 'node:assert/strict';
import {questById} from '../js/content.js';
import {getPerpReviewExample} from '../js/perp-review.js';

test('each optional fee and liquidation example uses its own conditions',()=>{
 const {tasks}=questById['HY-PERP'].reviewVariant, task=tasks[4];
 const displayed=index=>getPerpReviewExample(task,task.actions[index]);
 assert.match(displayed(1).status,/プラス.*ロング.*0.02を支払う/);
 assert.match(displayed(2).status,/プラス.*ショート.*0.02を受け取る/);
 assert.match(displayed(3).status,/マイナス.*ショート.*0.02を支払う/);
 assert.match(displayed(7).status,/残る4は必要な5.2以下/);
 assert.equal(getPerpReviewExample(tasks[3],tasks[3].actions[0]),null);
 assert.doesNotMatch(displayed(7).status,/993|0\.02/);
});
