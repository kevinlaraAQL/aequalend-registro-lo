/**
 * Aequalend — LO Onboarding Form Submission
 * Receives form data from the HTML form and inserts it into Supabase.
 * The Supabase URL and service_role key live in Netlify environment variables
 * (SUPABASE_URL / SUPABASE_SERVICE_KEY) — never in the HTML.
 *
 * The form is public and this function writes with the master key, so it
 * trusts NOTHING the browser sends beyond the answers themselves:
 *   - only the form's own fields are kept; anything else is dropped (including
 *     the columns My AQL uses to track the row, like applied_at),
 *   - the Aequalend email is worked out here from the name, the same way the
 *     form shows it, and only used if nobody already has it. Nobody can pick
 *     an address, nor take a real employee's.
 */

// The columns the form fills. Nothing else reaches the table.
const FIELDS = [
  'name', 'role', 'nmls', 'personal_email', 'phone', 'birth_date', 'start_date',
  'licensed_states', 'street_address', 'city', 'state', 'zip_code',
  'linkedin', 'instagram', 'facebook', 'tiktok', 'bio', 'shirt_size',
  'bio_es', 'calendar_url', 'office_address', 'intro_video_url',
  'languages', 'photo_url'
];
// The two bios can run long; everything else is a short answer.
const LONG = new Set(['bio', 'bio_es']);
const MAX_LEN = 2000;
const MAX_LONG = 10000;

// Same rule as the form: first initial + last name @aequalend.com.
function corporateEmail(fullName) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  const strip = (s) => s.normalize('NFD').replace(/[^a-zA-Z]/g, '').toLowerCase();
  const initial = strip(parts[0]).charAt(0);
  const last = strip(parts[parts.length - 1]);
  return (initial && last) ? initial + last + '@aequalend.com' : '';
}

function webLink(v) {
  if (/^https?:\/\/\S+$/i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v) || /\s/.test(v)) return '';
  return 'https://' + v;
}

// The Aequalend address is how My AQL tells people apart: company directory,
// the name and photo at the top of the app, email signatures. A stranger who
// types "Sandra Estrella" must not get sestrella@aequalend.com and take her
// place. So it is filled only when NOBODY in the system has it yet; otherwise
// the row comes in without one and an admin sets it in Admin > People. If the
// check itself fails, it is left blank too: blank is safe, a wrong owner is not.
async function freeCorporateEmail(name, url, key, tables) {
  const computed = corporateEmail(name);
  if (!computed) return '';
  // computed is only letters, one @ and dots, so ilike is an exact,
  // case-insensitive match here (no % or _ wildcards possible).
  const q = encodeURIComponent(computed);
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  try {
    const taken = await Promise.all(tables.map(async (t) => {
      const r = await fetch(`${url}/rest/v1/${t}?select=email&email=ilike.${q}&limit=1`, { headers });
      if (!r.ok) return true;
      const rows = await r.json();
      return !Array.isArray(rows) || rows.length > 0;
    }));
    return taken.some(Boolean) ? '' : computed;
  } catch {
    return '';
  }
}

function json(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;          // https://xxxx.supabase.co
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;  // service_role key (secreta)
  const TABLE        = 'lo_onboarding';                   // tabla dedicada de onboarding de LOs

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return json(500, { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variable' });
  }

  let input;
  try {
    input = JSON.parse(event.body || '{}').row;
  } catch {
    return json(400, { error: 'bad_request' });
  }
  // One person per submission, as a plain object. Not a list of a thousand.
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return json(400, { error: 'bad_request' });
  }

  const row = { status: 'Activo' };
  for (const key of FIELDS) {
    const v = input[key];
    if (typeof v !== 'string') continue;
    const t = v.trim().slice(0, LONG.has(key) ? MAX_LONG : MAX_LEN);
    if (t) row[key] = t;
  }
  if (!row.name) return json(400, { error: 'name_required' });
  // Links end up on a public profile, so they must be web links. A pasted
  // "calendar.app.google/abc" gets its https:// back; anything with another
  // scheme (javascript:, data:) or with spaces in it is not a link and is dropped.
  for (const key of ['photo_url', 'intro_video_url', 'calendar_url']) {
    if (row[key]) row[key] = webLink(row[key]);
    if (!row[key]) delete row[key];
  }
  row.email = await freeCorporateEmail(row.name, SUPABASE_URL, SERVICE_KEY, ['lo_onboarding', 'loan_officers', 'staff', 'profiles']);

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    });

    if (!res.ok) {
      // The details go to the Netlify log, not back to whoever sent the form.
      console.error('Supabase insert failed', res.status, await res.text());
      return json(res.status >= 500 ? 502 : 400, { error: 'not_saved' });
    }
    return json(200, { ok: true });

  } catch (err) {
    console.error('Network error', err);
    return json(500, { error: 'not_saved' });
  }
};
