import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  car_id: z.string().uuid().optional(),
  message: z.string().min(10),
});

// SEC-04 : rate-limit par IP (fenêtre glissante, en mémoire par instance serverless).
// Protège du spam de base ; limite connue : par instance (pas de coordination multi-instances).
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_MAX = 5; // messages max par fenêtre et par IP
const requestLog = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  // Purge opportuniste des IP devenues inactives (évite une Map non bornée)
  if (requestLog.size > 1000) {
    for (const [key, stamps] of requestLog) {
      if (stamps.every((s) => now - s > RATE_WINDOW_MS)) requestLog.delete(key);
    }
  }
  const stamps = (requestLog.get(ip) || []).filter((s) => now - s < RATE_WINDOW_MS);
  if (stamps.length >= RATE_MAX) {
    return { limited: true, retryAfterSec: Math.ceil((RATE_WINDOW_MS - (now - stamps[0])) / 1000) };
  }
  stamps.push(now);
  requestLog.set(ip, stamps);
  return { limited: false, retryAfterSec: 0 };
}

export async function POST(request: NextRequest) {
  try {
    // SEC-04 : anti-spam — contrôle avant tout travail (parse, requête DB)
    const { limited, retryAfterSec } = checkRateLimit(getClientIp(request));
    if (limited) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans quelques minutes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('contact_messages').insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      car_id: parsed.data.car_id || null,
      message: parsed.data.message,
      status: 'new',
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}