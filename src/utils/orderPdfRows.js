const money = (value) => `R$ ${Number(value ?? 0).toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;

const quantity = (value) => Number(value).toLocaleString('pt-BR', {
  maximumFractionDigits: 3
});

const description = (item, boxQuantity) => [
  item.name,
  item.category,
  boxQuantity > 0 && item.unitsPerBox
    ? `Caixa com ${item.unitsPerBox} ${Number(item.unitsPerBox) === 1 ? 'unidade' : 'unidades'}`
    : null,
  !item.productId && item.manualColor ? `Cor: ${item.manualColor}` : null
].filter(Boolean).join(' - ');

export const buildOrderPdfRows = (items = []) => items.map((item) => {
  const unitQuantity = Number(item.unitQuantity ?? item.quantity ?? 0);
  const boxQuantity = Number(item.boxQuantity ?? 0);
  const unitPrice = Number(item.unitPrice ?? 0);
  const boxPrice = Number(item.boxPrice ?? 0);
  const manualUnitLabel = item.manualUnitType === 'KG' ? 'KG' : 'UN';
  const unitLabel = item.productId ? 'UN' : manualUnitLabel;
  const quantities = [];
  const prices = [];

  if (unitQuantity > 0) {
    quantities.push(`${quantity(unitQuantity)} ${unitLabel}`);
    prices.push(money(unitPrice));
  }

  if (boxQuantity > 0) {
    quantities.push(`${quantity(boxQuantity)} CX`);
    prices.push(money(boxPrice));
  }

  return {
    quantity: quantities.join(' + ') || '0 UN',
    code: item.code,
    description: description(item, boxQuantity),
    unitPriceLabel: prices.join(' / ') || money(unitPrice),
    totalPrice: unitQuantity * unitPrice + boxQuantity * boxPrice
  };
});
