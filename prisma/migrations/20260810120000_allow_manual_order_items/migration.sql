ALTER TABLE `order_items`
  DROP FOREIGN KEY `order_items_productId_fkey`;

ALTER TABLE `order_items`
  MODIFY `productId` VARCHAR(191) NULL;

ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_productId_manual_fkey`
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
