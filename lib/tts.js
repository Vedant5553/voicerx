export async function synthesizeSpeech(text, languageCode = 'hi-IN') {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, languageCode }),
    });

    if (!response.ok) {
      throw new Error('TTS request failed');
    }

    const data = await response.json();
    return data.audio;
  } catch (error) {
    console.error('TTS Error:', error);
    throw error;
  }
}

export function playBase64Audio(base64Audio) {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play();
      return audio;
    } catch (error) {
      reject(error);
    }
  });
}
