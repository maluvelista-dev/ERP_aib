-- AlterTable
ALTER TABLE `products` ADD COLUMN `boxPrice` DECIMAL(10, 2) NULL,
    ADD COLUMN `unitPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0;
