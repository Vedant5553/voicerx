export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { text, languageCode = 'hi-IN' } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'No text provided' });
    }

    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      return res.status(200).json({ success: true, audio: null, fallback: true });
    }
    
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode, ssmlGender: 'FEMALE' },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json();
      throw new Error(errorData.error?.message || 'TTS API failed');
    }

    const data = await ttsResponse.json();
    return res.status(200).json({ success: true, audio: data.audioContent });
  } catch (error) {
    console.error('TTS error:', error);
    return res.status(500).json({
      success: false,
      error: 'Text-to-speech failed. Please try again.',
    });
  }
}
