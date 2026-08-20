import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { callChatModel, generateTitle } from "@/lib/aiClient";

export async function POST(request, context) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const { id } = params;

  const conversation = await Conversation.findOne({ _id: id, userId: session.user.id });
  if (!conversation) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { content } = await request.json().catch(() => ({}));
  if (!content) {
    return Response.json({ error: "Content is required" }, { status: 400 });
  }

  // 1. Save the user's message immediately
  const userMessage = await Message.create({
    conversationId: conversation._id,
    role: "user",
    content,
  });

  // Update conversation's lastMessageAt
  conversation.lastMessageAt = userMessage.createdAt;
  await conversation.save();

  // 2. Fetch history and call the model
  const history = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .lean();
    
  let aiContent;
  let status = "complete";
  try {
    aiContent = await callChatModel(history);
  } catch (err) {
    console.error("Model call failed:", err);
    aiContent = "Sorry, I encountered an error while processing your request.";
    status = "error";
  }

  // 3. Save the assistant's reply
  const assistantMessage = await Message.create({
    conversationId: conversation._id,
    role: "assistant",
    content: aiContent,
    status,
  });

  conversation.lastMessageAt = assistantMessage.createdAt;

  // 4. Fire-and-forget auto-titling if this is the first exchange
  if (history.length === 1 && conversation.title === "New conversation") {
    // Don't await this, let it run in the background
    generateTitle(content, aiContent).then(async (newTitle) => {
      if (newTitle) {
        conversation.title = newTitle;
        await conversation.save();
      }
    }).catch(console.error);
  } else {
    await conversation.save();
  }

  // 5. Return the assistant's message (Persist-before-respond)
  return Response.json({ message: assistantMessage });
}
