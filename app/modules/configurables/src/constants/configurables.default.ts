/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  tagline?: string;
  uploadHeadline?: string;
  uploadSubtext?: string;
  historyPageSize?: number;
  showTranscript?: boolean;
  showMedia?: boolean;
  showLogs?: boolean;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "XINTERVIEWX",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#3B82F6",
    secondary: "#1e2a3a",
    accent: "#22C55E",
  },
  tagline: "The truth about your hiring process.",
  uploadHeadline: "Upload an interview recording",
  uploadSubtext: "Drop a video or audio file — get an AI-powered analysis report instantly",
  historyPageSize: 20,
  showTranscript: true,
  showMedia: true,
  showLogs: false,
};
