import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const onlyDigits = (value) => value.replace(/\D/g, '');

class WhatsappService {
  async sendOrderPdf({ customer, order, pdfUrl }) {
    if (!env.whatsapp.token || !env.whatsapp.phoneNumberId) {
      throw new AppError('WhatsApp integration is not configured', 503);
    }

    if (!customer.whatsapp) {
      throw new AppError('O cliente não possui WhatsApp cadastrado', 422);
    }

    const url = `https://graph.facebook.com/${env.whatsapp.apiVersion}/${env.whatsapp.phoneNumberId}/messages`;
    const customerName = customer.legalName || customer.tradeName || 'cliente';
    const filename = `order_${order.orderNumber.replace('#', '')}_${customerName.replace(/\W+/g, '_').toLowerCase()}.pdf`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.whatsapp.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: onlyDigits(customer.whatsapp),
        type: 'document',
        document: {
          link: pdfUrl,
          filename,
          caption: `Hello, ${customerName}! Your order ${order.orderNumber} is attached.`
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new AppError('Failed to send order through WhatsApp', 502, error);
    }

    return response.json();
  }
}

export default new WhatsappService();
