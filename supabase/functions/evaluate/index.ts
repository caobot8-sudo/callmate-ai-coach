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
    const evaluationPrompt = `Você é um avaliador especialista em vendas e atendimento bancário do Bradesco.

CENÁRIO: ${scenario}
PERFIL DO CLIENTE: ${customerProfile}

Analise a conversa focando em TIMING DE ABORDAGEM, TÉCNICA COMERCIAL e TRATAMENTO DE OBJEÇÕES.

TRANSCRIÇÃO DA CONVERSA:
${transcript.map((msg: any) => `${msg.role === 'user' ? 'ATENDENTE' : 'CLIENTE'}: ${msg.content}`).join('\n')}

CRITÉRIOS DE AVALIAÇÃO (nota 0-10):

1. RESOLUÇÃO DA DEMANDA INICIAL: O atendente resolveu ou encaminhou adequadamente o problema que motivou o contato?

2. TIMING DA ABORDAGEM COMERCIAL: 
   - Abordou produtos no momento certo (após criar rapport e resolver a demanda)?
   - Evitou ser invasivo ou prematuro?
   - Identificou sinais de abertura do cliente?

3. IDENTIFICAÇÃO DE NECESSIDADES:
   - Fez perguntas para entender a situação do cliente?
   - Identificou dores ou oportunidades antes de oferecer?
   - Personalizou a abordagem baseado no perfil?

4. TÉCNICA DE APRESENTAÇÃO:
   - Apresentou benefícios (não apenas características)?
   - Usou linguagem clara e persuasiva?
   - Conectou o produto com necessidades reais do cliente?

5. TRATAMENTO DE OBJEÇÕES:
   - Validou as preocupações do cliente?
   - Apresentou contra-argumentos relevantes e convincentes?
   - Ofereceu alternativas quando apropriado?

ANÁLISE DE DORES NÃO ATENDIDAS:
- Identifique quais dores ou preocupações do cliente NÃO foram abordadas
- Liste oportunidades perdidas de venda ou argumentação
- Exemplo: Cliente preocupado com segurança → não ofereceu seguro do cartão

TIMING E MOMENTO DA ABORDAGEM:
- Classifique o timing como: "Excelente", "Bom", "Prematuro", "Tardio" ou "Não houve abordagem"
- Justifique: o atendente esperou o momento certo? Criou rapport antes? Resolveu a demanda primeiro?

PROBABILIDADE DE ACEITAÇÃO DA OFERTA:
Estime de 0-100% considerando:

SINAIS POSITIVOS QUE AUMENTAM PROBABILIDADE:
+ Cliente fez perguntas sobre o produto (+15-25%)
+ Atendente tratou objeções com argumentos sólidos (+20-30%)
+ Houve personalização da oferta (+15-20%)
+ Cliente demonstrou abertura ("interessante", "pode ser", "me fala mais") (+25-35%)
+ Timing adequado da abordagem (+15-20%)

SINAIS NEGATIVOS QUE REDUZEM PROBABILIDADE:
- Abordagem muito prematura (-40-50%)
- Objeções não tratadas ou mal tratadas (-30-40%)
- Cliente demonstrou irritação ou pressa (-35-45%)
- Falta de personalização/argumentos genéricos (-20-30%)
- Não resolveu demanda inicial antes de vender (-40-50%)

IMPORTANTE:
- Uma conversa SEM abordagem comercial = 0% (justificativa: "Não houve oferta")
- Uma abordagem MUITO PREMATURA = 0-15%
- Objeção bem tratada com argumentos válidos = NO MÍNIMO 30-50%
- Cliente engajado com perguntas = NO MÍNIMO 60-75%
- NÃO seja generoso: cliente brasileiro é naturalmente cético com vendas bancárias

DORES NÃO EXPLORADAS:
- Liste 2-4 dores ou necessidades que o cliente demonstrou mas não foram abordadas
- Para cada uma, sugira qual produto/serviço poderia ter sido oferecido

FEEDBACKS PRÁTICOS:
- Forneça 4-6 feedbacks específicos focados em VENDAS e TIMING
- Priorize: momento da abordagem, tratamento de objeções, identificação de necessidades
- Seja direto e acionável

FORMATO DA RESPOSTA (JSON):
{
  "criterios": {
    "resolucao_demanda": { "nota": 0-10, "observacao": "comentário breve" },
    "timing_abordagem": { "nota": 0-10, "observacao": "quando abordou? foi adequado?" },
    "identificacao_necessidades": { "nota": 0-10, "observacao": "fez perguntas? explorou dores?" },
    "tecnica_apresentacao": { "nota": 0-10, "observacao": "como apresentou? focou em benefícios?" },
    "tratamento_objecoes": { "nota": 0-10, "observacao": "como lidou com objeções?" }
  },
  "timing_classificacao": "Excelente | Bom | Prematuro | Tardio | Não houve abordagem",
  "timing_justificativa": "por que essa classificação?",
  "probabilidade_aceitacao": 0-100,
  "justificativa_probabilidade": "análise detalhada usando os sinais positivos/negativos listados acima",
  "dores_nao_exploradas": [
    {
      "dor_identificada": "descrição da dor/necessidade",
      "produto_sugerido": "qual produto/serviço teria sido adequado",
      "momento_ideal": "quando deveria ter sido oferecido"
    }
  ],
  "feedbacks": [
    {
      "area": "Timing | Objeções | Necessidades | Apresentação | Rapport",
      "observacao": "o que foi feito",
      "impacto": "qual foi o impacto disso",
      "sugestao": "como melhorar especificamente"
    }
  ],
  "resumo_geral": "Resumo executivo focado em performance comercial (2-3 frases)"
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
        criterios: {
          resolucao_demanda: { nota: 0, observacao: "Erro na avaliação" },
          timing_abordagem: { nota: 0, observacao: "Erro na avaliação" },
          identificacao_necessidades: { nota: 0, observacao: "Erro na avaliação" },
          tecnica_apresentacao: { nota: 0, observacao: "Erro na avaliação" },
          tratamento_objecoes: { nota: 0, observacao: "Erro na avaliação" }
        },
        timing_classificacao: "Não se aplica",
        timing_justificativa: "Erro ao processar avaliação",
        probabilidade_aceitacao: 0,
        justificativa_probabilidade: "Não foi possível avaliar",
        dores_nao_exploradas: [],
        feedbacks: [],
        resumo_geral: "Ocorreu um erro ao processar a avaliação."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});