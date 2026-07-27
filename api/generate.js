export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('MAKE_WEBHOOK_URL is not set');
      return res.status(500).json({ success: 'false', error: '서버 설정 오류입니다.' });
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    
    // Some responses might not be JSON, but Make webhooks usually return JSON or text.
    // We should try to parse as JSON, but handle text if it fails.
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { success: response.ok ? 'true' : 'false', message: text };
      }
    }
    
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Error in /api/generate:', err);
    return res.status(500).json({ success: 'false', error: '서버 연결에 실패했습니다.' });
  }
}
