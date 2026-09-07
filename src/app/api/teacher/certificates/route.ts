import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditService } from '@/modules/classroom/governance/audit.service';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    const certificates = await prisma.certificate.findMany({
      where: studentId ? { user_id: studentId } : {},
      orderBy: { issued_at: 'desc' },
    });

    const userIds = [...new Set(certificates.map((c) => c.user_id))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    const formatted = certificates.map((c) => ({
      id: c.id,
      studentId: c.user_id,
      studentName: userMap.get(c.user_id) || 'Student',
      title: c.title,
      category: c.category,
      grade: c.grade as 'DISTINCTION' | 'MERIT' | 'PASS',
      credentialCode: c.credential_code,
      issuedAt: c.issued_at.toISOString(),
    }));

    return NextResponse.json({ success: true, certificates: formatted });
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, classId, title, category, grade } = body;

    if (!studentId || !title || !category) {
      return NextResponse.json({ error: 'Missing required certificate fields' }, { status: 400 });
    }

    const credentialCode = `EDTX-${category.toUpperCase().slice(0, 4)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const cert = await prisma.certificate.create({
      data: {
        user_id: studentId,
        class_id: classId || null,
        issued_by: user.userId,
        title,
        category,
        grade: grade || 'DISTINCTION',
        credential_code: credentialCode,
      },
    });

    await AuditService.logAction({
      userId: user.userId,
      action: 'CERTIFICATE_ISSUE',
      entity: 'Certificate',
      entityId: cert.id,
      newValue: JSON.stringify({ studentId, title, credentialCode }),
    });

    return NextResponse.json({ success: true, certificate: cert });
  } catch (error: any) {
    console.error('Error issuing certificate:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
