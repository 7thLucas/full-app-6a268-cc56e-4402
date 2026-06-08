import { Router, type Request, type Response } from "express";
import { InterviewSessionModel } from "../model/audio-analyzer.model";

const router = Router();

/**
 * GET /api/interview-sessions
 * Returns the list of all interview sessions (most recent first).
 */
router.get("/interview-sessions", async (_req: Request, res: Response) => {
  try {
    const sessions = await InterviewSessionModel.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch sessions" });
  }
});

/**
 * POST /api/interview-sessions
 * Creates a new session record after a transcription job is queued.
 */
router.post("/interview-sessions", async (req: Request, res: Response) => {
  try {
    const { ticketId, fileName, fileSizeBytes } = req.body as {
      ticketId: string;
      fileName?: string;
      fileSizeBytes?: number;
    };

    if (!ticketId) {
      res.status(400).json({ success: false, error: "ticketId is required" });
      return;
    }

    const existing = await InterviewSessionModel.findOne({ ticketId }).lean();
    if (existing) {
      res.json({ success: true, data: existing });
      return;
    }

    const session = await InterviewSessionModel.create({
      ticketId,
      fileName,
      fileSizeBytes,
      status: "queued",
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create session" });
  }
});

/**
 * PATCH /api/interview-sessions/:ticketId
 * Updates the status, score, and summary of an existing session.
 */
router.patch("/interview-sessions/:ticketId", async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { status, overallScore, summary, label } = req.body as {
      status?: string;
      overallScore?: number | null;
      summary?: string | null;
      label?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (overallScore !== undefined) updateData.overallScore = overallScore;
    if (summary !== undefined) updateData.summary = summary;
    if (label !== undefined) updateData.label = label;

    const session = await InterviewSessionModel.findOneAndUpdate(
      { ticketId },
      { $set: updateData },
      { new: true, upsert: false },
    ).lean();

    if (!session) {
      res.status(404).json({ success: false, error: "Session not found" });
      return;
    }

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update session" });
  }
});

/**
 * DELETE /api/interview-sessions/:ticketId
 * Deletes a session record from history.
 */
router.delete("/interview-sessions/:ticketId", async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    await InterviewSessionModel.deleteOne({ ticketId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete session" });
  }
});

export default router;
