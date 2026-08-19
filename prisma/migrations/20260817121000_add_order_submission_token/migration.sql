ALTER TABLE `orders`
  ADD COLUMN `submissionToken` VARCHAR(64) NULL;

CREATE UNIQUE INDEX `orders_submissionToken_key`
  ON `orders`(`submissionToken`);
