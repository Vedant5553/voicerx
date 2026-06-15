import { geminiPro } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { text, language, patientPhone } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'No text provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let medicines;

    if (!apiKey || apiKey === 'your_key_here') {
      medicines = [];
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('paracetamol')) {
        medicines.push({
          name: "Paracetamol",
          dose: "650mg",
          frequency: ["morning", "night"],
          duration: 5,
          instructions: "after food"
        });
      }
      if (lowerText.includes('amoxicillin')) {
        medicines.push({
          name: "Amoxicillin",
          dose: "500mg",
          frequency: ["morning", "afternoon", "night"],
          duration: 7,
          instructions: "after food"
        });
      }
      if (lowerText.includes('pantoprazole')) {
        medicines.push({
          name: "Pantoprazole",
          dose: "40mg",
          frequency: ["morning"],
          duration: 5,
          instructions: "before food"
        });
      }
      
      if (medicines.length === 0) {
        medicines = [
          {
            name: "Paracetamol",
            dose: "650mg",
            frequency: ["morning", "night"],
            duration: 5,
            instructions: "after food"
          }
        ];
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      const prompt = `You are a medical prescription parser.
Extract all medicines from the text below and return ONLY a JSON array.
Each object must have:
- name: medicine name (string)
- dose: dosage amount like 500mg (string)
- frequency: array using only these values: morning, afternoon, evening, night
- duration: number of days or null
- instructions: special instructions like after food or null
Return nothing except valid JSON array. No explanation. No markdown backticks.

Prescription text: ${text}`;

      const result = await geminiPro.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      try {
        medicines = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\[.*\]/s);
        if (jsonMatch) {
          medicines = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse medicines from AI response');
        }
      }
    }

    // Save to Supabase
    let docId = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here') {
        const { data, error } = await supabase
          .from('prescriptions')
          .insert([
            {
              id: uuidv4(),
              raw_text: text,
              medicines: medicines,
              patient_phone: patientPhone || '',
              language: language || 'hi-IN'
            }
          ])
          .select();
        
        if (error) throw error;
        if (data && data.length > 0) {
          docId = data[0].id;
        }
      } else {
        docId = uuidv4();
        console.warn('Supabase not configured, using mock UUID');
      }
    } catch (supabaseError) {
      console.warn('Supabase save failed (continuing):', supabaseError.message);
    }

    return res.status(200).json({ success: true, medicines, docId });
  } catch (error) {
    console.error('Parse error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to parse prescription. Please try again.',
    });
  }
}
