ALTER TABLE `admin_accounts` ADD COLUMN `role` VARCHAR(10) NOT NULL DEFAULT 'STAFF';
UPDATE `admin_accounts` SET `role` = 'OWNER' WHERE `id` = 1;
ALTER TABLE `admin_accounts` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;
