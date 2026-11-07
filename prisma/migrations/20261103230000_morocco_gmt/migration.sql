-- Morocco returned to GMT at 01:00 UTC on 20 September 2026. Appointments saved
-- while the runtime still treated Casablanca as UTC+1 were stored one hour early.
-- Move those appointment instants forward so the booked wall-clock time stays put.
UPDATE `bookings`
SET
    `startAt` = DATE_ADD(`startAt`, INTERVAL 1 HOUR),
    `endAt` = DATE_ADD(`endAt`, INTERVAL 1 HOUR),
    `blockedUntil` = DATE_ADD(`blockedUntil`, INTERVAL 1 HOUR),
    `confirmationExpiresAt` = CASE
        WHEN `confirmationExpiresAt` IS NULL THEN NULL
        ELSE DATE_ADD(`confirmationExpiresAt`, INTERVAL 1 HOUR)
    END
WHERE `startAt` >= '2026-09-20 01:00:00.000';
