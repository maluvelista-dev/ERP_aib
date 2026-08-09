ALTER TABLE `orders`
  ADD COLUMN `deliveryDays` JSON NULL,
  ADD COLUMN `notes` TEXT NULL;
