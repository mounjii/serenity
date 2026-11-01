-- CreateTable
CREATE TABLE `admin_accounts` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `username` VARCHAR(40) NOT NULL,
    `passwordHash` VARCHAR(100) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_accounts_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
