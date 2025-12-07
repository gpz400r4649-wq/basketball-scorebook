import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { ArrowLeft, Star, Share2 } from 'lucide-react';

export function BoxScore() {
    const { id } = useParams();
    const navigate = useNavigate();
    const game = useLiveQuery(() => db.games.get(Number(id)));
    const players = useLiveQuery(() => db.players.toArray());
    const events = useLiveQuery(() => db.events.where({ gameId: Number(id) }).toArray());

    const stats = useMemo(() => {
        if (!players || !events) return [];

        return players.map(player => {
            const playerEvents = events.filter(e => e.playerId === player.id);

            const FGM2 = playerEvents.filter(e => e.type === '2PM').length;
            const FGA2 = FGM2 + playerEvents.filter(e => e.type === '2PA').length; // 2PA is miss
            const FGM3 = playerEvents.filter(e => e.type === '3PM').length;
            const FGA3 = FGM3 + playerEvents.filter(e => e.type === '3PA').length; // 3PA is miss
            const FTM = playerEvents.filter(e => e.type === 'FTM').length;
            const FTA = FTM + playerEvents.filter(e => e.type === 'FTA').length; // FTA is miss

            const FGM = FGM2 + FGM3;
            const FGA = FGA2 + FGA3;
            const PTS = (FGM2 * 2) + (FGM3 * 3) + FTM;

            const OR = playerEvents.filter(e => e.type === 'REB_OFF').length;
            const DR = playerEvents.filter(e => e.type === 'REB_DEF').length;
            const REB = OR + DR;

            const AST = playerEvents.filter(e => e.type === 'AST').length;
            const STL = playerEvents.filter(e => e.type === 'STL').length;
            const BLK = playerEvents.filter(e => e.type === 'BLK').length;
            const TO = playerEvents.filter(e => e.type === 'TO').length;
            const PF = playerEvents.filter(e => e.type === 'PF').length;

            // EFF = (PTS + REB + AST + STL + BLK) - ((FGA - FGM) + (FTA - FTM) + TO)
            const EFF = (PTS + REB + AST + STL + BLK) - ((FGA - FGM) + (FTA - FTM) + TO);

            return {
                ...player,
                PTS, FGM, FGA, FGM3, FGA3, FTM, FTA, OR, DR, REB, AST, STL, BLK, TO, PF, EFF
            };
        }).sort((a, b) => b.EFF - a.EFF); // Sort by EFF for MVP check
    }, [players, events]);

    if (!game || !players || !events) return <div>Loading...</div>;

    const mvp = stats.length > 0 ? stats[0] : null;
    // Check for ties?
    const mvps = stats.filter(p => p.EFF === mvp?.EFF && p.EFF > 0);

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(`/games/${id}/score`)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-slate-600" />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-800">Box Score</h2>
                    </div>
                    <button className="flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">
                        <Share2 size={20} />
                        共有
                    </button>
                </div>

                {/* MVP Section */}
                {mvps.length > 0 && (
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
                        <div className="flex items-center gap-2 text-yellow-600 font-bold tracking-widest mb-2">
                            <Star fill="currentColor" /> MVP <Star fill="currentColor" />
                        </div>
                        <div className="flex flex-wrap justify-center gap-8">
                            {mvps.map(p => (
                                <div key={p.id} className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-white border-4 border-yellow-300 overflow-hidden shadow-md mb-2">
                                        {p.photo ? (
                                            <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-2xl">
                                                #{p.number}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
                                    <div className="text-sm font-mono text-slate-600">
                                        EFF: <span className="font-bold text-orange-600">{p.EFF}</span> | PTS: {p.PTS} | REB: {p.REB} | AST: {p.AST}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10">Player</th>
                                    <th className="px-2 py-3 text-center">PTS</th>
                                    <th className="px-2 py-3 text-center">FGM-A</th>
                                    <th className="px-2 py-3 text-center">3PM-A</th>
                                    <th className="px-2 py-3 text-center">FTM-A</th>
                                    <th className="px-2 py-3 text-center">REB</th>
                                    <th className="px-2 py-3 text-center">AST</th>
                                    <th className="px-2 py-3 text-center">STL</th>
                                    <th className="px-2 py-3 text-center">BLK</th>
                                    <th className="px-2 py-3 text-center">TO</th>
                                    <th className="px-2 py-3 text-center">PF</th>
                                    <th className="px-2 py-3 text-center font-bold text-slate-700">EFF</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 sticky left-0 bg-white z-10 flex items-center gap-3 font-medium text-slate-800 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            <span className="text-slate-400 font-mono w-6 text-right">#{p.number}</span>
                                            <span className="truncate max-w-[120px]">{p.name}</span>
                                        </td>
                                        <td className="px-2 py-3 text-center font-bold">{p.PTS}</td>
                                        <td className="px-2 py-3 text-center text-slate-600">{p.FGM}-{p.FGA}</td>
                                        <td className="px-2 py-3 text-center text-slate-600">{p.FGM3}-{p.FGA3}</td>
                                        <td className="px-2 py-3 text-center text-slate-600">{p.FTM}-{p.FTA}</td>
                                        <td className="px-2 py-3 text-center text-slate-600">
                                            {p.REB} <span className="text-xs text-slate-400">({p.OR}-{p.DR})</span>
                                        </td>
                                        <td className="px-2 py-3 text-center text-slate-600">{p.AST}</td>
                                        <td className="px-2 py-3 text-center text-slate-600">{p.STL}</td>
                                        <td className="px-2 py-3 text-center text-slate-600">{p.BLK}</td>
                                        <td className="px-2 py-3 text-center text-slate-600">{p.TO}</td>
                                        <td className="px-2 py-3 text-center text-slate-600">{p.PF}</td>
                                        <td className="px-2 py-3 text-center font-bold text-orange-600">{p.EFF}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
