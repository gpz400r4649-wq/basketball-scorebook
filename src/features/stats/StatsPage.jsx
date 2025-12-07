import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { Filter } from 'lucide-react';

export function StatsPage() {
    const [filter, setFilter] = useState('all'); // 'all', 'month', 'last5'
    const players = useLiveQuery(() => db.players.toArray());
    const games = useLiveQuery(() => db.games.toArray());
    const events = useLiveQuery(() => db.events.toArray());

    const filteredGames = useMemo(() => {
        if (!games) return [];
        let sortedGames = [...games].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filter === 'last5') {
            return sortedGames.slice(0, 5);
        } else if (filter === 'month') {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            return sortedGames.filter(g => new Date(g.date) >= firstDay);
        }
        return sortedGames;
    }, [games, filter]);

    const stats = useMemo(() => {
        if (!players || !events || !filteredGames) return [];

        const gameIds = filteredGames.map(g => g.id);
        const filteredEvents = events.filter(e => gameIds.includes(e.gameId));

        return players.map(player => {
            const playerEvents = filteredEvents.filter(e => e.playerId === player.id);
            const gamesPlayed = new Set(playerEvents.map(e => e.gameId)).size;

            if (gamesPlayed === 0) return null;

            const PTS = playerEvents.filter(e => ['2PM', '3PM', 'FTM'].includes(e.type)).reduce((acc, e) => acc + (e.type === '2PM' ? 2 : e.type === '3PM' ? 3 : 1), 0);
            const REB = playerEvents.filter(e => ['REB_OFF', 'REB_DEF'].includes(e.type)).length;
            const AST = playerEvents.filter(e => e.type === 'AST').length;
            const STL = playerEvents.filter(e => e.type === 'STL').length;
            const BLK = playerEvents.filter(e => e.type === 'BLK').length;

            return {
                ...player,
                gamesPlayed,
                PTS,
                REB,
                AST,
                STL,
                BLK,
                PPG: (PTS / gamesPlayed).toFixed(1),
                RPG: (REB / gamesPlayed).toFixed(1),
                APG: (AST / gamesPlayed).toFixed(1)
            };
        }).filter(p => p !== null).sort((a, b) => parseFloat(b.PPG) - parseFloat(a.PPG));
    }, [players, events, filteredGames]);

    if (!players || !games || !events) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">成績集計</h2>

                <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        全期間
                    </button>
                    <button
                        onClick={() => setFilter('month')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'month' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        今月
                    </button>
                    <button
                        onClick={() => setFilter('last5')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'last5' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        直近5試合
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Player</th>
                                <th className="px-2 py-3 text-center">GP</th>
                                <th className="px-2 py-3 text-center">PPG</th>
                                <th className="px-2 py-3 text-center">RPG</th>
                                <th className="px-2 py-3 text-center">APG</th>
                                <th className="px-2 py-3 text-center">Total PTS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                                        <span className="text-slate-400 font-mono w-6 text-right">#{p.number}</span>
                                        {p.name}
                                    </td>
                                    <td className="px-2 py-3 text-center text-slate-600">{p.gamesPlayed}</td>
                                    <td className="px-2 py-3 text-center font-bold text-orange-600">{p.PPG}</td>
                                    <td className="px-2 py-3 text-center text-slate-600">{p.RPG}</td>
                                    <td className="px-2 py-3 text-center text-slate-600">{p.APG}</td>
                                    <td className="px-2 py-3 text-center text-slate-600">{p.PTS}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {stats.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                        データがありません
                    </div>
                )}
            </div>
        </div>
    );
}
