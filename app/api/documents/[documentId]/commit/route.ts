import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId } = await params;
  const body = await request.json().catch(() => ({}));
  const label = typeof body?.label === "string" ? body.label : "Checkpoint";

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      project: {
        OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }]
      }
    },
    include: { draft: true, currentVersion: true }
  });

  if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  if (!document.draft) return NextResponse.json({ error: "No draft available" }, { status: 400 });

  const version = await prisma.documentVersion.create({
    data: {
      documentId,
      createdById: session.user.id,
      parentId: document.currentVersionId ?? null,
      label,
      data: document.draft.data
    }
  });

  await prisma.document.update({
    where: { id: documentId },
    data: {
      currentVersionId: version.id
    }
  });

  return NextResponse.json({ ok: true, versionId: version.id });
}
