// app/administration/chat/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatLayout } from "./components/ChatLayout";
import { notFound } from "next/navigation";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  if (!session) return notFound();

  const allUsers = await prisma.user.findMany({
    where: {
      id: {
        not: session.user.id,
      },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <div className="h-[calc(100vh-150px)]">
      <ChatLayout allUsers={allUsers} />
    </div>
  );
}
