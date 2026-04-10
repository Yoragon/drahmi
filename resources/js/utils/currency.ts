/**
 * Formatage monétaire centralisé.
 * La devise est stockée dans localStorage (clé: ft_currency).
 * Par défaut : Dinar Algérien (DZD).
 */

export interface CurrencyConfig {
    code: string;       // "DZD", "EUR", "USD"
    symbol: string;     // "DA", "€", "$"
    locale: string;     // "fr-DZ", "fr-FR", "en-US"
    decimals: number;   // 2
}

export const CURRENCIES: CurrencyConfig[] = [
    { code: 'DZD', symbol: 'DA',  locale: 'fr-DZ', decimals: 2 },
    { code: 'EUR', symbol: '€',   locale: 'fr-FR', decimals: 2 },
    { code: 'USD', symbol: '$',   locale: 'en-US', decimals: 2 },
    { code: 'GBP', symbol: '£',   locale: 'en-GB', decimals: 2 },
    { code: 'MAD', symbol: 'MAD', locale: 'fr-MA', decimals: 2 },
    { code: 'TND', symbol: 'TND', locale: 'fr-TN', decimals: 3 },
];

const STORAGE_KEY = 'ft_currency';
const DEFAULT: CurrencyConfig = CURRENCIES[0]; // DZD

export function getCurrency(): CurrencyConfig {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as CurrencyConfig;
            // Valider que le code existe encore dans la liste
            const found = CURRENCIES.find(c => c.code === parsed.code);
            if (found) return found;
        }
    } catch {}
    return DEFAULT;
}

export function saveCurrency(config: CurrencyConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** Formate un montant selon la devise active. */
export function fmt(amount: number): string {
    const c = getCurrency();
    return new Intl.NumberFormat(c.locale, {
        minimumFractionDigits: c.decimals,
        maximumFractionDigits: c.decimals,
    }).format(amount) + '\u00A0' + c.symbol;
}

/** Retourne juste le symbole (pour les labels de formulaires). */
export function currencySymbol(): string {
    return getCurrency().symbol;
}
