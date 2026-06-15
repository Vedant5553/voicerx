import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.image?.[0] || files.image;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const apiKey = process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey || apiKey === 'your_google_cloud_api_key_here' || apiKey === 'your_key_here') {
      const mockText = `Dr. Anita Sharma, MD
Apollo Clinic, New Delhi
Date: May 28, 2026
Patient: Vedan, Age: 28

Prescription:
1. Paracetamol 650mg
   - Take 1 tablet in the morning and 1 tablet at night after food.
   - For 5 days.
2. Amoxicillin 500mg
   - Take 1 capsule in the morning, 1 in the afternoon, and 1 at night.
   - For 7 days.
3. Pantoprazole 40mg
   - Take 1 tablet in the morning before food.
   - For 5 days.`;

      await new Promise((resolve) => setTimeout(resolve, 1500));
      return res.status(200).json({ success: true, text: mockText, mock: true });
    }

    const imageBuffer = fs.readFileSync(file.filepath || file.path);
    const base64Image = imageBuffer.toString('base64');

    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: 'TEXT_DETECTION' }]
            }
          ]
        })
      }
    );

    const data = await visionResponse.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    const text = data.responses?.[0]?.fullTextAnnotation?.text || '';

    return res.status(200).json({ success: true, text });
  } catch (error) {
    console.error('Scan error:', error);
    return res.status(500).json({
      success: false,
      error: 'Could not read prescription. Please take a clearer photo.',
    });
  }
}
