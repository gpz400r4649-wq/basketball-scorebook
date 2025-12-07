import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { Link } from 'react-router-dom';
import { User, Plus, Trash2, Edit } from 'lucide-react';

export function PlayerList() {
    const players = useLiveQuery(() => db.players.toArray());

    if (!players) return null;

    const handleDelete = async (id) => {
        if (window.confirm('本当に削除しますか？')) {
            await db.players.delete(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">選手一覧</h2>
                <Link
                    to="/players/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    選手を追加
                </Link>
            </div>

            {players.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center text-slate-400 flex flex-col items-center gap-4">
                    <div className="bg-slate-50 p-4 rounded-full">
                        <User size={48} className="text-slate-300" />
                    </div>
                    <p>選手が登録されていません</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {players.map(player => (
                        <div key={player.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-slate-100 relative">
                                {player.photo ? (
                                    <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <User size={64} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                    #{player.number}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-slate-800 truncate">{player.name}</h3>
                                <p className="text-slate-500 text-sm">{player.position || 'ポジション未設定'}</p>

                                <div className="mt-4 flex gap-2 justify-end">
                                    <Link to={`/players/${player.id}/edit`} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(player.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
