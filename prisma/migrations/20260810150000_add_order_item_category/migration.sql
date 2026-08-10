ALTER TABLE `order_items`
  ADD COLUMN `category` VARCHAR(191) NULL;

UPDATE `order_items` AS `item`
INNER JOIN `products` AS `product` ON `product`.`id` = `item`.`productId`
SET `item`.`category` = `product`.`category`
WHERE `item`.`category` IS NULL;
