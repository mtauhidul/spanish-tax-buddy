// src/types/form.ts
// Create a shared type definition file for consistent form types across components

export interface FormField {
  name: string;
  label: {
    en: string;
    es: string;
  };
  type:
    | "text"
    | "number"
    | "date"
    | "checkbox"
    | "email"
    | "radio"
    | "dropdown";
  placeholder?: {
    en: string;
    es: string;
  };
  required?: boolean;
  validation?: string;
  options?: string[];
  question?: string; // Original question text from PDF
  tooltip?: string; // Additional information from PDF
}

export interface FormData {
  id: string;
  name: string;
  description: string;
  year: number;
  pdfUrl?: string;
  formFields?: Record<string, FormField>;
  aiPrompt?: string;
}

export interface PDFFieldData {
  name: string;
  type: string;
  value: string;
  question: string;
  required: boolean;
  options?: string[];
}
