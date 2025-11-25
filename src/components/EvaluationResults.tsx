import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Heart, CheckCircle2, MessageSquare, Shield, ArrowLeft, Target } from "lucide-react";

interface Principio {
  nota: number;
  observacao: string;
}

interface Feedback {
  principio: string;
  observacao: string;
  sugestao: string;
  trecho_exemplo?: string;
}

interface EvaluationProps {
  evaluation: {
    principios: {
      acolhimento: Principio;
      empatia: Principio;
      resolutividade: Principio;
      argumentacao: Principio;
      contra_argumentacao: Principio;
    };
    abordagem_venda: {
      classificacao: string;
      justificativa: string;
    };
    probabilidade_aceitacao: number;
    justificativa_probabilidade: string;
    feedbacks: Feedback[];
    resumo_geral: string;
  };
  onBack: () => void;
}

const EvaluationResults = ({ evaluation, onBack }: EvaluationProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getClassificacaoColor = (classificacao: string) => {
    if (classificacao === "Excelente") return "text-green-600 bg-green-50 border-green-200";
    if (classificacao === "Boa") return "text-blue-600 bg-blue-50 border-blue-200";
    if (classificacao === "Aceitável") return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (classificacao === "Inadequada") return "text-red-600 bg-red-50 border-red-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getProbabilidadeColor = (prob: number) => {
    if (prob >= 70) return "text-green-600";
    if (prob >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const principiosConfig = [
    { key: 'acolhimento', label: 'Acolhimento', icon: Heart },
    { key: 'empatia', label: 'Empatia', icon: Heart },
    { key: 'resolutividade', label: 'Resolutividade', icon: CheckCircle2 },
    { key: 'argumentacao', label: 'Argumentação', icon: MessageSquare },
    { key: 'contra_argumentacao', label: 'Contra-argumentação', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-5xl mx-auto py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nova Simulação
        </Button>

        {/* Resumo Geral */}
        <Card className="mb-6 border-2 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Avaliação do Atendimento</CardTitle>
            <CardDescription className="text-base">
              {evaluation.resumo_geral}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Princípios Avaliados */}
        <Card className="mb-6 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Avaliação por Princípios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {principiosConfig.map(({ key, label, icon: Icon }) => {
                const principio = evaluation.principios[key as keyof typeof evaluation.principios];
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <span className="font-semibold">{label}</span>
                      </div>
                      <span className={`text-lg font-bold ${getScoreColor(principio.nota)}`}>
                        {principio.nota}/10
                      </span>
                    </div>
                    <Progress value={principio.nota * 10} className="h-2" />
                    <p className="text-sm text-muted-foreground">{principio.observacao}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Abordagem de Venda e Probabilidade */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Abordagem de Venda */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Abordagem de Venda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`text-sm px-3 py-1 ${getClassificacaoColor(evaluation.abordagem_venda.classificacao)}`}>
                {evaluation.abordagem_venda.classificacao}
              </Badge>
              <p className="text-sm text-muted-foreground mt-3">
                {evaluation.abordagem_venda.justificativa}
              </p>
            </CardContent>
          </Card>

          {/* Probabilidade de Aceitação */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Probabilidade de Aceitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-3">
                <span className={`text-4xl font-bold ${getProbabilidadeColor(evaluation.probabilidade_aceitacao)}`}>
                  {evaluation.probabilidade_aceitacao}%
                </span>
              </div>
              <Progress value={evaluation.probabilidade_aceitacao} className="h-2 mb-3" />
              <p className="text-sm text-muted-foreground">
                {evaluation.justificativa_probabilidade}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feedbacks para Melhoria */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-secondary" />
              Feedbacks para Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {evaluation.feedbacks.map((feedback, index) => (
                <div key={index} className="border-l-4 border-secondary pl-4 py-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {feedback.principio}
                    </Badge>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Observação:</p>
                    <p className="text-sm text-blue-900">{feedback.observacao}</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs font-semibold text-green-700 mb-1">Sugestão:</p>
                    <p className="text-sm text-green-900">{feedback.sugestao}</p>
                  </div>

                  {feedback.trecho_exemplo && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Exemplo da conversa:</p>
                      <p className="text-sm text-gray-900 italic">"{feedback.trecho_exemplo}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button
            size="lg"
            className="bg-gradient-primary text-white hover:opacity-90 shadow-glow"
            onClick={onBack}
          >
            Fazer Nova Simulação
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationResults;
