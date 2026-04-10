import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { CURRENCIES, getCurrency, saveCurrency, CurrencyConfig } from '@/utils/currency';
import { useState } from 'react';

export default function SettingsIndex() {
    const [current, setCurrent] = useState<CurrencyConfig>(getCurrency());
    const [saved, setSaved] = useState(false);

    const handleSelect = (config: CurrencyConfig) => {
        setCurrent(config);
        saveCurrency(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <AppLayout header={
            <div>
                <h1 className="text-xl font-bold text-slate-900">Paramètres</h1>
                <p className="text-sm text-slate-500">Personnalisez votre expérience FinanceTracker.</p>
            </div>
        }>
            <Head title="Paramètres" />

            <div className="max-w-2xl space-y-6">
                {/* Currency setting */}
                <div className="ft-card-static">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Devise</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Choisissez la devise utilisée dans toute l'application.</p>
                        </div>
                        {saved && (
                            <span className="text-sm font-medium text-emerald-600 animate-fade-in">✓ Enregistré</span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {CURRENCIES.map(c => (
                            <button
                                key={c.code}
                                onClick={() => handleSelect(c)}
                                className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-all duration-150 active:scale-95 ${
                                    current.code === c.code
                                        ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-300/50'
                                        : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
                                }`}
                            >
                                <span className="text-xl font-bold text-slate-900">{c.symbol}</span>
                                <span className="text-xs font-semibold text-slate-700">{c.code}</span>
                                <span className="text-xs text-slate-400">{c.locale}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Display preferences */}
                <div className="ft-card-static">
                    <h2 className="text-base font-bold text-slate-900 mb-5">Affichage</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                            <div>
                                <p className="text-sm font-medium text-slate-800">Langue</p>
                                <p className="text-xs text-slate-500">Langue de l'interface</p>
                            </div>
                            <select className="ft-select w-40">
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                                <option value="ar">العربية</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-sm font-medium text-slate-800">Semaine commence le</p>
                                <p className="text-xs text-slate-500">Pour les rapports hebdomadaires</p>
                            </div>
                            <select className="ft-select w-40">
                                <option value="0">Dimanche</option>
                                <option value="1">Lundi</option>
                                <option value="6">Samedi</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="ft-card-static">
                    <h2 className="text-base font-bold text-slate-900 mb-5">Notifications</h2>
                    <div className="space-y-3">
                        {[
                            { id: 'budget_alerts', label: 'Alertes de budget', desc: "Être notifié quand un budget est sur le point d'être dépassé" },
                            { id: 'goal_progress', label: "Progression des objectifs", desc: "Recevoir des mises à jour mensuelles sur vos objectifs d'épargne" },
                            { id: 'monthly_summary', label: 'Bilan mensuel', desc: 'Recevoir un résumé financier chaque début de mois' },
                        ].map(n => (
                            <label key={n.id} className="flex items-start gap-3 cursor-pointer py-2 group">
                                <input
                                    type="checkbox"
                                    id={n.id}
                                    defaultChecked
                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{n.label}</p>
                                    <p className="text-xs text-slate-500">{n.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
