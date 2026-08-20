import PDFDocument from 'pdfkit';
import path from 'node:path';
import { env } from '../config/env.js';
import { ConcurrencyLimiter } from '../utils/ConcurrencyLimiter.js';
import { buildOrderPdfRows } from '../utils/orderPdfRows.js';
import { performance } from 'node:perf_hooks';

const pdfLimiter = new ConcurrencyLimiter(env.pdfConcurrency);

const PAGE = {
  margin: 36,
  width: 595.28,
  height: 841.89
};

const table = {
  x: 36,
  y: 407,
  width: 523,
  rowHeight: 20,
  headerHeight: 22,
  columns: {
    quantity: { x: 36, width: 52 },
    code: { x: 88, width: 76 },
    description: { x: 164, width: 250 },
    unitPrice: { x: 414, width: 62 },
    total: { x: 476, width: 83 }
  }
};

class PdfService {
  async generateOrderPdf(order, metrics = {}) {
    const queuedAt = performance.now();
    return pdfLimiter.run(() => new Promise((resolve, reject) => {
      metrics.queue_wait_ms = (metrics.queue_wait_ms ?? 0) + performance.now() - queuedAt;
      const renderStartedAt = performance.now();
      const doc = new PDFDocument({ margin: PAGE.margin, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        metrics.render_ms = performance.now() - renderStartedAt;
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);

      this.#drawPage(doc, order);

      doc.end();
    }));
  }

  #drawPage(doc, order) {
    this.#drawHeader(doc, order);
    this.#drawCustomerBox(doc, order);
    const rows = buildOrderPdfRows(order.items);
    const summaryRowCount = (Number(order.discountPercent ?? 0) > 0 ? 3 : 2)
      + (order.bonusProductSnapshot ? 1 : 0);
    const firstPageLastCapacity = (order.notes ? 10 : 13) - summaryRowCount;

    if (rows.length <= firstPageLastCapacity) {
      const tableBottomY = this.#drawItemsTable(doc, order, rows, table.y, true);
      this.#drawFooter(doc, tableBottomY, order);
      return;
    }

    const firstPageRowsCount = Math.min(14, Math.max(1, firstPageLastCapacity));
    let remainingRows = rows.slice(firstPageRowsCount);
    this.#drawItemsTable(doc, order, rows.slice(0, firstPageRowsCount), table.y, false);

    while (remainingRows.length > 0) {
      doc.addPage();
      const lastPageCapacity = 24 - summaryRowCount;
      const isLastPage = remainingRows.length <= lastPageCapacity;
      const intermediateCount = Math.min(30, remainingRows.length - lastPageCapacity);
      const pageRows = remainingRows.splice(0, isLastPage ? lastPageCapacity : intermediateCount);
      const tableBottomY = this.#drawItemsTable(doc, order, pageRows, 50, isLastPage);

      if (isLastPage) {
        this.#drawFooter(doc, tableBottomY, order);
      }
    }
  }

  #drawHeader(doc, order) {
    const logoPath = path.resolve(process.cwd(), 'src/public/images/velas-aib-logo-official.png');

    doc.image(logoPath, 78, 62, { width: 58 });
    doc.font('Helvetica').fontSize(29).fillColor('#231f20').text('Velas', 54, 125, { continued: true });
    doc.font('Helvetica-Bold').text('AIB');
    doc.font('Helvetica-Bold').fontSize(12).text('www.velasaib.com.br', 58, 157);

    doc.font('Helvetica-Bold').fontSize(13).text('PEDIDO N°', 220, 70);
    this.#drawLine(doc, 286, 80, 400);
    doc.font('Helvetica-Bold').fontSize(12).text(order.orderNumber.replace('#', ''), 305, 65, {
      width: 88,
      align: 'center'
    });

