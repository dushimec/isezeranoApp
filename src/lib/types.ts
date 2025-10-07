import type { User as PrismaUser, Role, Announcement as PrismaAnnouncement, Notification as PrismaNotification, Rehearsal as PrismaRehearsal, Service as PrismaService, Attendance as PrismaAttendance, AttendanceStatus, EventType } from '@prisma/client';

export type { Role, AttendanceStatus, EventType };

export type User = Omit<PrismaUser, 'password'>;

export type Announcement = PrismaAnnouncement & {
  createdBy: {
    firstName: string;
    lastName: string;
  }
}

export type Notification = PrismaNotification;

export type Rehearsal = PrismaRehearsal;

export type Service = PrismaService;

export type Attendance = PrismaAttendance;

export type TUser = PrismaUser;
