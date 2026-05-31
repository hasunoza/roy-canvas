export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, comment } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 is required' });
  }

  const userContent = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/png',
        data: imageBase64,
      },
    },
  ];

  if (comment) {
    userContent.push({ type: 'text', text: comment });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: 'あなたはロイという名前の数学の先生です。生徒が手書きで書いた数式や図を見て、丁寧にフィードバックを返してください。間違いがあれば優しく指摘し、正しければ褒めてあげてください。日本語で答えてください。',
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({ error: error.error?.message || 'API error' });
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
