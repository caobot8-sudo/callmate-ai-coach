import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Target, TrendingUp } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";

const scenarios = [
  {
    id: "limite",
    title: "Solicitação de Aumento de Limite",
    description: "Cliente deseja aumentar o limite do cartão de crédito",
    profiles: [
      { id: "calmo", label: "Cliente Calmo", emotion: "😊" },
      { id: "ansioso", label: "Cliente Ansioso", emotion: "😰" },
      { id: "irritado", label: "Cliente Irritado", emotion: "😠" },
    ],
  },
  {
    id: "cobranca",
    title: "Contestação de Cobrança",
    description: "Cliente contesta uma cobrança não reconhecida",
    profiles: [
      { id: "confuso", label: "Cliente Confuso", emotion: "🤔" },
      { id: "preocupado", label: "Cliente Preocupado", emotion: "😟" },
      { id: "irritado", label: "Cliente Muito Irritado", emotion: "😡" },
    ],
  },
  {
    id: "cartao",
    title: "Problema com Cartão",
    description: "Cliente com problema de cartão bloqueado ou não recebido",
    profiles: [
      { id: "calmo", label: "Cliente Calmo", emotion: "😊" },
      { id: "urgente", label: "Cliente com Urgência", emotion: "⏰" },
      { id: "frustrado", label: "Cliente Frustrado", emotion: "😤" },
    ],
  },
  {
    id: "credito",
    title: "Solicitação de Crédito",
    description: "Cliente interessado em contratar um empréstimo",
    profiles: [
      { id: "empolgado", label: "Cliente Empolgado", emotion: "🤩" },
      { id: "cauteloso", label: "Cliente Cauteloso", emotion: "🤨" },
      { id: "desconfiado", label: "Cliente Desconfiado", emotion: "🧐" },
    ],
  },
];

const Index = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleStartTraining = () => {
    if (selectedScenario && selectedProfile) {
      setShowChat(true);
    }
  };

  const handleBackToMenu = () => {
    setShowChat(false);
    setSelectedScenario(null);
    setSelectedProfile(null);
  };

  if (showChat && selectedScenario && selectedProfile) {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    const profile = scenario?.profiles.find(p => p.id === selectedProfile);
    
    return (
      <ChatInterface
        scenario={scenario!.title}
        customerProfile={profile!.label}
        onBack={handleBackToMenu}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-4 shadow-glow">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-3">
            Simulador de Atendimento
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Treine suas habilidades de atendimento com simulações realistas de clientes
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 shadow-elegant">
            <CardHeader>
              <Target className="w-8 h-8 text-secondary mb-2" />
              <CardTitle className="text-lg">Cenários Reais</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Pratique situações comuns do dia a dia com diferentes perfis de clientes
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-2 shadow-elegant">
            <CardHeader>
              <MessageSquare className="w-8 h-8 text-secondary mb-2" />
              <CardTitle className="text-lg">IA Conversacional</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Interaja com clientes simulados por inteligência artificial
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-2 shadow-elegant">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-secondary mb-2" />
              <CardTitle className="text-lg">Feedback Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receba avaliação CSAT e sugestões práticas de melhoria
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Scenario Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-primary mb-6">Escolha um Cenário</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {scenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer transition-all hover:shadow-glow ${
                  selectedScenario === scenario.id
                    ? 'ring-2 ring-secondary shadow-glow'
                    : 'hover:border-secondary'
                }`}
                onClick={() => {
                  setSelectedScenario(scenario.id);
                  setSelectedProfile(null);
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                {selectedScenario === scenario.id && (
                  <CardContent>
                    <p className="text-sm font-semibold mb-3 text-primary">Escolha o perfil do cliente:</p>
                    <div className="space-y-2">
                      {scenario.profiles.map((profile) => (
                        <Button
                          key={profile.id}
                          variant={selectedProfile === profile.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProfile(profile.id);
                          }}
                        >
                          <span className="mr-2 text-xl">{profile.emotion}</span>
                          {profile.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {selectedScenario && selectedProfile && (
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-gradient-primary text-white hover:opacity-90 shadow-glow text-lg px-8"
                onClick={handleStartTraining}
              >
                Iniciar Simulação
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
