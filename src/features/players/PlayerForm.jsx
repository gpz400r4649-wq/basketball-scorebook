import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../db/db';
import { resizeImage } from '../../lib/utils';
import { Camera, Upload, User, Save, ArrowLeft } from 'lucide-react';

export function PlayerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [position, setPosition] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            db.players.get(Number(id)).then(player => {
                if (player) {
                    setName(player.name);
                    setNumber(player.number);
                    setPosition(player.position);
                    setPhoto(player.photo);
                }
            });
        }
    }, [id]);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const resized = await resizeImage(file);
                setPhoto(resized);
            } catch (error) {
                console.error("Error resizing image:", error);
                alert("画像の処理に失敗しました");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const playerData = {
                name,
                number,
                position,
                photo,
                teamId: 1 // Default team for now
            };

            if (id) {
                await db.players.update(Number(id), playerData);
            } else {
                await db.players.add(playerData);
            }
            navigate('/players');
        } catch (error) {
            console.error("Error saving player:", error);
            alert("保存に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/players')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800">{id ? '選手編集' : '選手登録'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-md group">
                        {photo ? (
                            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <User size={48} />
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={32} />
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                    </div>
                    <p className="text-sm text-slate-500">写真をタップして変更</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">名前</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="選手名"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">背番号</label>
                        <input
                            type="text"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="#"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">ポジション</label>
                        <select
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="">選択してください</option>
                            <option value="PG">PG (ポイントガード)</option>
                            <option value="SG">SG (シューティングガード)</option>
                            <option value="SF">SF (スモールフォワード)</option>
                            <option value="PF">PF (パワーフォワード)</option>
                            <option value="C">C (センター)</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {loading ? '保存中...' : '保存する'}
                    </button>
                </div>
            </form>
        </div>
    );
}
