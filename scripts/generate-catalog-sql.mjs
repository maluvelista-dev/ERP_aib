import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const products = JSON.parse(await readFile(resolve(root, 'prisma/catalog-products.json'), 'utf8'));
const categories = JSON.parse(await readFile(resolve(root, 'prisma/product-categories.json'), 'utf8'));
const outputPath = resolve(root, 'artifacts/catalog-import/layerbase-products.sql');

const quote = (value) => value === null || value === undefined
  ? 'NULL'
  : `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "''")}'`;

const decimal = (value) => value === null || value === undefined
  ? 'NULL'
  : Number(value).toFixed(2);

const slugify = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const duplicateCodes = [...new Set(products
  .map((product) => product.code)
  .filter((code, index, all) => all.indexOf(code) !== index))];

if (duplicateCodes.length > 0) {
  throw new Error(`Duplicate product codes: ${duplicateCodes.join(', ')}`);
}

const knownCategories = new Set(categories.map((category) => category.name));
const unknownCategories = [...new Set(products
  .map((product) => product.category)
  .filter((category) => !knownCategories.has(category)))];

if (unknownCategories.length > 0) {
  throw new Error(`Unknown product categories: ${unknownCategories.join(', ')}`);
}

const lines = [
  '-- Catálogo Velas AIB / Tabela Comercial Abril 2026',
  `-- ${categories.length} categorias e ${products.length} produtos`,
  '-- Compatível com MySQL/MariaDB e seguro para reexecução.',
  '-- Execute as migrations do Prisma antes deste arquivo.',
  '',
  'SET NAMES utf8mb4;',
  'START TRANSACTION;',
  '',
  'INSERT INTO `product_categories`',
  '  (`id`, `name`, `slug`, `description`, `active`, `createdAt`, `updatedAt`)',
  'VALUES',
  categories.map((category) => [
    '  (UUID()',
    quote(category.name),
    quote(slugify(category.name)),
    quote(category.description),
    'TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))'
  ].join(', ')).join(',\n'),
  'ON DUPLICATE KEY UPDATE',
  '  `name` = VALUES(`name`),',
  '  `description` = VALUES(`description`),',
  '  `active` = TRUE,',
  '  `updatedAt` = CURRENT_TIMESTAMP(3);',
  ''
];

const chunkSize = 40;
for (let index = 0; index < products.length; index += chunkSize) {
  const chunk = products.slice(index, index + chunkSize);
  lines.push(
    'INSERT INTO `products`',
    '  (`id`, `code`, `name`, `category`, `categoryId`, `description`, `unitPrice`, `boxPrice`, `sortOrder`, `active`, `createdAt`, `updatedAt`)',
    'VALUES',
    chunk.map((product, chunkIndex) => [
      '  (UUID()',
      quote(product.code),
      quote(product.name),
      quote(product.category),
      `(SELECT \`id\` FROM \`product_categories\` WHERE \`slug\` = ${quote(slugify(product.category))} LIMIT 1)`,
      quote(product.description),
      decimal(product.unitPrice),
      decimal(product.boxPrice),
      String(index + chunkIndex + 1),
      `${product.active ? 'TRUE' : 'FALSE'}, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`
    ].join(', ')).join(',\n'),
    'ON DUPLICATE KEY UPDATE',
    '  `name` = VALUES(`name`),',
    '  `category` = VALUES(`category`),',
    '  `categoryId` = VALUES(`categoryId`),',
    '  `description` = VALUES(`description`),',
    '  `unitPrice` = VALUES(`unitPrice`),',
    '  `boxPrice` = VALUES(`boxPrice`),',
    '  `sortOrder` = VALUES(`sortOrder`),',
    '  `active` = VALUES(`active`),',
    '  `updatedAt` = CURRENT_TIMESTAMP(3);',
    ''
  );
}

lines.push(
  'COMMIT;',
  '',
  '-- Conferência',
  'SELECT COUNT(*) AS `catalog_products_found`',
  'FROM `products`',
  `WHERE \`code\` IN (${products.map((product) => quote(product.code)).join(', ')});`,
  ''
);

await writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`Generated ${outputPath}`);
console.log(`${categories.length} categories; ${products.length} unique products.`);
