ALTER TABLE members
    ADD COLUMN email TEXT,
    ADD COLUMN phone_number TEXT,
    ADD COLUMN birthday_month INTEGER CHECK (birthday_month BETWEEN 1 AND 12),
    ADD COLUMN birthday_day INTEGER CHECK (birthday_day BETWEEN 1 AND 31);
