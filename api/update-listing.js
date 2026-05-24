import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.mrjpkviryziixphuhmdp.supabase.co, process.env.sb_publishable_7X6EhP6OU_bzbBc_hYiO0g_fVtru7nx);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).end();

  const { id } = req.query;
  const { title, company, type, industry, city, allowance, duration, slots, skills, status, featured, verified, icon } = req.body;

  const { data, error } = await supabase
    .from('listings')
    .update({ title, company, type, industry, city, allowance: parseInt(allowance), duration, slots: parseInt(slots), skills, status, featured: featured === 'true' || featured === true, verified: verified === 'true' || verified === true, icon })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}