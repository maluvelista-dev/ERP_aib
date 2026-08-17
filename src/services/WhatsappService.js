import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const brazilianWhatsappNumber = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
};

class WhatsappService {
  buildOrderShareUrl({ customer, order, pdfUrl }) {
    const phone = brazilianWhatsappNumber(customer.whatsapp);

    if (!phone) {
      throw new AppError('O cliente não possui WhatsApp cadastrado', 422);
    }

    const customerName = customer.legalName || customer.tradeName || 'cliente';
    const absolutePdfUrl = new URL(pdfUrl, env.publicAppUrl).href;
    const message = [
      `Olá, ${customerName}!`,
      `Segue o pedido ${order.orderNumber} da Velas AIB:`,
      absolutePdfUrl
    ].join('\n');

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
}

export default new WhatsappService();
