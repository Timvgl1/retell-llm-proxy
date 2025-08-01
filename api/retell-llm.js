export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    // Fallback für leeres messages[]
    const messages = body?.messages || [
      {
        role: 'user',
        content: 'Start',
      }
    ];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Du bist ein deutschsprachiger Vertriebsassistent der Firma Advisy. 
Dein Ziel ist es, Entscheider in E-Commerce-Unternehmen zu überzeugen, ein 15-minütiges Strategiegespräch zu führen.
Du sprichst direkt, charmant, leicht provokant und auf Augenhöhe.`
          },
          ...messages
        ]
      }),
    });

    const gpt = await openaiRes.json();

    // Fallback wenn GPT aussteigt
    const content = gpt?.choices?.[0]?.message?.content || "Leider keine Antwort von GPT – bitte später erneut versuchen.";

    return new Response(JSON.stringify({
      choices: [
        {
          message: {
            role: "assistant",
            content
          }
        }
      ]
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: err.message || err.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
