const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('profiles').select('*').eq('id', user.id).single();
    if (error) return res.status(404).json({ error: 'Profile not found' });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { role, full_name, city, skills, bio, company_name, company_industry } = req.body;
    const { data, error } = await supabase.from('profiles').insert([{
      id: user.id, role, full_name, email: user.email,
      city, skills, bio, company_name, company_industry
    }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { full_name, city, skills, bio, company_name, company_industry } = req.body;
    const { data, error } = await supabase.from('profiles')
      .update({ full_name, city, skills, bio, company_name, company_industry })
      .eq('id', user.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
};