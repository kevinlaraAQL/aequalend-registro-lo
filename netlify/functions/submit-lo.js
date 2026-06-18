/**
 * Aequalend — LO Onboarding Form Submission
 * Receives form data from the HTML form and inserts it into Supabase.
 * The Supabase URL and service_role key live in Netlify environment variables
 * (SUPABASE_URL / SUPABASE_SERVICE_KEY) — never in the HTML.
 */

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;          // https://xxxx.supabase.co
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;  // service_role key (secreta)
  const TABLE        = 'staff';                           // tabla unificada (staff + LOs)

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variable' })
    };
  }

  try {
    const { row } = JSON.parse(event.body);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(row)
    });

    const data = await res.json();

    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
