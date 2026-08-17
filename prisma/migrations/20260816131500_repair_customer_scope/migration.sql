-- Completa com segurança a migration de escopo de clientes quando o banco
-- manteve o ALTER TABLE inicial, mas interrompeu as comparações por collation.
CREATE TEMPORARY TABLE `customer_owner_map` (
  `oldCustomerId` VARCHAR(191) NOT NULL,
  `ownerId` VARCHAR(191) NOT NULL,
  `newCustomerId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`oldCustomerId`, `ownerId`),
  UNIQUE INDEX `customer_owner_map_new_id_key` (`newCustomerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `customer_owner_map` (`oldCustomerId`, `ownerId`, `newCustomerId`)
SELECT
  owners.`customerId`,
  owners.`createdById`,
  IF(
    owners.`createdById` = (
      SELECT MIN(first_owner.`createdById`)
      FROM `orders` first_owner
      WHERE first_owner.`customerId` = owners.`customerId`
    ),
    owners.`customerId`,
    UUID()
  )
FROM (
  SELECT DISTINCT `customerId`, `createdById`
  FROM `orders`
) owners;

INSERT INTO `customer_owner_map` (`oldCustomerId`, `ownerId`, `newCustomerId`)
SELECT
  customer.`id`,
  COALESCE(
    (SELECT admin_user.`id` FROM `users` admin_user WHERE admin_user.`role` = 'ADMIN' LIMIT 1),
    (SELECT first_user.`id` FROM `users` first_user LIMIT 1)
  ),
  customer.`id`
FROM `customers` customer
WHERE NOT EXISTS (
  SELECT 1 FROM `orders` existing_order WHERE existing_order.`customerId` = customer.`id`
);

INSERT INTO `customers` (
  `id`, `createdById`, `cnpj`, `legalName`, `tradeName`, `phone`, `whatsapp`,
  `email`, `zipCode`, `street`, `number`, `district`, `city`, `state`, `active`,
  `searchKeywords`, `createdAt`, `updatedAt`
)
SELECT
  ownership.`newCustomerId`, ownership.`ownerId`, customer.`cnpj`, customer.`legalName`,
  customer.`tradeName`, customer.`phone`, customer.`whatsapp`, customer.`email`,
  customer.`zipCode`, customer.`street`, customer.`number`, customer.`district`,
  customer.`city`, customer.`state`, customer.`active`, customer.`searchKeywords`,
  customer.`createdAt`, customer.`updatedAt`
FROM `customer_owner_map` ownership
INNER JOIN `customers` customer ON customer.`id` = ownership.`oldCustomerId`
WHERE ownership.`newCustomerId` <> ownership.`oldCustomerId`;

UPDATE `customers` customer
INNER JOIN `customer_owner_map` ownership
  ON ownership.`oldCustomerId` = customer.`id`
  AND ownership.`newCustomerId` = customer.`id`
SET customer.`createdById` = ownership.`ownerId`;

UPDATE `orders` existing_order
INNER JOIN `customer_owner_map` ownership
  ON ownership.`oldCustomerId` = existing_order.`customerId`
  AND ownership.`ownerId` = existing_order.`createdById`
SET existing_order.`customerId` = ownership.`newCustomerId`;

DROP TEMPORARY TABLE `customer_owner_map`;

ALTER TABLE `customers`
  MODIFY `createdById` VARCHAR(191)
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

CREATE UNIQUE INDEX `customers_createdById_cnpj_key`
  ON `customers`(`createdById`, `cnpj`);
CREATE INDEX `customers_createdById_idx` ON `customers`(`createdById`);

ALTER TABLE `customers`
  ADD CONSTRAINT `customers_createdById_fkey`
  FOREIGN KEY (`createdById`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
