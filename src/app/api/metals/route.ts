
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
    try {
        const response = await fetch("https://gold-silver-api.vercel.app/api/all", {
             headers: {
                'Content-Type': 'application/json',
            },
            // Revalidate every hour
            next: { revalidate: 3600 } 
        });

        if (!response.ok) {
            console.error("API fetch failed with status:", response.status);
            return NextResponse.json({ error: 'Failed to fetch metal prices from external API.' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Error fetching metal prices:", error);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}
