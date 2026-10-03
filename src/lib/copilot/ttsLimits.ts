/**
 * What one signed-in person may spend on neural speech. ElevenLabs bills per character, and the browser asks for one sentence
 * at a time, so the limits are on characters as well as on requests.
 */
export const TTS_LIMITS = {
  /** One request is one sentence or two; the longest sentence the assistant speaks is far shorter. */
  maxCharsPerRequest: 1000,
  /** Sentences are spoken one after another, about one every few seconds. */
  requestsPerMinute: 30,
  /** An hour of continuous speech is about 54,000 characters, so a person talking to the assistant all hour is not stopped. */
  charBudgets: [
    { limit: 60_000, windowMs: 60 * 60 * 1000 },
    { limit: 200_000, windowMs: 24 * 60 * 60 * 1000 },
  ],
} as const;
