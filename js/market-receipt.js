import {cardProfit} from './finance.js';
import {comparisonPanels} from './content-points.js';

const yen = amount => amount.toLocaleString('ja-JP') + '円';
const line = (label, amount) => ({label, value: yen(amount)});
const cost = (label, amount) => ({label, value: '−' + yen(amount)});

function forecast(costs) {
  const {salePrice, purchasePrice, inboundShipping, feeRate, outboundShipping, packagingCost} = costs;
  const estimate = cardProfit(costs);
  return {
    title: 'この値段で売れたら？',
    rows: [
      line('売れると予想した値段', salePrice),
      cost('市場の手数料（' + feeRate * 100 + '%）', estimate.fee),
      cost('自分から買った人までの送料', outboundShipping),
      line('入金の見込み', estimate.netPayout),
      line('利益の見込み', estimate.profit),
    ],
    note: '入金の見込みから、カード代' + yen(purchasePrice) + '、お店から自分までの送料' + yen(inboundShipping)
      + '、梱包代' + yen(packagingCost) + 'を引くと、利益の見込みは' + yen(estimate.profit) + '。売れる値段で結果は変わるよ。',
  };
}

function payout(accounts) {
  return {
    title: '市場から届いた入金の明細',
    rows: [
      line('カードが売れた値段', accounts.sales),
      cost('市場の手数料', accounts.feeExpense),
      cost('自分から買った人までの送料', accounts.shippingExpense),
      line('入金されたお金', accounts.netPayout),
    ],
    note: '梱包代' + yen(accounts.packagingPaid) + 'は、台紙と袋を選んだときに払ったよ。',
  };
}

function profit(accounts, purchasePrice, inboundShipping) {
  return {
    title: 'この取引でいくら増えた？',
    rows: [
      line('入金されたお金', accounts.netPayout),
      cost('仕入れたカードの代金', purchasePrice),
      cost('お店から自分までの送料', inboundShipping),
      cost('先に払った梱包代', accounts.packagingPaid),
      line('今回の利益', accounts.realizedProfit),
    ],
    note: 'ここで引いたのは、利益を計算するための費用だよ。支払いはもう済んでいるよ。',
  };
}

