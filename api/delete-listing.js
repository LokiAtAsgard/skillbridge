import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.mrjpkviryziixphuhmdp.supabase.co,
  process.env.sb_publishable_7X6EhP6OU_bzbBc_hYiO0g_fVtru7nx
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'DELETE') return res.status(405).end();

  const { id } = req.query;
  const { error } = await supabase.from('listings').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true });
}