
import type { ObjectId, WithId } from 'mongodb';

export type Role = 'ADMIN' | 'SECRETARY' | 'DISCIPLINARIAN' | 'SINGER';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type EventType = 'REHEARSAL' | 'SERVICE';

export type User = {
  _id: ObjectId;
  id: string; // string version of _id
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  profileImage?: string;
  role: Role;
  password?: string; // Will be excluded in most queries
  isActive: boolean;
  forcePasswordChange: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Announcement = {
  _id: ObjectId;
  id: string;
  title: string;
  message: string;
  attachment?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  createdById: ObjectId;
  createdBy: { // Populated field
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type Notification = {
    _id: ObjectId;
    id: string;
    title: string;
    message: string;
    senderRole: Role;
    userId: ObjectId;
    isRead: boolean;
    createdAt: Date;
};

export type Rehearsal = {
    _id: ObjectId;
    id: string;
    title: string;
    date: Date;
    time: string;
    location: string;
    notes?: string;
    createdById: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type Service = {
    _id: ObjectId;
    id: string;
    title: string;
    date: Date;
    time: string;
    churchLocation: string;
    attire?: string;
    notes?: string;
    createdById: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}


// A simplified, combined type for displaying events
export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: {userId: string}[];
  type: EventType;
};


export type Attendance = {
    id: string;
    status: AttendanceStatus;
    user: {
        firstName: string;
        lastName: string;
    };
    event: {
        title: string;
        date: string;
    };
};

// Raw MongoDB document types
export type UserDocument = WithId<Omit<User, 'id'>>;
export type AnnouncementDocument = WithId<Omit<Announcement, 'id' | 'createdBy'>>;
export type RehearsalDocument = WithId<Omit<Rehearsal, 'id'>>;
export type ServiceDocument = WithId<Omit<Service, 'id'>>;
export type AttendanceDocument = WithId<Omit<Attendance, 'id' | 'user' | 'event'>>;
