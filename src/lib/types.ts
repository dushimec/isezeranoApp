import { ObjectId } from "mongodb";

export type Role = 'ADMIN' | 'SECRETARY' | 'DISCIPLINARIAN' | 'PRESIDENT' | 'SINGER' | 'SECTION_LEADER';

export interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    username?: string;
    profileImage?: string;
    email?: string;
    role?: Role;
    registrationNumber?: string;
    isActive?: boolean;
    forcePasswordChange?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserDocument extends Document {
  _id: ObjectId;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  profileImage?: string;
  email: string;
  password?: string; 
  role: Role;
  registrationNumber?: string;
  isActive?: boolean;
  forcePasswordChange?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AnnouncementPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority?: AnnouncementPriority;
  createdBy: User;
  createdAt: Date;
}

export type TUser = User;

export type EventType = 'REHEARSAL' | 'SERVICE' | 'OTHER';
export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string;
  attendees: any[];
}

export type ClaimStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
export type ClaimSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export interface Claim {
  id: string;
  title: string;
  description?: string;
  severity: ClaimSeverity;
  status: ClaimStatus;
  createdAt: string | Date;
  attachment?: string;
  isAnonymous?: boolean;
  submittedById?: string;
  submittedBy?: User;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export interface Attendance {
  id: string;
  userId?: string;
  eventId?: string;
  user?: User;
  event?: Event;
  status: AttendanceStatus;
}

export interface Rehearsal {
    id: string;
    title: string;
    date: string;
    time: string;
    notes?: string;
    attendees: ObjectId[];
    createdById: ObjectId;
}

export interface RehearsalDocument extends Document {
    _id: ObjectId;
    title: string;
    date: Date;
    time: string;
    notes?: string;
    attendees: ObjectId[];
    createdById: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type ServiceType = 'Amateraniro ya 1' | 'Amateraniro ya 2' | 'Amateraniro ya 3';

export interface Service {
    id: string;
    title: string;
    date: string;
    time: string;
    churchLocation: string;
    serviceType: ServiceType;
    attire?: string;
    notes?: string;
    createdById: ObjectId;
}

export interface Notification {
    id: string;
    userId: ObjectId;
    rehearsalId?: ObjectId;
    serviceId?: ObjectId;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}
