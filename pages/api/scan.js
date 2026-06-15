import formidable from 'formidable';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Comprehensive medical drug name reference used in the OCR prompt
// This trains the model to recognize and correct common handwritten drug names
const DRUG_REFERENCE = `
COMMON PRESCRIPTION DRUG NAMES (use these exact spellings when reading handwriting):

ANTIBIOTICS: Amoxicillin, Amoxicillin-Clavulanate, Augmentin, Azithromycin, Azee, Zithromax,
Ciprofloxacin, Cipro, Doxycycline, Metronidazole, Flagyl, Cephalexin, Clindamycin,
Levofloxacin, Ofloxacin, Cefixime, Cefpodoxime, Cefuroxime, Ampicillin, Erythromycin,
Clarithromycin, Nitrofurantoin, Co-trimoxazole, Trimethoprim, Sulfamethoxazole,
Norfloxacin, Gemifloxacin, Moxifloxacin, Linezolid, Tetracycline, Roxithromycin,
Cloxacillin, Flucloxacillin, Dicloxacillin, Piperacillin-Tazobactam, Ceftriaxone,
Cefoperazone, Cefotaxime, Imipenem, Meropenem, Vancomycin, Colistin.

PAINKILLERS / ANALGESICS / ANTIPYRETICS: Paracetamol, Acetaminophen, Crocin, Dolo-650,
Ibuprofen, Brufen, Combiflam, Diclofenac, Voveran, Aspirin, Ecosprin, Naproxen, Naprosyn,
Indomethacin, Mefenamic Acid, Ponstan, Aceclofenac, Ketorolac, Celecoxib, Etoricoxib, Arcoxia,
Tramadol, Codeine, Morphine, Fentanyl, Oxycodone, Buprenorphine, Tapentadol, Pregabalin, Lyrica.

ANTACIDS / GI / ACID REFLUX: Pantoprazole, Pan-40, Omeprazole, Omez, Rabeprazole, Razo,
Esomeprazole, Nexium, Lansoprazole, Ranitidine, Rantac, Famotidine, Antacid, Sucralfate,
Domperidone, Domstal, Metoclopramide, Ondansetron, Zofran, Emeset, Loperamide, Bismuth,
Dicyclomine, Mebeverine, Albendazole, Mebendazole, Tinidazole, Rifaximin, Probiotics.

DIABETES / ANTIDIABETICS: Metformin, Glucophage, Glipizide, Glibenclamide, Glyburide,
Gliclazide, Pioglitazone, Actos, Voglibose, Sitagliptin, Januvia, Saxagliptin, Empagliflozin,
Dapagliflozin, Canagliflozin, Liraglutide, Insulin Regular, Insulin NPH, Insulin Glargine,
Lantus, Insulin Aspart, Insulin Lispro, Insulin Detemir, Teneligliptin, Alogliptin.

HEART / BLOOD PRESSURE / CARDIOLOGY: Amlodipine, Norvasc, Nifedipine, Atenolol, Metoprolol,
Bisoprolol, Carvedilol, Propranolol, Enalapril, Lisinopril, Ramipril, Telmisartan, Losartan,
Valsartan, Olmesartan, Furosemide, Lasix, Hydrochlorothiazide, Spironolactone, Digoxin,
Amiodarone, Warfarin, Heparin, Clopidogrel, Aspirin, Rosuvastatin, Crestor, Atorvastatin,
Lipitor, Lovastatin, Simvastatin, Ezetimibe, Nitroglycerin, Isosorbide, Clonidine.

RESPIRATORY: Salbutamol, Albuterol, Ventolin, Terbutaline, Formoterol, Salmeterol, Tiotropium,
Ipratropium, Montelukast, Singulair, Theophylline, Budesonide, Fluticasone, Beclomethasone,
Dexamethasone, Prednisolone, Methylprednisolone, Cetirizine, Zyrtec, Loratadine, Fexofenadine,
Pheniramine, Chlorpheniramine, Diphenhydramine, Levocetrizine, Codeine cough syrup, Dextromethorphan,
Ambroxol, Bromhexine, Guaifenesin, Benzocaine, N-acetylcysteine.

VITAMINS / MINERALS / SUPPLEMENTS: Vitamin D3, Vitamin D, Calcitriol, Vitamin B12, Methylcobalamin,
Vitamin B Complex, Multivitamin, Calcium Carbonate, Calcium Citrate, Iron, Ferrous Sulfate, Zinc,
Magnesium, Potassium Chloride, Folic Acid, Vitamin C, Ascorbic Acid, Vitamin E, Vitamin A,
Biotin, Lycopene, Omega-3, Fish Oil, Glucosamine, Chondroitin.

ANTIFUNGALS / ANTIVIRALS / ANTIPARASITICS: Fluconazole, Itraconazole, Ketoconazole, Clotrimazole,
Terbinafine, Griseofulvin, Acyclovir, Valacyclovir, Oseltamivir, Tamiflu, Ribavirin, Ivermectin,
Albendazole, Chloroquine, Hydroxychloroquine.

HORMONES / THYROID / OTHERS: Levothyroxine, Thyroxine, Eltroxin, Methimazole, Carbimazole,
Prednisolone, Dexamethasone, Betamethasone, Hydrocortisone, Testosterone, Estrogen, Progesterone,
Oral Contraceptive Pills (OCP), Mifepristone.

NEUROLOGICAL / PSYCHIATRIC / SLEEP: Alprazolam, Clonazepam, Diazepam, Lorazepam, Zolpidem,
Melatonin, Sertraline, Fluoxetine, Escitalopram, Paroxetine, Amitriptyline, Nortriptyline,
Duloxetine, Venlafaxine, Lithium, Olanzapine, Risperidone, Quetiapine, Haloperidol,
Carbamazepine, Phenytoin, Valproate, Levetiracetam, Gabapentin, Donepezil, Memantine.

DERMATOLOGY / TOPICAL: Hydrocortisone, Betamethasone, Clobetasol, Mometasone, Triamcinolone,
Clotrimazole, Mupirocin, Permethrin, Benzyl Benzoate, Calamine, Silver Sulfadiazine.
`;

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

    const apiKey = process.env.GEMINI_API_KEY;

    // If no Gemini key, return mock response
    if (!apiKey || apiKey === 'your_key_here') {
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

    // Read image file and encode to base64
    const imageBuffer = fs.readFileSync(file.filepath || file.path);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = file.mimetype || file.type || 'image/jpeg';

    // Use Gemini Vision model — it excels at handwriting and medical text OCR
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an expert medical prescription OCR system trained on thousands of doctor handwritten prescriptions.

Your task is to read this prescription image and extract ALL text from it accurately.

CRITICAL RULES:
1. Doctor handwriting is often messy. Use the DRUG REFERENCE LIST below to correct any unclear drug names.
2. If a partially legible word looks like a drug name in the reference list, use the CORRECT spelling from the list.
3. Preserve dosages (e.g. 500mg, 10mg, 1 tablet), frequencies (once daily, BD, TDS, QID, morning, night), and durations (5 days, 1 week).
4. Extract the doctor name, clinic name, date if visible.
5. BD = twice daily (morning + night). TDS = three times daily (morning, afternoon, night). QID = four times daily. OD = once daily. HS = at bedtime.
6. Do NOT invent any medicine names — only use names clearly visible or closely matching the drug reference.
7. Return the FULL prescription text exactly as you read it, with correct spellings.

DRUG REFERENCE LIST (use these exact spellings for correction):
${DRUG_REFERENCE}

Now read the prescription image and return the complete text:`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text().trim();

    if (!text || text.length < 10) {
      throw new Error('Could not read the prescription. Please take a clearer photo.');
    }

    return res.status(200).json({ success: true, text });

  } catch (error) {
    console.error('Scan error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Could not read prescription. Please take a clearer photo.',
    });
  }
}
