import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Settings, BarChart2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { PlayerList } from './features/players/PlayerList';
import { PlayerForm } from './features/players/PlayerForm';
import { SettingsPage } from './features/settings/SettingsPage';
import { GameSetup } from './features/games/GameSetup';
import { GameScoring } from './features/games/GameScoring';
import { BoxScore } from './features/stats/BoxScore';
import { StatsPage } from './features/stats/StatsPage';
import { db } from './db/db';

function App() {
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const myTeam = await db.teams.where({ isMyTeam: 1 }).first();
                if (myTeam && myTeam.colors) {
                    const root = document.documentElement;
                    root.style.setProperty('--color-primary', myTeam.colors.primary);
                    root.style.setProperty('--color-secondary', myTeam.colors.secondary);
                    root.style.setProperty('--color-accent', myTeam.colors.accent);
                }
            } catch (error) {
                console.error("Failed to load theme:", error);
            }
        };
        loadTheme();
    }, []);

    return (
        <Router>
            <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
                <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-500 p-2 rounded-lg text-white">
                            <Trophy size={24} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">Scorebook</h1>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/" className="flex flex-col items-center text-xs text-slate-500 hover:text-orange-600 transition-colors">
                            <Calendar size={24} />
                            <span>試合</span>
                        </Link>
                        <Link to="/stats" className="flex flex-col items-center text-xs text-slate-500 hover:text-orange-600 transition-colors">
                            <BarChart2 size={24} />
                            <span>成績</span>
                        </Link>
                        <Link to="/players" className="flex flex-col items-center text-xs text-slate-500 hover:text-orange-600 transition-colors">
                            <Users size={24} />
                            <span>選手</span>
                        </Link>
                        <Link to="/settings" className="flex flex-col items-center text-xs text-slate-500 hover:text-orange-600 transition-colors">
                            <Settings size={24} />
                            <span>設定</span>
                        </Link>
                    </div>
                </nav>

                <main className="p-4 max-w-4xl mx-auto pb-20">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/stats" element={<StatsPage />} />
                        <Route path="/games/new" element={<GameSetup />} />
                        <Route path="/games/:id/score" element={<GameScoring />} />
                        <Route path="/games/:id/boxscore" element={<BoxScore />} />
                        <Route path="/players" element={<PlayerList />} />
                        <Route path="/players/new" element={<PlayerForm />} />
                        <Route path="/players/:id/edit" element={<PlayerForm />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

function Home() {
    const navigate = useNavigate();
    const games = useLiveQuery(() => db.games.orderBy('date').reverse().toArray());

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">試合一覧</h2>
                <button
                    onClick={() => navigate('/games/new')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium shadow-sm transition-colors"
                >
                    + 新しい試合
                </button>
            </div>

            {!games || games.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-400">
                    <p>まだ試合が記録されていません</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {games.map(game => (
                        <div key={game.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-500 mb-1">{game.date}</div>
                                <div className="font-bold text-lg text-slate-800">vs {game.opponent}</div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/games/${game.id}/score`)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    スコア入力
                                </button>
                                <button
                                    onClick={() => navigate(`/games/${game.id}/boxscore`)}
                                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                    <Trophy size={16} />
                                    結果
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
