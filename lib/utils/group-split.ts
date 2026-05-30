/** Etiqueta de grupo: A, B, C… */
export function groupLabel(index: number): string {
  return `Grupo ${String.fromCharCode(65 + index)}`;
}

/**
 * Reparte equipos en grupos.
 * - Con `teamsPerGroup`: bloques consecutivos (Grupo A = equipos 0..n-1, etc.)
 * - Sin `teamsPerGroup`: reparto lo más equilibrado posible entre `groupsCount` grupos
 */
export function splitIntoGroups(
  clubIds: string[],
  groupsCount: number,
  teamsPerGroup = 0,
): string[][] {
  if (clubIds.length < 2 || groupsCount < 1) return [];

  const gc = Math.max(1, Math.floor(groupsCount));

  if (teamsPerGroup > 0) {
    const groups: string[][] = [];
    for (let g = 0; g < gc; g++) {
      const slice = clubIds.slice(g * teamsPerGroup, (g + 1) * teamsPerGroup);
      if (slice.length > 0) groups.push(slice);
    }
    return groups;
  }

  const groups: string[][] = Array.from({ length: gc }, () => []);
  clubIds.forEach((id, i) => {
    groups[i % gc].push(id);
  });
  return groups.filter((g) => g.length > 0);
}

export function clubsInGroup(
  clubIds: string[],
  groupsCount: number,
  teamsPerGroup: number,
  groupIndex: number,
): string[] {
  return splitIntoGroups(clubIds, groupsCount, teamsPerGroup)[groupIndex] ?? [];
}
