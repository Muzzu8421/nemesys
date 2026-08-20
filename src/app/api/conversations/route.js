import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // adjust to match your actual authOptions export
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

const PAGE_SIZE = 30;

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor"); // ISO date from the previous page's last item
  const search = searchParams.get("q")?.trim();

  const query = { userId: session.user.id, isArchived: false };
  if (cursor) query.lastMessageAt = { $lt: new Date(cursor) };
  if (search) query.$text = { $search: search };

  const conversations = await Conversation.find(query)
    .sort({ isPinned: -1, lastMessageAt: -1 })
    .limit(PAGE_SIZE)
    .lean();

  const nextCursor =
    conversations.length === PAGE_SIZE
      ? conversations[conversations.length - 1].lastMessageAt
      : null;

  return Response.json({ conversations, nextCursor });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const body = await request.json().catch(() => ({}));
  const type = body.type === "scan" ? "scan" : "chat";

  const conversation = await Conversation.create({
    userId: session.user.id,
    title: type === "scan" ? "New scan" : "New conversation",
    type,
    scanMeta: body.scanMeta || undefined
  });

  return Response.json({ conversation }, { status: 201 });
}
