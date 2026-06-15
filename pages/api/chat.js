import { geminiPro } from '../../lib/gemini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { question, medicines, language = 'hi-IN' } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, error: 'No question provided' });
    }

    const medicinesJson = JSON.stringify(medicines || [], null, 2);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      const q = question.toLowerCase();
      let answer = "";
      
      const isHindi = language.startsWith('hi');
      const isMarathi = language.startsWith('mr');
      const isBengali = language.startsWith('bn');
      const isTamil = language.startsWith('ta');
      const isTelugu = language.startsWith('te');

      if (q.includes('empty stomach') || q.includes('before food') || q.includes('खाली पेट') || q.includes(' जेवणाआधी')) {
        if (isHindi) {
          answer = "पेंटोप्राजोल (Pantoprazole) को सुबह खाली पेट (भोजन से पहले) लेना चाहिए। पैरासिटामोल (Paracetamol) और एमोक्सिसिलिन (Amoxicillin) को भोजन के बाद लेना चाहिए।";
        } else if (isMarathi) {
          answer = "पँटोप्राझोल (Pantoprazole) सकाळी रिकाम्या पोटी (जेवणापूर्वी) घ्यावी. पॅरासिटामॉल (Paracetamol) आणि अमॉक्सिसिलिन (Amoxicillin) जेवणानंतर घ्यावी.";
        } else if (isBengali) {
          answer = "প্যান্টোপ্রাজল (Pantoprazole) সকালে খালি পেটে (খাবারের আগে) নেওয়া উচিত। প্যারাসিটামল (Paracetamol) এবং অ্যামোক্সিসিলিন (Amoxicillin) খাবারের পরে নেওয়া উচিত।";
        } else if (isTamil) {
          answer = "பான்டோபிரசோல் (Pantoprazole) மருந்தை காலையில் வெறும் வயிற்றில் (உணவுக்கு முன்) சாப்பிட வேண்டும். பாராசிட்டமால் (Paracetamol) மற்றும் அமோக்சிசிலின் (Amoxicillin) உணவுக்கு பின் சாப்பிட வேண்டும்.";
        } else if (isTelugu) {
          answer = "పాంటోప్రజోల్ (Pantoprazole) ఉదయం ఖాళీ కడుపుతో (ఆహారానికి ముందు) తీసుకోవాలి. పారాసిటమాల్ (Paracetamol) మరియు అమోక్సిసిలిన్ (Amoxicillin) ఆహారం తర్వాత తీసుకోవాలి.";
        } else {
          answer = "Pantoprazole should be taken on an empty stomach in the morning before food. Paracetamol and Amoxicillin should be taken after food.";
        }
      } else if (q.includes('side effect') || q.includes('side-effect') || q.includes('नुकसान') || q.includes('दुष्परिणाम') || q.includes('পার্শ্বপ্রতিক্রিয়া') || q.includes('பக்க விளைவுகள்')) {
        if (isHindi) {
          answer = "एमोक्सिसिलिन से हल्का पेट खराब या दस्त हो सकता है। यदि आपको त्वचा पर लाल चकत्ते, खुजली या सांस लेने में तकलीफ हो, तो तुरंत दवा बंद करें और डॉक्टर से संपर्क करें।";
        } else if (isMarathi) {
          answer = "अमॉक्सिसिलिनमुळे सौम्य पोट खराब किंवा जुलाब होऊ शकतात. जर तुम्हाला त्वचेवर पुरळ, खाज सुटणे किंवा श्वास घेण्यास त्रास होत असेल तर ताबडतोब औषध थांबवा आणि डॉक्टरांशी संपर्क साधा।";
        } else if (isBengali) {
          answer = "অ্যামোক্সিসিলিনের কারণে পেট খারাপ বা পাতলা পায়খানা হতে পারে। যদি আপনার ত্বকে ফুসকুড়ি, চুলকানি বা শ্বাসকষ্ট হয়, তবে অবিলম্বে ওষুধ বন্ধ করুন এবং ডাক্তারের সাথে যোগাযোগ করুন।";
        } else if (isTamil) {
          answer = "அமோக்சிசிலின் லேசான வயிற்றுப்போக்கு அல்லது வயிற்று உபாதையை ஏற்படுத்தலாம். தோல் வெடிப்பு, அரிப்பு அல்லது மூச்சுத் திணறல் ஏற்பட்டால், உடனடியாக மருந்தை நிறுத்திவிட்டு மருத்துவரை அணுகவும்.";
        } else if (isTelugu) {
          answer = "అమోక్సిసిలిన్ వల్ల తేలికపాటి కడుపు నొప్పి లేదా విరేచనాలు కావచ్చు. చర్మంపై దద్దుర్లు, దురద లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉంటే, వెంటనే మందులు ఆపి వైద్యుడిని సంప్రదించండి.";
        } else {
          answer = "Amoxicillin may cause mild stomach upset or diarrhea. If you notice skin rash, itching, or difficulty breathing, stop the medicine immediately and consult your doctor.";
        }
      } else if (q.includes('other medicine') || q.includes('combination') || q.includes('दूसरी दवा') || q.includes('इतर औषध') || q.includes('অন্যান্য ওষুধ')) {
        if (isHindi) {
          answer = "कृपया डॉक्टर अनीता शर्मा से सलाह लिए बिना इस पर्चे के बाहर की कोई अन्य दवाएं न मिलाएं।";
        } else if (isMarathi) {
          answer = "कृपया डॉक्टर अनिता शर्मा यांच्या सल्ल्याशिवाय या प्रिस्क्रिप्शन बाहेरील इतर कोणतीही औषधे एकत्र घेऊ नका.";
        } else if (isBengali) {
          answer = "দয়া করে ডক্টর অনিতা শর্মার পরামর্শ ছাড়া এই প্রেসক্রিপশনের বাইরের অন্য কোনো ওষুধ খাবেন না।";
        } else if (isTamil) {
          answer = "டாக்டர் அனிதா சர்மாவின் ஆলোசனையின்றி இந்த மருந்துச்சீட்டுக்கு வெளியே வேறு எந்த மருந்தையும் இணைக்க வேண்டாம்.";
        } else if (isTelugu) {
          answer = "దయచేసి డాక్టర్ అనితా శర్మ సలహా లేకుండా ఈ ప్రిస్క్రిప్షన్ వెలుపల ఇతర మందులను కలిపి తీసుకోవద్దు.";
        } else {
          answer = "Please consult Dr. Anita Sharma before combining any other medicines outside this prescription.";
        }
      } else {
        if (isHindi) {
          answer = "आपके पर्चे में 3 दवाएं हैं: पैरासिटामोल 650mg (सुबह/रात, 5 दिन), एमोक्सिसिलिन 500mg (सुबह/दोपहर/रात, 7 दिन), और पेंटोप्राजोल 40mg (सुबह, 5 दिन)। क्या आप इनके बारे में कुछ और जानना चाहते हैं?";
        } else if (isMarathi) {
          answer = "तुमच्या प्रिस्क्रिप्शनमध्ये ३ औषधे आहेत: पॅरासिटामॉल 650mg (सकाळी/रात्री, ५ दिवस), अमॉक्सिसिलिन 500mg (सकाळी/दुपारी/रात्री, ७ दिवस), आणि पँटोप्राझोल 40mg (सकाळी, ५ दिवस). तुम्हाला याबद्दल काही माहिती हवी आहे का?";
        } else if (isBengali) {
          answer = "আপনার প্রেসক্রিপশনে ৩টি ওষুধ রয়েছে: প্যারাসিটামল ৬৫০mg (সকালে/রাতে, ৫ দিন), অ্যামোক্সিসিলিন ৫০০mg (সকালে/দুপুরে/রাতে, ৭ দিন), এবং প্যান্টোপ্রাজল ৪০mg (সকালে, ৫ দিন)। আপনি কি এই ওষুধগুলি সম্পর্কে অন্য কিছু জানতে চান?";
        } else if (isTamil) {
          answer = "உங்கள் மருந்துச்சீட்டில் 3 மருந்துகள் உள்ளன: பாராசிட்டமால் 650mg (காலை/இரவு, 5 நாட்கள்), அமோக்சிசிலின் 500mg (காலை/மதியம்/இரவு, 7 நாட்கள்), மற்றும் பான்டோபிரசோல் 40mg (காலை, 5 நாட்கள்). நீங்கள் வேறு ஏதாவது தெரிந்து கொள்ள வேண்டுமா?";
        } else if (isTelugu) {
          answer = "మీ ప్రిస్క్రిప్షన్‌లో 3 మందులు ఉన్నాయి: పారాసిటమాల్ 650mg (ఉదయం/రాత్రి, 5 రోజులు), అమోక్సిసిలిన్ 500mg (ఉదయం/మధ్యాహ్నం/రాత్రి, 7 రోజులు), మరియు పాంటోప్రజోల్ 40mg (ఉదయం, 5 రోజులు). మీరు వీటి గురించి ఇంకా ఏదైనా తెలుసుకోవాలనుకుంటున్నారా?";
        } else {
          answer = `Your prescription contains 3 medicines:\n1. Paracetamol 650mg - twice daily (morning, night) for 5 days.\n2. Amoxicillin 500mg - thrice daily (morning, afternoon, night) for 7 days.\n3. Pantoprazole 40mg - once daily (morning) for 5 days.\n\nHow else can I help you with your prescription?`;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      return res.status(200).json({ success: true, answer });
    }

    const prompt = `You are a helpful medication assistant for a patient.
The patient has been prescribed these medicines: ${medicinesJson}
Answer the patient's question ONLY based on this prescription.
If the question is not about these medicines, say:
'I can only answer questions about your current prescription.'
Keep answers short, simple, and easy to understand.
Respond in the same language as the question.

Patient question: ${question}`;

    const result = await geminiPro.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    return res.status(200).json({ success: true, answer });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.',
    });
  }
}
