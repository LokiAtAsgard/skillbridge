import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { search, type, city, industry, allowance, sort, featured } = req.query;

  let query = supabase.from('listings').select('*');

  if (search) {
    query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,skills.ilike.%${search}%`);
  }
  if (type)     query = query.eq('type', type);
  if (city)     query = query.eq('city', city);
  if (industry) query = query.eq('industry', industry);
  if (allowance) query = query.gte('allowance', parseInt(allowance));
  if (featured === 'true') query = query.eq('featured', true);

  if (sort === 'allowance') {
    query = query.order('allowance', { ascending: false });
  } else if (sort === 'newest') {
    query = query.order('posted', { ascending: false });
  } else {
    query = query.order('featured', { ascending: false }).order('id');
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}