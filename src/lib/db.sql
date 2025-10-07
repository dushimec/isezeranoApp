-- Isezerano Choir Management System SQL Schema
-- This script contains CREATE TABLE statements for all database models.

-- User Roles Enum Type
CREATE TYPE user_role AS ENUM ('ADMIN', 'SECRETARY', 'DISCIPLINARIAN', 'SINGER');

-- 1. User Model
-- Stores all users in the system, regardless of their role.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    profile_image_url TEXT,
    role user_role NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraint for username/email based on role if necessary at application level.
-- For example, Admin must have an email.

-- Announcement Priority Enum Type
CREATE TYPE announcement_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- 2. Announcement Model
-- Stores all announcements posted by the Secretary or Admin.
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    priority announcement_priority DEFAULT 'MEDIUM',
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sender Role Enum Type
CREATE TYPE sender_role AS ENUM ('ADMIN', 'SECRETARY');

-- 3. Notification Model
-- Holds all in-app notifications sent to users.
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sender_role sender_role NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Rehearsal Model
-- Represents choir rehearsals managed by the Secretary.
CREATE TABLE rehearsals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    notes TEXT,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Service Model
-- Represents Sunday or event services where the choir performs.
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME NOT NULL,
    church_location VARCHAR(255) NOT NULL,
    attire VARCHAR(255),
    notes TEXT,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance Event Type Enum
CREATE TYPE event_type AS ENUM ('REHEARSAL', 'SERVICE');

-- Attendance Status Enum
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- 6. Attendance Model
-- Tracks participation of singers in both Rehearsals and Services.
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type event_type NOT NULL,
    event_id UUID NOT NULL,
    status attendance_status NOT NULL,
    marked_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX ON users (role);
CREATE INDEX ON announcements (created_by_id);
CREATE INDEX ON notifications (user_id);
CREATE INDEX ON rehearsals (created_by_id);
CREATE INDEX ON services (created_by_id);
CREATE INDEX ON attendance (user_id);
CREATE INDEX ON attendance (event_id);
CREATE INDEX ON attendance (marked_by_id);

-- Note: A composite index on (eventType, eventId) might be useful for attendance lookups.
CREATE INDEX ON attendance (event_type, event_id);

COMMENT ON TABLE users IS 'Stores all users in the system, regardless of their role.';
COMMENT ON TABLE announcements IS 'Stores all announcements posted by the Secretary or Admin.';
COMMENT ON TABLE notifications IS 'Holds all in-app notifications sent to users.';
COMMENT ON TABLE rehearsals IS 'Represents choir rehearsals managed by the Secretary.';
COMMENT ON TABLE services IS 'Represents Sunday or event services where the choir performs.';
COMMENT ON TABLE attendance IS 'Tracks participation of singers in both Rehearsals and Services.';

