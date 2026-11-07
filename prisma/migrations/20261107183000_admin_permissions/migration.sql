ALTER TABLE `admin_accounts` ADD COLUMN `permissions` VARCHAR(120) NOT NULL DEFAULT '';

-- Staff created before areas existed could already use the dashboard, except Members & offers.
UPDATE `admin_accounts`
SET `permissions` = 'dashboard,bookings,prices,closed,notifications,activity'
WHERE `role` = 'STAFF';
