import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ documentId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId } = await params;
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      project: {
        OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }]
      }
    },
    include: {
      draft: true,
      currentVersion: true
    }
  });

  if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  return NextResponse.json({
    id: document.id,
    name: document.name,
    width: document.width,
    height: document.height,
    data: document.draft?.data ?? document.currentVersion?.data
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId } = await params;
  const body = await request.json().catch(() => null);
  const data = body?.data;

  if (!data) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      project: {
        OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }]
      }
    }
  });

  if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  await prisma.documentDraft.upsert({
    where: { documentId },
    update: { data },
    create: { documentId, data }
  });

  return NextResponse.json({ ok: true });
}
