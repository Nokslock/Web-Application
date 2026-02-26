import { NextResponse } from "next/server";

// Cache exchange rates for 1 hour in memory
let cachedRates: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

const SUPPORTED_CURRENCIES = [
    "USD", "EUR", "GBP", "NGN", "CAD", "AUD", "KES", "GHS", "ZAR", "INR",
];

export async function GET() {
    try {
        // Return cached rates if still fresh
        if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION_MS) {
            return NextResponse.json({ rates: cachedRates.rates, cached: true });
        }

        // Fetch live rates from free API (no API key required)
        const response = await fetch("https://open.er-api.com/v6/latest/USD", {
            next: { revalidate: 3600 }, // Next.js ISR cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Exchange rate API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.result !== "success") {
            throw new Error("Exchange rate API returned unsuccessful result");
        }

        // Filter to only supported currencies
        const filteredRates: Record<string, number> = {};
        for (const code of SUPPORTED_CURRENCIES) {
            if (data.rates[code]) {
                filteredRates[code] = data.rates[code];
            }
        }

        // Cache the rates
        cachedRates = { rates: filteredRates, timestamp: Date.now() };

        return NextResponse.json({ rates: filteredRates, cached: false });
    } catch (error) {
        console.error("Failed to fetch exchange rates:", error);

        // If we have stale cached rates, return those as fallback
        if (cachedRates) {
            return NextResponse.json({ rates: cachedRates.rates, cached: true, stale: true });
        }

        // Ultimate fallback with hardcoded approximate rates
        return NextResponse.json({
            rates: {
                USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1550,
                CAD: 1.36, AUD: 1.53, KES: 129, GHS: 15.8,
                ZAR: 18.2, INR: 83.5,
            },
            cached: false,
            fallback: true,
        });
    }
}
