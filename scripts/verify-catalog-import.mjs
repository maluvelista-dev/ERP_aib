import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { prisma } from '../src/config/prisma.js';

const catalog = JSON.parse(await readFile(
  new URL('../prisma/catalog-products.json', import.meta.url),
  'utf8'
));
const codes = catalog.map((product) => product.code);

try {
  const [categories, totalProducts, catalogProducts, withoutCategory, duplicateCodes, migrations] =
    await Promise.all([
      prisma.productCategory.count(),
      prisma.product.count(),
      prisma.product.count({ where: { code: { in: codes } } }),
      prisma.product.count({ where: { categoryId: null } }),
      prisma.$queryRawUnsafe(
        'SELECT COUNT(*) AS count FROM (SELECT code FROM products GROUP BY code HAVING COUNT(*) > 1) duplicates'
      ),
      prisma.$queryRawUnsafe(
        'SELECT COUNT(*) AS count FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL'
      )
    ]);

  console.log(JSON.stringify({
    categories,
    totalProducts,
    catalogProducts,
    expectedCatalogProducts: catalog.length,
    withoutCategory,
    duplicateCodes: Number(duplicateCodes[0].count),
    appliedMigrations: Number(migrations[0].count)
  }, null, 2));
} finally {
  await prisma.$disconnect();
}
