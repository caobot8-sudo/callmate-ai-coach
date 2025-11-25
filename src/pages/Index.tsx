import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Target, TrendingUp, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChatInterface from "@/components/ChatInterface";
import { KnowledgeBaseManager } from "@/components/KnowledgeBaseManager";
import { supabase } from "@/integrations/supabase/client";

interface KnowledgeEntry {
  id: string;
  title: string;
  category: string;
}

const scenarios = [
  {
    id: "consulta_saldo",
    title: "Consulta de Saldo e Extrato",
    description: "Cliente liga para consultar saldo. Oportunidade de oferecer produtos.",
    profiles: [
      { id: "aberto", label: "Cliente Aberto a Ofertas", emotion: "😊" },
      { id: "neutro", label: "Cliente Neutro", emotion: "😐" },
      { id: "apressado", label: "Cliente com Pressa", emotion: "⏰" },
    ],
  },
  {
    id: "problema_app",
    title: "Problema com App Bradesco",
    description: "Cliente com dificuldade no app. Chance de oferecer produtos digitais.",
    profiles: [
      { id: "paciente", label: "Cliente Paciente", emotion: "🙂" },
      { id: "frustrado", label: "Cliente Frustrado", emotion: "😤" },
      { id: "confuso", label: "Cliente Confuso", emotion: "🤔" },
    ],
  },
  {
    id: "renovacao_cartao",
    title: "Renovação de Cartão",
    description: "Cliente liga para renovar cartão. Momento ideal para upgrade.",
    profiles: [
      { id: "satisfeito", label: "Cliente Satisfeito", emotion: "😊" },
      { id: "economico", label: "Cliente Econômico", emotion: "💰" },
      { id: "premium", label: "Cliente Premium", emotion: "⭐" },
    ],
  },
  {
    id: "pagamento_fatura",
    title: "Dúvida sobre Fatura",
    description: "Cliente com dúvida sobre fatura. Oportunidade de parcelamento/crédito.",
    profiles: [
      { id: "tranquilo", label: "Cliente Tranquilo", emotion: "😌" },
      { id: "preocupado", label: "Cliente Preocupado", emotion: "😟" },
      { id: "interessado", label: "Cliente Interessado", emotion: "🤨" },
    ],
  },
];

const Index = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<string>("");
  const [showChat, setShowChat] = useState(false);
  const [processes, setProcesses] = useState<KnowledgeEntry[]>([]);

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    const { data } = await supabase
      .from("knowledge_base")
      .select("id, title, category")
      .order("created_at", { ascending: false });
    
    setProcesses(data || []);
  };

  const handleStartTraining = () => {
    if (selectedScenario && selectedProfile) {
      setShowChat(true);
    }
  };

  const handleBackToMenu = () => {
    setShowChat(false);
    setSelectedScenario(null);
    setSelectedProfile(null);
    setSelectedProcess("");
    loadProcesses();
  };

  if (showChat && selectedScenario && selectedProfile) {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    const profile = scenario?.profiles.find(p => p.id === selectedProfile);
    
    return (
      <ChatInterface
        scenario={scenario!.title}
        customerProfile={profile!.label}
        processId={selectedProcess || undefined}
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
            Simulador de Atendimento Bradesco
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aprimore suas técnicas de atendimento e vendas com clientes simulados. Aprenda o melhor timing para oferecer produtos durante o atendimento.
          </p>
        </div>

        {/* Tabs for Simulation and Knowledge Base */}
        <Tabs defaultValue="simulate" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="simulate" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Iniciar Simulação
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Base de Conhecimento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge">
            <KnowledgeBaseManager />
          </TabsContent>

          <TabsContent value="simulate">
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-2 shadow-elegant">
                <CardHeader>
                  <Target className="w-8 h-8 text-secondary mb-2" />
                  <CardTitle className="text-lg">Atendimento Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Resolva demandas do cliente e identifique oportunidades de venda durante o atendimento
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="border-2 shadow-elegant">
                <CardHeader>
                  <MessageSquare className="w-8 h-8 text-secondary mb-2" />
                  <CardTitle className="text-lg">Cliente Simulado</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Cliente simulado por IA com objeções reais e perfis comportamentais variados
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="border-2 shadow-elegant">
                <CardHeader>
                  <TrendingUp className="w-8 h-8 text-secondary mb-2" />
                  <CardTitle className="text-lg">Análise de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Avaliação detalhada do timing de venda, tratamento de objeções e técnicas comerciais
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

              {/* Process Selection */}
              {processes.length > 0 && selectedScenario && selectedProfile && (
                <Card className="mb-8 border-2 shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-secondary" />
                      <CardTitle className="text-lg">Processo Operacional (Opcional)</CardTitle>
                    </div>
                    <CardDescription>
                      Selecione um processo para tornar a simulação mais realista e baseada em fluxos reais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um processo ou deixe em branco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem processo específico</SelectItem>
                        {processes.map((process) => (
                          <SelectItem key={process.id} value={process.id}>
                            {process.title} - {process.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
