ALTER TABLE `orders`
  ADD COLUMN `sellerSnapshot` JSON NULL,
  ADD COLUMN `discountPercent` DECIMAL(5, 2) NOT NULL DEFAULT 0,
  ADD COLUMN `discountAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN `bonusProductSnapshot` JSON NULL;
