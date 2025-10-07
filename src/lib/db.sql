-- Drop existing tables in reverse order of creation to avoid foreign key constraints
DROP TABLE IF EXISTS "Attendance" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Announcement" CASCADE;
DROP TABLE IF EXISTS "Service" CASCADE;
DROP TABLE IF EXISTS "Rehearsal" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS "Role";
DROP TYPE IF EXISTS "Priority";
DROP TYPE IF EXISTS "SenderRole";
DROP TYPE IF EXISTS "AttendanceEventType";
DROP TYPE IF EXISTS "AttendanceStatus";


-- Create ENUM types
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SECRETARY', 'DISCIPLINARIAN', 'SINGER');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "SenderRole" AS ENUM ('ADMIN', 'SECRETARY');
CREATE TYPE "AttendanceEventType" AS ENUM ('REHEARSAL', 'SERVICE');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- Create User Table
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) UNIQUE,
    "email" VARCHAR(255) UNIQUE,
    "profileImage" VARCHAR(255),
    "role" "Role" NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Announcement Table
CREATE TABLE "Announcement" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "attachment" VARCHAR(255),
    "priority" "Priority" DEFAULT 'MEDIUM',
    "createdById" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Notification Table
CREATE TABLE "Notification" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "senderRole" "SenderRole" NOT NULL,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Rehearsal Table
CREATE TABLE "Rehearsal" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "createdById" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Service Table
CREATE TABLE "Service" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME NOT NULL,
    "churchLocation" VARCHAR(255) NOT NULL,
    "attire" VARCHAR(255),
    "notes" TEXT,
    "createdById" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Attendance Table
CREATE TABLE "Attendance" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "eventType" "AttendanceEventType" NOT NULL,
    "eventId" UUID NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "markedById" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add Indexes
CREATE UNIQUE INDEX "user_username_key" ON "User"("username");
CREATE UNIQUE INDEX "user_email_key" ON "User"("email");
CREATE INDEX "user_role_idx" ON "User"("role");
CREATE INDEX "announcement_createdById_idx" ON "Announcement"("createdById");
CREATE INDEX "notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "rehearsal_createdById_idx" ON "Rehearsal"("createdById");
CREATE INDEX "service_createdById_idx" ON "Service"("createdById");
CREATE INDEX "attendance_userId_idx" ON "Attendance"("userId");
CREATE INDEX "attendance_eventId_idx" ON "Attendance"("eventId");
CREATE INDEX "attendance_markedById_idx" ON "Attendance"("markedById");
