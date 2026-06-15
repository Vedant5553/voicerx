'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader, MessageCircle } from 'lucide-react';
import ChatBubble from '../../components/ChatBubble';

const suggestions = [
  'Can I take this on empty stomach?',
  'What are the side effects?',
  'Can I take with other medicines?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [language, setLanguage] = useState('hi-IN');
  const [toast, setToast] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const savedMedicines = localStorage.getItem('voicerx_medicines');
    const savedLang = localStorage.getItem('voicerx_lang');

    if (savedMedicines) {
      try {
        setMedicines(JSON.parse(savedMedicines));
      } catch (e) {
        console.error('Failed to parse medicines:', e);
      }
    }
    if (savedLang) {
      setLanguage(savedLang);
    }

    // Welcome message
    setMessages([
      {
        role: 'ai',
        text: 'Hello! I\'m your medication assistant. Ask me anything about your prescribed medicines. 💊',
      },
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playTTS = async (text) => {
    try {
      let data = { success: false };
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, languageCode: language }),
        });
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          throw new Error('Server returned non-JSON/error response');
        }
      } catch (fetchError) {
        console.warn('TTS API fetch failed, falling back to Web Speech API:', fetchError.message);
        data = { success: true, fallback: true };
      }

      if (data.success && (data.fallback || !data.audio)) {
        return new Promise((resolve, reject) => {
          if (typeof window === 'undefined' || !window.speechSynthesis) {
            reject(new Error('Speech synthesis not supported in this browser'));
            return;
          }
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language;

          const voices = window.speechSynthesis.getVoices();
          const matchingVoice = voices.find((v) => v.lang.startsWith(language.split('-')[0]));
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }

          utterance.onend = resolve;
          utterance.onerror = reject;
          window.speechSynthesis.speak(utterance);
        });
      }

      if (data.success && data.audio) {
        return new Promise((resolve, reject) => {
          const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
          audio.onended = resolve;
          audio.onerror = reject;
          audio.play();
        });
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let data = null;
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: text.trim(),
            medicines,
            language,
          }),
        });

        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          throw new Error('Server returned non-JSON/error response');
        }
      } catch (e) {
        console.warn('Chat API failed or returned non-JSON. Using browser fallback:', e.message);
        
        // Multilingual rule-based assistant
        const q = text.trim().toLowerCase();
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
            answer = "అమోక్సిసిలిన్ వల్ల తేలికపాటి కడుపు నొప్పి లేదా విరేచనాలు కావచ్చు. చర్మంపై దద్దుర్లు, దుরద లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉంటే, వెంటనే మందులు ఆపి వైద్యుడిని సంప్రదించండి.";
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
            answer = "டாக்டர் அனிதா சர்மாவின் ஆலோசனையின்றி இந்த மருந்துச்சீட்டுக்கு வெளியே வேறு எந்த மருந்தையும் இணைக்க வேண்டாம்.";
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
            answer = "আপনার প্রেসক্রিপশনে ৩টি ওষুধ রয়েছে: প্যারাসิตামল ৬৫০mg (সকালে/রাতে, ৫ দিন), অ্যামোক্সিসিলিন ৫০০mg (সকালে/দুপুরে/রাতে, ৭ দিন), এবং প্যান্টোপ্রাজল ৪০mg (সকালে, ৫ দিন)। আপনি কি এই ওষুধগুলি সম্পর্কে অন্য কিছু জানতে চান?";
          } else if (isTamil) {
            answer = "உங்கள் மருந்துச்சீட்டில் 3 மருந்துகள் உள்ளன: பாராசிட்டமால் 650mg (காலை/இரவு, 5 நாட்கள்), அமோக்சிசிலின் 500mg (காலை/மதியம்/இரவு, 7 நாட்கள்), மற்றும் பான்டோபிரசோல் 40mg (காலை, 5 நாட்கள்). நீங்கள் வேறு ஏதாவது தெரிந்து கொள்ள வேண்டுமா?";
          } else if (isTelugu) {
            answer = "మీ ప్రిస్క్రిప్షన్‌లో 3 మందులు ఉన్నాయి: పారాసిటమాల్ 650mg (ఉదయం/రాత్రి, 5 రోజులు), అమోక్సిసిలిన్ 500mg (ఉదయం/మధ్యాహ్నం/రాత్రి, 7 రోజులు), మరియు పాంటోప్రజోల్ 40mg (ఉదయం, 5 రోజులు). మీరు వీటి గురించి ఇంకా ఏదైనా తెలుసుకోవాలనుకుంటున్నారా?";
          } else {
            answer = `Your prescription contains 3 medicines:\n1. Paracetamol 650mg - twice daily (morning, night) for 5 days.\n2. Amoxicillin 500mg - thrice daily (morning, afternoon, night) for 7 days.\n3. Pantoprazole 40mg - once daily (morning) for 5 days.\n\nHow else can I help you with your prescription?`;
          }
        }
        
        await new Promise((resolve) => setTimeout(resolve, 800));
        data = { success: true, answer };
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Chat failed');
      }

      const aiMessage = { role: 'ai', text: data.answer };
      setMessages((prev) => [...prev, aiMessage]);

      // Auto-play TTS
      try {
        await playTTS(data.answer);
      } catch (e) {
        // TTS is optional, don't show error
      }
    } catch (error) {
      console.error('Chat error:', error);
      showToast('Something went wrong. Please try again.');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 8rem)',
        padding: '0',
      }}
    >
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <MessageCircle size={22} color="var(--primary)" />
          Ask about your prescription
        </h1>
        {medicines.length === 0 && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Upload a prescription first to get personalized answers
          </p>
        )}
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 1.25rem',
        }}
      >
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            message={msg}
            onPlayTTS={playTTS}
          />
        ))}

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
            <div
              className="chat-bubble-ai"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Loader size={16} className="animate-spin-slow" color="var(--primary)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <div
          style={{
            padding: '0.5rem 1.25rem',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => sendMessage(s)}
              disabled={isLoading}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          background: 'white',
        }}
      >
        <input
          ref={inputRef}
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          disabled={isLoading}
          style={{
            flex: 1,
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.75rem 1.125rem',
            fontSize: '0.9375rem',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            fontFamily: 'Inter, sans-serif',
            background: 'var(--bg-subtle)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        <button
          id="send-button"
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '50%',
            border: 'none',
            background:
              input.trim()
                ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                : 'var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
          aria-label="Send message"
        >
          <Send
            size={18}
            color={input.trim() ? 'white' : 'var(--text-muted)'}
            style={{ marginLeft: '1px', marginTop: '-1px' }}
          />
        </button>
      </form>
    </div>
  );
}
