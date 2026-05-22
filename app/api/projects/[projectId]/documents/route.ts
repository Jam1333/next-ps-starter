import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { starterDocument } from "@/lib/editor-state";

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }]
    }
  });

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const document = await prisma.document.create({
    data: {
      projectId: project.id,
      name: "Untitled Canvas",
      width: 1600,
      height: 1100,
      draft: {
        create: {
          data: starterDocument(1600, 1100)
        }
      }
    }
  });

  return NextResponse.redirect(new URL(`/editor/${document.id}`, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
