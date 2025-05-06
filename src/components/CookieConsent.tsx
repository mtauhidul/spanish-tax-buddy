// src/components/CookieConsent.tsx
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookieConsent") === "true";

    if (!hasConsented) {
      // Show cookie banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:p-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="md:flex-1">
          <h3 className="font-bold text-lg mb-1">{t("cookies.title")}</h3>
          <p className="text-gray-600 text-sm">
            {t("cookies.description")}{" "}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              {t("cookies.privacy")}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsVisible(false)}>
            {t("cookies.decline")}
          </Button>
          <Button onClick={handleAccept}>{t("cookies.accept")}</Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
