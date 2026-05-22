import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }]
    },
    include: { documents: true },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      documentsCount: project.documents.length
    }))
  });
}

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.create({
    data: {
      name: `Project ${new Date().toLocaleDateString()}`,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER"
        }
      }
    }
  });

  const document = await prisma.document.create({
    data: {
      projectId: project.id,
      name: "Untitled Canvas",
      width: 1600,
      height: 1100,
      draft: {
        create: {
          data: {
            width: 1600,
            height: 1100,
            background: "#090b16",
            zoom: 1,
            pan: { x: 0, y: 0 },
            selectedLayerId: null,
            activeTool: "brush",
            layers: []
          }
        }
      }
    }
  });

  return NextResponse.redirect(new URL(`/editor/${document.id}`, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
