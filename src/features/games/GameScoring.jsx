import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { ArrowLeft, RefreshCw, Users, Trophy } from 'lucide-react';

export function GameScoring() {
    const { id } = useParams();
    const navigate = useNavigate();
    const game = useLiveQuery(() => db.games.get(Number(id)));
    const players = useLiveQuery(() => db.players.toArray());
    const events = useLiveQuery(() => db.events.where({ gameId: Number(id) }).toArray());

    const [onCourtIds, setOnCourtIds] = useState([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [opponentScore, setOpponentScore] = useState(0);
    const [quarter, setQuarter] = useState(1);

    useEffect(() => {
        if (game && game.starters && onCourtIds.length === 0) {
            setOnCourtIds(game.starters);
        }
    }, [game]);

    if (!game || !players || !events) return <div>Loading...</div>;

    const myScore = events.reduce((acc, event) => {
        if (event.type === '2PM') return acc + 2;
        if (event.type === '3PM') return acc + 3;
        if (event.type === 'FTM') return acc + 1;
        return acc;
    }, 0);

    const handleEvent = async (type) => {
        if (!selectedPlayerId) {
            alert('選手を選択してください');
            return;
        }

        await db.events.add({
            gameId: Number(id),
            playerId: selectedPlayerId,
            type,
            quarter,
            timestamp: new Date()
        });

        // Optional: Clear selection after action?
        // setSelectedPlayerId(null); 
    };

    const handleOpponentScore = (points) => {
        setOpponentScore(prev => prev + points);
        // Ideally save this to DB too, maybe as a special event or update game record
        // For now just local state, but we should persist it.
        // Let's add a special event type 'OPP_SCORE' with playerId: -1
        db.events.add({
            gameId: Number(id),
            playerId: -1,
            type: 'OPP_SCORE',
            value: points,
            quarter,
            timestamp: new Date()
        });
    };

    // Calculate opponent score from events
    const calculatedOpponentScore = events
        .filter(e => e.type === 'OPP_SCORE')
        .reduce((acc, e) => acc + e.value, 0);

    const onCourtPlayers = players.filter(p => onCourtIds.includes(p.id));
    const benchPlayers = players.filter(p => game.roster.includes(p.id) && !onCourtIds.includes(p.id));

    const handleSub = (inId, outId) => {
        setOnCourtIds(prev => prev.map(id => id === outId ? inId : id));
        // Log substitution event?
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-800 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-sm text-slate-400">{game.date} vs {game.opponent}</h2>
                        <div className="flex items-center gap-6 text-3xl font-bold font-mono">
                            <span className="text-orange-500">{myScore}</span>
                            <span className="text-slate-600">-</span>
                            <span>{calculatedOpponentScore}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-800 px-4 py-2 rounded-lg">
                        <span className="text-slate-400 text-xs block">QUARTER</span>
                        <span className="font-bold text-xl">{quarter}Q</span>
                    </div>
                    <button
                        onClick={() => navigate(`/games/${id}/boxscore`)}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                        <Trophy size={18} />
                        Box Score
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                {/* Court / Players */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {onCourtPlayers.map(player => (
                            <div
                                key={player.id}
                                onClick={() => setSelectedPlayerId(player.id)}
                                className={`relative bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${selectedPlayerId === player.id
                                        ? 'border-orange-500 shadow-lg ring-2 ring-orange-200'
                                        : 'border-slate-100 hover:border-orange-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                                        {player.photo ? (
                                            <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Users size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold font-mono text-slate-800">#{player.number}</div>
                                        <div className="font-medium text-slate-600 truncate">{player.name}</div>
                                        {/* Real-time stats for this game */}
                                        <div className="text-xs text-slate-400 mt-1">
                                            PTS: {events.filter(e => e.playerId === player.id && ['2PM', '3PM', 'FTM'].includes(e.type)).reduce((acc, e) => acc + (e.type === '2PM' ? 2 : e.type === '3PM' ? 3 : 1), 0)}
                                            {' / '}
                                            F: {events.filter(e => e.playerId === player.id && e.type === 'PF').length}
                                        </div>
                                    </div>
                                </div>
                                {selectedPlayerId === player.id && (
                                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-1 rounded-full shadow-sm">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Opponent Controls */}
                    <div className="mt-8 bg-slate-200 rounded-xl p-4">
                        <h3 className="text-sm font-bold text-slate-600 mb-2">相手チーム得点</h3>
                        <div className="flex gap-2">
                            <button onClick={() => handleOpponentScore(1)} className="flex-1 bg-white hover:bg-slate-50 py-3 rounded-lg font-bold text-slate-700 shadow-sm">+1</button>
                            <button onClick={() => handleOpponentScore(2)} className="flex-1 bg-white hover:bg-slate-50 py-3 rounded-lg font-bold text-slate-700 shadow-sm">+2</button>
                            <button onClick={() => handleOpponentScore(3)} className="flex-1 bg-white hover:bg-slate-50 py-3 rounded-lg font-bold text-slate-700 shadow-sm">+3</button>
                        </div>
                    </div>
                </div>

                {/* Action Panel */}
                <div className="md:w-80 bg-white border-l border-slate-200 p-4 flex flex-col gap-2 shadow-xl z-10">
                    <div className="text-center mb-2 text-sm text-slate-400">アクションを選択</div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleEvent('2PM')} className="bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg shadow-sm">2PT IN</button>
                        <button onClick={() => handleEvent('2PA')} className="bg-red-100 hover:bg-red-200 text-red-600 py-4 rounded-lg font-bold text-lg shadow-sm">2PT MISS</button>

                        <button onClick={() => handleEvent('3PM')} className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg shadow-sm">3PT IN</button>
                        <button onClick={() => handleEvent('3PA')} className="bg-red-100 hover:bg-red-200 text-red-600 py-4 rounded-lg font-bold text-lg shadow-sm">3PT MISS</button>

                        <button onClick={() => handleEvent('FTM')} className="bg-green-400 hover:bg-green-500 text-white py-3 rounded-lg font-bold shadow-sm">FT IN</button>
                        <button onClick={() => handleEvent('FTA')} className="bg-red-50 hover:bg-red-100 text-red-500 py-3 rounded-lg font-bold shadow-sm">FT MISS</button>
                    </div>

                    <div className="h-px bg-slate-100 my-2"></div>

                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handleEvent('REB_OFF')} className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold text-sm shadow-sm">OR</button>
                        <button onClick={() => handleEvent('REB_DEF')} className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold text-sm shadow-sm">DR</button>
                        <button onClick={() => handleEvent('AST')} className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-bold text-sm shadow-sm">AST</button>

                        <button onClick={() => handleEvent('STL')} className="bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-bold text-sm shadow-sm">STL</button>
                        <button onClick={() => handleEvent('BLK')} className="bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg font-bold text-sm shadow-sm">BLK</button>
                        <button onClick={() => handleEvent('TO')} className="bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-lg font-bold text-sm shadow-sm">TO</button>
                    </div>

                    <button onClick={() => handleEvent('PF')} className="mt-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold shadow-sm">FOUL</button>
                </div>
            </div>
        </div>
    );
}
