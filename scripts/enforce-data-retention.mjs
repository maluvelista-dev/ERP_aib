import 'dotenv/config';
import StorageService from '../src/services/StorageService.js';

if (!process.env.GOVERNANCE_DATABASE_URL) {
  throw new Error('GOVERNANCE_DATABASE_URL é obrigatória para executar a política de retenção');
}

process.env.DATABASE_URL = process.env.GOVERNANCE_DATABASE_URL;
const { prisma } = await import('../src/config/prisma.js');

const apply = process.argv.includes('--apply');
const now = new Date();

const expiredOrders = await prisma.order.findMany({
  where: { retentionUntil: { lte: now }, anonymizedAt: null },
  select: { id: true, pdfUrl: true }
});
const expiredCustomers = await prisma.customer.findMany({
  where: { active: false, retentionUntil: { lte: now }, anonymizedAt: null },
  select: { id: true }
});

console.log(JSON.stringify({
  mode: apply ? 'apply' : 'dry-run',
  expiredOrders: expiredOrders.length,
  expiredCustomers: expiredCustomers.length
}, null, 2));

if (!apply) {
  console.log('Nenhum dado foi alterado. Use --apply somente após revisar o resultado.');
  await prisma.$disconnect();
  process.exit(0);
}

try {
  for (const order of expiredOrders) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        customerId: null,
        customerSnapshot: { anonymized: true },
        sellerSnapshot: { anonymized: true },
        notes: null,
        fiscalEmail: null,
        contactEmail: null,
        pdfUrl: null,
        whatsappSent: false,
        sentAt: null,
        whatsappError: null,
        archivedAt: now,
        anonymizedAt: now
      }
    });
    await StorageService.deletePdf(order.pdfUrl);
  }

  for (const customer of expiredCustomers) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        cnpj: null,
        legalName: 'Dados anonimizados',
        tradeName: null,
        phone: null,
        whatsapp: null,
        email: null,
        zipCode: null,
        street: null,
        number: null,
        district: null,
        city: null,
        state: null,
        searchKeywords: null,
        anonymizedAt: now
      }
    });
  }

  console.log('Política de retenção aplicada com sucesso.');
  await prisma.auditLog.create({
    data: {
      action: 'DATA_RETENTION_APPLIED',
      entityType: 'GOVERNANCE',
      metadata: {
        anonymizedOrders: expiredOrders.length,
        anonymizedCustomers: expiredCustomers.length
      }
    }
  });
} finally {
  await prisma.$disconnect();
}