    doc.font('Helvetica-Bold').fontSize(13).text('DATA:', 220, 106);
    this.#drawLine(doc, 262, 116, 302);
    this.#drawLine(doc, 318, 116, 358);
    this.#drawLine(doc, 374, 116, 414);
    const [day, month, year] = new Date(order.createdAt ?? Date.now()).toLocaleDateString('pt-BR').split('/');
    doc.font('Helvetica-Bold').fontSize(11).text(day, 266, 101, { width: 30, align: 'center' });
    doc.text(month, 322, 101, { width: 30, align: 'center' });
    doc.text(year, 369, 101, { width: 48, align: 'center' });

    this.#drawBrandIcon(doc, 455, 58);
    this.#drawBrandIcon(doc, 492, 58);
    this.#drawBrandIcon(doc, 529, 58);

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Rua Gema, 302', 432, 105, { width: 126, align: 'right' })
      .text('Jd. São Judas - CEP 09930-290', { align: 'right' })
      .text('Diadema | SP | Brasil', { align: 'right' })
      .text('CNPJ 24.868.272/0001-76', { align: 'right' })
      .text('Fone 55 11 3705-9925', { align: 'right' })
      .text('contato@velasaib.com.br', { align: 'right' });
  }

  #drawCustomerBox(doc, order) {
    const boxX = table.x;
    const boxY = 186;
    const boxW = table.width;
    const boxH = 205;
    const customer = order.customerSnapshot;
    const seller = order.sellerSnapshot ?? {};

    doc.roundedRect(boxX, boxY, boxW, boxH, 8).lineWidth(1.1).strokeColor('#231f20').stroke();
    doc.font('Helvetica').fontSize(10).fillColor('#231f20');

    this.#field(doc, 'Cliente:', customer.legalName, 55, 205, 382);
    this.#field(doc, 'Fone:', customer.whatsapp, 438, 205, 112);
    this.#field(doc, 'Endereço:', customer.street, 55, 226, 392);
    this.#field(doc, 'N°', customer.number, 452, 226, 98);
    this.#field(doc, 'Bairro:', customer.district, 55, 247, 150);
    this.#field(doc, 'CEP:', customer.zipCode ?? '', 215, 247, 118);
    this.#field(doc, 'Cidade:', customer.city, 340, 247, 116);
    this.#field(doc, 'Estado:', customer.state, 458, 247, 92);
    this.#field(doc, 'Inscr. Est:', '', 55, 268, 230);
    this.#field(doc, 'Inscr. CNPJ:', customer.cnpj, 290, 268, 260);
    this.#field(doc, 'Cond. Pagto.:', order.paymentTerm ?? '', 55, 289, 245);
    this.#field(doc, 'Transportadora:', '', 305, 289, 245);
    this.#field(doc, 'Vendedor:', seller.name ?? order.createdBy?.name ?? '', 55, 310, 245);
    this.#field(doc, 'Fone:', seller.phone ?? '', 305, 310, 115);
    this.#field(doc, 'Receb.:', this.#formatReceivedTime(order.receivedTime), 425, 310, 125);
    this.#field(doc, 'Dias de entrega:', this.#formatDeliveryDays(order.deliveryDays), 55, 331, 495);
    this.#field(doc, 'E-mail fiscal:', order.fiscalEmail ?? '', 55, 352, 495);
    this.#field(doc, 'E-mail contato:', order.contactEmail ?? '', 55, 373, 495);
  }

  #drawItemsTable(doc, order, rows, tableY, includeSummary) {
    const summaryRows = includeSummary && Number(order.discountPercent ?? 0) > 0 ? 3 : includeSummary ? 2 : 0;
    const bonusRows = includeSummary && order.bonusProductSnapshot ? 1 : 0;
    const rowCount = Math.max(rows.length + summaryRows + bonusRows, 2);
    const totalTableHeight = table.headerHeight + rowCount * table.rowHeight;
    const bottomY = tableY + totalTableHeight;

    doc.roundedRect(table.x, tableY, table.width, totalTableHeight, 7)
      .lineWidth(1.2)
      .strokeColor('#231f20')
      .stroke();

    this.#drawVerticalLine(doc, table.columns.quantity.x + table.columns.quantity.width, tableY, bottomY);
    this.#drawVerticalLine(doc, table.columns.code.x + table.columns.code.width, tableY, bottomY);
    this.#drawVerticalLine(doc, table.columns.description.x + table.columns.description.width, tableY, bottomY);
    this.#drawVerticalLine(doc, table.columns.unitPrice.x + table.columns.unitPrice.width, tableY, bottomY);

    for (let index = 1; index <= rowCount; index += 1) {
      const y = tableY + table.headerHeight + index * table.rowHeight;
      this.#drawLine(doc, table.x, y, table.x + table.width);
    }

    doc.font('Helvetica-Bold').fontSize(8.5);
    this.#cell(doc, 'QUANT.', table.columns.quantity, tableY + 6, 'center');
    this.#cell(doc, 'CÓD. PRODUTO', table.columns.code, tableY + 6, 'center');
    this.#cell(doc, 'DESCRIÇÃO DO PRODUTO', table.columns.description, tableY + 6, 'center');
    this.#cell(doc, 'PREÇO', table.columns.unitPrice, tableY + 6, 'center');
    this.#cell(doc, 'TOTAL', table.columns.total, tableY + 6, 'center');

    doc.font('Helvetica').fontSize(7.8);

    rows.forEach((row, index) => {
      const y = tableY + table.headerHeight + index * table.rowHeight + 6;
      this.#cell(doc, row.quantity, table.columns.quantity, y, 'center');
      this.#cell(doc, row.code, table.columns.code, y, 'center');
      this.#cell(doc, row.description, table.columns.description, y, 'left');
      this.#fitCell(doc, row.unitPriceLabel, table.columns.unitPrice, y, 'right', 7.8, 4.6);
      this.#cell(doc, this.#money(row.totalPrice), table.columns.total, y, 'right');
    });

    if (!includeSummary) {
      return bottomY;
    }

    let summaryY = tableY + table.headerHeight + rows.length * table.rowHeight + 6;
    const subtotal = Number(order.subtotalPrice ?? rows.reduce((sum, row) => sum + row.totalPrice, 0));
    const discountPercent = Number(order.discountPercent ?? 0);
    const discountAmount = Number(order.discountAmount ?? 0);
    const total = Number(order.totalPrice ?? Math.max(subtotal - discountAmount, 0));

    if (order.bonusProductSnapshot) {
      doc.font('Helvetica-Bold').fontSize(8.5);
      this.#cell(doc, 'BONUS', table.columns.quantity, summaryY, 'center');
      this.#cell(doc, order.bonusProductSnapshot.code, table.columns.code, summaryY, 'center');
      this.#cell(doc, order.bonusProductSnapshot.name, table.columns.description, summaryY, 'left');
      this.#cell(doc, this.#money(0), table.columns.unitPrice, summaryY, 'right');
      this.#cell(doc, this.#money(0), table.columns.total, summaryY, 'right');
      summaryY += table.rowHeight;
    }

    doc.font('Helvetica-Bold').fontSize(7.8);
    this.#fitCell(doc, 'SUBTOTAL', table.columns.unitPrice, summaryY, 'right');
    this.#cell(doc, this.#money(subtotal), table.columns.total, summaryY, 'right');
    summaryY += table.rowHeight;

    if (discountPercent > 0) {
      doc.font('Helvetica-Bold').fontSize(7.8);
      this.#fitCell(doc, `DESCONTO ${discountPercent.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`, table.columns.unitPrice, summaryY, 'right');
      this.#cell(doc, this.#money(discountAmount), table.columns.total, summaryY, 'right');
      summaryY += table.rowHeight;
    }

    doc.font('Helvetica-Bold').fontSize(7.8);
    this.#fitCell(doc, 'TOTAL DO PEDIDO', table.columns.unitPrice, summaryY, 'right');
    this.#cell(doc, this.#money(total), table.columns.total, summaryY, 'right');

    return bottomY;
  }

  #drawFooter(doc, contentBottomY, order) {
    let notesY = Math.max(contentBottomY + 22, 582);
    const observation = String(order.notes ?? '').trim();

    if (observation) {
      const observationHeight = 54;
      doc.roundedRect(36, notesY, 523, observationHeight, 6)
        .lineWidth(0.8)
        .strokeColor('#231f20')
        .stroke();
      doc.font('Helvetica-Bold').fontSize(9).text('OBSERVAÇÃO:', 45, notesY + 8);
      doc.font('Helvetica-Bold').fontSize(8.5).text(observation, 45, notesY + 21, {
        width: 505,
        height: 27,
        ellipsis: true
      });
      notesY += observationHeight + 12;
    }

    const signatureY = notesY + 54;

    if (signatureY + 25 > PAGE.height - PAGE.margin) {
      doc.addPage();
      this.#drawFooter(doc, PAGE.margin, order);
      return;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('NOTAS: 1 - PAGAMENTO FATURADO SUJEITO A APROVAÇÃO DE CADASTRO E CONSULTA AO SPC/SERASA.', 36, notesY, {
        width: 523,
        align: 'center'
      });

    doc.font('Helvetica-Bold').fontSize(10).text('DIADEMA,', 36, signatureY);
    this.#drawLine(doc, 90, signatureY + 10, 130);
    this.#drawLine(doc, 145, signatureY + 10, 185);
    this.#drawLine(doc, 200, signatureY + 10, 245);
    this.#drawLine(doc, 350, signatureY + 10, 540);
    doc.fontSize(8).text('NOME E ASSINATURA', 405, signatureY + 15);
  }

  #field(doc, label, value, x, y, width) {
    const labelWidth = doc.widthOfString(label) + 4;
    doc.text(label, x, y);
    this.#drawLine(doc, x + labelWidth, y + 11, x + width);

    if (value) {
      doc.font('Helvetica-Bold').fontSize(8.5).text(String(value), x + labelWidth + 2, y - 1, {
        width: width - labelWidth - 4,
        height: 14,
        ellipsis: true
      });
      doc.font('Helvetica').fontSize(10);
    }
  }

  #cell(doc, value, column, y, align = 'left') {
    doc.text(String(value ?? ''), column.x + 4, y, {
      width: column.width - 8,
      height: table.rowHeight - 4,
      align,
      ellipsis: true
    });
  }

  #fitCell(doc, value, column, y, align = 'left', maxFontSize = 7.8, minFontSize = 5.2) {
    const text = String(value ?? '');
    const availableWidth = column.width - 8;
    let fontSize = maxFontSize;

    while (fontSize > minFontSize && doc.fontSize(fontSize).widthOfString(text) > availableWidth) {
      fontSize -= 0.2;
    }

    doc.fontSize(fontSize);
    this.#cell(doc, text, column, y, align);
    doc.fontSize(maxFontSize);
  }

  #money(value) {
    return `R$ ${Number(value ?? 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  #formatDeliveryDays(deliveryDays) {
    const labels = {
      MON: 'Seg',
      TUE: 'Ter',
      WED: 'Qua',
      THU: 'Qui',
      FRI: 'Sex',
      SAT: 'Sáb',
      SUN: 'Dom'
    };

    return Array.isArray(deliveryDays)
      ? deliveryDays.map((day) => labels[day]).filter(Boolean).join(', ')
      : '';
  }

  #formatReceivedTime(receivedTime) {
    const labels = {
      BUSINESS_HOURS: 'Horário comercial',
      MORNING: 'Manhã',
      AFTERNOON: 'Tarde'
    };

    return labels[receivedTime] || receivedTime || '';
  }

  #drawLine(doc, fromX, y, toX) {
    doc.moveTo(fromX, y).lineTo(toX, y).strokeColor('#231f20').lineWidth(0.7).stroke();
  }

  #drawVerticalLine(doc, x, fromY, toY) {
    doc.moveTo(x, fromY).lineTo(x, toY).strokeColor('#231f20').lineWidth(0.8).stroke();
  }

  #drawBrandIcon(doc, x, y) {
    doc.circle(x, y, 14).fill('#231f20');
    doc.circle(x, y, 7).fill('#ffffff');
    doc.circle(x, y + 2, 4).fill('#231f20');
  }
}

export default new PdfService();
