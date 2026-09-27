const nodemailer = require('nodemailer');

const TO_EMAIL = 'Artisansrefuge@gmail.com';

function clean(v, max) {
  return v && typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function buildRequestMessage(type, d) {
  return [
    `NEW ${type.toUpperCase()} REQUEST — Kapoe Inked`,
    `From: ${d.name} (${d.email}${d.phone ? ', ' + d.phone : ''})`,
    `Size: ${d.size}`,
    `Placement: ${d.placement}`,
    d.date ? `Preferred date: ${d.date}` : null,
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
  const type = body.type === 'consultation' ? 'consultation' : body.type === 'appointment' ? 'appointment' : null;
  if (!type) {
    res.status(400).json({ error: 'Please choose a request type.' });
    return;
  }

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const idea = clean(body.idea, 600);
  const size = clean(body.size, 40);
  const placement = clean(body.placement, 80);
  if (!name || !email || !idea || !size || !placement) {
    res.status(400).json({ error: 'Name, email, size, placement, and a description of the idea are required.' });
    return;
  }

  const subject = `New ${type} request from ${name}`;
  const messageBody = buildRequestMessage(type, {
    name, email, idea, size, placement,
    phone: clean(body.phone, 30),
    date: clean(body.date, 10),
    reference: clean(body.reference, 300),
  });

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.error('Gmail env vars are not configured.');
    res.status(500).json({ error: 'Online submissions are not fully set up yet.' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailAppPassword },
    });
    await transporter.sendMail({
      from: `Kapoe Inked Website <${gmailUser}>`,
      to: TO_EMAIL,
      replyTo: email,
      subject,
      text: messageBody,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email send failed:', err && err.message);
    res.status(502).json({ error: 'Could not send that.' });
  }
};
