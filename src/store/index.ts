
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './adminSlice';
import announcementsReducer from './announcementsSlice';
import attendanceReducer from './attendanceSlice';
import authReducer from './authSlice';
import disciplinarianReducer from './disciplinarianSlice';
import secretaryReducer from './secretarySlice';
import sectionLeaderReducer from './sectionLeaderSlice';
import singerReducer from './singerSlice';
import profileReducer from './profileSlice';
import rehearsalsReducer from './rehearsalsSlice';
import servicesReducer from './servicesSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    announcements: announcementsReducer,
    attendance: attendanceReducer,
    auth: authReducer,
    disciplinarian: disciplinarianReducer,
    secretary: secretaryReducer,
    sectionLeader: sectionLeaderReducer,
    singer: singerReducer,
    profile: profileReducer,
    rehearsals: rehearsalsReducer,
    services: servicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
