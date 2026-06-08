import type { TranscriptionAnalysisOptions } from "../libs/types";
import { defaultAnalysisOptions } from "./default-analysis-options";

/**
 * Builds analysis options for a transcribe request.
 * Uses {@link defaultAnalysisOptions} unless the client sends a JSON `analysis_options` form field.
 */
export function resolveAnalysisOptions(
  override?: string | TranscriptionAnalysisOptions,
): TranscriptionAnalysisOptions {
  if (!override) {
    return defaultAnalysisOptions;
  }

  try {
    const parsed =
      typeof override === "string"
        ? (JSON.parse(override) as TranscriptionAnalysisOptions)
        : override;

    return {
      ...defaultAnalysisOptions,
      ...parsed,
      role_display: {
        ...defaultAnalysisOptions.role_display,
        ...parsed.role_display,
      },
      chunking: {
        ...defaultAnalysisOptions.chunking,
        ...parsed.chunking,
      },
      pass_settings: {
        ...defaultAnalysisOptions.pass_settings,
        ...parsed.pass_settings,
      },
    };
  } catch {
    return defaultAnalysisOptions;
  }
}
