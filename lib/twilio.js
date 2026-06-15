export async function sendReminders(phone, medicines) {
  try {
    const response = await fetch('/api/remind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, medicines }),
    });

    if (!response.ok) {
      throw new Error('Failed to send reminders');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Reminder Error:', error);
    throw error;
  }
}
