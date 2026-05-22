import { PrismaClient, AssetType, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@photoshop.local";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo Creator"
    }
  });

  const project = await prisma.project.create({
    data: {
      name: "Neo Canvas",
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: Role.OWNER
        }
      }
    }
  });

  const document = await prisma.document.create({
    data: {
      projectId: project.id,
      name: "Poster Draft",
      width: 1600,
      height: 1100
    }
  });

  await prisma.documentDraft.create({
    data: {
      documentId: document.id,
      data: {
        width: 1600,
        height: 1100,
        background: "#0a0f1f",
        zoom: 1,
        pan: { x: 0, y: 0 },
        selectedLayerId: null,
        activeTool: "brush",
        layers: [
          {
            id: "layer-bg",
            type: "shape",
            name: "Background",
            visible: true,
            opacity: 1,
            shape: "rect",
            x: 0,
            y: 0,
            width: 1600,
            height: 1100,
            fill: "linear-gradient(135deg, #0f172a, #111827)",
            stroke: "rgba(255,255,255,0.04)"
          }
        ]
      }
    }
  });

  await prisma.asset.create({
    data: {
      userId: user.id,
      name: "Neon Grain Brush",
      type: AssetType.BRUSH,
      mimeType: "application/json",
      size: 0,
      url: "/brushes/neon-grain.json"
    }
  });

  console.log({ user: user.email, project: project.name, document: document.id });
}

main().finally(async () => prisma.$disconnect());
