export function estimate(input) {
  const number = (key, min = 0, max = 1e9) => {
    const v = Number(input[key]);
    if (input[key] === '' || !Number.isFinite(v) || v < min || v > max) throw new Error(`Check ${key}.`);
    return v;
  };
  const type = input.type;
  if (!['bulk', 'area', 'linear', 'count'].includes(type)) throw new Error('Choose a material type.');
  const measured = number('measured', 0.001);
  const waste = number('waste', 0, 100) / 100;
  const factor = type === 'bulk' ? number('factor', 1, 3) : 1;
  const net = type === 'bulk' ? measured * number('depth', 0.01, 120) / 324 : measured;
  const quantity = net * (1 + waste) * factor;
  const pack = number('pack', 0.001);
  const packs = Math.ceil(Number((quantity / pack).toPrecision(12)));
  const ordered = packs * pack;
  const materials = ordered * number('unitCost');
  const labor = number('hours') * number('hourlyCost');
  const cost = materials + labor + number('delivery') + number('otherCost');
  const percent = number('percent', 0, input.pricing === 'margin' ? 99 : 1000) / 100;
  if (!['margin', 'markup'].includes(input.pricing)) throw new Error('Choose markup or margin.');
  const price = input.pricing === 'margin' ? cost / (1 - percent) : cost * (1 + percent);
  return { type, net, quantity, packs, ordered, materials, labor, cost, price, grossProfit: price - cost, grossMargin: price ? (price - cost) / price : 0, unit: { bulk: 'yd³', area: 'ft²', linear: 'ft', count: 'each' }[type] };
}
