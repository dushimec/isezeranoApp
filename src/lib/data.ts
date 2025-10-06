export type User = {
  id: string;
  name: string;
  phone: string;
  role: 'Singer' | 'Secretary' | 'Disciplinarian' | 'Admin';
  avatar: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
};

export type Event = {
  id: string;
  title: string;
  date: Date;
  location: string;
  attire: string;
};

export const users: User[] = [
  { id: 'usr_1', name: 'John Doe', phone: '+1-202-555-0104', role: 'Singer', avatar: 'https://picsum.photos/seed/avatar1/200/200' },
  { id: 'usr_2', name: 'Jane Smith', phone: '+1-202-555-0186', role: 'Secretary', avatar: 'https://picsum.photos/seed/avatar2/200/200' },
  { id: 'usr_3', name: 'Peter Jones', phone: '+1-202-555-0193', role: 'Disciplinarian', avatar: 'https://picsum.photos/seed/avatar3/200/200' },
  { id: 'usr_4', name: 'Mary Johnson', phone: '+1-202-555-0199', role: 'Admin', avatar: 'https://picsum.photos/seed/avatar4/200/200' },
  { id: 'usr_5', name: 'Chris Lee', phone: '+1-202-555-0158', role: 'Singer', avatar: 'https://picsum.photos/seed/avatar5/200/200' },
  { id: 'usr_6', name: 'Patricia Brown', phone: '+1-202-555-0143', role: 'Singer', avatar: 'https://picsum.photos/seed/avatar6/200/200' },
];

export const announcements: Announcement[] = [
  { id: 'ann_1', title: 'Upcoming Rehearsal Canceled', content: 'The rehearsal scheduled for this Friday has been canceled due to unforeseen circumstances. Please spread the word.', author: 'Jane Smith', createdAt: '2024-07-28T10:00:00Z' },
  { id: 'ann_2', title: 'New Song Practice', content: 'We will be practicing a new song "He Reigns" this coming Sunday. Please listen to it beforehand.', author: 'Jane Smith', createdAt: '2024-07-27T15:30:00Z' },
  { id: 'ann_3', title: 'Uniform Reminder', content: 'Please remember to wear the full white uniform for this weekend\'s service. No exceptions.', author: 'Peter Jones', createdAt: '2024-07-26T09:00:00Z' },
];

export const events: Event[] = [
  { id: 'evt_1', title: 'Weekend Service', date: new Date('2024-08-04T10:00:00'), location: 'Main Sanctuary', attire: 'Full White Uniform' },
  { id: 'evt_2', title: 'Mid-week Rehearsal', date: new Date('2024-08-07T18:30:00'), location: 'Choir Room', attire: 'Casual' },
  { id: 'evt_3', title: 'Special Event: Wedding', date: new Date('2024-08-10T14:00:00'), location: 'Community Hall', attire: 'Black & White' },
  { id: 'evt_4', title: 'Weekend Service', date: new Date('2024-08-11T10:00:00'), location: 'Main Sanctuary', attire: 'Blue & White' },
];

export const attendanceData = [
    { name: 'Jan', attendance: Math.floor(Math.random() * 20) + 80 },
    { name: 'Feb', attendance: Math.floor(Math.random() * 20) + 80 },
    { name: 'Mar', attendance: Math.floor(Math.random() * 20) + 80 },
    { name: 'Apr', attendance: Math.floor(Math.random() * 20) + 80 },
    { name: 'May', attendance: Math.floor(Math.random() * 20) + 80 },
    { name: 'Jun', attendance: Math.floor(Math.random() * 20) + 80 },
];
