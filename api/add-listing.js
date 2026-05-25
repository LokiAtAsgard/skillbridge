const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { title, company, type, industry, city, allowance, duration, slots, skills, icon } = req.body;

  if (!title || !company || !city) {
    return res.status(400).json({ error: 'Title, company, and city are required.' });
  }

  const { data, error } = await supabase.from('listings').insert([{
    title, company, type, industry, city,
    allowance: parseInt(allowance) || 0,
    duration,
    slots: parseInt(slots) || 1,
    skills,
    icon: icon || '💼',
    verified: false,
    featured: false,
    status: 'active',
    posted: new Date().toISOString().split('T')[0]
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};
