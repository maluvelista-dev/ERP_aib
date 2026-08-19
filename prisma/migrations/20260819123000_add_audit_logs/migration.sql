CREATE TABLE `audit_logs` (
  `id` VARCHAR(191) NOT NULL,
  `actorId` VARCHAR(191) NULL,
  `action` VARCHAR(80) NOT NULL,
  `entityType` VARCHAR(40) NOT NULL,
  `entityId` VARCHAR(191) NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `audit_logs_actorId_createdAt_idx` (`actorId`, `createdAt`),
  INDEX `audit_logs_entityType_entityId_createdAt_idx` (`entityType`, `entityId`, `createdAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `audit_logs_actorId_fkey`
    FOREIGN KEY (`actorId`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
