export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request body: messages[] required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
            content: `Du bist ein deutschsprachiger Vertriebsassistent für die Firma Advisy.
Deine Aufgabe ist es, Entscheider in E-Commerce-Unternehmen davon zu überzeugen, ein kurzes Gespräch mit dir zu führen.
Du sprichst locker, selbstbewusst, leicht provokant, aber immer sympathisch.
Frag wann sie 15 Minuten Zeit haben, um die aktuelle Ad-Situation zu besprechen.`,
          },
          ...body.messages,
        ],
      }),
    });

    const gpt = await openaiRes.json();

    if (!gpt || !gpt.choices || !gpt.choices[0]?.message?.content) {
      return new Response(JSON.stringify({ error: 'Invalid OpenAI response' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      choices: [
        {
          message: {
            role: "assistant",
            content: gpt.choices[0].message.content,
          },
        },
      ],
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: `${err}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
