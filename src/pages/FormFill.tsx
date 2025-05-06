// src/pages/FormFill.tsx

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIChatForm from "@/features/ai-assistant/AIChatForm";
import ManualForm from "@/features/forms/ManualForm";
import PDFPreview from "@/features/pdf/PDFPreview";
import UploadForm from "@/features/upload/UploadForm";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import MainLayout from "@/layout/MainLayout";
import { db } from "@/lib/firebase";
import axios from "axios";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

interface FormField {
  name: string;
  label: {
    en: string;
    es: string;
  };
  type: "text" | "number" | "date" | "checkbox" | "email";
  placeholder?: {
    en: string;
    es: string;
  };
  required?: boolean;
  validation?: string;
}

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
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ai-chat");
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch saved form progress if available
  const fetchSavedProgress = useCallback(async () => {
    if (!currentUser || !formId) return null;

    try {
      const progressRef = doc(
        db,
        "users",
        currentUser.uid,
        "formProgress",
        formId
      );
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        return progressDoc.data().values as Record<string, string>;
      }
      return null;
    } catch (error) {
      console.error("Error fetching saved progress:", error);
      return null;
    }
  }, [currentUser, formId]);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!formId) return;

      try {
        setLoading(true);
        const formDoc = await getDoc(doc(db, "forms", formId));

        if (!formDoc.exists()) {
          console.error("Form not found");
          toast.error(t("form.notFound"), {
            description: t("form.tryAgain"),
          });
          navigate("/dashboard");
          return;
        }

        const formDocData = formDoc.data();

        // Create full form data object with proper typing
        const loadedFormData: FormData = {
          id: formId,
          name: formDocData.name || "",
          description: formDocData.description || "",
          year: formDocData.year || new Date().getFullYear(),
          pdfUrl: formDocData.pdfUrl,
          formFields: formDocData.formFields as
            | Record<string, FormField>
            | undefined,
          aiPrompt: formDocData.aiPrompt,
        };

        // If there's a PDF URL from Cloudinary, fetch it
        if (loadedFormData.pdfUrl) {
          try {
            const response = await axios.get(loadedFormData.pdfUrl, {
              responseType: "arraybuffer",
            });

            // Convert array buffer to Uint8Array
            const pdfBytes = new Uint8Array(response.data);
            setPdfBytes(pdfBytes);
          } catch (error) {
            console.error("Error fetching PDF:", error);
            toast.error(t("form.pdfError"), {
              description: t("form.pdfErrorDescription"),
            });
          }
        }

        setFormData(loadedFormData);

        // Try to load previously saved progress
        const savedValues = await fetchSavedProgress();

        if (savedValues && Object.keys(savedValues).length > 0) {
          setFormValues(savedValues);
          toast.info(t("form.progressLoaded"), {
            description: t("form.progressLoadedDescription"),
          });
        } else {
          // Initialize form values with empty strings if no saved progress
          if (loadedFormData.formFields) {
            const initialValues: Record<string, string> = {};
            Object.keys(loadedFormData.formFields).forEach((field) => {
              initialValues[field] = "";
            });
            setFormValues(initialValues);
          }
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error(t("form.loadError"), {
          description: t("form.loadErrorDescription"),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [formId, fetchSavedProgress, navigate, t]);

  // Save progress to Firestore
  const saveProgress = async () => {
    if (
      !currentUser ||
      !formId ||
      !formValues ||
      Object.keys(formValues).length === 0
    )
      return;

    try {
      setSaving(true);

      // Save to user's formProgress collection
      await setDoc(doc(db, "users", currentUser.uid, "formProgress", formId), {
        formId,
        formName: formData?.name,
        values: formValues,
        lastUpdated: new Date().toISOString(),
      });

      toast.success(t("form.progressSaved"), {
        description: t("form.progressSavedDescription"),
      });
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error(t("form.saveError"), {
        description: t("form.saveErrorDescription"),
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle form value changes with a single interface
  const handleFormValueChange = (fieldName: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  // Used by AI and Upload components for bulk updates
  const handleFormValuesUpdate = (newValues: Record<string, string>) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{formData.name}</h1>
            <p className="text-gray-600">{formData.description}</p>
          </div>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={saveProgress}
            disabled={saving || Object.keys(formValues).length === 0}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t("form.saveProgress")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
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
