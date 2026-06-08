import type { TranscriptionAnalysisOptions } from "../libs/types";

/**
 * Default options for XINTERVIEWX — interview session analysis.
 *
 * Domain: Job interview between an interviewer and a candidate.
 * Scoring dimensions are calibrated for hiring quality assessment.
 */
export const defaultAnalysisOptions: TranscriptionAnalysisOptions = {
  context:
    "Job interview session between an interviewer and a candidate. Evaluate the overall quality of the interview: whether strong questions were asked, how the candidate communicated, and whether the session produced useful hiring signal.",
  speaker_roles: ["interviewer", "candidate", "other"],
  primary_role: "interviewer",
  default_role: "candidate",
  role_display: {
    interviewer: "Interviewer",
    candidate: "Candidate",
    other: "Other",
  },
  scoring_rules: [
    {
      id: "interview_quality",
      title: "Interview Quality",
      rule: "Score 0-{max_score} for the overall quality of the interview. High scores go to sessions with structured, probing questions that reveal genuine candidate capability. Penalize shallow small-talk, yes/no-only questions, or interviewers who talk more than the candidate.",
      params: { max_score: "100" },
    },
    {
      id: "candidate_communication",
      title: "Candidate Communication",
      rule: "Score 0-{max_score} for the candidate's communication clarity, coherence, and ability to articulate their thinking. Penalize vague, disorganized, or evasive answers.",
      params: { max_score: "100" },
    },
    {
      id: "depth_of_answers",
      title: "Depth of Answers",
      rule: "Score 0-{max_score} for how substantive and specific the candidate's responses are. High scores require concrete examples, measurable outcomes, or demonstrated domain knowledge. Penalize generic or buzzword-heavy answers.",
      params: { max_score: "100" },
    },
    {
      id: "hiring_signal",
      title: "Hiring Signal",
      rule: "Score 0-{max_score} for how much useful hiring signal this interview produced. A high score means the interviewer and candidate exchange produced clear evidence for or against hiring. Penalize sessions that end without a clear read on the candidate.",
      params: { max_score: "100" },
    },
  ],
};
