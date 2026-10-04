-- CreateTable
CREATE TABLE `services` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NOT NULL,
    `durationMinutes` INTEGER NOT NULL,
    `priceCents` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `services_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `therapists` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opening_hours` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `weekday` INTEGER NOT NULL,
    `openMinute` INTEGER NOT NULL,
    `closeMinute` INTEGER NOT NULL,
    `closed` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `opening_hours_weekday_key`(`weekday`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `closed_days` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `reason` VARCHAR(200) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `closed_days_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `therapistId` VARCHAR(191) NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `blockedUntil` DATETIME(3) NOT NULL,
    `durationMinutes` INTEGER NOT NULL,
    `priceCents` INTEGER NOT NULL,
    `customerName` VARCHAR(80) NOT NULL,
    `customerPhone` VARCHAR(20) NOT NULL,
    `note` VARCHAR(500) NULL,
    `status` ENUM('CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    `source` ENUM('ONLINE', 'ADMIN') NOT NULL DEFAULT 'ONLINE',
    `idempotencyKey` VARCHAR(100) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bookings_idempotencyKey_key`(`idempotencyKey`),
    INDEX `bookings_therapistId_startAt_idx`(`therapistId`, `startAt`),
    INDEX `bookings_status_startAt_idx`(`status`, `startAt`),
    INDEX `bookings_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_logs` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `recipient` ENUM('CUSTOMER', 'OWNER') NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `template` VARCHAR(60) NOT NULL,
    `payload` JSON NOT NULL,
    `provider` VARCHAR(30) NOT NULL,
    `status` ENUM('SENT', 'FAILED') NOT NULL,
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `therapists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
