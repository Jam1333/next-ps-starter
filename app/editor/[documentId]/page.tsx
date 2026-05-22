import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EditorClient } from "@/components/editor/editor-client";
import { starterDocument } from "@/lib/editor-state";

export default async function EditorPage({
  params
}: {
  params: Promise<{ documentId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

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
      currentVersion: true,
      project: true
    }
  });

  if (!document) redirect("/dashboard");

  const initialDocument = (document.draft?.data as any) ?? (document.currentVersion?.data as any) ?? starterDocument(document.width, document.height);

  return <EditorClient documentId={document.id} initialDocument={initialDocument} />;
}
