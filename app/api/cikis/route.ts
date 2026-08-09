import { NextResponse } from 'next/server';
import { sessionCookieTemizle } from '../../lib/session';

export async function POST() {
    const response = NextResponse.json({ basari: true });
    sessionCookieTemizle(response);
    return response;
}
