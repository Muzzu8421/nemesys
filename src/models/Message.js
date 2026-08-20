import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
    // Optional structured content (e.g. a list-of-parts shape, tool
    // calls, attachments). Kept separate from `content` so simple
    // messages don't pay for structure they don't need, while leaving
    // room for richer message types later without a migration.
    parts: { type: mongoose.Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ["complete", "error"],
      default: "complete",
    },
    // Reserved for edit/regenerate branching: a new response to an
    // edited message becomes a sibling with the same parentId instead
    // of overwriting history. Unused by a v1 linear chat, but having
    // the field from day one avoids a schema migration later.
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: {
      model: String,
      findingId: mongoose.Schema.Types.ObjectId,
      tokensUsed: Number,
    },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
