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
import type { FormData, FormField } from "@/types/form";
import {
  AlertCircle,
  CheckCircle,
  Edit2,
  FileText,
  Upload,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Enhanced PDF extraction function that properly reads form fields
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
          if (value) extractedData[String(fieldName)] = value;
        } else if (field.constructor.name === "PDFCheckBox") {
          const checkBox = form.getCheckBox(fieldName);
          extractedData[fieldName] = checkBox.isChecked() ? "true" : "false";
        } else if (field.constructor.name === "PDFRadioGroup") {
          const radioGroup = form.getRadioGroup(fieldName);
          const value = radioGroup.getSelected();
          if (value) extractedData[String(fieldName)] = value;
        } else if (field.constructor.name === "PDFDropdown") {
          const dropdown = form.getDropdown(fieldName);
          const value = dropdown.getSelected();
          if (value)
            extractedData[fieldName.toString()] = Array.isArray(value)
              ? value.join(", ")
              : value;
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

// Map PDF form field names to standardized field names based on common patterns
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

// Identify which required fields are missing data
const findMissingRequiredFields = (
  extractedData: Record<string, string>,
  formFields?: Record<string, FormField>
): string[] => {
  if (!formFields) return [];

  const requiredFields = Object.values(formFields)
    .filter((field) => field.required)
    .map((field) => field.name);

  return requiredFields.filter((fieldName) => !extractedData[fieldName]);
};

interface UploadFormProps {
  formData: FormData;
  onFormValuesUpdate: (values: Record<string, string>) => void;
}

const UploadForm = ({ formData, onFormValuesUpdate }: UploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<Record<string, string>>(
    {}
  );
  const [, setPdfFields] = useState<string[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Automatically start processing when file is selected
    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Read the file
      const fileBuffer = await selectedFile.arrayBuffer();
      setPdfBytes(fileBuffer);

      setUploadProgress(40);

      // Extract fields and values from PDF
      const { fields, extractedData } = await extractPDFFields(fileBuffer);
      setPdfFields(fields);

      setUploadProgress(70);

      // Update extracted data
      setExtractedData(extractedData);

      // Find missing required fields
      const missing = findMissingRequiredFields(
        extractedData,
        formData.formFields
      );
      setMissingFields(missing);

      setUploadProgress(100);

      // Update parent component with extracted values
      onFormValuesUpdate(extractedData);

      toast.success(
        missing.length > 0
          ? t("uploadForm.dataPartiallyExtracted")
          : t("uploadForm.dataExtracted"),
        {
          description:
            missing.length > 0
              ? t("uploadForm.dataPartiallyExtractedDescription")
              : t("uploadForm.dataExtractedDescription"),
        }
      );

      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    } catch (error) {
      console.error("Error processing PDF:", error);
      setError(t("uploadForm.processError"));
      setIsUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!file || !pdfBytes) return;

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

      // Re-process the PDF to ensure we have the latest extracted data
      const { fields, extractedData } = await extractPDFFields(pdfBytes);
      setPdfFields(fields);

      clearInterval(interval);
      setUploadProgress(100);

      // Update extracted data
      setExtractedData(extractedData);

      // Find missing required fields
      const missing = findMissingRequiredFields(
        extractedData,
        formData.formFields
      );
      setMissingFields(missing);

      // Update parent component with extracted values
      onFormValuesUpdate(extractedData);

      toast.success(
        missing.length > 0
          ? t("uploadForm.dataPartiallyExtracted")
          : t("uploadForm.dataExtracted"),
        {
          description:
            missing.length > 0
              ? t("uploadForm.pleaseCompleteFields")
              : t("uploadForm.dataExtractedDescription"),
        }
      );

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
    const updatedData = {
      ...extractedData,
      [field]: value,
    };

    setExtractedData(updatedData);

    // Update missing fields list
    const missing = findMissingRequiredFields(updatedData, formData.formFields);
    setMissingFields(missing);

    // Update parent form values
    onFormValuesUpdate(updatedData);
  };

  const resetForm = () => {
    setFile(null);
    setPdfBytes(null);
    setExtractedData({});
    setPdfFields([]);
    setMissingFields([]);
    setUploadProgress(0);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmData = () => {
    // Check if all required fields are filled
    const missingRequired = findMissingRequiredFields(
      extractedData,
      formData.formFields
    );

    if (missingRequired.length > 0) {
      toast.error(t("uploadForm.missingRequiredFields"), {
        description: t("uploadForm.pleaseCompleteFields"),
      });
      return;
    }

    toast.success(t("uploadForm.dataConfirmed"), {
      description: t("uploadForm.dataConfirmedDescription"),
    });
  };

  // Use form fields from formData if available to display proper field labels
  const getFieldLabel = (field: string): string => {
    if (formData.formFields && formData.formFields[field]) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { language } = useLanguage();
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

  // Check if field is required
  const isFieldRequired = (field: string): boolean => {
    if (formData.formFields && formData.formFields[field]) {
      return !!formData.formFields[field].required;
    }
    return false;
  };

  // Automatically open form editor when there are missing fields
  useEffect(() => {
    if (missingFields.length > 0 && Object.keys(extractedData).length > 0) {
      // The form has missing fields that need to be completed
      document.getElementById("extracted-data-trigger")?.click();
    }
  }, [missingFields, extractedData]);

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

      {Object.keys(extractedData).length === 0 ? (
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
                <Button className="w-full" onClick={handleProcess}>
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
                {missingFields.length > 0
                  ? t("uploadForm.dataPartiallyExtracted")
                  : t("uploadForm.dataExtracted")}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={resetForm}>
              {t("uploadForm.uploadAnother")}
            </Button>
          </div>

          {missingFields.length > 0 && (
            <Alert className="bg-amber-50 border-amber-200 mb-4">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">
                {t("uploadForm.missingFields")}
              </AlertTitle>
              <AlertDescription className="text-amber-700">
                {t("uploadForm.pleaseCompleteFields")}:
                <ul className="list-disc list-inside mt-1">
                  {missingFields.map((field) => (
                    <li key={field}>{getFieldLabel(field)}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Accordion type="single" collapsible defaultValue="extracted-data">
            <AccordionItem value="extracted-data">
              <AccordionTrigger id="extracted-data-trigger">
                {t("uploadForm.reviewData")}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  {/* First show missing required fields */}
                  {missingFields.map((field) => (
                    <div key={field} className="space-y-1">
                      <Label
                        htmlFor={`edit-${field}`}
                        className="flex items-center"
                      >
                        {getFieldLabel(field)}
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="flex items-center">
                        {getFieldType(field) === "checkbox" ? (
                          <div className="flex items-center">
                            <Input
                              id={`edit-${field}`}
                              type="checkbox"
                              checked={extractedData[field] === "true"}
                              onChange={(e) =>
                                handleEditField(
                                  field,
                                  e.target.checked ? "true" : "false"
                                )
                              }
                              className="mr-2 h-4 w-4"
                            />
                            <span>
                              {extractedData[field] === "true"
                                ? t("uploadForm.yes")
                                : t("uploadForm.no")}
                            </span>
                          </div>
                        ) : (
                          <Input
                            id={`edit-${field}`}
                            value={extractedData[field] || ""}
                            onChange={(e) =>
                              handleEditField(field, e.target.value)
                            }
                            className="flex-grow mr-2 border-red-300 focus:border-red-500"
                            type={getFieldType(field)}
                            required
                          />
                        )}
                        <Edit2 className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}

                  {/* Then show filled fields */}
                  {Object.entries(extractedData)
                    .filter(([field]) => !missingFields.includes(field))
                    .map(([field, value]) => (
                      <div key={field} className="space-y-1">
                        <Label
                          htmlFor={`edit-${field}`}
                          className="flex items-center"
                        >
                          {getFieldLabel(field)}
                          {isFieldRequired(field) && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <div className="flex items-center">
                          {getFieldType(field) === "checkbox" ? (
                            <div className="flex items-center">
                              <Input
                                id={`edit-${field}`}
                                type="checkbox"
                                checked={value === "true"}
                                onChange={(e) =>
                                  handleEditField(
                                    field,
                                    e.target.checked ? "true" : "false"
                                  )
                                }
                                className="mr-2 h-4 w-4"
                              />
                              <span>
                                {value === "true"
                                  ? t("uploadForm.yes")
                                  : t("uploadForm.no")}
                              </span>
                            </div>
                          ) : (
                            <Input
                              id={`edit-${field}`}
                              value={value}
                              onChange={(e) =>
                                handleEditField(field, e.target.value)
                              }
                              className="flex-grow mr-2"
                              type={getFieldType(field)}
                            />
                          )}
                          <Edit2 className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            className="w-full"
            onClick={handleConfirmData}
            disabled={missingFields.length > 0}
          >
            {missingFields.length > 0
              ? t("uploadForm.completeRequiredFields")
              : t("uploadForm.confirmData")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
