import mongoose from "mongoose";

const FindingSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    vulnerabilityType: { type: String, required: true },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      required: true,
    },
    file: String,
    line: Number,
    path: mongoose.Schema.Types.Mixed, // taint-path array from taint-analysis
    attackerPayload: String,
    fixSuggestion: String,
    // Cached AI explanation. Populated the first time a user expands a
    // finding; served from here on subsequent views instead of
    // re-calling the model — cuts cost and latency, and survives a page
    // refresh (today it lives only in FindingDetail's React state and
    // is lost on reload, re-triggering a fresh model call every time).
    aiExplanation: { type: String, default: null },
    explainedAt: { type: Date, default: null },
    // Triage workflow — persisted per finding rather than per session,
    // so marking something "false positive" sticks across visits.
    triageStatus: {
      type: String,
      enum: ["open", "fixed", "false_positive", "accepted_risk"],
      default: "open",
    },
  },
  { timestamps: true }
);

FindingSchema.index({ conversationId: 1, severity: 1 });

export default mongoose.models.Finding ||
  mongoose.model("Finding", FindingSchema);
