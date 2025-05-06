// src/features/pdf/PDFPreview.tsx
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Download, Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useEffect, useState } from "react";

interface PDFPreviewProps {
  pdfBytes: Uint8Array;
  formValues: Record<string, string>;
  formData: {
    id: string;
    name: string;
  };
}

const PDFPreview = ({ pdfBytes, formValues, formData }: PDFPreviewProps) => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [filledPdfBytes, setFilledPdfBytes] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Fill PDF with form values
  useEffect(() => {
    const fillPdf = async () => {
      try {
        setLoading(true);

        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Get form fields
        const form = pdfDoc.getForm();

        // Fill form fields with values
        Object.entries(formValues).forEach(([fieldName, value]) => {
          try {
            if (value) {
              const field = form.getTextField(fieldName);
              if (field) {
                field.setText(value);
              }
            }
          } catch (error) {
            // Field might not exist or might be of a different type
            console.warn(`Could not fill field ${fieldName}:`, error);
          }
        });

        // Flatten form fields to prevent further editing (optional)
        // form.flatten();

        // Save the filled PDF
        const filledPdfBytes = await pdfDoc.save();
        setFilledPdfBytes(filledPdfBytes);

        // Create a data URL for preview
        const blob = new Blob([filledPdfBytes], { type: "application/pdf" });
        const dataUrl = URL.createObjectURL(blob);
        setPdfDataUrl(dataUrl);
      } catch (error) {
        console.error("Error filling PDF:", error);
      } finally {
        setLoading(false);
      }
    };

    if (pdfBytes && Object.keys(formValues).length > 0) {
      fillPdf();
    } else if (pdfBytes) {
      // Just display the original PDF if no form values
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);
      setPdfDataUrl(dataUrl);
      setLoading(false);
    }

    return () => {
      // Clean up data URL when component unmounts
      if (pdfDataUrl) {
        URL.revokeObjectURL(pdfDataUrl);
      }
    };
  }, [pdfBytes, formValues]);

  const handleDownload = () => {
    if (!filledPdfBytes) return;

    const blob = new Blob([filledPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.name.replace(/\s+/g, "_")}_filled.pdf`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[600px] border rounded-lg bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>{t("pdfPreview.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={handleDownload}
          disabled={!filledPdfBytes}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("pdfPreview.download")}
        </Button>
      </div>

      {pdfDataUrl ? (
        <iframe
          src={`${pdfDataUrl}#view=FitH`}
          title="PDF Preview"
          className="w-full flex-grow border rounded-lg"
        />
      ) : (
        <div className="flex justify-center items-center h-full border rounded-lg bg-gray-50">
          <p>{t("pdfPreview.noPreview")}</p>
        </div>
      )}
    </div>
  );
};

export default PDFPreview;
