// src/utils/pdfUtils.ts
import { PDFDocument } from "pdf-lib";

export interface FormField {
  name: string;
  type: string;
  label?: string;
  originalText?: string;
  required?: boolean;
  options?: string[];
  hints?: string;
  index: number;
}

/**
 * Extract field information and content from a PDF
 */
export const extractPDFFields = async (
  pdfBytes: ArrayBuffer | Uint8Array
): Promise<{
  fields: FormField[];
  extractedData: Record<string, string>;
  pdfText: string;
}> => {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const pdfFields = form.getFields();
    const fieldNameMap = new Map<string, FormField>();
    const extractedData: Record<string, string> = {};

    // Process fields sequentially (maintain document order)
    const fields: FormField[] = [];

    for (let i = 0; i < pdfFields.length; i++) {
      const field = pdfFields[i];
      const fieldName = field.getName();
      let fieldType = "text";
      let fieldValue = "";
      let fieldOptions: string[] = [];

      try {
        // Determine field type and extract value
        if (field.constructor.name === "PDFTextField") {
          fieldType = "text";
          const textField = form.getTextField(fieldName);
          fieldValue = textField.getText() || "";
          if (fieldValue) extractedData[fieldName] = fieldValue;
        } else if (field.constructor.name === "PDFCheckBox") {
          fieldType = "checkbox";
          const checkBox = form.getCheckBox(fieldName);
          fieldValue = checkBox.isChecked() ? "true" : "false";
          extractedData[fieldName] = fieldValue;
        } else if (field.constructor.name === "PDFRadioGroup") {
          fieldType = "radio";
          const radioGroup = form.getRadioGroup(fieldName);
          fieldValue = radioGroup.getSelected() || "";
          fieldOptions = radioGroup.getOptions();
          if (fieldValue) extractedData[fieldName] = fieldValue;
        } else if (field.constructor.name === "PDFDropdown") {
          fieldType = "dropdown";
          const dropdown = form.getDropdown(fieldName);
          fieldValue = dropdown.getSelected()[0] || "";
          fieldOptions = dropdown.getOptions();
          if (fieldValue) extractedData[fieldName] = fieldValue;
        } else if (field.constructor.name === "PDFOptionList") {
          fieldType = "list";
          const optionList = form.getOptionList(fieldName);
          fieldValue = optionList.getSelected().join(", ") || "";
          fieldOptions = optionList.getOptions();
          if (fieldValue) extractedData[fieldName] = fieldValue;
        }
      } catch (error) {
        console.warn(`Error extracting value for field ${fieldName}:`, error);
      }

      // Convert field name to readable label and detect if it's required
      const formField: FormField = {
        name: fieldName,
        type: fieldType,
        label: getReadableLabel(fieldName),
        originalText: `Field context for ${fieldName}`, // In a real implementation, extract text near the field
        options: fieldOptions,
        // Check if field name contains indicators like "required" or "*"
        required:
          fieldName.toLowerCase().includes("required") ||
          fieldName.includes("*") ||
          // Heuristic: many required fields have simple, short names
          (fieldName.length < 15 && !fieldName.includes("optional")),
        index: i,
      };

      fields.push(formField);
      fieldNameMap.set(fieldName, formField);
    }

    // In a real implementation, we would extract the full PDF text here
    // For this implementation, we'll simulate it
    const pdfText = simulatePdfTextFromFields(fields);

    return {
      fields,
      extractedData,
      pdfText,
    };
  } catch (error) {
    console.error("Error extracting PDF fields:", error);
    return {
      fields: [],
      extractedData: {},
      pdfText: "",
    };
  }
};

/**
 * Convert field names to readable labels
 */
export const getReadableLabel = (fieldName: string): string => {
  return fieldName
    .replace(/([A-Z])/g, " $1") // Insert space before capital letters
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\./g, " ") // Replace dots with spaces
    .replace(/\d+/g, " $& ") // Add space around numbers
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
};

/**
 * Find context around a specific field in the PDF text
 */
export const findFieldContext = (pdfText: string, field: FormField): string => {
  // In a real implementation, we would search the extracted text
  // For this implementation, we'll return placeholder text
  const contexts = [
    "This information is required by tax authorities.",
    "Please use the format specified in the instructions.",
    "Enter your official registered name as it appears on your ID.",
    "You can find this number on your tax card.",
    "If you're unsure, refer to your previous year's tax return.",
    "This information will be used for verification purposes only.",
    "For non-residents, special rules may apply.",
    "Enter the total amount without cents.",
    "Include all income sources for the fiscal year.",
  ];

  // Return a consistent context based on field name to simulate real extraction
  const hash = field.name.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return contexts[hash % contexts.length];
};

/**
 * Simulate extracting text from a PDF based on field information
 */
function simulatePdfTextFromFields(fields: FormField[]): string {
  // In a real implementation, we would use a PDF text extraction library
  // For this implementation, we'll generate plausible text based on fields
  let text = "OFFICIAL TAX FORM\n\n";

  fields.forEach((field) => {
    const label = field.label || getReadableLabel(field.name);

    // Add more context based on field type
    if (field.type === "checkbox") {
      text += `☐ ${label} ${field.required ? "*" : ""}\n`;
      text += `Please check this box if applicable.\n\n`;
    } else if (
      field.type === "radio" ||
      field.type === "dropdown" ||
      field.type === "list"
    ) {
      text += `${label} ${field.required ? "*" : ""}\n`;
      text += `Select one of the following options: ${field.options?.join(
        ", "
      )}\n\n`;
    } else {
      text += `${label} ${field.required ? "*" : ""}\n`;
      text += `Enter your ${label.toLowerCase()} in the space provided.\n\n`;
    }
  });

  text += "\n* Required fields\n";
  text += "Please ensure all information provided is accurate and complete.";

  return text;
}
