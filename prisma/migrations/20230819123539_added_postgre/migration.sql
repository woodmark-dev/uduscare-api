-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "verificationId" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "dateOfBirth" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'User',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointments" (
    "id" SERIAL NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "actualDate" TEXT NOT NULL,
    "appointmentTime" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'Doctor Appointment',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "test" BOOLEAN NOT NULL DEFAULT false,
    "testDetails" TEXT,
    "testResults" TEXT,
    "pharmacy" BOOLEAN NOT NULL DEFAULT false,
    "pharmacyDetail" TEXT,

    CONSTRAINT "Appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dates" (
    "appointmentDate" TEXT NOT NULL,

    CONSTRAINT "Dates_pkey" PRIMARY KEY ("appointmentDate")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_actualDate_fkey" FOREIGN KEY ("actualDate") REFERENCES "Dates"("appointmentDate") ON DELETE RESTRICT ON UPDATE CASCADE;
