// src/features/forms/ManualForm.tsx
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/useLanguage";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface FormField {
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

interface ManualFormProps {
  formData: {
    id: string;
    name: string;
    formFields?: Record<string, FormField>;
  };
  formValues: Record<string, string>;
  onFormValueChange: (fieldName: string, value: string) => void;
}

const ManualForm = ({
  formData,
  formValues,
  onFormValueChange,
}: ManualFormProps) => {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FormField[]>([]);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});
  const { t, language } = useLanguage();

  useEffect(() => {
    setLoading(true);

    // If formFields is provided, use them
    // Otherwise, use mock fields for demo
    if (formData.formFields) {
      setFields(Object.values(formData.formFields));
    } else {
      // Mock fields for demonstration
      setFields([
        {
          name: "fullName",
          label: {
            en: "Full Name",
            es: "Nombre Completo",
          },
          type: "text",
          placeholder: {
            en: "John Doe",
            es: "Juan Pérez",
          },
          required: true,
        },
        {
          name: "dni",
          label: {
            en: "DNI / NIE",
            es: "DNI / NIE",
          },
          type: "text",
          placeholder: {
            en: "12345678A",
            es: "12345678A",
          },
          required: true,
          validation: "^[0-9]{8}[A-Za-z]$",
        },
        {
          name: "birthDate",
          label: {
            en: "Date of Birth",
            es: "Fecha de Nacimiento",
          },
          type: "date",
          required: true,
        },
        {
          name: "email",
          label: {
            en: "Email",
            es: "Correo Electrónico",
          },
          type: "email",
          placeholder: {
            en: "john.doe@example.com",
            es: "juan.perez@ejemplo.com",
          },
        },
        {
          name: "income",
          label: {
            en: "Annual Income (€)",
            es: "Ingresos Anuales (€)",
          },
          type: "number",
          required: true,
        },
        {
          name: "taxResidence",
          label: {
            en: "Spanish Tax Resident",
            es: "Residente Fiscal en España",
          },
          type: "checkbox",
        },
      ]);
    }

    // Initialize local values with existing form values
    setLocalValues(formValues);
    setLoading(false);
  }, [formData]);

  // Update local values when parent form values change
  useEffect(() => {
    setLocalValues(formValues);
  }, [formValues]);

  const validateField = (field: FormField, value: string): boolean => {
    if (field.required && !value) return false;

    if (field.validation && value) {
      const regex = new RegExp(field.validation);
      return regex.test(value);
    }

    return true;
  };

  // Use debounce to prevent excessive updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateValue = useCallback(
    debounce((fieldName: string, value: string) => {
      onFormValueChange(fieldName, value);
    }, 300),
    [onFormValueChange]
  );

  const handleInputChange = (field: FormField, value: string) => {
    // Update local state immediately for responsive UI
    setLocalValues((prev) => ({
      ...prev,
      [field.name]: value,
    }));

    // Validate the field
    const isValid = validateField(field, value);
    setValidationErrors((prev) => ({
      ...prev,
      [field.name]: !isValid,
    }));

    // Notify parent with debounce to prevent re-rendering PDF too often
    debouncedUpdateValue(field.name, value);
  };

  const handleCheckboxChange = (field: FormField, checked: boolean) => {
    const value = checked ? "true" : "false";
    setLocalValues((prev) => ({
      ...prev,
      [field.name]: value,
    }));

    // Checkboxes don't need validation, update immediately
    onFormValueChange(field.name, value);
  };

  const handleSave = () => {
    // Validate all fields before saving
    const errors: Record<string, boolean> = {};
    let hasErrors = false;

    fields.forEach((field) => {
      const value = localValues[field.name] || "";
      const isValid = validateField(field, value);

      if (!isValid) {
        errors[field.name] = true;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);

    if (hasErrors) {
      toast.error(t("manualForm.validationError"), {
        description: t("manualForm.pleaseCorrectErrors"),
      });
      return;
    }

    // Update all values at once in parent
    for (const [key, value] of Object.entries(localValues)) {
      onFormValueChange(key, value);
    }

    toast.success(t("manualForm.formSaved"), {
      description: t("manualForm.formSavedDescription"),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">{t("manualForm.title")}</h2>
        <p className="text-gray-600">{t("manualForm.description")}</p>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="flex items-center">
                {field.label[language as "en" | "es"]}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === "checkbox" ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={localValues[field.name] === "true"}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(field, checked as boolean)
                    }
                  />
                  <label htmlFor={field.name} className="text-sm text-gray-600">
                    {field.placeholder?.[language as "en" | "es"] ||
                      field.label[language as "en" | "es"]}
                  </label>
                </div>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder?.[language as "en" | "es"]}
                  value={localValues[field.name] || ""}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  required={field.required}
                  className={
                    validationErrors[field.name] ? "border-red-500" : ""
                  }
                />
              )}

              {validationErrors[field.name] && (
                <p className="text-red-500 text-sm">
                  {t("manualForm.fieldRequired")}
                </p>
              )}
            </div>
          ))}

          <Button type="button" className="w-full mt-4" onClick={handleSave}>
            {t("manualForm.saveButton")}
          </Button>
        </form>
      </ScrollArea>
    </div>
  );
};

export default ManualForm;
