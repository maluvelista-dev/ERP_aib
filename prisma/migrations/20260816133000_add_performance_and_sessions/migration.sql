CREATE TABLE `web_sessions` (
  `id` VARCHAR(191) NOT NULL,
  `data` JSON NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `web_sessions_expiresAt_idx` (`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `customers_createdById_active_createdAt_idx`
  ON `customers`(`createdById`, `active`, `createdAt`);

CREATE INDEX `products_active_categoryId_sortOrder_idx`
  ON `products`(`active`, `categoryId`, `sortOrder`);

CREATE INDEX `orders_createdById_createdAt_idx`
  ON `orders`(`createdById`, `createdAt`);
