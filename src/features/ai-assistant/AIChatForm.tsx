// src/features/ai-assistant/AIChatForm.tsx
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowDown, Loader2, Send } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useEffect, useRef, useState } from "react";

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
  type: "text" | "number" | "date" | "checkbox" | "email";
  required?: boolean;
}

interface AIChatFormProps {
  formData: {
    id: string;
    name: string;
    aiPrompt?: string;
    formFields?: Record<string, FormField>;
    pdfUrl?: string;
  };
  onFormValuesUpdate: (values: Record<string, string>) => void;
  pdfBytes?: Uint8Array | null;
}

const AIChatForm = ({
  formData,
  onFormValuesUpdate,
  pdfBytes,
}: AIChatFormProps) => {
  // State variables
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfFieldNames, setPdfFieldNames] = useState<string[]>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number>(-1);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [, setIsLanguageSelected] = useState(false);
  const [activeMode, setActiveMode] = useState<
    "init" | "language" | "fields" | "completed"
  >("init");
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfForm, setPdfForm] = useState<any>(null);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number>(0);
  const [formFieldsMap, setFormFieldsMap] = useState<Record<string, FormField>>(
    {}
  );

  // Get language context
  const { t, language, setLanguage: setAppLanguage } = useLanguage();

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);

      // No PDF yet, show initial message
      if (!pdfBytes) {
        setMessages([
          {
            role: "assistant",
            content:
              "Please select a PDF form to begin filling it out with the AI assistant.",
          },
        ]);
        setLoading(false);
        return;
      }

      try {
        // Load PDF and extract field names
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        const fieldNames = fields.map((field) => field.getName());

        // Save PDF doc and field names
        setPdfDoc(pdfDoc);
        setPdfForm(form);
        setPdfFieldNames(fieldNames);

        // Create a map of field info
        const fieldInfoMap: Record<string, FormField> = {};

        for (const field of fields) {
          const fieldName = field.getName();
          let fieldType: "text" | "number" | "date" | "checkbox" | "email" =
            "text";

          // Determine field type
          if (field.constructor.name === "PDFCheckBox") {
            fieldType = "checkbox";
          } else {
            // Try to guess field type from name
            fieldType = getFieldTypeFromName(fieldName);
          }

          // Create field info
          fieldInfoMap[fieldName] = {
            name: fieldName,
            label: {
              en: generateReadableLabel(fieldName, "en"),
              es: generateReadableLabel(fieldName, "es"),
            },
            type: fieldType,
            required: true,
          };
        }

        // Merge with any existing form field definitions from props
        if (formData.formFields) {
          for (const [name, field] of Object.entries(formData.formFields)) {
            if (fieldInfoMap[name]) {
              // Keep the official label if available
              fieldInfoMap[name] = {
                ...fieldInfoMap[name],
                label: field.label,
                type: field.type,
                required: field.required,
              };
            }
          }
        }

        setFormFieldsMap(fieldInfoMap);

        // If no fields found, show error
        if (fieldNames.length === 0) {
          setMessages([
            {
              role: "assistant",
              content:
                "I couldn't detect any fillable fields in this PDF. Please make sure it's a fillable AcroForm PDF.",
            },
          ]);
          setLoading(false);
          return;
        }

        // Show welcome message with language selection
        setMessages([
          {
            role: "assistant",
            content: `Hello! I've detected ${fieldNames.length} fillable fields in the form "${formData.name}". Let's complete it together! Would you prefer to continue in English or Español? (Reply "english" or "español")`,
          },
        ]);

        // Set mode to language selection
        setActiveMode("language");
      } catch (error) {
        console.error("Error analyzing PDF:", error);
        setMessages([
          {
            role: "assistant",
            content:
              "There was an error analyzing the PDF. Please make sure it's a valid fillable PDF form.",
          },
        ]);
      }

      setLoading(false);
    };

    initializeChat();
  }, [formData.name, formData.formFields, pdfBytes]);

  // Logic to ask questions about each field
  useEffect(() => {
    if (
      activeMode !== "fields" ||
      currentFieldIndex < 0 ||
      currentFieldIndex >= pdfFieldNames.length
    ) {
      return;
    }

    // Get the current field name
    const fieldName = pdfFieldNames[currentFieldIndex];

    // Skip if we already have a value for this field
    if (fieldValues[fieldName]) {
      setCurrentFieldIndex(currentFieldIndex + 1);
      return;
    }

    // Get field info
    const fieldInfo = formFieldsMap[fieldName] || {
      name: fieldName,
      label: {
        en: generateReadableLabel(fieldName, "en"),
        es: generateReadableLabel(fieldName, "es"),
      },
      type: getFieldTypeFromName(fieldName),
    };

    const fieldLabel = fieldInfo.label[language as "en" | "es"];
    const fieldType = fieldInfo.type;

    // Create a question based on field type and language
    let question = "";
    const isEnglish = language === "en";

    if (isEnglish) {
      if (fieldType === "checkbox") {
        question = `${fieldLabel}? (please answer yes or no)`;
      } else if (fieldType === "date") {
        question = `Please enter your ${fieldLabel} (format: YYYY-MM-DD):`;
      } else if (fieldType === "number") {
        question = `Please enter the ${fieldLabel}:`;
      } else if (fieldType === "email") {
        question = `Please enter your ${fieldLabel}:`;
      } else {
        question = `Please enter your ${fieldLabel}:`;
      }
    } else {
      if (fieldType === "checkbox") {
        question = `¿${fieldLabel}? (por favor responde sí o no)`;
      } else if (fieldType === "date") {
        question = `Por favor, introduce tu ${fieldLabel} (formato: AAAA-MM-DD):`;
      } else if (fieldType === "number") {
        question = `Por favor, introduce el ${fieldLabel}:`;
      } else if (fieldType === "email") {
        question = `Por favor, introduce tu ${fieldLabel}:`;
      } else {
        question = `Por favor, introduce tu ${fieldLabel}:`;
      }
    }

    // Add the question as a message
    setMessages((prev) => [...prev, { role: "assistant", content: question }]);
  }, [
    activeMode,
    currentFieldIndex,
    language,
    pdfFieldNames,
    formFieldsMap,
    fieldValues,
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Function to generate readable label from field name
  const generateReadableLabel = (
    fieldName: string,
    lang: "en" | "es"
  ): string => {
    // Try to get label from formData.formFields
    if (formData.formFields && formData.formFields[fieldName]) {
      return formData.formFields[fieldName].label[lang];
    }

    // Generate a readable label from the field name
    let label = fieldName
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\./g, " ") // Replace dots with spaces
      .toLowerCase()
      .trim();

    // Capitalize first letter
    label = label.charAt(0).toUpperCase() + label.slice(1);

    // Spanish-specific transformations if needed
    if (lang === "es") {
      // Map common English words to Spanish (very basic)
      const translations: Record<string, string> = {
        name: "nombre",
        email: "correo electrónico",
        date: "fecha",
        birth: "nacimiento",
        address: "dirección",
        phone: "teléfono",
        number: "número",
        city: "ciudad",
        state: "estado",
        zip: "código postal",
        country: "país",
      };

      // Simple word replacement (not perfect but helps)
      for (const [en, es] of Object.entries(translations)) {
        label = label.replace(new RegExp(`\\b${en}\\b`, "gi"), es);
      }
    }

    return label;
  };

  // Function to guess field type from name
  const getFieldTypeFromName = (
    fieldName: string
  ): "text" | "number" | "date" | "checkbox" | "email" => {
    const nameLower = fieldName.toLowerCase();

    // Check for email
    if (
      nameLower.includes("email") ||
      nameLower.includes("mail") ||
      nameLower.includes("correo") ||
      nameLower.includes("e-mail")
    ) {
      return "email";
    }

    // Check for date
    if (
      nameLower.includes("date") ||
      nameLower.includes("birth") ||
      nameLower.includes("born") ||
      nameLower.includes("fecha") ||
      nameLower.includes("nacimiento") ||
      nameLower.match(/\b(day|month|year|día|mes|año)\b/)
    ) {
      return "date";
    }

    // Check for number
    if (
      nameLower.includes("num") ||
      nameLower.includes("amount") ||
      nameLower.includes("qty") ||
      nameLower.includes("quantity") ||
      nameLower.includes("total") ||
      nameLower.includes("sum") ||
      nameLower.includes("count") ||
      nameLower.includes("price") ||
      nameLower.includes("cost") ||
      nameLower.includes("precio") ||
      nameLower.includes("cantidad") ||
      nameLower.includes("número") ||
      nameLower.includes("importe") ||
      nameLower.match(/\b(age|edad)\b/)
    ) {
      return "number";
    }

    // Check for checkbox
    if (
      nameLower.includes("check") ||
      nameLower.includes("flag") ||
      nameLower.includes("toggle") ||
      nameLower.includes("yes") ||
      nameLower.includes("no") ||
      nameLower.includes("confirm") ||
      nameLower.includes("agree") ||
      nameLower.includes("accept") ||
      nameLower.includes("approve")
    ) {
      return "checkbox";
    }

    // Default to text
    return "text";
  };

  // Function to validate field input
  const validateInput = (
    fieldName: string,
    value: string
  ): { valid: boolean; message?: string } => {
    const fieldInfo = formFieldsMap[fieldName];
    const fieldType = fieldInfo?.type || getFieldTypeFromName(fieldName);
    const isEnglish = language === "en";

    // Empty check
    if (!value.trim()) {
      return {
        valid: false,
        message: isEnglish
          ? "This field cannot be empty. Please provide a value."
          : "Este campo no puede estar vacío. Por favor, proporciona un valor.",
      };
    }

    // Type-specific validation
    switch (fieldType) {
      case "checkbox": {
        const checkValue = value.toLowerCase();
        const validValues = isEnglish
          ? ["yes", "no", "true", "false", "1", "0"]
          : ["si", "sí", "no", "verdadero", "falso", "1", "0"];

        if (!validValues.some((v) => checkValue.includes(v))) {
          return {
            valid: false,
            message: isEnglish
              ? "Please answer with yes or no."
              : "Por favor, responde con sí o no.",
          };
        }
        break;
      }

      case "date": {
        // Allow various date formats
        const dateRegex =
          /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$|^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/;
        if (!dateRegex.test(value)) {
          return {
            valid: false,
            message: isEnglish
              ? "Please enter a valid date in YYYY-MM-DD format."
              : "Por favor, introduce una fecha válida en formato AAAA-MM-DD.",
          };
        }
        break;
      }

      case "email": {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return {
            valid: false,
            message: isEnglish
              ? "Please enter a valid email address."
              : "Por favor, introduce una dirección de correo electrónico válida.",
          };
        }
        break;
      }

      case "number": {
        // Basic number validation
        const numberRegex = /^-?\d+(\.\d+)?$/;
        if (!numberRegex.test(value)) {
          return {
            valid: false,
            message: isEnglish
              ? "Please enter a valid number."
              : "Por favor, introduce un número válido.",
          };
        }
        break;
      }
    }

    return { valid: true };
  };

  // Function to format field value based on type
  const formatValue = (fieldName: string, value: string): string => {
    const fieldInfo = formFieldsMap[fieldName];
    const fieldType = fieldInfo?.type || getFieldTypeFromName(fieldName);

    if (fieldType === "checkbox") {
      const lowerValue = value.toLowerCase();
      if (
        lowerValue.includes("yes") ||
        lowerValue.includes("sí") ||
        lowerValue.includes("si") ||
        lowerValue === "true" ||
        lowerValue === "1"
      ) {
        return "true";
      } else {
        return "false";
      }
    }

    return value.trim();
  };

  // Function to update PDF field
  const updatePdfField = async (
    fieldName: string,
    value: string
  ): Promise<Uint8Array | null> => {
    // Limit updates to max once every 200ms to prevent flickering
    const now = Date.now();
    if (now - lastUpdateTimestamp < 200) {
      return null;
    }

    if (!pdfDoc || !pdfForm) return null;

    try {
      // Try to get the field by name
      const field = pdfForm.getField(fieldName);

      // Handle different field types
      if (field.constructor.name === "PDFCheckBox") {
        const checkBox = pdfForm.getCheckBox(fieldName);
        if (value === "true") {
          checkBox.check();
        } else {
          checkBox.uncheck();
        }
      } else if (field.constructor.name === "PDFTextField") {
        const textField = pdfForm.getTextField(fieldName);
        textField.setText(value);
      } else if (field.constructor.name === "PDFDropdown") {
        const dropdown = pdfForm.getDropdown(fieldName);
        dropdown.select(value);
      } else if (field.constructor.name === "PDFRadioGroup") {
        const radioGroup = pdfForm.getRadioGroup(fieldName);
        radioGroup.select(value);
      }

      // Save the updated PDF
      const updatedPdfBytes = await pdfDoc.save();

      // Update timestamp
      setLastUpdateTimestamp(now);

      return updatedPdfBytes;
    } catch (error) {
      console.error(`Error updating field ${fieldName}:`, error);
      return null;
    }
  };

  // Function to check if scroll indicator should be shown
  const shouldShowScrollIndicator = (): boolean => {
    if (!chatContainerRef.current) return false;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const threshold = 100; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight > threshold;
  };

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle message submission
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Don't process empty messages or when loading
    if (!input.trim() || loading) return;

    // Add user message to chat
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input and set loading state
    const userInput = input.trim();
    setInput("");
    setLoading(true);

    try {
      // HANDLE LANGUAGE SELECTION MODE
      if (activeMode === "language") {
        const inputLower = userInput.toLowerCase();

        // Check if input contains language selection
        if (
          inputLower.includes("english") ||
          inputLower === "en" ||
          inputLower === "english"
        ) {
          // Set language to English
          if (setAppLanguage) {
            setAppLanguage("en");
          }

          // Add confirmation message
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Great! We'll proceed in English. Let's start filling out your form.",
            },
          ]);

          // Switch to fields mode and start with first field
          setIsLanguageSelected(true);
          setActiveMode("fields");
          setTimeout(() => setCurrentFieldIndex(0), 500);
        } else if (
          inputLower.includes("español") ||
          inputLower.includes("espanol") ||
          inputLower === "es" ||
          inputLower === "spanish"
        ) {
          // Set language to Spanish
          if (setAppLanguage) {
            setAppLanguage("es");
          }

          // Add confirmation message
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "¡Perfecto! Continuaremos en español. Comencemos a completar tu formulario.",
            },
          ]);

          // Switch to fields mode and start with first field
          setIsLanguageSelected(true);
          setActiveMode("fields");
          setTimeout(() => setCurrentFieldIndex(0), 500);
        } else {
          // Invalid language selection
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Please select either 'English' or 'Español' to continue. / Por favor, selecciona 'English' o 'Español' para continuar.",
            },
          ]);
        }
      }
      // HANDLE FIELD FILLING MODE
      else if (
        activeMode === "fields" &&
        currentFieldIndex >= 0 &&
        currentFieldIndex < pdfFieldNames.length
      ) {
        const fieldName = pdfFieldNames[currentFieldIndex];

        // Validate input
        const validation = validateInput(fieldName, userInput);

        if (!validation.valid) {
          // Show validation error message
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: validation.message || "Invalid input. Please try again.",
            },
          ]);
        } else {
          // Format the value based on field type
          const formattedValue = formatValue(fieldName, userInput);

          // Update field values
          setFieldValues((prev) => ({
            ...prev,
            [fieldName]: formattedValue,
          }));

          // Update parent component with all values
          const updatedValues = {
            ...fieldValues,
            [fieldName]: formattedValue,
          };
          onFormValuesUpdate(updatedValues);

          // Update PDF if possible
          if (pdfDoc) {
            const updatedPdfBytes = await updatePdfField(
              fieldName,
              formattedValue
            );
            if (updatedPdfBytes) {
              // In a real implementation, we would update the PDF preview here
              // but that's handled by the parent component through onFormValuesUpdate
            }
          }

          // Show confirmation message
          const isEnglish = language === "en";
          const fieldInfo = formFieldsMap[fieldName] || {
            label: {
              en: generateReadableLabel(fieldName, "en"),
              es: generateReadableLabel(fieldName, "es"),
            },
          };

          const fieldLabel = fieldInfo.label[language as "en" | "es"];
          const confirmationMsg = isEnglish
            ? `Thank you! I've recorded your answer for ${fieldLabel}.`
            : `¡Gracias! He registrado tu respuesta para ${fieldLabel}.`;

          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: confirmationMsg },
          ]);

          // Check if we're done or move to the next field
          if (currentFieldIndex >= pdfFieldNames.length - 1) {
            // We've completed all fields
            const completeMsg = isEnglish
              ? "Great job! You've completed all the form fields. You can now view and download your filled form."
              : "¡Buen trabajo! Has completado todos los campos del formulario. Ahora puedes ver y descargar tu formulario rellenado.";

            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: completeMsg },
            ]);
            setActiveMode("completed");
          } else {
            // Move to next field after a short delay
            setTimeout(() => setCurrentFieldIndex(currentFieldIndex + 1), 500);
          }
        }
      }
      // HANDLE COMPLETED MODE OR OTHER QUERIES
      else {
        const isEnglish = language === "en";
        let responseMsg = "";

        // Check for common questions
        const inputLower = userInput.toLowerCase();

        if (
          inputLower.includes("download") ||
          inputLower.includes("descargar")
        ) {
          responseMsg = isEnglish
            ? "You can download your filled form using the Download button in the preview panel."
            : "Puedes descargar tu formulario rellenado usando el botón Descargar en el panel de vista previa.";
        } else if (
          inputLower.includes("restart") ||
          inputLower.includes("reset") ||
          inputLower.includes("reiniciar")
        ) {
          responseMsg = isEnglish
            ? "Would you like to start over? I can guide you through filling the form again."
            : "¿Te gustaría empezar de nuevo? Puedo guiarte para rellenar el formulario otra vez.";
        } else if (activeMode === "completed") {
          responseMsg = isEnglish
            ? "I'm here to help you with the form. If you have any specific questions about any field, or need to modify any data, let me know."
            : "Estoy aquí para ayudarte con el formulario. Si tienes alguna pregunta específica sobre algún campo o necesitas modificar algún dato, házmelo saber.";
        } else {
          responseMsg = isEnglish
            ? "I'm not sure what you're asking. Please select a PDF form first so I can help you fill it out."
            : "No estoy seguro de lo que estás preguntando. Por favor, selecciona primero un formulario PDF para que pueda ayudarte a rellenarlo.";
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: responseMsg },
        ]);
      }
    } catch (error) {
      console.error("Error handling message:", error);

      // Show error message
      const errorMsg =
        language === "en"
          ? "Sorry, something went wrong. Please try again."
          : "Lo siento, algo salió mal. Por favor, inténtalo de nuevo.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white relative">
      {/* Chat header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">{t("aiChat.title")}</h2>
        <p className="text-sm text-gray-500">{t("aiChat.description")}</p>
      </div>

      {/* Chat messages area */}
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

      {/* Show scroll down button when needed */}
      {shouldShowScrollIndicator() && (
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

      {/* Form completion status */}
      {pdfFieldNames.length > 0 && (
        <div className="border-t p-2 bg-gray-50 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <span>
              {t("aiChat.formCompletion")}: {Object.keys(fieldValues).length}/
              {pdfFieldNames.length}
            </span>
            <span>
              {Object.keys(fieldValues).length >= pdfFieldNames.length
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
