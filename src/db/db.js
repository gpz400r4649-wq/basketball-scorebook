import Dexie from 'dexie';

export const db = new Dexie('BasketballScorebookDB');

db.version(1).stores({
    players: '++id, name, teamId',
    teams: '++id, name, isMyTeam',
    games: '++id, date, isFinished, opponent, starters', // We will store opponent name and starters in the object
    events: '++id, gameId, playerId, type, quarter', // Event log for calculating stats
    stats: '++id, gameId, playerId'
});
