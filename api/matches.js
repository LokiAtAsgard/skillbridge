import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.mrjpkviryziixphuhmdp.supabase.co, process.env.sb_publishable_7X6EhP6OU_bzbBc_hYiO0g_fVtru7nx);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  // GET — fetch all matches for current user
  if (req.method === 'GET') {
    let query = supabase.from('matches')
      .select('*, listings(*), employee:profiles!matches_employee_id_fkey(*), employer:profiles!matches_employer_id_fkey(*), messages(*)');
    if (profile.role === 'employee') query = query.eq('employee_id', user.id);
    if (profile.role === 'employer') query = query.eq('employer_id', user.id);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST — employee expresses interest (creates or updates match row)
  if (req.method === 'POST' && profile.role === 'employee') {
    const { listing_id, employer_id } = req.body;
    const { data: existing } = await supabase.from('matches')
      .select('*').eq('listing_id', listing_id).eq('employee_id', user.id).single();

    if (existing) {
      const { data, error } = await supabase.from('matches')
        .update({ employee_interested: true, matched: existing.employer_interested })
        .eq('id', existing.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    const { data, error } = await supabase.from('matches').insert([{
      listing_id, employee_id: user.id, employer_id,
      employee_interested: true, employer_interested: false, matched: false
    }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // PUT — employer approves interest (sets employer_interested, checks for mutual match)
  if (req.method === 'PUT' && profile.role === 'employer') {
    const { match_id } = req.body;
    const { data: match } = await supabase.from('matches').select('*').eq('id', match_id).single();
    if (!match) return res.status(404).json({ error: 'Match not found' });
    const isNowMatched = match.employee_interested;
    const { data, error } = await supabase.from('matches')
      .update({ employer_interested: true, matched: isNowMatched })
      .eq('id', match_id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).end();
}