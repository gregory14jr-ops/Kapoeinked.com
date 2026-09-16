const twilio = require('twilio');

function clean(v, max) {
  return v && typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function buildBookingMessage(d) {
  return [
    'NEW BOOKING REQUEST — Kapoe Inked',
    `From: ${d.name} (${d.email}${d.phone ? ', ' + d.phone : ''})`,
    `Size: ${d.size}`,
    `Placement: ${d.placement}`,
    d.date ? `Preferred date: ${d.date}` : null,
    '',
    'Idea:',
    d.idea,
  ].filter(Boolean).join('\n');
}

function buildIdeaMessage(d) {
  return [
    'NEW TATTOO IDEA — Kapoe Inked',
    `From: ${d.name} (${d.email})`,
    `Style: ${d.style}`,
    '',
    'Idea:',
    d.idea,
    d.reference ? `\nReference: ${d.reference}` : null,
  ].filter(Boolean).join('\n');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const type = body.type === 'idea' ? 'idea' : body.type === 'booking' ? 'booking' : null;
  if (!type) {
    res.status(400).json({ error: 'Unrecognized request type.' });
    return;
  }

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const idea = clean(body.idea, 600);
  if (!name || !email || !idea) {
    res.status(400).json({ error: 'Name, email, and a description of the idea are required.' });
    return;
  }

  let messageBody;
  if (type === 'booking') {
    const size = clean(body.size, 40);
    const placement = clean(body.placement, 80);
    if (!size || !placement) {
      res.status(400).json({ error: 'Size and placement are required.' });
      return;
    }
    messageBody = buildBookingMessage({
      name, email, idea, size, placement,
      phone: clean(body.phone, 30),
      date: clean(body.date, 10),
    });
  } else {
    const style = clean(body.style, 60);
    if (!style) {
      res.status(400).json({ error: 'Please choose a style.' });
      return;
    }
    messageBody = buildIdeaMessage({
      name, email, idea, style,
      reference: clean(body.reference, 300),
    });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const ownerNumber = process.env.OWNER_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber || !ownerNumber) {
    console.error('Twilio env vars are not configured.');
    res.status(500).json({ error: 'Online submissions are not fully set up yet.' });
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({ body: messageBody, from: fromNumber, to: ownerNumber });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Twilio send failed:', err && err.message);
    res.status(502).json({ error: 'Could not send that.' });
  }
};
