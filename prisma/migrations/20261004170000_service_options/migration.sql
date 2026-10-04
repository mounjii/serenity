-- CreateTable
CREATE TABLE `service_options` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `durationMinutes` INTEGER NOT NULL,
    `priceCents` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `service_options_serviceId_durationMinutes_key`(`serviceId`, `durationMinutes`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service_options` ADD CONSTRAINT `service_options_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep the existing duration and price of every service as its first option.
INSERT INTO `service_options` (`id`, `serviceId`, `durationMinutes`, `priceCents`, `active`, `createdAt`, `updatedAt`)
SELECT CONCAT('opt', LEFT(`id`, 22)), `id`, `durationMinutes`, `priceCents`, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `services`;

-- AlterTable
ALTER TABLE `services` DROP COLUMN `durationMinutes`,
    DROP COLUMN `priceCents`;
