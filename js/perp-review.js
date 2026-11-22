import {openPerp, perpMetrics, tickPerp} from './finance.js';
import {simulationConfig} from './content-crypto.js';

// Review 5 compares independent examples. Choosing a direction only opens its example.
export function getPerpReviewExample(task, action) {
  if (task?.id !== 'RV-PERP-5') return null;
  const index = task.actions.indexOf(action);
  if (index < 0) return null;
  if (index >= 6) {
    const {position} = openPerp();
    const {equity, maintenance} = perpMetrics(position, 52, simulationConfig.maintenanceRate);
    return {title:'別のお手本・取引を続けられる額', route:'この判定には、さっきの資金調達料を足し引きしません。',
      reference:'価格が52になると、取引に残る額は' + equity + '。続けるのに必要な額は' + maintenance + '。',
      status:'残る' + equity + 'は必要な' + maintenance + '以下。この例では自動で取引が終わります。'};
  }
  const short = index === 2 || index === 3;
  const rate = simulationConfig.fundingHourlyRate * (index === 3 ? -1 : 1);
  const sample = openPerp({side:short ? -1 : 1});
  const {position} = tickPerp(sample, {markPrice:100, fundingRate:rate, fundingEventId:'review-example'});
  const payment = position.fundingPaid ? position.fundingPaid + 'を支払う' : position.fundingReceived + 'を受け取る';
  return {title:'別のお手本・1時間分の資金調達料', route:'それぞれ新しい練習資金で、1回分を比べます。',
    reference:'数量' + position.quantity + ' × 基準価格100 × 0.01% ＝ 0.02 Mock USDC。',
    status:'率は' + (rate > 0 ? 'プラス' : 'マイナス') + '。この例の' + (short ? 'ショート' : 'ロング') + 'は' + payment + '。'};
}
