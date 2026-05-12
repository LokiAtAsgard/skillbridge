import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'DELETE') return res.status(405).end();

  const { id } = req.query;
  const { error } = await supabase.from('listings').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true });
}