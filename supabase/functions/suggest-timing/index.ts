import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, scenario, customerProfile } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analisar apenas se há mensagens suficientes
    if (messages.length < 3) {
      return new Response(
        JSON.stringify({ 
          should_suggest: false,
          suggestion: null 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const conversationContext = messages.slice(-4).map((msg: any) => 
      `${msg.role === 'user' ? 'ATENDENTE' : 'CLIENTE'}: ${msg.content}`
    ).join('\n');

    const analysisPrompt = `Você é um assistente que ajuda atendentes a identificar o melhor momento para abordar vendas.

CENÁRIO: ${scenario}
PERFIL DO CLIENTE: ${customerProfile}

ÚLTIMAS MENSAGENS DA CONVERSA:
${conversationContext}

Analise se este é um BOM MOMENTO para o atendente fazer uma oferta/venda baseado em:
1. O cliente demonstrou alguma necessidade ou interesse?
2. Há um bom rapport estabelecido?
3. O atendente já entendeu a situação do cliente?
4. O timing parece adequado?

IMPORTANTE: Só sugira se realmente for um momento oportuno. Não force vendas.

Responda APENAS com um JSON no formato:
{
  "should_suggest": true ou false,
  "timing_score": 0-100 (quão bom é o momento),
  "suggestion": "texto da sugestão para o atendente (ou null se should_suggest = false)",
  "reasoning": "breve explicação do porquê sugerir ou não"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao comunicar com a IA");
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Extract JSON
    let jsonString = aiResponse;
    const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
    } else {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
    }

    const lastBraceIndex = jsonString.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      jsonString = jsonString.substring(0, lastBraceIndex + 1);
    }

    const analysis = JSON.parse(jsonString);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Suggestion timing error:", error);
    return new Response(
      JSON.stringify({ 
        should_suggest: false,
        suggestion: null,
        error: error instanceof Error ? error.message : "Erro ao analisar"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});