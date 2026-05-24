import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.mrjpkviryziixphuhmdp.supabase.co, process.env.sb_publishable_7X6EhP6OU_bzbBc_hYiO0g_fVtru7nxsb_publishable_7X6EhP6OU_bzbBc_hYiO0g_fVtru7nxEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    const { match_id } = req.query;
    const { data, error } = await supabase.from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(full_name, role)')
      .eq('match_id', match_id).order('created_at');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { match_id, content, interview_date, interview_time, is_interview_offer } = req.body;
    const { data, error } = await supabase.from('messages').insert([{
      match_id, sender_id: user.id, content,
      interview_date: interview_date || null,
      interview_time: interview_time || null,
      is_interview_offer: is_interview_offer || false
    }]).select('*, sender:profiles!messages_sender_id_fkey(full_name, role)').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
}