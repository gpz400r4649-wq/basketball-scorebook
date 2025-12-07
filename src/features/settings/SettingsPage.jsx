import React, { useState, useEffect } from 'react';
import { db } from '../../db/db';
import { Save, RefreshCw } from 'lucide-react';

export function SettingsPage() {
    const [teamName, setTeamName] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#f97316');
    const [secondaryColor, setSecondaryColor] = useState('#1e293b');
    const [accentColor, setAccentColor] = useState('#3b82f6');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const myTeam = await db.teams.where({ isMyTeam: 1 }).first();
            if (myTeam) {
                setTeamName(myTeam.name);
                if (myTeam.colors) {
                    setPrimaryColor(myTeam.colors.primary);
                    setSecondaryColor(myTeam.colors.secondary);
                    setAccentColor(myTeam.colors.accent);
                    applyTheme(myTeam.colors);
                }
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (colors) => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-accent', colors.accent);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const colors = { primary: primaryColor, secondary: secondaryColor, accent: accentColor };

            const myTeam = await db.teams.where({ isMyTeam: 1 }).first();
            if (myTeam) {
                await db.teams.update(myTeam.id, {
                    name: teamName,
                    colors: colors
                });
            } else {
                await db.teams.add({
                    name: teamName,
                    isMyTeam: 1,
                    colors: colors
                });
            }

            applyTheme(colors);
            alert('設定を保存しました');
        } catch (error) {
            console.error("Error saving settings:", error);
            alert('保存に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">チーム設定</h2>

            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">チーム名</label>
                    <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="チーム名を入力"
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-800">テーマカラー</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">メインカラー</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="h-10 w-10 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm uppercase"
                                />
                            </div>
                            <p className="text-xs text-slate-500">ヘッダー、主要ボタンなど</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">サブカラー</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="h-10 w-10 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm uppercase"
                                />
                            </div>
                            <p className="text-xs text-slate-500">テキスト、背景アクセントなど</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">アクセントカラー</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="h-10 w-10 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm uppercase"
                                />
                            </div>
                            <p className="text-xs text-slate-500">リンク、強調表示など</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? '保存中...' : '設定を保存'}
                    </button>
                </div>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">プレビュー</h3>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg text-white font-bold text-center" style={{ backgroundColor: primaryColor }}>
                        メインカラーボタン
                    </div>
                    <div className="p-4 rounded-lg text-white font-bold text-center" style={{ backgroundColor: secondaryColor }}>
                        サブカラー要素
                    </div>
                    <div className="p-4 rounded-lg text-white font-bold text-center" style={{ backgroundColor: accentColor }}>
                        アクセント要素
                    </div>
                </div>
            </div>
        </div>
    );
}
