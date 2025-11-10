import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import EvaluationResults from "./EvaluationResults";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  scenario: string;
  customerProfile: string;
  onBack: () => void;
}

const ChatInterface = ({ scenario, customerProfile, onBack }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { 
    isListening, 
    transcript, 
    isSupported, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useSpeechRecognition();

  useEffect(() => {
    // Start conversation with AI
    startConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startConversation = async () => {
    setIsLoading(true);
    try {
      // Create conversation record
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          scenario,
          customer_profile: customerProfile,
          transcript: JSON.stringify([]),
        })
        .select()
        .single();

      if (convError) throw convError;
      setConversationId(conv.id);

      // Get first message from AI
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [],
          scenario,
          customerProfile,
        },
      });

      if (error) throw error;

      const aiMessage: Message = { role: 'assistant', content: data.message };
      setMessages([aiMessage]);

      // Update conversation with first message
      await supabase
        .from('conversations')
        .update({ transcript: JSON.stringify([aiMessage]) })
        .eq('id', conv.id);

    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível iniciar a conversa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: updatedMessages,
          scenario,
          customerProfile,
        },
      });

      if (error) throw error;

      const aiMessage: Message = { role: 'assistant', content: data.message };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Update conversation
      if (conversationId) {
        await supabase
          .from('conversations')
          .update({ transcript: JSON.stringify(finalMessages) })
          .eq('id', conversationId);
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = async () => {
    if (messages.length < 4) {
      toast({
        title: "Conversa muito curta",
        description: "Continue a conversa um pouco mais antes de encerrar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('evaluate', {
        body: {
          transcript: messages,
          scenario,
          customerProfile,
        },
      });

      if (error) throw error;

      setEvaluation(data);

      // Update conversation with evaluation
      if (conversationId) {
        await supabase
          .from('conversations')
          .update({
            ended_at: new Date().toISOString(),
            csat_score: data.csat,
            feedback: JSON.stringify(data),
          })
          .eq('id', conversationId);
      }

      setShowEvaluation(true);

    } catch (error: any) {
      console.error('Error evaluating conversation:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível avaliar a conversa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showEvaluation && evaluation) {
    return <EvaluationResults evaluation={evaluation} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="bg-card rounded-t-2xl border-b p-4 shadow-elegant">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={endConversation}
              disabled={isLoading || messages.length < 4}
            >
              Encerrar e Avaliar
            </Button>
          </div>
          <div>
            <h2 className="font-semibold text-primary">{scenario}</h2>
            <p className="text-sm text-muted-foreground">Perfil: {customerProfile}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-card p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-[80%] p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-primary text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </Card>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-muted p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-card rounded-b-2xl border-t p-4 shadow-elegant">
          {!isSupported && (
            <div className="mb-2 text-xs text-muted-foreground text-center">
              ⚠️ Reconhecimento de voz não disponível neste navegador
            </div>
          )}
          <div className="flex gap-2">
            {isSupported && (
              <Button
                onClick={toggleListening}
                disabled={isLoading}
                variant={isListening ? "destructive" : "outline"}
                className={isListening ? "animate-pulse" : ""}
                size="icon"
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            )}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isListening && sendMessage()}
              placeholder={isListening ? "Escutando... Fale agora!" : "Digite ou fale sua mensagem..."}
              disabled={isLoading || isListening}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || isListening}
              className="bg-secondary hover:bg-secondary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {isListening && (
            <div className="mt-2 text-xs text-center text-muted-foreground">
              🎤 Gravando... Clique no microfone novamente para parar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
