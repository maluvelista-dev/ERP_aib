import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';

const accounts = [
  { name: 'Super Admin', email: 'admin@aibvelas.com.br', role: 'ADMIN' },
  { name: 'Colaborador 1', email: 'colaborador1@aibvelas.com.br', role: 'SELLER' },
  { name: 'Colaborador 2', email: 'colaborador2@aibvelas.com.br', role: 'SELLER' }
];

const created = [];

try {
  for (const account of accounts) {
    const existing = await prisma.user.findUnique({ where: { email: account.email } });

    if (existing) {
      console.log(`Skipped existing account: ${account.email}`);
      continue;
    }

    const temporaryPassword = `A!${randomBytes(18).toString('base64url')}`;
    const passwordHash = await bcrypt.hash(
      temporaryPassword,
      Number(process.env.BCRYPT_SALT_ROUNDS ?? 12)
    );

    await prisma.user.create({
      data: {
        ...account,
        passwordHash,
        active: true
      }
    });

    created.push({
      name: account.name,
      email: account.email,
      role: account.role,
      temporaryPassword
    });
  }

  console.log('\nTemporary credentials (shown once):');
  console.log(JSON.stringify(created, null, 2));
} finally {
  await prisma.$disconnect();
}
