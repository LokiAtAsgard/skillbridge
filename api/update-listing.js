const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).end();

  const { id } = req.query;
  const { title, company, type, industry, city, allowance, duration, slots, skills, status, featured, verified, icon } = req.body;

  const { data, error } = await supabase
    .from('listings')
    .update({
      title, company, type, industry, city,
      allowance: parseInt(allowance),
      duration,
      slots: parseInt(slots),
      skills, status, icon,
      featured: featured === 'true' || featured === true,
      verified: verified === 'true' || verified === true
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};