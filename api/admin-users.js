const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at');

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};