import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, Clock, Target, MessageSquare, Shield, ArrowLeft, Lightbulb, AlertCircle } from "lucide-react";

interface Criterio {
  nota: number;
  observacao: string;
}

interface DorNaoExplorada {
  dor_identificada: string;
  produto_sugerido: string;
  momento_ideal: string;
}

interface Feedback {
  area: string;
  observacao: string;
  impacto: string;
  sugestao: string;
}

interface EvaluationProps {
  evaluation: {
    criterios: {
      resolucao_demanda: Criterio;
      timing_abordagem: Criterio;
      identificacao_necessidades: Criterio;
      tecnica_apresentacao: Criterio;
      tratamento_objecoes: Criterio;
    };
    timing_classificacao: string;
    timing_justificativa: string;
    probabilidade_aceitacao: number;
    justificativa_probabilidade: string;
    dores_nao_exploradas?: DorNaoExplorada[];
    feedbacks: Feedback[];
    resumo_geral: string;
  };
  onBack: () => void;
}

const EvaluationResults = ({ evaluation, onBack }: EvaluationProps) => {
  const [showTipsDialog, setShowTipsDialog] = useState(false);

  useEffect(() => {
    if (evaluation.probabilidade_aceitacao <= 20) {
      setShowTipsDialog(true);
    }
  }, [evaluation.probabilidade_aceitacao]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getTimingColor = (classificacao: string) => {
    if (classificacao === "Excelente") return "bg-green-50 text-green-700 border-green-200";
    if (classificacao === "Bom") return "bg-blue-50 text-blue-700 border-blue-200";
    if (classificacao === "Prematuro") return "bg-orange-50 text-orange-700 border-orange-200";
    if (classificacao === "Tardio") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getProbabilidadeColor = (prob: number) => {
    if (prob >= 70) return "text-green-600";
    if (prob >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const criteriosConfig = [
    { key: 'resolucao_demanda', label: 'Resolução da Demanda', icon: Target },
    { key: 'timing_abordagem', label: 'Timing da Abordagem', icon: Clock },
    { key: 'identificacao_necessidades', label: 'Identificação de Necessidades', icon: Target },
    { key: 'tecnica_apresentacao', label: 'Técnica de Apresentação', icon: MessageSquare },
    { key: 'tratamento_objecoes', label: 'Tratamento de Objeções', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      {/* Dialog de Dicas */}
      <Dialog open={showTipsDialog} onOpenChange={setShowTipsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              Dicas para Melhorar sua Abordagem Comercial
            </DialogTitle>
            <DialogDescription>
              A probabilidade de aceitação está baixa. Aqui estão orientações práticas:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">1. RESOLVA PRIMEIRO, VENDA DEPOIS</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">• Atenda a demanda inicial completamente antes de abordar vendas</p>
                <p className="mb-2">• Cliente irritado ou apressado = momento ERRADO para vender</p>
                <p>• Só ofereça após resolver o problema e sentir abertura</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">2. IDENTIFIQUE NECESSIDADES COM PERGUNTAS</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">• "Como você costuma usar seu cartão?"</p>
                <p className="mb-2">• "Você tem alguma preocupação com segurança?"</p>
                <p>• Ouça as respostas e conecte com produtos relevantes</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">3. APRESENTE BENEFÍCIOS, NÃO PRODUTOS</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">• ❌ "Temos o cartão Gold que custa R$ 50/mês"</p>
                <p className="mb-2">• ✅ "Você teria proteção contra fraudes e cashback em suas compras"</p>
                <p>• Foque no valor para a vida do cliente</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">4. TRATE OBJEÇÕES COM EMPATIA + DADOS</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">• Cliente: "Tá caro"</p>
                <p className="mb-2">• Você: "Entendo sua preocupação. Na verdade, com o cashback de 2%, o custo se paga em compras que você já faz"</p>
                <p>• Valide + Eduque + Mostre valor real</p>
              </CardContent>
            </Card>

            <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary/30">
              <p className="text-sm font-semibold mb-2">💡 REGRA DE OURO:</p>
              <p className="text-sm">
                O melhor vendedor é aquele que o cliente NEM PERCEBE que está vendendo. 
                Seja consultivo, não invasivo. Vendas acontecem naturalmente quando você resolve problemas reais.
              </p>
            </div>
          </div>

          <Button onClick={() => setShowTipsDialog(false)} className="w-full mt-4">
            Entendi, vamos tentar novamente!
          </Button>
        </DialogContent>
      </Dialog>

      <div className="max-w-5xl mx-auto py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nova Simulação
        </Button>

        {/* Header com Resumo */}
        <Card className="mb-8 border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-3xl text-primary flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              Avaliação de Performance Comercial
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {evaluation.resumo_geral}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Timing e Probabilidade */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Timing da Abordagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${getTimingColor(evaluation.timing_classificacao)} text-lg py-2 px-4`}>
                {evaluation.timing_classificacao}
              </Badge>
              <p className="text-sm text-muted-foreground mt-3">
                {evaluation.timing_justificativa}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Probabilidade de Aceitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-3">
                <span className={`text-4xl font-bold ${getProbabilidadeColor(evaluation.probabilidade_aceitacao)}`}>
                  {evaluation.probabilidade_aceitacao}%
                </span>
              </div>
              <Progress value={evaluation.probabilidade_aceitacao} className="mb-3" />
              <p className="text-sm text-muted-foreground">
                {evaluation.justificativa_probabilidade}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Critérios de Avaliação */}
        <Card className="mb-8 border-2 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl">Critérios de Avaliação</CardTitle>
            <CardDescription>Performance detalhada por área</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {criteriosConfig.map(({ key, label, icon: Icon }) => {
                const criterio = evaluation.criterios[key as keyof typeof evaluation.criterios];
                return (
                  <div key={key} className="pb-6 border-b last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{label}</h3>
                      </div>
                      <span className={`text-2xl font-bold ${getScoreColor(criterio.nota)}`}>
                        {criterio.nota}/10
                      </span>
                    </div>
                    <Progress value={criterio.nota * 10} className="mb-2" />
                    <p className="text-sm text-muted-foreground">{criterio.observacao}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dores Não Exploradas */}
        {evaluation.dores_nao_exploradas && evaluation.dores_nao_exploradas.length > 0 && (
          <Card className="mb-8 border-2 shadow-elegant border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2 text-orange-900">
                <AlertCircle className="w-5 h-5" />
                Oportunidades Perdidas
              </CardTitle>
              <CardDescription>Necessidades do cliente que não foram abordadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluation.dores_nao_exploradas.map((dor, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-orange-900 mb-1">
                          {dor.dor_identificada}
                        </p>
                        <p className="text-sm text-orange-800 mb-1">
                          <strong>Produto sugerido:</strong> {dor.produto_sugerido}
                        </p>
                        <p className="text-sm text-orange-700">
                          <strong>Momento ideal:</strong> {dor.momento_ideal}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedbacks */}
        <Card className="border-2 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl">Feedbacks para Melhoria</CardTitle>
            <CardDescription>Ações específicas para aprimorar sua técnica comercial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluation.feedbacks.map((feedback, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="font-semibold">
                      {feedback.area}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">
                    <strong>O que foi observado:</strong> {feedback.observacao}
                  </p>
                  <p className="text-sm mb-2 text-orange-700">
                    <strong>Impacto:</strong> {feedback.impacto}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Como melhorar:</strong> {feedback.sugestao}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EvaluationResults;