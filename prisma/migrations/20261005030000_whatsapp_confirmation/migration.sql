-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `cancelReason` VARCHAR(20) NULL,
    ADD COLUMN `confirmationExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `confirmedAt` DATETIME(3) NULL,
    MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX `bookings_status_confirmationExpiresAt_idx` ON `bookings`(`status`, `confirmationExpiresAt`);

-- Bookings made before this change were confirmed automatically.
UPDATE `bookings` SET `confirmedAt` = `createdAt` WHERE `status` IN ('CONFIRMED', 'COMPLETED') AND `confirmedAt` IS NULL;
