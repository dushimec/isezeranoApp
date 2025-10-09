import { ObjectId } from "mongodb";

/**
 * @description Defines the roles within the choir management system.
 *
 * @property SINGER - A choir member who attends rehearsals and services.
 * Responsibilities:
 * - View rehearsal and service schedules.
 * - Track personal attendance history.
 * - Receive notifications about events, warnings, or disciplinary actions.
 *
 * @property SECRETARY - Manages the choir's schedule and communication.
 * Responsibilities:
 * - Create, edit, and delete rehearsals and services.
 * - Notify singers of any schedule changes.
 * - Manage the choir roster by adding new singers or deactivating existing ones.
 * - Set the default rehearsal day (e.g., Thursday).
 *
 * @property DISCIPLINARIAN - Enforces attendance and punctuality rules.
 * Responsibilities:
 * - Mark attendance for each singer at rehearsals (Present, Absent, Late).
 * - Monitor absenteeism and lateness patterns.
 * - Issue warnings and apply disciplinary actions based on established rules (e.g., absence from 4 consecutive rehearsals).
 * - Manage user accounts and assign roles.
 *
 * @property PRESIDENT - Oversees all choir activities and has full system access.
 * Responsibilities:
 * - View all schedules, attendance records, and disciplinary reports.
 * - Hold administrative privileges to manage all aspects of the system.
 * - Make final decisions on disciplinary matters.
 */
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
