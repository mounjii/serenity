CREATE TABLE `password_resets` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(10) NOT NULL,
    `codeHash` VARCHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `password_resets_customerId_idx`(`customerId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `password_resets_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
