/** Whole minutes elapsed since joinTime (floor). Returns 0 if joinTime is null/invalid. */
export function computePartialMinutes(
  joinTimeMs: number | null,
  nowMs: number = Date.now(),
): number {
  if (joinTimeMs == null || !Number.isFinite(joinTimeMs)) return 0
  const elapsed = nowMs - joinTimeMs
  if (elapsed < 60_000) return 0
  return Math.floor(elapsed / 60_000)
}
