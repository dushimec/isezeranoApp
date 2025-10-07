
import type { User as PrismaUser, Role, Announcement as PrismaAnnouncement, Notification as PrismaNotification, Rehearsal as PrismaRehearsal, Service as PrismaService, Attendance as PrismaAttendance, Event as PrismaEvent, AttendanceStatus, EventType } from '@prisma/client';

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

export type Event = PrismaEvent & {
    attendees: PrismaAttendance[];
};

export type Attendance = PrismaAttendance & {
    user: {
        firstName: string;
        lastName: string;
    };
    event: {
        title: string;
    };
};

export type TUser = PrismaUser;
