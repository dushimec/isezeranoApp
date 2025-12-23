
import clientPromise from '@/lib/db';
import { EventType, UserDocument } from '@/lib/types';
import { t, Locale } from '@/utils/i18n';

const PUNISHMENT_THRESHOLD = 4;
const LATE_WARNING_THRESHOLD = 3;
const LATE_PUNISHMENT_THRESHOLD = 4;

import { ObjectId } from 'mongodb';

async function createNotification(userId: string | ObjectId, title: string, message: string) {
    const client = await clientPromise;
    const db = client.db();
    const userIdObj = typeof userId === 'string' ? (ObjectId.isValid(userId) ? new ObjectId(userId) : userId) : userId;
    await db.collection('notifications').insertOne({
        userId: userIdObj,
        title,
        message,
        isRead: false,
        createdAt: new Date(),
    });
}

async function getDisplinarian(){
    const client = await clientPromise;
    const db = client.db();
    const disciplinarian = await db.collection<UserDocument>('users').findOne({ role: 'DISCIPLINARIAN' });
    return disciplinarian;
}


export async function checkAbsencePunishment(userId: string, eventType: EventType, session?: string, lang?: Locale) {
    const client = await clientPromise;
    const db = client.db();

    const query: any = { userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId };
    if (eventType === 'SERVICE') {
        query.session = session;
    }

    const userAttendance = await db.collection('attendance').find(query).sort({ eventDate: -1 }).limit(PUNISHMENT_THRESHOLD).toArray();

    if (userAttendance.length === PUNISHMENT_THRESHOLD && userAttendance.every(a => a.status === 'ABSENT')) {
        const disciplinarian = await getDisplinarian();
        if (disciplinarian) {
            await createNotification(
                disciplinarian._id.toString(),
                t("punishments.punishment_alert_title", undefined, { lang }),
                t("punishments.absence_punishment_message", { singerId: userId, count: PUNISHMENT_THRESHOLD, eventType, session }, { lang })
            );
        }
    }
}

export async function checkLateness(userId: string, eventType: EventType, session?: string, lang?: Locale) {
    const client = await clientPromise;
    const db = client.db();

    const query: any = { userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId, status: 'LATE' };
    if (eventType === 'SERVICE') {
        query.session = session;
    }

    const latenessCount = await db.collection('attendance').countDocuments(query);

    if (latenessCount >= LATE_PUNISHMENT_THRESHOLD) {
        const disciplinarian = await getDisplinarian();
        if (disciplinarian) {
            await createNotification(
                disciplinarian._id.toString(),
                t("punishments.punishment_alert_title", undefined, { lang }),
                t("punishments.lateness_punishment_message", { singerId: userId, count: latenessCount, eventType, session }, { lang })
            );
        }
    } else if (latenessCount >= LATE_WARNING_THRESHOLD) {
        await createNotification(
            userId,
            t("punishments.lateness_warning_title", undefined, { lang }),
            t("punishments.lateness_warning_message", { count: latenessCount, eventType, session }, { lang })
        );
    }
}
