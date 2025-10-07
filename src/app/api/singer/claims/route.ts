
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { ClaimSeverity, ClaimStatus } from '@/lib/types';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, severity, isAnonymous, attachment } = await req.json();

    if (!title || !description || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    let attachmentUrl;
    if (attachment) {
        try {
            const uploadResult = await cloudinary.uploader.upload(attachment, {
                folder: 'isezerano_cms_claims',
            });
            attachmentUrl = uploadResult.secure_url;
        } catch (uploadError) {
            console.error('Cloudinary upload failed:', uploadError);
            return NextResponse.json({ error: 'Failed to upload attachment.' }, { status: 500 });
        }
    }

    const newClaim = {
        title,
        description,
        submittedById: new ObjectId(userId),
        isAnonymous: !!isAnonymous,
        status: 'PENDING' as ClaimStatus,
        severity: severity as ClaimSeverity,
        attachment: attachmentUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await db.collection('claims').insertOne(newClaim);
    
    // TODO: Notify Disciplinarians
    // This could be done via a separate notifications collection or another mechanism

    return NextResponse.json({ ...newClaim, id: result.insertedId.toHexString() }, { status: 201 });
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const client = await clientPromise;
        const db = client.db();

        const claims = await db.collection('claims').find({ submittedById: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();

        return NextResponse.json(claims.map(c => ({...c, id: c._id.toHexString()})));

    } catch (error) {
        console.error('Error fetching user claims:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
