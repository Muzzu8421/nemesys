import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New conversation",
      trim: true,
      maxlength: 200,
    },
    // "chat": a normal assistant conversation.
    // "scan": a GitHub/upload vulnerability scan session — findings live
    // in the Finding collection, keyed by this conversation's _id.
    type: {
      type: String,
      enum: ["chat", "scan"],
      default: "chat",
      index: true,
    },
    scanMeta: {
      source: { type: String, enum: ["github", "upload"] },
      repoUrl: String,
      fileCount: Number,
      findingsCount: Number,
    },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false, index: true }, // soft delete
    // Denormalized for cheap sidebar sorting without joining Message on
    // every list request.
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Sidebar's primary query: this user's non-archived conversations,
// pinned first, then newest activity first.
ConversationSchema.index({ userId: 1, isArchived: 1, lastMessageAt: -1 });

// Backs the sidebar search box.
ConversationSchema.index({ userId: 1, title: "text" });

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
