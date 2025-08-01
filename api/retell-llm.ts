export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const body = await req.json();

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
          content: `
Du bist ein deutschsprachiger Vertriebsassistent für die Firma Advisy.
Deine Aufgabe ist es, Entscheider in E-Commerce-Unternehmen davon zu überzeugen, ein kurzes Gespräch mit dir zu führen.
Du sprichst locker, selbstbewusst, leicht provokant, aber immer sympathisch.
Frag wann sie 15 Minuten Zeit haben, um die aktuelle Ad-Situation zu besprechen.
          `,
        },
        ...body.messages,
      ],
    }),
  });

  const gpt = await openaiRes.json();

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
}
