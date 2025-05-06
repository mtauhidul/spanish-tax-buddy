// src/features/ai-assistant/AIChatForm.tsx
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowDown, CheckCircle, FileText, Loader2, Send } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface FormField {
  name: string;
  label: {
    en: string;
    es: string;
  };
  type: string;
  required?: boolean;
}

interface AIChatFormProps {
  formData: {
    id: string;
    name: string;
    aiPrompt?: string;
    formFields?: Record<string, FormField>;
  };
  onFormValuesUpdate: (values: Record<string, string>) => void;
}

// Extract field names and values from PDF fields
const extractPDFFields = async (
  pdfBytes: ArrayBuffer
): Promise<{ fields: string[]; extractedData: Record<string, string> }> => {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Get field names
    const fieldNames = fields.map((field) => field.getName());

    // Extract existing values
    const extractedData: Record<string, string> = {};

    fields.forEach((field) => {
      try {
        const fieldName = field.getName();

        // Try to get value based on field type
        if (field.constructor.name === "PDFTextField") {
          const textField = form.getTextField(fieldName);
          const value = textField.getText();
          if (value) extractedData[fieldName] = value;
        } else if (field.constructor.name === "PDFCheckBox") {
          const checkBox = form.getCheckBox(fieldName);
          extractedData[fieldName] = checkBox.isChecked() ? "true" : "false";
        }
      } catch (error) {
        console.warn(
          `Error extracting value for field ${field.getName()}:`,
          error
        );
      }
    });

    // Map common field names to standardized names
    const standardizedData = mapToStandardFields(extractedData, fieldNames);

    return {
      fields: fieldNames,
      extractedData: standardizedData,
    };
  } catch (error) {
    console.error("Error extracting PDF fields:", error);
    return {
      fields: [],
      extractedData: {},
    };
  }
};

// Map PDF form field names to standardized field names
const mapToStandardFields = (
  extractedData: Record<string, string>,
  fieldNames: string[]
): Record<string, string> => {
  const standardizedData: Record<string, string> = { ...extractedData };

  // Try to identify common field patterns and map them to our standard fields
  for (const fieldName of fieldNames) {
    const lowerName = fieldName.toLowerCase();

    // Name fields
    if (
      lowerName.includes("name") &&
      (lowerName.includes("full") ||
        lowerName.includes("complete") ||
        lowerName === "name")
    ) {
      if (extractedData[fieldName]) {
        standardizedData["fullName"] = extractedData[fieldName];
      }
    }

    // ID/DNI fields
    if (
      lowerName.includes("dni") ||
      lowerName.includes("nie") ||
      (lowerName.includes("id") && !lowerName.includes("hide"))
    ) {
      if (extractedData[fieldName]) {
        standardizedData["dni"] = extractedData[fieldName];
      }
    }

    // Birth date fields
    if (
      lowerName.includes("birth") ||
      lowerName.includes("nacimiento") ||
      lowerName.includes("fecha")
    ) {
      if (extractedData[fieldName]) {
        standardizedData["birthDate"] = extractedData[fieldName];
      }
    }

    // Email fields
    if (
      lowerName.includes("email") ||
      lowerName.includes("correo") ||
      lowerName.includes("e-mail")
    ) {
      if (extractedData[fieldName]) {
        standardizedData["email"] = extractedData[fieldName];
      }
    }

    // Income fields
    if (
      lowerName.includes("income") ||
      lowerName.includes("salary") ||
      lowerName.includes("ingres") ||
      lowerName.includes("salario")
    ) {
      if (extractedData[fieldName]) {
        standardizedData["income"] = extractedData[fieldName];
      }
    }

    // Tax residence fields
    if (
      lowerName.includes("resident") ||
      lowerName.includes("tax") ||
      lowerName.includes("fiscal")
    ) {
      if (extractedData[fieldName]) {
        const value = extractedData[fieldName].toLowerCase();
        if (
          value === "yes" ||
          value === "true" ||
          value === "sí" ||
          value === "si" ||
          value === "1"
        ) {
          standardizedData["taxResidence"] = "true";
        } else if (value === "no" || value === "false" || value === "0") {
          standardizedData["taxResidence"] = "false";
        }
      }
    }
  }

  return standardizedData;
};

