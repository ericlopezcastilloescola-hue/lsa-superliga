/** Club ficticio para huecos del cuadro eliminatorio aún sin definir. */
export const TBD_CLUB_ID = "club-tbd-por-determinar";

export function isTbdClubId(clubId: string | null | undefined): boolean {
  return clubId === TBD_CLUB_ID;
}

export function isRealClubId(clubId: string | null | undefined): clubId is string {
  return !!clubId && !isTbdClubId(clubId);
}
