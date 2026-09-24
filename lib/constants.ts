// BUG-27 : ID du singleton garage_infos — ciblé par l'admin (upsert) et lu par les pages publiques.
// L'ancien insert laissait Supabase générer un UUID aléatoire : ligne invisible côté public.
export const GARAGE_INFO_ID = '00000000-0000-0000-0000-000000000000';
