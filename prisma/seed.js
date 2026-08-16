import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';
import { ProductCategoryModel } from '../src/models/ProductCategoryModel.js';

const defaultProductCategory = await prisma.productCategory.upsert({
  where: { slug: ProductCategoryModel.normalizeSlug('Velas Comuns') },
  update: {
    name: 'Velas Comuns',
    description: 'Velas comuns por medida e uso diário.',
    active: true
  },
  create: {
    name: 'Velas Comuns',
    slug: ProductCategoryModel.normalizeSlug('Velas Comuns'),
    description: 'Velas comuns por medida e uso diário.',
    active: true
  }
});

const passwordHash = await bcrypt.hash('Admin@123456', Number(process.env.BCRYPT_SALT_ROUNDS ?? 12));
const sellerPasswordHash = await bcrypt.hash('Seller@123456', Number(process.env.BCRYPT_SALT_ROUNDS ?? 12));

const admin = await prisma.user.upsert({
  where: { email: 'admin@ordersweb.com' },
  update: {
    name: 'System Admin',
    role: 'ADMIN',
    active: true
  },
  create: {
    name: 'System Admin',
    email: 'admin@ordersweb.com',
    passwordHash,
    role: 'ADMIN',
    active: true
  }
});

const seller = await prisma.user.upsert({
  where: { email: 'seller@ordersweb.com' },
  update: {
    name: 'Demo Seller',
    role: 'SELLER',
    active: true
  },
  create: {
    name: 'Demo Seller',
    email: 'seller@ordersweb.com',
    passwordHash: sellerPasswordHash,
    role: 'SELLER',
    active: true
  }
});

const customer = await prisma.customer.upsert({
  where: {
    createdById_cnpj: {
      createdById: seller.id,
      cnpj: '12345678000190'
    }
  },
  update: {
    legalName: 'TechSolutions Tecnologia Ltda',
    tradeName: 'TechSolutions',
    whatsapp: '11987654321',
    active: true
  },
  create: {
    createdById: seller.id,
    cnpj: '12345678000190',
    legalName: 'TechSolutions Tecnologia Ltda',
    tradeName: 'TechSolutions',
    phone: '1133445566',
    whatsapp: '11987654321',
    email: 'contact@techsolutions.com',
    zipCode: '01311000',
    street: 'Av. Paulista',
    number: '1000',
    district: 'Bela Vista',
    city: 'Sao Paulo',
    state: 'SP',
    active: true,
    searchKeywords: ['12345678000190', 'techsolutions', 'tecnologia', 'ltda']
  }
});

const chair = await prisma.product.upsert({
  where: { code: 'PRD-001' },
  update: {
    name: 'Ergonomic Office Chair',
    category: defaultProductCategory.name,
    categoryId: defaultProductCategory.id,
    unitPrice: 499.9,
    boxPrice: null,
    active: true
  },
  create: {
    code: 'PRD-001',
    name: 'Ergonomic Office Chair',
    category: defaultProductCategory.name,
    categoryId: defaultProductCategory.id,
    description: 'Adjustable ergonomic chair with lumbar support.',
    unitPrice: 499.9,
    boxPrice: null,
    active: true
  }
});

const desk = await prisma.product.upsert({
  where: { code: 'PRD-002' },
  update: {
    name: 'Office Desk 120cm',
    category: defaultProductCategory.name,
    categoryId: defaultProductCategory.id,
    unitPrice: 350,
    boxPrice: null,
    active: true
  },
  create: {
    code: 'PRD-002',
    name: 'Office Desk 120cm',
    category: defaultProductCategory.name,
    categoryId: defaultProductCategory.id,
    description: 'Compact office desk with 120cm width.',
    unitPrice: 350,
    boxPrice: null,
    active: true
  }
});

const existingOrder = await prisma.order.findUnique({
  where: { orderNumber: '#100001' }
});

if (!existingOrder) {
  await prisma.order.create({
    data: {
      orderNumber: '#100001',
      customerId: customer.id,
      createdById: seller.id,
      customerSnapshot: {
        cnpj: customer.cnpj,
        legalName: customer.legalName,
        tradeName: customer.tradeName,
        whatsapp: customer.whatsapp,
        street: customer.street,
        number: customer.number,
        district: customer.district,
        city: customer.city,
        state: customer.state
      },
      status: 'DRAFT',
      items: {
        create: [
          {
            productId: chair.id,
            code: chair.code,
            name: chair.name,
            quantity: 5
          },
          {
            productId: desk.id,
            code: desk.code,
            name: desk.name,
            quantity: 2
          }
        ]
      }
    }
  });
}

console.log('Seed completed');
console.log('Admin login: admin@ordersweb.com / Admin@123456');
console.log('Seller login: seller@ordersweb.com / Seller@123456');

await prisma.$disconnect();
