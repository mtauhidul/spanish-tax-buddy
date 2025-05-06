// src/features/pdf/PDFPreview.tsx
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { debounce } from "lodash";
import { Download, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useEffect, useState } from "react";

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
  const [zoomLevel, setZoomLevel] = useState<number>(1.2); // Increased default zoom
  const { t } = useLanguage();

  // Use debounce to prevent excessive PDF rendering
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFillPdf = useCallback(
    debounce(
      async (pdfBytes: Uint8Array, formValues: Record<string, string>) => {
        try {
          setLoading(true);

          // Load the PDF document
          const pdfDoc = await PDFDocument.load(pdfBytes);

          // Get form fields
          const form = pdfDoc.getForm();

          // Fill form fields with values
          Object.entries(formValues).forEach(([fieldName, value]) => {
            try {
              if (value !== undefined) {
                const field = form.getTextField(fieldName);
                if (field) {
                  // Handle checkbox values
                  if (value === "true" || value === "false") {
                    try {
                      const checkboxField = form.getCheckBox(fieldName);
                      if (checkboxField) {
                        if (value === "true") {
                          checkboxField.check();
                        } else {
                          checkboxField.uncheck();
                        }
                        return;
                      }
                    } catch {
                      // If it's not a checkbox, continue with text field
                      field.setText(value);
                    }
                  } else {
                    field.setText(value);
                  }
                }
              }
            } catch (error) {
              console.warn(`Could not fill field ${fieldName}:`, error);
            }
          });

          // Save the filled PDF
          const filledPdfBytes = await pdfDoc.save();
          setFilledPdfBytes(filledPdfBytes);

          // Create a data URL for preview
          const blob = new Blob([filledPdfBytes], { type: "application/pdf" });
          const dataUrl = URL.createObjectURL(blob);

          // Clean up old URL if exists
          if (pdfDataUrl) {
            URL.revokeObjectURL(pdfDataUrl);
          }

          setPdfDataUrl(dataUrl);
        } catch (error) {
          console.error("Error filling PDF:", error);
        } finally {
          setLoading(false);
        }
      },
      300
    ),
    []
  );

  // Fill PDF with form values
  useEffect(() => {
    if (pdfBytes) {
      if (Object.keys(formValues).length > 0) {
        debouncedFillPdf(pdfBytes, formValues);
      } else {
        // Just display the original PDF if no form values
        setLoading(true);
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const dataUrl = URL.createObjectURL(blob);

        // Clean up old URL if exists
        if (pdfDataUrl) {
          URL.revokeObjectURL(pdfDataUrl);
        }

        setPdfDataUrl(dataUrl);
        setLoading(false);
      }
    }

    return () => {
      // Clean up data URL when component unmounts
      if (pdfDataUrl) {
        URL.revokeObjectURL(pdfDataUrl);
      }
      // Cancel debounced function if it's pending
      debouncedFillPdf.cancel();
    };
  }, [pdfBytes, debouncedFillPdf]);

  // Handle changing form values with minimal re-rendering
  useEffect(() => {
    if (pdfBytes && Object.keys(formValues).length > 0) {
      debouncedFillPdf(pdfBytes, formValues);
    }
  }, [formValues, pdfBytes, debouncedFillPdf]);

  const handleDownload = () => {
    if (!filledPdfBytes && !pdfBytes) return;

    const bytesToDownload = filledPdfBytes || pdfBytes;
    const blob = new Blob([bytesToDownload], { type: "application/pdf" });
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

  const increaseZoom = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2.0)); // Max zoom 2.0
  };

  const decreaseZoom = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.6)); // Min zoom 0.6
  };

  return (
    <div className="h-[650px] flex flex-col">
      {" "}
      {/* Increased height */}
      <div className="flex justify-between mb-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={decreaseZoom}
            title={t("pdfPreview.zoomOut")}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={increaseZoom}
            title={t("pdfPreview.zoomIn")}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("pdfPreview.download")}
        </Button>
      </div>
      <div className="relative flex-grow border rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-gray-50 bg-opacity-80 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>{t("pdfPreview.loading")}</p>
            </div>
          </div>
        )}

        {pdfDataUrl ? (
          <iframe
            src={`${pdfDataUrl}#view=FitH&zoom=${zoomLevel * 100}`}
            title="PDF Preview"
            className="w-full h-full"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              height: `${100 / zoomLevel}%`,
              width: `${100 / zoomLevel}%`,
            }}
          />
        ) : (
          <div className="flex justify-center items-center h-full bg-gray-50">
            <p>{t("pdfPreview.noPreview")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;
