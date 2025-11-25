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
    const { transcript, scenario, customerProfile } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for evaluation
    const evaluationPrompt = `Você é um avaliador especialista em atendimento ao cliente de call center bancário.

CENÁRIO: ${scenario}
PERFIL DO CLIENTE: ${customerProfile}

Analise a conversa abaixo e avalie a conduta do operador com base em princípios fundamentais de atendimento.

TRANSCRIÇÃO DA CONVERSA:
${transcript.map((msg: any) => `${msg.role === 'user' ? 'ATENDENTE' : 'CLIENTE'}: ${msg.content}`).join('\n')}

INSTRUÇÕES DE AVALIAÇÃO:

Avalie o atendente nos seguintes princípios (nota de 0 a 10 para cada):

1. ACOLHIMENTO: O atendente demonstrou receptividade, cordialidade e disposição para ajudar desde o início?
2. EMPATIA: O atendente compreendeu as emoções e necessidades do cliente, demonstrando sensibilidade?
3. RESOLUTIVIDADE: O atendente foi eficaz em resolver o problema ou encaminhar adequadamente?
4. ARGUMENTAÇÃO: O atendente apresentou argumentos claros, lógicos e convincentes para a oferta/solução?
5. CONTRA-ARGUMENTAÇÃO: O atendente soube lidar com objeções, dúvidas e resistências do cliente de forma adequada?

AVALIAÇÃO DA ABORDAGEM DE VENDA:
- Avalie se a abordagem de venda foi adequada ao perfil do cliente
- Considere timing, tom, técnicas utilizadas e respeito ao cliente
- Classifique como: "Excelente", "Boa", "Aceitável", "Inadequada" ou "Não se aplica"

PROBABILIDADE DE ACEITAÇÃO:
- Com base no desenrolar da conversa, estime a probabilidade (0-100%) de o cliente aceitar a oferta
- Considere sinais de interesse, objeções levantadas e engajamento

FEEDBACKS PARA MELHORIA:
- Forneça 3-5 feedbacks específicos e acionáveis
- Cada feedback deve incluir: o princípio relacionado, o que foi observado, e como melhorar
- Cite trechos específicos da conversa quando relevante

FORMATO DA RESPOSTA (JSON):
{
  "principios": {
    "acolhimento": { "nota": número 0-10, "observacao": "breve observação" },
    "empatia": { "nota": número 0-10, "observacao": "breve observação" },
    "resolutividade": { "nota": número 0-10, "observacao": "breve observação" },
    "argumentacao": { "nota": número 0-10, "observacao": "breve observação" },
    "contra_argumentacao": { "nota": número 0-10, "observacao": "breve observação" }
  },
  "abordagem_venda": {
    "classificacao": "Excelente | Boa | Aceitável | Inadequada | Não se aplica",
    "justificativa": "explicação detalhada da classificação"
  },
  "probabilidade_aceitacao": número 0-100,
  "justificativa_probabilidade": "explicação da probabilidade estimada",
  "feedbacks": [
    {
      "principio": "nome do princípio relacionado",
      "observacao": "o que foi observado no atendimento",
      "sugestao": "como melhorar especificamente",
      "trecho_exemplo": "trecho da conversa (se aplicável)"
    }
  ],
  "resumo_geral": "Resumo executivo da avaliação em 2-3 frases"
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
          { role: "user", content: evaluationPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Erro ao comunicar com a IA");
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Extract JSON from response (handle markdown code blocks and extra text)
    let jsonString = aiResponse;

    // Try to extract from code block first
    const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
    } else {
      // Try to find JSON object
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
    }

    // Clean up any trailing content after the last closing brace
    const lastBraceIndex = jsonString.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      jsonString = jsonString.substring(0, lastBraceIndex + 1);
    }

    const evaluation = JSON.parse(jsonString);

    return new Response(
      JSON.stringify(evaluation),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Evaluation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao avaliar conversa",
        csat: 3,
        pontos_positivos: ["Não foi possível gerar avaliação completa"],
        oportunidades: [],
        resumo: "Ocorreu um erro ao processar a avaliação."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
