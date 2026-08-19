ALTER TABLE `customers`
  ADD COLUMN `retentionUntil` DATETIME(3) NULL,
  ADD COLUMN `anonymizedAt` DATETIME(3) NULL;

ALTER TABLE `orders`
  MODIFY `customerId` VARCHAR(191) NULL,
  ADD COLUMN `archivedAt` DATETIME(3) NULL,
  ADD COLUMN `retentionUntil` DATETIME(3) NULL,
  ADD COLUMN `anonymizedAt` DATETIME(3) NULL;

UPDATE `orders`
SET `retentionUntil` = DATE_ADD(`createdAt`, INTERVAL 1825 DAY)
WHERE `retentionUntil` IS NULL;

UPDATE `customers`
SET `retentionUntil` = DATE_ADD(`updatedAt`, INTERVAL 1825 DAY)
WHERE `active` = FALSE AND `retentionUntil` IS NULL;

CREATE INDEX `orders_archivedAt_retentionUntil_idx`
  ON `orders`(`archivedAt`, `retentionUntil`);