const AIChatForm = ({ formData, onFormValuesUpdate }: AIChatFormProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfDropActive, setPdfDropActive] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const { t, language } = useLanguage();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractedValues, setExtractedValues] = useState<
    Record<string, string>
  >({});
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    // Determine the required fields from formData
    if (formData.formFields) {
      const required = Object.values(formData.formFields)
        .filter((field) => field.required)
        .map((field) => field.name);
      setRequiredFields(required);
    }
  }, [formData]);

  useEffect(() => {
    // Update missing fields when required fields or extracted values change
    if (requiredFields.length > 0) {
      const missing = requiredFields.filter(
        (field) =>
          !extractedValues[field] || extractedValues[field].trim() === ""
      );
      setMissingFields(missing);
    }
  }, [requiredFields, extractedValues]);

  // Call simulated OpenAI API
  const callOpenAI = async (messages: Message[]): Promise<string> => {
    // For demo purposes, we'll simulate it
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get the last user message
        const lastUserMessage = messages.filter((m) => m.role === "user").pop();
        if (!lastUserMessage) {
          resolve(
            "I didn't understand your message. Could you please try again?"
          );
          return;
        }

        // If we have extracted PDF data and this is the first user message,
        // acknowledge the PDF upload and ask about missing fields
        if (
          uploadedPdf &&
          messages.filter((m) => m.role === "user").length === 1
        ) {
          if (missingFields.length > 0) {
            // Ask for the first missing field
            const firstMissingField = missingFields[0];
            const fieldLabel = getFieldLabel(firstMissingField);

            resolve(
              language === "es"
                ? `He analizado tu PDF "${uploadedPdf.name}" y he extraído algunos datos. Sin embargo, necesito más información. ¿Podrías proporcionarme tu ${fieldLabel}?`
                : `I've analyzed your PDF "${uploadedPdf.name}" and extracted some data. However, I need more information. Could you provide your ${fieldLabel}?`
            );
            return;
          } else {
            resolve(
              language === "es"
                ? `He analizado tu PDF "${uploadedPdf.name}" y he completado todos los campos necesarios para el formulario. Puedes ver una vista previa del PDF en el panel derecho. ¿Hay algo más en lo que pueda ayudarte?`
                : `I've analyzed your PDF "${uploadedPdf.name}" and completed all the necessary fields for the form. You can see a preview of the PDF in the right panel. Is there anything else I can help you with?`
            );
            return;
          }
        }

        // Check if this is an answer to a specific field request
        if (missingFields.length > 0) {
          const targetField = missingFields[0];
          const userValue = lastUserMessage.content.trim();

          // Try to extract the value based on the field type
          const fieldType = getFieldType(targetField);

          let valueExtracted = false;

          if (fieldType === "checkbox") {
            if (/^(yes|sí|si|true|1)$/i.test(userValue)) {
              setExtractedValues((prev) => {
                const updated = { ...prev, [targetField]: "true" };
                onFormValuesUpdate(updated);
                return updated;
              });
              valueExtracted = true;
            } else if (/^(no|false|0)$/i.test(userValue)) {
              setExtractedValues((prev) => {
                const updated = { ...prev, [targetField]: "false" };
                onFormValuesUpdate(updated);
                return updated;
              });
              valueExtracted = true;
            }
          } else {
            // For text, number, email, etc.
            setExtractedValues((prev) => {
              const updated = { ...prev, [targetField]: userValue };
              onFormValuesUpdate(updated);
              return updated;
            });
            valueExtracted = true;
          }

          if (valueExtracted) {
            // Check if there are more missing fields
            const updatedMissingFields = missingFields.slice(1);

            if (updatedMissingFields.length > 0) {
              // Ask for the next missing field
              const nextField = updatedMissingFields[0];
              const fieldLabel = getFieldLabel(nextField);

              resolve(
                language === "es"
                  ? `Gracias. Ahora, ¿cuál es tu ${fieldLabel}?`
                  : `Thank you. Now, what is your ${fieldLabel}?`
              );
              return;
            } else {
              // All fields are complete
              resolve(
                language === "es"
                  ? "¡Excelente! He completado todos los campos del formulario. Puedes ver una vista previa del PDF completo en el panel derecho y descargarlo cuando estés listo."
                  : "Excellent! I've completed all the form fields. You can see a preview of the completed PDF in the right panel and download it when you're ready."
              );
              return;
            }
          }
        }

        // Extract potential field values based on the user's message and required fields
        let responseText = "";

        // Detect if the message looks like a name
        if (
          lastUserMessage.content.length > 2 &&
          !extractedValues.fullName &&
          !lastUserMessage.content.includes("@") &&
          lastUserMessage.content.split(" ").length >= 2
        ) {
          // Save the extracted value
          setExtractedValues((prev) => {
            const updated = {
              ...prev,
              fullName: lastUserMessage.content.trim(),
            };
            onFormValuesUpdate(updated);
            return updated;
          });

          responseText =
            language === "es"
              ? `Gracias ${lastUserMessage.content}. Ahora, ¿cuál es tu DNI o NIE?`
              : `Thank you ${lastUserMessage.content}. Now, what is your DNI or NIE?`;
        }
        // Detect if the message looks like a DNI/NIE
        else if (
          !extractedValues.dni &&
          /^[0-9XYZxyz]\d{7}[A-Za-z]$/.test(lastUserMessage.content.trim())
        ) {
          // Save the extracted value
          setExtractedValues((prev) => {
            const updated = {
              ...prev,
              dni: lastUserMessage.content.trim().toUpperCase(),
            };
            onFormValuesUpdate(updated);
            return updated;
          });

          responseText =
            language === "es"
              ? "Gracias. ¿Cuál es tu fecha de nacimiento? (formato YYYY-MM-DD)"
              : "Thank you. What is your date of birth? (format YYYY-MM-DD)";
        }
        // Detect if the message looks like a date
        else if (
          !extractedValues.birthDate &&
          /^\d{4}-\d{2}-\d{2}$/.test(lastUserMessage.content.trim())
        ) {
          // Save the extracted value
          setExtractedValues((prev) => {
            const updated = {
              ...prev,
              birthDate: lastUserMessage.content.trim(),
            };
            onFormValuesUpdate(updated);
            return updated;
          });

          responseText =
            language === "es"
              ? "Gracias. ¿Cuál es tu dirección de correo electrónico?"
              : "Thank you. What is your email address?";
        }
        // Detect if the message looks like an email
        else if (
          !extractedValues.email &&
          /\S+@\S+\.\S+/.test(lastUserMessage.content.trim())
        ) {
          // Save the extracted value
          setExtractedValues((prev) => {
            const updated = { ...prev, email: lastUserMessage.content.trim() };
            onFormValuesUpdate(updated);
            return updated;
          });

          responseText =
            language === "es"
              ? "Gracias. ¿Cuáles son tus ingresos anuales en euros?"
              : "Thank you. What is your annual income in euros?";
        }
        // Detect if the message looks like an income amount
        else if (
          !extractedValues.income &&
          /\d+/.test(lastUserMessage.content.trim())
        ) {
          // Save the extracted value
          setExtractedValues((prev) => {
            const updated = { ...prev, income: lastUserMessage.content.trim() };
            onFormValuesUpdate(updated);
            return updated;
          });

          responseText =
            language === "es"
              ? "Gracias. Por último, ¿eres residente fiscal en España? (sí/no)"
              : "Thank you. Finally, are you a Spanish tax resident? (yes/no)";
        }
        // Detect yes/no for tax residence
        else if (
          !extractedValues.taxResidence &&
          /^(yes|no|sí|si|no)$/i.test(lastUserMessage.content.trim())
        ) {
          // Save the extracted value
          const isResident = /^(yes|sí|si)$/i.test(
            lastUserMessage.content.trim()
          );

          setExtractedValues((prev) => {
            const updated = {
              ...prev,
              taxResidence: isResident ? "true" : "false",
            };
            onFormValuesUpdate(updated);
            return updated;
          });

          responseText =
            language === "es"
              ? "¡Excelente! He completado tu formulario con toda la información proporcionada. Puedes ver el resultado en la vista previa del PDF. Si necesitas hacer cambios, puedes hacerlo manualmente o pedirme ayuda."
              : "Excellent! I've completed your form with all the information provided. You can see the result in the PDF preview. If you need to make changes, you can do so manually or ask me for help.";
        }
        // If the user is asking to upload a PDF
        else if (
          /pdf|upload|file|documento|archivo|subir/i.test(
            lastUserMessage.content
          )
        ) {
          responseText =
            language === "es"
              ? "Puedes subir un PDF para extraer información automáticamente. Simplemente arrastra y suelta un archivo PDF en esta ventana de chat, o haz clic en el ícono de archivo debajo del área de chat."
              : "You can upload a PDF to automatically extract information. Simply drag and drop a PDF file into this chat window, or click the file icon below the chat area.";
        }
        // Generic guidance for form filling
        else {
          // Check which fields we still need
          const missingFieldsNames = getMissingFieldsLabels().join(", ");

          responseText =
            language === "es"
              ? `Para completar el formulario "${formData.name}", necesito la siguiente información: ${missingFieldsNames}. ¿Podrías proporcionarme estos datos? También puedes subir un PDF con esta información.`
              : `To complete the "${formData.name}" form, I need the following information: ${missingFieldsNames}. Could you provide me with this data? You can also upload a PDF with this information.`;
        }

        resolve(responseText);
      }, 1000);
    });
  };

  // Get missing fields labels in user's language
  const getMissingFieldsLabels = (): string[] => {
    if (!missingFields.length) {
      // If we have extracted values but no specific missing fields defined
      // Return standard fields that are commonly required
      const standardFields = [
        "fullName",
        "dni",
        "birthDate",
        "email",
        "income",
        "taxResidence",
      ];
      const missingStandardFields = standardFields.filter(
        (field) =>
          !extractedValues[field] || extractedValues[field].trim() === ""
      );

      return missingStandardFields.map((field) => getFieldLabel(field));
    }

    return missingFields.map((field) => getFieldLabel(field));
  };

  // Use form fields from formData to display proper field labels
  const getFieldLabel = (field: string): string => {
    if (formData.formFields && formData.formFields[field]) {
      return (
        formData.formFields[field].label[language as "en" | "es"] ||
        t(`fields.${field}`)
      );
    }
    return t(`fields.${field}`);
  };

  // Determine field type from formData if available
  const getFieldType = (field: string): string => {
    if (formData.formFields && formData.formFields[field]) {
      return formData.formFields[field].type;
    }

    // Default types based on common field names
    if (field === "birthDate") return "date";
    if (field === "income") return "number";
    if (field === "email") return "email";
    if (field === "taxResidence") return "checkbox";

    return "text";
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (messagesEndRef.current && chatContainerRef.current) {
      // Use native scrollTo method instead of scrollIntoView for better control
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // Initialize chat with a system message
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);

      // Initialize with a personalized welcome message based on the form
      // Include the form name in the welcome message
      const welcomeMessage =
        language === "es"
          ? `¡Hola! Soy tu asistente para completar el formulario "${formData.name}". Puedes proporcionarme la información paso a paso, o subir un PDF para extraer los datos automáticamente. ¿Cómo te gustaría empezar?`
          : `Hello! I'm your assistant for completing the "${formData.name}" form. You can provide me with the information step by step, or upload a PDF to extract the data automatically. How would you like to start?`;

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

      // Add context about existing extracted values
      const valuesContext: Message = {
        role: "system",
        content:
          Object.keys(extractedValues).length > 0
            ? `The following information has already been collected: ${Object.entries(
                extractedValues
              )
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}`
            : `No information has been collected yet.`,
      };

      const conversationHistory: Message[] = [
        systemMessage,
        valuesContext,
        ...messages,
        userMessage,
      ];

      const response = await callOpenAI(conversationHistory);

      // Update messages with AI response
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
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

  // Handle file drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setPdfDropActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processPdfFile(file);
    }
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processPdfFile(file);
    }
  };

  // Process the PDF file
  const processPdfFile = async (file: File) => {
    // Check if it's a PDF
    if (file.type !== "application/pdf") {
      toast.error(t("uploadForm.pdfOnly"));
      return;
    }

    setIsProcessingPdf(true);

    try {
      setUploadedPdf({
        name: file.name,
        size: file.size,
      });

      // Read the file
      const fileBuffer = await file.arrayBuffer();

      // Extract fields and values from PDF
      const { extractedData } = await extractPDFFields(fileBuffer);

      // Update extracted values
      setExtractedValues((prev) => {
        const updated = { ...prev, ...extractedData };
        onFormValuesUpdate(updated);
        return updated;
      });

      // Send a message to the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content:
            language === "es"
              ? `He subido el archivo "${file.name}".`
              : `I've uploaded the file "${file.name}".`,
        },
      ]);

      // Let the AI respond next cycle
      setTimeout(() => {
        setLoading(true);

        // Determine if we have all required fields
        const stillMissing = requiredFields.filter(
          (field) => !extractedData[field] || extractedData[field].trim() === ""
        );

        setTimeout(() => {
          const aiResponse = {
            role: "assistant" as const,
            content:
              language === "es"
                ? stillMissing.length > 0
                  ? `He analizado tu PDF "${
                      file.name
                    }" y he extraído algunos datos. Sin embargo, aún necesito los siguientes campos: ${stillMissing
                      .map((f) => getFieldLabel(f))
                      .join(", ")}. ¿Podrías proporcionarme esta información?`
                  : `¡Excelente! He analizado tu PDF "${file.name}" y he completado todos los campos necesarios. Puedes ver el resultado en la vista previa del PDF. Si necesitas hacer correcciones, házmelo saber.`
                : stillMissing.length > 0
                ? `I've analyzed your PDF "${
                    file.name
                  }" and extracted some data. However, I still need the following fields: ${stillMissing
                    .map((f) => getFieldLabel(f))
                    .join(", ")}. Could you provide this information?`
                : `Excellent! I've analyzed your PDF "${file.name}" and completed all the necessary fields. You can see the result in the PDF preview. If you need to make any corrections, just let me know.`,
          };

          setMessages((prev) => [...prev, aiResponse]);
          setLoading(false);
        }, 1500);
      }, 0);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error(t("uploadForm.processError"));

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            language === "es"
              ? `Lo siento, hubo un error al procesar el archivo PDF. Por favor, inténtalo de nuevo o proporciona la información manualmente.`
              : `Sorry, there was an error processing the PDF file. Please try again or provide the information manually.`,
        },
      ]);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // Check if we should show the scroll indicator
  const isScrollable = (): boolean => {
    if (!chatContainerRef.current) return false;

    return (
      chatContainerRef.current.scrollHeight >
      chatContainerRef.current.clientHeight
    );
  };

  // Check if we're not at the bottom of the chat
  const isNotAtBottom = (): boolean => {
    if (!chatContainerRef.current) return false;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const threshold = 100; // pixels from bottom

    return scrollHeight - scrollTop - clientHeight > threshold;
  };

  return (
    <div className="flex flex-col h-[600px] bg-white relative">
      {/* Chat header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">{t("aiChat.title")}</h2>
        <p className="text-sm text-gray-500">{t("aiChat.description")}</p>
      </div>

      {/* Chat messages area - using native scroll */}
      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${
          pdfDropActive ? "bg-blue-50" : ""
        }`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e7eb transparent",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setPdfDropActive(true);
        }}
        onDragLeave={() => setPdfDropActive(false)}
        onDrop={handleDrop}
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

            {/* PDF drop overlay */}
            {pdfDropActive && (
              <div className="absolute inset-0 bg-blue-100/90 flex items-center justify-center rounded-lg z-10 border-2 border-blue-300 border-dashed">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-blue-800">
                    {t("uploadForm.dropPDFHere")}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PDF upload success indicator */}
      {uploadedPdf && (
        <div className="px-4 py-2 bg-green-50 border-t border-green-200 flex items-center justify-between">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm truncate">{uploadedPdf.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-700 hover:text-green-800 text-xs px-2 h-6"
            onClick={() => setUploadedPdf(null)}
          >
            {t("uploadForm.change")}
          </Button>
        </div>
      )}

      {/* Show scroll down button when not at bottom */}
      {isScrollable() && isNotAtBottom() && (
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-20 right-8 rounded-full opacity-70 hover:opacity-100"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-3 flex items-end gap-2 bg-white"
      >
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700"
          title={t("uploadForm.uploadPDF")}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || isProcessingPdf}
        >
          <FileText className="h-5 w-5" />
        </Button>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("aiChat.inputPlaceholder")}
          className="flex-1 resize-none rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          rows={1}
          disabled={loading || isProcessingPdf}
          style={{ minHeight: "44px", maxHeight: "120px" }}
        />
        <Button
          type="submit"
          disabled={loading || isProcessingPdf || input.trim() === ""}
          className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
        >
          {loading || isProcessingPdf ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>

      {/* Show form completion status */}
      {(requiredFields.length > 0 ||
        Object.keys(extractedValues).length > 0) && (
        <div className="border-t p-2 bg-gray-50 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <span>
              {t("aiChat.formCompletion")}:{" "}
              {Object.keys(extractedValues).length}/
              {Math.max(requiredFields.length, 6)}
            </span>
            <span>
              {missingFields.length === 0 &&
              Object.keys(extractedValues).length >=
                Math.max(requiredFields.length, 1)
                ? t("aiChat.complete")
                : t("aiChat.incomplete")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatForm;
