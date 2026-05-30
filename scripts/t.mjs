import { generateCompetitionCalendar } from './lib/utils/competition-calendar.ts';

const cal = generateCompetitionCalendar('c', 'eliminatoria_directa', ['a','b','c','d'], '2026-01-01', {
  calendarMode: 'manual',
  phases: [{ name: 'KO', type: 'llaves', matchesPerSeries: 2, bracketTeams: 0 }],
  standingsEnabled: false,
});
console.log('matchdays', cal.matchdays.map(m => m.name));
console.log('matches', cal.matches.length);
console.log('knockoutRounds', JSON.stringify(cal.knockoutRounds, null, 2));
