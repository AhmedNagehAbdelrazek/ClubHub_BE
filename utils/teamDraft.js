/**
 * Snake-draft team allocation algorithm.
 *
 * Given an array of player IDs, splits them into two balanced teams.
 * Draft order: A, B, B, A, A, B, B, A... for 8 players.
 * Picks alternate in a snake pattern.
 *
 * @param {Array<string>} players - Array of player IDs
 * @returns {{teamA: Array<string>, teamB: Array<string>}}
 */
function teamDraft(players) {
  if (!Array.isArray(players) || players.length < 2) {
    throw new Error('At least 2 players required');
  }

  const shuffled = [...players];
  // Fisher-Yates shuffle for random allocation
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const teamA = [];
  const teamB = [];

  // snake pattern: pick 1 to A, pick 2 to B, pick 3 to B, pick 4 to A, pick 5 to A, pick 6 to B, pick 7 to B, pick 8 to A...
  // Equivalently: 0->A, 1->B, 2->B, 3->A, 4->A, 5->B, 6->B, 7->A...
  // Pattern repeats every 4 picks: A, B, B, A
  for (let i = 0; i < shuffled.length; i++) {
    const patternIndex = i % 4;
    if (patternIndex === 0 || patternIndex === 3) {
      teamA.push(shuffled[i]);
    } else {
      teamB.push(shuffled[i]);
    }
  }

  return { teamA, teamB };
}

module.exports = teamDraft;
