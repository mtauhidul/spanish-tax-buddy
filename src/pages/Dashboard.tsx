// src/pages/Dashboard.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";
import MainLayout from "@/layout/MainLayout";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface TaxForm {
  id: string;
  name: string;
  description: string;
  year: number;
  type: string;
  thumbnail?: string;
}

const Dashboard = () => {
  const [forms, setForms] = useState<TaxForm[]>([]);
  const [loading, setLoading] = useState(true);
  // const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const formsSnapshot = await getDocs(collection(db, "forms"));
        const formsList: TaxForm[] = [];

        formsSnapshot.forEach((doc) => {
          const formData = doc.data() as Omit<TaxForm, "id">;
          formsList.push({
            id: doc.id,
            ...formData,
          });
        });

        setForms(formsList);
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleFormSelect = (formId: string) => {
    navigate(`/form/${formId}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">{t("dashboard.title")}</h1>
        <p className="text-gray-600 mb-8">{t("dashboard.subtitle")}</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{form.name}</CardTitle>
                  <CardDescription>
                    {language === "es" ? "Año: " : "Year: "}
                    {form.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{form.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleFormSelect(form.id)}
                  >
                    {t("dashboard.selectForm")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">
              {t("dashboard.noForms")}
            </h3>
            <p className="text-gray-500 mb-6">{t("dashboard.checkLater")}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
