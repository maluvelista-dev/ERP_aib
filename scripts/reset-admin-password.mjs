import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';

const email = String(process.env.ADMIN_EMAIL ?? 'admin@aibvelas.com.br').trim().toLowerCase();
const temporaryPassword = `Aib!${randomBytes(18).toString('base64url')}`;
const passwordHash = await bcrypt.hash(
  temporaryPassword,
  Number(process.env.BCRYPT_SALT_ROUNDS ?? 12)
);

try {
  await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Administrador AIB',
      passwordHash,
      role: 'ADMIN',
      active: true,
      approvalStatus: 'APPROVED'
    },
    create: {
      name: 'Administrador AIB',
      email,
      passwordHash,
      role: 'ADMIN',
      active: true,
      approvalStatus: 'APPROVED'
    }
  });

  console.log('\nAdministrador criado ou atualizado com sucesso.');
  console.log(`E-mail: ${email}`);
  console.log(`Senha temporária: ${temporaryPassword}`);
  console.log('Guarde esta senha agora: ela não será exibida novamente.\n');
} finally {
  await prisma.$disconnect();
}
