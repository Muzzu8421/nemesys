import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // adjust to match your actual authOptions export
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Finding from "@/models/Finding";

// Returns null for both "doesn't exist" and "exists but isn't yours" —
// deliberately the same response for both, so a request never leaks
// whether a given conversation id belongs to someone else.
async function loadOwnedConversation(id, userId) {
  return Conversation.findOne({ _id: id, userId });
}

export async function GET(request, context) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const conversation = await loadOwnedConversation(params.id, session.user.id);
  if (!conversation) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  if (conversation.type === "scan") {
    const findings = await Finding.find({ conversationId: conversation._id }).lean();
    return Response.json({ conversation, findings });
  }

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .lean();

  return Response.json({ conversation, messages });
}

export async function PATCH(request, context) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const conversation = await loadOwnedConversation(params.id, session.user.id);
  if (!conversation) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  const updates = await request.json().catch(() => ({}));
  const allowed = ["title", "isPinned", "isArchived"];
  for (const key of allowed) {
    if (key in updates) conversation[key] = updates[key];
  }
  await conversation.save();

  return Response.json({ conversation });
}

export async function DELETE(request, context) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const conversation = await loadOwnedConversation(params.id, session.user.id);
  if (!conversation) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Soft delete: flip isArchived rather than removing the document.
  // Matches "Delete chat" in ChatGPT/Claude — recoverable for a window
  // rather than destroying the record on a mis-click. Add a scheduled
  // job later to hard-delete archived conversations after N days if you
  // need real data retention limits.
  conversation.isArchived = true;
  await conversation.save();

  return Response.json({ success: true });
}
