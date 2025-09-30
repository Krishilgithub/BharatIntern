import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Mock dynamic statistics - replace with real database calls
        const stats = {
            activeInternships: 1234 + Math.floor(Math.random() * 100),
            registeredCompanies: 567 + Math.floor(Math.random() * 50),
            successRate: 89 + Math.floor(Math.random() * 6),
            placedCandidates: 8901 + Math.floor(Math.random() * 200),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}