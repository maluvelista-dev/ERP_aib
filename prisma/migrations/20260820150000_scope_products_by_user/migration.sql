ALTER TABLE `products`
  ADD COLUMN `createdById` VARCHAR(191) NULL,
  ADD COLUMN `sourceProductId` VARCHAR(191) NULL;

DROP INDEX `products_code_key` ON `products`;

CREATE UNIQUE INDEX `products_createdById_code_key` ON `products`(`createdById`, `code`);
CREATE UNIQUE INDEX `products_createdById_sourceProductId_key` ON `products`(`createdById`, `sourceProductId`);
CREATE INDEX `products_createdById_active_categoryId_sortOrder_idx` ON `products`(`createdById`, `active`, `categoryId`, `sortOrder`);
CREATE INDEX `products_sourceProductId_idx` ON `products`(`sourceProductId`);

ALTER TABLE `products`
  ADD CONSTRAINT `products_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `products_sourceProductId_fkey` FOREIGN KEY (`sourceProductId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
