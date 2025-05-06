// src/features/upload/UploadForm.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import {
  AlertCircle,
  CheckCircle,
  Edit2,
  FileText,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

// Mock Tesseract.js functionality
const mockOCR = async (): Promise<Record<string, string>> => {
  // This is a placeholder - in the real app, use actual Tesseract.js
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Return mock extracted data
      resolve({
        fullName: "John Doe",
        dni: "12345678A",
        income: "45000",
        birthDate: "1980-01-01",
        email: "john.doe@example.com",
        taxResidence: "true",
      });
    }, 2000);
  });
};

interface UploadFormProps {
  formData: {
    id: string;
    name: string;
  };
  onFormValuesUpdate: (values: Record<string, string>) => void;
}

const UploadForm = ({ onFormValuesUpdate }: UploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<Record<
    string,
    string
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (!selectedFile) {
      return;
    }

    // Validate file is PDF
    if (selectedFile.type !== "application/pdf") {
      setError(t("uploadForm.pdfOnly"));
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      // Process PDF with OCR
      const extractedValues = await mockOCR();

      clearInterval(interval);
      setUploadProgress(100);

      // Update form values
      setExtractedData(extractedValues);
      onFormValuesUpdate(extractedValues);

      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    } catch (error) {
      setError(t("uploadForm.processError"));
      setIsUploading(false);
      console.error("Error processing PDF:", error);
    }
  };

  const handleEditField = (field: string, value: string) => {
    if (!extractedData) return;

    const updatedData = {
      ...extractedData,
      [field]: value,
    };

    setExtractedData(updatedData);
    onFormValuesUpdate(updatedData);
  };

  const resetForm = () => {
    setFile(null);
    setExtractedData(null);
    setUploadProgress(0);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">{t("uploadForm.title")}</h2>
        <p className="text-gray-600">{t("uploadForm.description")}</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("uploadForm.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!extractedData ? (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium mb-1">
                {t("uploadForm.dropFile")}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {t("uploadForm.pdfHint")}
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {t("uploadForm.selectFile")}
              </Button>
            </div>
          </div>

          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900 truncate">
                    {file.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  disabled={isUploading}
                >
                  {t("uploadForm.remove")}
                </Button>
              </div>

              {isUploading ? (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-blue-700 text-center">
                    {uploadProgress < 100
                      ? t("uploadForm.processing")
                      : t("uploadForm.finishing")}
                  </p>
                </div>
              ) : (
                <Button className="w-full" onClick={handleUpload}>
                  {t("uploadForm.processButton")}
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {t("uploadForm.dataExtracted")}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={resetForm}>
              {t("uploadForm.uploadAnother")}
            </Button>
          </div>

          <Accordion type="single" collapsible defaultValue="extracted-data">
            <AccordionItem value="extracted-data">
              <AccordionTrigger>{t("uploadForm.reviewData")}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  {Object.entries(extractedData).map(([field, value]) => (
                    <div key={field} className="space-y-1">
                      <Label htmlFor={`edit-${field}`}>
                        {t(`fields.${field}`)}
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id={`edit-${field}`}
                          value={value}
                          onChange={(e) =>
                            handleEditField(field, e.target.value)
                          }
                          className="flex-grow mr-2"
                        />
                        <Edit2 className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button className="w-full">{t("uploadForm.confirmData")}</Button>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
