// src/features/ai-assistant/AIChatForm.tsx
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Mock OpenAI client for now - will integrate with actual OpenAI SDK
const mockOpenAICall = async (language: string) => {
  // This is a placeholder - in the real app, replace with actual OpenAI API call

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const responseByLanguage = {
    en: "I'll help you fill out this form. Let's start with the basic information. What's your full name?",
    es: "Te ayudaré a completar este formulario. Comencemos con la información básica. ¿Cuál es tu nombre completo?",
  };

  return responseByLanguage[language as "en" | "es"] || responseByLanguage.en;
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatFormProps {
  formData: {
    id: string;
    name: string;
    aiPrompt?: string;
  };
  onFormValuesUpdate: (values: Record<string, string>) => void;
}

const AIChatForm = ({ formData, onFormValuesUpdate }: AIChatFormProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize chat with a greeting message
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);

      // Use the form-specific AI prompt if available, otherwise use default
      const initialPrompt =
        formData.aiPrompt ||
        `You are a Spanish tax advisor helping a user fill out ${formData.name}. Ask one question at a time to collect the necessary data.`;

      try {
        const initialResponse = await mockOpenAICall(initialPrompt);

        setMessages([
          {
            role: "assistant",
            content: initialResponse,
          },
        ]);

        // Initialize form values based on the first assistant message
        // This is a placeholder - in the real app, you'd parse the response
        // to extract form field values
        onFormValuesUpdate({
          name: "",
          email: "",
          income: "",
        });
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [formData, language, onFormValuesUpdate]);

  const handleSendMessage = async () => {
    if (input.trim() === "" || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Send the entire conversation history for context
      const conversationHistory = [...messages, userMessage]
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const response = await mockOpenAICall(conversationHistory);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: response,
        },
      ]);

      // Update form values based on the conversation
      // This is a placeholder - in the real app, you'd parse the response
      // to extract form field values
      onFormValuesUpdate({
        name: userMessage.content.includes("name") ? userMessage.content : "",
        email: userMessage.content.includes("@") ? userMessage.content : "",
        income: userMessage.content.includes("income")
          ? userMessage.content
          : "",
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{t("aiChat.title")}</h2>
        <p className="text-gray-600">{t("aiChat.description")}</p>
      </div>

      <ScrollArea className="flex-grow mb-4 border rounded-lg p-4 bg-gray-50">
        {messages.length === 0 && loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-gray-200 text-gray-800 rounded-tl-none"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="flex items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("aiChat.inputPlaceholder")}
          className="flex-grow mr-2 resize-none"
          rows={2}
          disabled={loading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={loading || input.trim() === ""}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default AIChatForm;
