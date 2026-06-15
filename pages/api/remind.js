import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { phone, medicines } = req.body;

    if (!phone || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and medicines are required',
      });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const isMock = !accountSid || accountSid === 'your_key_here' || !authToken || authToken === 'your_key_here';

    let client;
    if (!isMock) {
      client = twilio(accountSid, authToken);
    }

    // Group medicines by frequency
    const groups = { morning: [], afternoon: [], evening: [], night: [] };

    medicines.forEach((med) => {
      if (med.frequency && Array.isArray(med.frequency)) {
        med.frequency.forEach((time) => {
          if (groups[time]) {
            groups[time].push(med);
          }
        });
      }
    });

    let sent = 0;

    for (const [timing, meds] of Object.entries(groups)) {
      if (meds.length === 0) continue;

      const medList = meds
        .map(
          (m) =>
            `\u2022 ${m.name} - ${m.dose}${m.instructions ? ' ' + m.instructions : ''}`
        )
        .join('\n');

      const emoji = {
        morning: '\u{1F305}',
        afternoon: '\u2600\uFE0F',
        evening: '\u{1F306}',
        night: '\u{1F319}',
      };

      const message = `VoiceRx Reminder \u{1F48A} ${emoji[timing]} ${timing.charAt(0).toUpperCase() + timing.slice(1)}\nTime to take:\n${medList}\nStay healthy! - VoiceRx`;

      if (isMock) {
        console.log(`[Twilio Mock SMS to ${phone}]: \n${message}\n--------------------`);
      } else {
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
      }

      sent++;
    }

    return res.status(200).json({ success: true, sent });
  } catch (error) {
    console.error('Remind error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send reminders. Please check the phone number.',
    });
  }
}
