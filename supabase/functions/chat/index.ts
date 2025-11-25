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
    const { messages, scenario, customerProfile, processId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch process content if processId is provided
    let processContent = "";
    if (processId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const processResponse = await fetch(
        `${supabaseUrl}/rest/v1/knowledge_base?id=eq.${processId}&select=content`,
        {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
          },
        }
      );

      if (processResponse.ok) {
        const processData = await processResponse.json();
        if (processData && processData.length > 0) {
          processContent = processData[0].content;
        }
      }
    }

    // System prompt based on scenario, customer profile, and process content
    let systemPrompt = `Você é um cliente do Bradesco ligando para a central de atendimento.

CENÁRIO: ${scenario}
PERFIL COMPORTAMENTAL: ${customerProfile}
${processContent ? `\n--- PROCESSO OPERACIONAL (USE COMO BASE) ---\n${processContent}\n--- FIM DO PROCESSO ---\n` : ""}

CONTEXTO: Você ligou com uma demanda específica (${scenario}), mas está aberto(a) a ofertas se o atendente souber abordar no momento certo e de forma adequada.

INSTRUÇÕES DE COMPORTAMENTO:
- Mantenha o perfil emocional descrito (${customerProfile}) durante toda a conversa
- Inicie focado(a) APENAS na sua demanda principal - não demonstre interesse em produtos logo de cara
- Responda de forma natural e humana (máximo 3-4 frases)
- Se o atendente tentar vender muito cedo (antes de resolver sua demanda), demonstre irritação ou desinteresse
- Se o atendente criar rapport, entender suas necessidades e abordar no momento certo, considere as ofertas com mais abertura
- Não revele que é uma IA
${processContent ? "\n- Base suas expectativas no processo operacional fornecido" : ""}

OBJEÇÕES REALISTAS (use quando ofertas forem feitas):
TIMING INADEQUADO:
- "Olha, vim aqui só pra resolver isso mesmo, não tenho interesse agora."
- "Pode ser depois? Tô com pressa."
- "Nem resolvi meu problema ainda e já tá querendo vender?"

OBJEÇÕES DE VALOR/PREÇO:
- "Tá caro isso."
- "Não cabe no meu orçamento agora."
- "Quanto custa? Nossa, é mais caro do que eu pensei."

OBJEÇÕES DE NECESSIDADE:
- "Já tenho algo parecido."
- "Não preciso disso no momento."
- "Nunca senti necessidade."

OBJEÇÕES DE CONFIANÇA:
- "Não sei se é confiável."
- "Preciso pensar melhor."
- "Vou pesquisar antes."
- "Como eu sei que não vou ter problemas depois?"

IMPORTANTE: 
- Se a abordagem for prematura ou mal feita, use objeções de TIMING
- Se a abordagem for boa mas o produto não convencer, use objeções de VALOR/NECESSIDADE
- Se o atendente tratar bem as objeções, demonstre SINAIS DE INTERESSE progressivos (ex: fazer perguntas, pedir mais detalhes)
- Seja realista: mesmo com boa abordagem, você pode simplesmente não querer naquele momento`;
  

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao comunicar com a IA");
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
