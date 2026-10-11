-- Open every day, Monday to Sunday, 10:00-22:00 (minutes from local midnight, Africa/Casablanca).
INSERT INTO `opening_hours` (`weekday`, `openMinute`, `closeMinute`, `closed`) VALUES
    (0, 600, 1320, false),
    (1, 600, 1320, false),
    (2, 600, 1320, false),
    (3, 600, 1320, false),
    (4, 600, 1320, false),
    (5, 600, 1320, false),
    (6, 600, 1320, false)
ON DUPLICATE KEY UPDATE
    `openMinute` = VALUES(`openMinute`),
    `closeMinute` = VALUES(`closeMinute`),
    `closed` = VALUES(`closed`);
