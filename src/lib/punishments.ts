
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { EventType, UserDocument } from '@/lib/types';
import { t } from '@/utils/i18n';

const PUNISHMENT_THRESHOLD = 4;
const LATE_WARNING_THRESHOLD = 3;
const LATE_PUNISHMENT_THRESHOLD = 4;

async function createNotification(userId: ObjectId, title: string, message: string) {
    const client = await clientPromise;
    const db = client.db();
    await db.collection('notifications').insertOne({
        userId,
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


export async function checkAbsencePunishment(userId: ObjectId, lang: string | undefined, eventType: EventType, session?: string) {
    const client = await clientPromise;
    const db = client.db();

    const query: any = { userId };
    if (eventType === 'SERVICE') {
        query.session = session;
    }

    const userAttendance = await db.collection('attendance').find(query).sort({ eventDate: -1 }).limit(PUNISHMENT_THRESHOLD).toArray();

    if (userAttendance.length === PUNISHMENT_THRESHOLD && userAttendance.every(a => a.status === 'ABSENT')) {
        const disciplinarian = await getDisplinarian();
        if (disciplinarian) {
            await createNotification(
                disciplinarian._id,
                t("punishments.punishment_alert_title", undefined, { lang }),
                t("punishments.absence_punishment_message", { singerId: userId.toHexString(), count: PUNISHMENT_THRESHOLD, eventType, session }, { lang })
            );
        }
    }
}

export async function checkLateness(userId: ObjectId, lang: string | undefined, eventType: EventType, session?: string) {
    const client = await clientPromise;
    const db = client.db();

    const query: any = { userId, status: 'LATE' };
    if (eventType === 'SERVICE') {
        query.session = session;
    }

    const latenessCount = await db.collection('attendance').countDocuments(query);

    if (latenessCount >= LATE_PUNISHMENT_THRESHOLD) {
        const disciplinarian = await getDisplinarian();
        if (disciplinarian) {
            await createNotification(
                disciplinarian._id,
                t("punishments.punishment_alert_title", undefined, { lang }),
                t("punishments.lateness_punishment_message", { singerId: userId.toHexString(), count: latenessCount, eventType, session }, { lang })
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
