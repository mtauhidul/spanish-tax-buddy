// src/pages/FormFill.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIChatForm from "@/features/ai-assistant/AIChatForm";
import ManualForm, { type FormField } from "@/features/forms/ManualForm";
import PDFPreview from "@/features/pdf/PDFPreview";
import UploadForm from "@/features/upload/UploadForm";
import { useLanguage } from "@/hooks/useLanguage";
import MainLayout from "@/layout/MainLayout";
import { db } from "@/lib/firebase";
import axios from "axios";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface FormData {
  id: string;
  name: string;
  description: string;
  year: number;
  pdfUrl?: string;
  formFields?: Record<string, FormField>;
  aiPrompt?: string;
}

const FormFill = () => {
  const { formId } = useParams<{ formId: string }>();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchFormData = async () => {
      if (!formId) return;

      try {
        setLoading(true);
        const formDoc = await getDoc(doc(db, "forms", formId));

        if (!formDoc.exists()) {
          console.error("Form not found");
          return;
        }

        const formData = formDoc.data() as Omit<FormData, "id">;

        // If there's a PDF URL from Cloudinary, fetch it
        if (formData.pdfUrl) {
          try {
            console.log("Fetching PDF from URL:", formData.pdfUrl);
            const response = await axios.get(formData.pdfUrl, {
              responseType: "arraybuffer",
            });

            // Convert array buffer to Uint8Array
            const pdfBytes = new Uint8Array(response.data);
            setPdfBytes(pdfBytes);
          } catch (error) {
            console.error("Error fetching PDF:", error);
          }
        }

        setFormData({
          id: formId,
          ...formData,
        });

        // Initialize form values with empty strings
        if (formData.formFields) {
          const initialValues: Record<string, string> = {};
          Object.keys(formData.formFields).forEach((field) => {
            initialValues[field] = "";
          });
          setFormValues(initialValues);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [formId]);

  // Debounce form value changes to prevent excessive re-renders
  const handleFormValueChange = (fieldName: string, value: string) => {
    // Use functional update to ensure we have the latest state
    setFormValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  // Used by AI and Upload components for bulk updates
  const handleFormValuesUpdate = (newValues: Record<string, string>) => {
    setFormValues(newValues);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>{t("form.loading")}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!formData) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t("form.notFound")}</h2>
          <p>{t("form.tryAgain")}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">{formData.name}</h1>
        <p className="text-gray-600 mb-6">{formData.description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Tabs defaultValue="ai-chat">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="ai-chat" className="flex-1">
                  {t("form.aiAssistant")}
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex-1">
                  {t("form.manualFill")}
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex-1">
                  {t("form.uploadPdf")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai-chat">
                <AIChatForm
                  formData={formData}
                  onFormValuesUpdate={handleFormValuesUpdate}
                />
              </TabsContent>

              <TabsContent value="manual">
                <ManualForm
                  formData={formData}
                  formValues={formValues}
                  onFormValueChange={handleFormValueChange}
                />
              </TabsContent>

              <TabsContent value="upload">
                <UploadForm
                  formData={formData}
                  onFormValuesUpdate={handleFormValuesUpdate}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">{t("form.pdfPreview")}</h2>
            {pdfBytes ? (
              <PDFPreview
                pdfBytes={pdfBytes}
                formValues={formValues}
                formData={formData}
              />
            ) : (
              <div className="border rounded-lg p-8 text-center bg-gray-50">
                <p>{t("form.previewUnavailable")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FormFill;
