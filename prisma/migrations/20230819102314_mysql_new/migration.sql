-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `sex` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `verificationId` VARCHAR(191) NULL,
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `dateOfBirth` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'User',

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `actualDate` VARCHAR(191) NOT NULL,
    `appointmentTime` VARCHAR(191) NOT NULL,
    `stage` VARCHAR(191) NOT NULL DEFAULT 'Doctor Appointment',
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `test` BOOLEAN NOT NULL DEFAULT false,
    `testDetails` VARCHAR(191) NULL,
    `testResults` VARCHAR(191) NULL,
    `pharmacy` BOOLEAN NOT NULL DEFAULT false,
    `pharmacyDetail` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dates` (
    `appointmentDate` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`appointmentDate`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Appointments` ADD CONSTRAINT `Appointments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointments` ADD CONSTRAINT `Appointments_actualDate_fkey` FOREIGN KEY (`actualDate`) REFERENCES `Dates`(`appointmentDate`) ON DELETE RESTRICT ON UPDATE CASCADE;
