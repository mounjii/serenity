ALTER TABLE `customers`
    ADD COLUMN `email` VARCHAR(120) NULL,
    ADD COLUMN `preferredMassage` VARCHAR(80) NULL,
    ADD COLUMN `wellnessGoal` VARCHAR(20) NULL,
    ADD COLUMN `visitFrequency` VARCHAR(20) NULL,
    ADD COLUMN `discovery` VARCHAR(20) NULL,
    ADD UNIQUE INDEX `customers_email_key`(`email`);
