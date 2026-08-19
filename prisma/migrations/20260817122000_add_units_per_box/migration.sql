ALTER TABLE `products`
  ADD COLUMN `unitsPerBox` INTEGER NULL AFTER `boxPrice`;

UPDATE `products`
SET `unitsPerBox` = ROUND(`boxPrice` / `unitPrice`)
WHERE `boxPrice` IS NOT NULL
  AND `unitPrice` > 0
  AND ROUND(`boxPrice` / `unitPrice`) > 0
  AND ABS((`boxPrice` / `unitPrice`) - ROUND(`boxPrice` / `unitPrice`)) < 0.01;

ALTER TABLE `order_items`
  ADD COLUMN `unitsPerBox` INTEGER NULL AFTER `boxPrice`;

UPDATE `order_items` AS `item`
INNER JOIN `products` AS `product` ON `product`.`id` = `item`.`productId`
SET `item`.`unitsPerBox` = `product`.`unitsPerBox`
WHERE `item`.`productId` IS NOT NULL;
