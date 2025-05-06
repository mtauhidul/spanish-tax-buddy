// src/pages/NotFound.tsx
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">{t("notFound.title")}</h2>
        <p className="text-gray-600 mb-6">{t("notFound.description")}</p>
        <Link to="/">
          <Button>{t("notFound.returnHome")}</Button>
        </Link>
      </div>
    </div>
  );
};
export default NotFound;
