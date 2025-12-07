import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { Calendar, Users, PlayCircle, ArrowLeft } from 'lucide-react';

export function GameSetup() {
    const navigate = useNavigate();
    const players = useLiveQuery(() => db.players.toArray());

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [opponent, setOpponent] = useState('');
    const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
    const [starterIds, setStarterIds] = useState([]);

    useEffect(() => {
        if (players) {
            // Default select all players
            setSelectedPlayerIds(players.map(p => p.id));
        }
    }, [players]);

    const handlePlayerToggle = (id) => {
        if (selectedPlayerIds.includes(id)) {
            setSelectedPlayerIds(selectedPlayerIds.filter(pid => pid !== id));
            setStarterIds(starterIds.filter(pid => pid !== id));
        } else {
            setSelectedPlayerIds([...selectedPlayerIds, id]);
        }
    };

    const handleStarterToggle = (id) => {
        if (starterIds.includes(id)) {
            setStarterIds(starterIds.filter(pid => pid !== id));
        } else {
            if (starterIds.length < 5) {
                setStarterIds([...starterIds, id]);
            } else {
                alert('スターティングメンバーは5人までです');
            }
        }
    };

    const handleStartGame = async () => {
        if (!opponent) {
            alert('対戦相手を入力してください');
            return;
        }
        if (starterIds.length !== 5) {
            if (!window.confirm('スターティングメンバーが5人選ばれていませんが、開始しますか？')) {
                return;
            }
        }

        try {
            const gameId = await db.games.add({
                date,
                opponent,
                isFinished: false,
                roster: selectedPlayerIds,
                starters: starterIds,
                createdAt: new Date()
            });
            navigate(`/games/${gameId}/score`);
        } catch (error) {
            console.error("Error creating game:", error);
            alert('試合の作成に失敗しました');
        }
    };

    if (!players) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800">新しい試合</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Calendar size={16} /> 日付
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Users size={16} /> 対戦相手
                        </label>
                        <input
                            type="text"
                            value={opponent}
                            onChange={(e) => setOpponent(e.target.value)}
                            placeholder="相手チーム名"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2">メンバー選択 & スターター指定</h3>
                    <p className="text-sm text-slate-500">
                        試合に出場する選手にチェックを入れ、その中からスターティングメンバー(★)を選んでください。
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {players.map(player => (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${selectedPlayerIds.includes(player.id)
                                        ? 'border-orange-200 bg-orange-50'
                                        : 'border-slate-100 bg-slate-50 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedPlayerIds.includes(player.id)}
                                        onChange={() => handlePlayerToggle(player.id)}
                                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-slate-600 w-6 text-center">#{player.number}</span>
                                        <span className="font-medium text-slate-800">{player.name}</span>
                                    </div>
                                </div>

                                {selectedPlayerIds.includes(player.id) && (
                                    <button
                                        onClick={() => handleStarterToggle(player.id)}
                                        className={`p-1.5 rounded-full transition-colors ${starterIds.includes(player.id)
                                                ? 'bg-yellow-400 text-white shadow-sm'
                                                : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                            }`}
                                        title="スターターに設定"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill={starterIds.includes(player.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-right text-sm text-slate-600">
                        スターター: <span className="font-bold text-orange-600">{starterIds.length}</span> / 5
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button
                        onClick={handleStartGame}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                        <PlayCircle size={28} />
                        試合開始
                    </button>
                </div>
            </div>
        </div>
    );
}
