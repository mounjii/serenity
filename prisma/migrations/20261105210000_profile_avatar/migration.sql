ALTER TABLE `customers`
    ADD COLUMN `avatar` LONGBLOB NULL,
    ADD COLUMN `avatarType` VARCHAR(20) NULL;

ALTER TABLE `admin_accounts`
    ADD COLUMN `avatar` LONGBLOB NULL,
    ADD COLUMN `avatarType` VARCHAR(20) NULL;
