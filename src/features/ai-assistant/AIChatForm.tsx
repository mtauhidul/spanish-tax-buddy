// src/features/ai-assistant/AIChatForm.tsx
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant" | "system";
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [extractedValues, setExtractedValues] = useState<
    Record<string, string>
  >({});

  // Call OpenAI API
  const callOpenAI = async (messages: Message[]): Promise<string> => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
        console.error("OpenAI API key is not set in environment variables");
        return "Error: API key is not configured. Please check your environment variables.";
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("OpenAI API error:", data);
        return `Error: ${data.error?.message || "Something went wrong"}`;
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return "Sorry, there was an error processing your request. Please try again.";
    }
  };

  // Parse AI response for form field values
  const parseResponseForFields = (message: string): Record<string, string> => {
    const extractedValues: Record<string, string> = {};

    // Look for common patterns in the response
    const nameMatch = message.match(/name(?:\s+is)?\s*:\s*([^.,\n]+)/i);
    const emailMatch = message.match(/email(?:\s+is)?\s*:\s*([^.,\n]+)/i);
    const dniMatch = message.match(/dni(?:\s+is)?\s*:\s*([^.,\n]+)/i);
    const incomeMatch = message.match(/income(?:\s+is)?\s*:\s*([^.,\n€]+)/i);
    const taxResidenceMatch = message.match(
      /tax\s+residence(?:\s+is)?\s*:\s*([^.,\n]+)/i
    );

    // Extract the name from user's message if it contains the word "name"
    if (nameMatch && nameMatch[1]) {
      extractedValues.fullName = nameMatch[1].trim();
    }

    // Extract email if it contains an @ symbol
    if (emailMatch && emailMatch[1]) {
      const email = emailMatch[1].trim();
      if (email.includes("@")) {
        extractedValues.email = email;
      }
    }

    // Extract DNI if it follows the Spanish format
    if (dniMatch && dniMatch[1]) {
      const dni = dniMatch[1].trim();
      if (/^[0-9]{8}[A-Za-z]$/.test(dni)) {
        extractedValues.dni = dni;
      }
    }

    // Extract income
    if (incomeMatch && incomeMatch[1]) {
      const income = incomeMatch[1].trim().replace(/[^0-9]/g, "");
      if (income) {
        extractedValues.income = income;
      }
    }

    // Extract tax residence boolean
    if (taxResidenceMatch && taxResidenceMatch[1]) {
      const value = taxResidenceMatch[1].trim().toLowerCase();
      if (
        value === "yes" ||
        value === "true" ||
        value === "sí" ||
        value === "si"
      ) {
        extractedValues.taxResidence = "true";
      } else if (value === "no" || value === "false") {
        extractedValues.taxResidence = "false";
      }
    }

    return extractedValues;
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (messagesEndRef.current && chatContainerRef.current) {
      // Use native scrollTo method instead of scrollIntoView to prevent page scrolling
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // Initialize chat with a system message
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);

      // Initial welcome message
      const welcomeMessage =
        language === "es"
          ? `¡Hola! Estoy aquí para ayudarte a completar el formulario "${formData.name}". Vamos a empezar con la información básica. ¿Cuál es tu nombre completo?`
          : `Hello! I'm here to help you complete the "${formData.name}" form. Let's start with some basic information. What is your full name?`;

      setMessages([
        {
          role: "assistant",
          content: welcomeMessage,
        },
      ]);

      setLoading(false);
    };

    initializeChat();
  }, [formData, language]);

  // Scroll to bottom when messages change
  useEffect(() => {
    // Small timeout to ensure DOM update has completed
    setTimeout(scrollToBottom, 50);
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (input.trim() === "" || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Create system message with form-specific context
      const systemMessage: Message = {
        role: "system",
        content:
          formData.aiPrompt ||
          `You are a helpful Spanish tax assistant aiding the user with completing the "${formData.name}" form. 
          Ask questions one at a time to gather all necessary information. 
          Explain what each field means and why it's important.
          When the user provides information, extract it and use it to fill out the form.
          Remember their answers throughout the conversation.
          Respond in the same language the user is using (Spanish or English).
          Keep your responses concise and focused.`,
      };

      const conversationHistory = [systemMessage, ...messages, userMessage];

      // Add context about previously extracted values
      if (Object.keys(extractedValues).length > 0) {
        const valuesContext = `The following information has already been collected for the form: ${Object.entries(
          extractedValues
        )
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")}`;

        conversationHistory.splice(1, 0, {
          role: "system",
          content: valuesContext,
        });
      }

      const response = await callOpenAI(conversationHistory);

      // Update messages with AI response
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      // Parse user message and AI response for possible form field values
      const newExtractedValues = parseResponseForFields(userMessage.content);

      // If nothing found in user message, try the AI response
      if (Object.keys(newExtractedValues).length === 0) {
        const aiExtracted = parseResponseForFields(response);
        Object.assign(newExtractedValues, aiExtracted);
      }

      // Update extracted values
      if (Object.keys(newExtractedValues).length > 0) {
        setExtractedValues((prev) => {
          const updated = { ...prev, ...newExtractedValues };
          // Update form values in parent component
          onFormValuesUpdate(updated);
          return updated;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content:
            "Sorry, there was an error processing your request. Please try again.",
        },
      ]);
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
    <div className="flex flex-col h-[600px] bg-white">
      {/* Chat header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">{t("aiChat.title")}</h2>
        <p className="text-sm text-gray-500">{t("aiChat.description")}</p>
      </div>

      {/* Chat messages area - using native scroll instead of ScrollArea */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e7eb transparent",
        }}
      >
        {messages.length === 0 && loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-3 flex items-end gap-2 bg-white"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("aiChat.inputPlaceholder")}
          className="flex-1 resize-none rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          rows={1}
          disabled={loading}
          style={{ minHeight: "44px", maxHeight: "120px" }}
        />
        <Button
          type="submit"
          disabled={loading || input.trim() === ""}
          className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default AIChatForm;
