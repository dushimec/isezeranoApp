
export type UserRole = 'ADMIN' | 'SECRETARY' | 'DISCIPLINARIAN' | 'SINGER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  profileImage?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: any; // Using `any` for Firestore Timestamp compatibility
  updatedAt: any; // Using `any` for Firestore Timestamp compatibility
}

export type AnnouncementPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  attachment?: string;
  priority: AnnouncementPriority;
  createdById: string;
  createdAt: any;
  updatedAt: any;
}

export type SenderRole = 'ADMIN' | 'SECRETARY';

export interface Notification {
  id: string;
  title: string;
  message: string;
  senderRole: SenderRole;
  userId: string;
  isRead: boolean;
  createdAt: any;
}

export interface Rehearsal {
  id: string;
  title: string;
  date: any; // Date
  time: string; // Time
  location: string;
  notes?: string;
  createdById: string;
  createdAt: any;
  updatedAt: any;
}

export interface Service {
  id: string;
  title: string;
  date: any; // Date
  time: string; // Time
  churchLocation: string;
  attire?: string;
  notes?: string;
  createdById: string;
  createdAt: any;
  updatedAt: any;
}

export type AttendanceEventType = 'REHEARSAL' | 'SERVICE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface Attendance {
  id: string;
  userId: string;
  eventType: AttendanceEventType;
  eventId: string;
  status: AttendanceStatus;
  markedById: string;
  createdAt: any;
}
