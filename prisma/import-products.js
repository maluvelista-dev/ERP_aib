import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { prisma } from '../src/config/prisma.js';
import { ProductCategoryModel } from '../src/models/ProductCategoryModel.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const productsPath = join(currentDir, 'catalog-products.json');
const categoriesPath = join(currentDir, 'product-categories.json');
const products = JSON.parse(await readFile(productsPath, 'utf8'));
const categories = JSON.parse(await readFile(categoriesPath, 'utf8'));

const categoryByName = new Map();

for (const category of categories) {
  const slug = ProductCategoryModel.normalizeSlug(category.name);
  const savedCategory = await prisma.productCategory.upsert({
    where: { slug },
    update: {
      name: category.name,
      description: category.description,
      active: true
    },
    create: {
      name: category.name,
      slug,
      description: category.description,
      active: true
    }
  });

  categoryByName.set(category.name, savedCategory);
}

let imported = 0;

for (const product of products) {
  const category = categoryByName.get(product.category) ?? categoryByName.get('Linha Premium');

  await prisma.product.upsert({
    where: { code: product.code },
    update: {
      name: product.name,
      category: category.name,
      categoryId: category.id,
      description: product.description,
      unitPrice: product.unitPrice,
      boxPrice: product.boxPrice,
      active: product.active
    },
    create: {
      code: product.code,
      name: product.name,
      category: category.name,
      categoryId: category.id,
      description: product.description,
      unitPrice: product.unitPrice,
      boxPrice: product.boxPrice,
      active: product.active
    }
  });

  imported += 1;
}

const productsWithoutCategory = await prisma.product.findMany({
  where: { categoryId: null }
});

for (const product of productsWithoutCategory) {
  const category = categoryByName.get(product.category) ?? categoryByName.get('Velas Comuns');

  await prisma.product.update({
    where: { id: product.id },
    data: {
      category: category.name,
      categoryId: category.id
    }
  });
}

console.log(`Imported ${categories.length} categories.`);
console.log(`Imported ${imported} products.`);
console.log(`Linked ${productsWithoutCategory.length} existing products without category.`);

await prisma.$disconnect();