/** Receipts describe the current operation. A null step requests a finished quest's report. */
export function getMarketReceipt(state, questId, stepId = null) {
  if (questId !== 'TC-01' && questId !== 'TC-02') return null;
  if (stepId !== null && !stepId.startsWith(questId + '-')) return null;
  if (stepId === null && !state.questStates?.[questId]?.completed) return null;
  const market = state.financialScenarios?.['cards-trade'];
  if (!market) return null;

  const offer = comparisonPanels.cards;
  const draft = market.phoneState?.formDrafts?.['TC-01'] ?? {};
  // Unsubmitted edits live in the phone's UI draft. The scenario only records confirmed values.
  const purchasePrice = Number(draft.purchasePrice ?? offer.purchasePrice);
  const inboundShipping = Number(draft.inboundShipping ?? offer.inboundShipping);
  const costs = {
    purchasePrice, inboundShipping,
    salePrice: Number(draft.expectedSalePrice ?? offer.expectedSalePrice),
    feeRate: Number(draft.feeRate ?? offer.feeRate),
    outboundShipping: Number(draft.outboundShipping ?? offer.outboundShipping),
    packagingCost: Number(draft.packagingCost ?? offer.packagingCost),
  };
  const paidForStock = purchasePrice + inboundShipping;
  const accounts = market.accounts;
  if (questId === 'TC-01') {
    if (stepId === 'TC-01-015') return {
      title: '仕入れの計算メモ', rows: [line('入力したカード代', purchasePrice)],
    };
    if (stepId === 'TC-01-016') return {
      title: '仕入れにかかるお金', rows: [line('カード代', purchasePrice), line('お店から自分までの送料', inboundShipping), line('仕入れに必要な合計', paidForStock)],
    };
    if (stepId === 'TC-01-017') return {
      title: '売れそうな値段で考えよう', rows: [line('入力した予想の売値', costs.salePrice)],
      note: 'ここから、市場に払う手数料や、送るときの費用を引いてみよう。',
    };
    if (stepId === 'TC-01-018' || stepId === 'TC-01-019') return {
      title: '売れたときに引かれるお金',
      rows: [line('予想の売値', costs.salePrice), cost('市場の手数料（' + costs.feeRate * 100 + '%）', cardProfit(costs).fee),
        ...(stepId === 'TC-01-019' ? [cost('自分から買った人までの送料', costs.outboundShipping)] : [])],
    };
    if (stepId === 'TC-01-020' || stepId === 'TC-01-021') return forecast(costs);
    if (stepId !== null) return null;
    return {
      title: '仕入れた日の支払い明細',
      rows: [
        line('カードの代金', purchasePrice),
        line('お店から自分までの送料', inboundShipping),
        line('仕入れで払った合計', paidForStock),
        line('仕入れた直後の財布', market.initialSnapshot.accounts.cashBalance - paidForStock),
      ],
      note: 'この時点ではカードの到着待ち。売上と入金はまだなく、利益も決まっていないよ。',
    };
  }

  switch (stepId) {
    case 'TC-02-021':
    case 'TC-02-022': {
      const listingPrice = Number(market.phoneState?.formDrafts?.['TC-02']?.salePrice ?? costs.salePrice);
      return {
        title: '出品する前の値札',
        rows: [line('出品する値段', listingPrice), line('売れた場合の入金の見込み', cardProfit({...costs, salePrice: listingPrice}).netPayout)],
        note: '出品すると、買いたい人に値札が見えるよ。この時点の入金は' + yen(accounts.netPayout) + '。',
      };
    }
    case 'TC-02-023':
      return {
        title: '出品中・買ってくれる人を待とう',
        rows: [line('いまの売上', accounts.sales), line('入金されたお金', accounts.netPayout)],
      };
    case 'TC-02-024':
    case 'TC-02-025':
      return {
        title: '売れたよ。代金は受け取り待ち',
        rows: [line('まだ入金されていない売上', accounts.unsettledSales), line('入金されたお金', accounts.netPayout)],
        note: '品物を送り、買った人が受け取ると、市場が代金を届けてくれるよ。',
      };
    case 'TC-02-026':
      return {
        title: '台紙と袋を用意したよ',
        rows: [line('いま払った梱包代', accounts.packagingPaid), line('財布に残った現金', accounts.cashBalance)],
      };
    case 'TC-02-028':
    case 'TC-02-029':
      return {
        title: market.data.shipmentStatus === 'shipped' ? '発送済み・買った人の受け取り待ち' : '発送前のお金を確認',
        rows: [
          line('まだ入金されていない売上', accounts.unsettledSales),
          line('入金されたお金', accounts.netPayout),
          ...(market.data.shipmentStatus === 'shipped' ? [{label: '荷物の追跡番号', value: '星便 HS-001'}] : []),
        ],
        note: '送る送料' + yen(costs.outboundShipping) + 'は、あとで市場が売上から引くよ。梱包代' + yen(accounts.packagingPaid) + 'は支払い済みだよ。',
      };
    case 'TC-02-030':
      return market.data.settled ? {
        title: '買った人にカードが届いたよ',
        rows: [{label: '荷物', value: '受け取り済み'}, {label: '市場からの入金', value: '入金済み'}],
        note: '受取完了の通知が届いたよ。市場から入った金額は、このあと明細で確かめよう。',
      } : null;
    case 'TC-02-031':
      return market.data.settled ? {
        title: '新しい入金が1件あるよ',
        rows: [line('市場から届いたお金', accounts.netPayout)],
        note: '「入金明細」を開いて、売れた値段から何が引かれたか見よう。',
      } : null;
    case 'TC-02-032':
      return market.data.settled ? payout(accounts) : null;
    case null:
      if (!market.data.settled) return null;
      return {
        title: 'このカードで増えたお金',
        breakdowns: [profit(accounts, purchasePrice, inboundShipping), payout(accounts)],
        rows: [
          line('売上（売れた値段）', accounts.sales),
          line('入金（市場から届いたお金）', accounts.netPayout),
          line('利益（費用を全部引いた分）', accounts.realizedProfit),
        ],
        note: 'はじめの財布は' + yen(market.initialSnapshot.accounts.cashBalance) + '。今は' + yen(accounts.cashBalance) + '。増えた' + yen(accounts.realizedProfit) + 'が利益だよ。',
      };
    default:
      return null;
  }
}
