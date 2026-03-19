/**
 * Compute achievement badge labels from challenge stats.
 * Mirrors the logic in the frontend public profile page.
 */
export function computeBadges(
  correctCount: number,
  wrongCount: number,
  totalScore: number,
  duelWins = 0,
  duelTotal = 0,
): string[] {
  const total = correctCount + wrongCount
  const accuracy = total > 0 ? correctCount / total : 0
  const badges: string[] = []

  if (correctCount >= 1)    badges.push('Primo Passo')
  if (correctCount >= 10)   badges.push('Code Warrior')
  if (correctCount >= 50)   badges.push('Maestro')
  if (correctCount >= 100)  badges.push('Leggenda')
  if (totalScore >= 500)    badges.push('Diamond')
  if (totalScore >= 2000)   badges.push('Grandmaster')
  if (total >= 5 && accuracy >= 0.8)  badges.push('Cecchino')
  if (total >= 20 && accuracy >= 0.9) badges.push('Fulmine')
  if (duelWins >= 5)        badges.push('Guerriero')
  if (duelWins >= 20)       badges.push('Campione')

  return badges
}
