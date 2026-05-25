import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.https://mrjpkviryziixphuhmdp.supabase.co/rest/v1/, process.env.sb_publishable_7X6EhP6OU_bzbBc_hYiO0g_fVtru7nx);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { data, error } = await supabase.from('profiles').select('*').order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}