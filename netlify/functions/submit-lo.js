/**
 * Aequalend — LO Onboarding Form Submission
 * Receives form data from the HTML form and sends it to Airtable.
 * The Airtable token lives in Netlify environment variables (never in the HTML).
 */

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID        = 'appJkLG6dpvfMPygE';
  const TABLE_ID       = 'tblM736DaUWGS1frv';

  if (!AIRTABLE_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing AIRTABLE_TOKEN environment variable' })
    };
  }

  try {
    const { fields } = JSON.parse(event.body);

    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields, typecast: true })
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
