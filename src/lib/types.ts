import { ObjectId } from "mongodb";

export type Role = 'SINGER' | 'SECRETARY' | 'DISCIPLINARIAN' | 'PRESIDENT';

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    registrationNumber: string;
    isActive: boolean;
}

export interface UserDocument extends Document {
  _id: ObjectId;
  fullName: string;
  email: string;
  password?: string; 
  role: Role;
  registrationNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rehearsal {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    notes?: string;
    attendees: ObjectId[];
    createdById: ObjectId;
}

export interface RehearsalDocument extends Document {
    _id: ObjectId;
    title: string;
    date: Date;
    time: string;
    location: string;
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
