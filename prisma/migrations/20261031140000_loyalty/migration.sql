-- AlterTable
ALTER TABLE `customers` ADD COLUMN `birthday` DATE NULL,
    ADD COLUMN `points` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `discountCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `voucherId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `loyalty_ledgers` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NULL,
    `points` INTEGER NOT NULL,
    `reason` VARCHAR(40) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `loyalty_ledgers_customerId_createdAt_idx`(`customerId`, `createdAt`),
    INDEX `loyalty_ledgers_bookingId_idx`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vouchers` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `kind` ENUM('REWARD', 'BIRTHDAY', 'PERSONALIZED', 'PROMO') NOT NULL,
    `code` VARCHAR(16) NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `discountCents` INTEGER NULL,
    `discountPercent` INTEGER NULL,
    `serviceId` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `vouchers_code_key`(`code`),
    INDEX `vouchers_customerId_usedAt_idx`(`customerId`, `usedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loyalty_alerts` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `kind` ENUM('POINTS', 'TIER', 'BIRTHDAY', 'PERSONALIZED', 'PROMO', 'VOUCHER') NOT NULL,
    `payload` JSON NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `loyalty_alerts_customerId_createdAt_idx`(`customerId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `vouchers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX `bookings_voucherId_key` ON `bookings`(`voucherId`);

-- AddForeignKey
ALTER TABLE `loyalty_ledgers` ADD CONSTRAINT `loyalty_ledgers_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_ledgers` ADD CONSTRAINT `loyalty_ledgers_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vouchers` ADD CONSTRAINT `vouchers_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_alerts` ADD CONSTRAINT `loyalty_alerts_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
