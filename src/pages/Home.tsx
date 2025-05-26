// src/pages/Home.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import MainLayout from "@/layout/MainLayout";
import {
  MdChat,
  MdEditDocument,
  MdFileUpload,
  MdSecurity,
} from "react-icons/md";
import { Link } from "react-router-dom";

const Home = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2C3E50] to-[#1a252f] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("home.title")}
            </h1>
            <p className="text-lg md:text-xl mb-8">{t("home.subtitle")}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {currentUser ? (
                <Link to="/dashboard">
                  <Button className="w-full sm:w-auto" size="lg">
                    {t("home.getStarted")}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button className="w-full sm:w-auto" size="lg">
                      {t("home.createAccount")}
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto bg-white/10 hover:bg-white/20"
                      size="lg"
                    >
                      {t("home.login")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#F5F7FA]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.features")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center bg-[#F1C40F]/20 rounded-full w-12 h-12 mb-4">
                  <MdChat className="h-6 w-6 text-[#2C3E50]" />
                </div>
                <CardTitle>{t("home.featureAI")}</CardTitle>
                <CardDescription>{t("home.featureAIDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#7F8CD5]">{t("home.featureAIDetail")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center bg-[#27AE60]/20 rounded-full w-12 h-12 mb-4">
                  <MdEditDocument className="h-6 w-6 text-[#27AE60]" />
                </div>
                <CardTitle>{t("home.featureManual")}</CardTitle>
                <CardDescription>{t("home.featureManualDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#7F8CD5]">
                  {t("home.featureManualDetail")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center bg-[#2C3E50]/20 rounded-full w-12 h-12 mb-4">
                  <MdFileUpload className="h-6 w-6 text-[#2C3E50]" />
                </div>
                <CardTitle>{t("home.featureOCR")}</CardTitle>
                <CardDescription>{t("home.featureOCRDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#7F8CD5]">{t("home.featureOCRDetail")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.howItWorks")}
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Steps with connecting line */}
              <div className="hidden md:block absolute left-[15px] top-0 bottom-0 w-0.5 bg-[#7F8CD5] z-0"></div>

              {/* Step 1 */}
              <div className="flex mb-8 md:mb-12 relative z-10">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#2C3E50] text-white font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("home.step1")}</h3>
                  <p className="text-[#7F8CD5]">{t("home.step1Desc")}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex mb-8 md:mb-12 relative z-10">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#2C3E50] text-white font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("home.step2")}</h3>
                  <p className="text-[#7F8CD5]">{t("home.step2Desc")}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex mb-8 md:mb-12 relative z-10">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#2C3E50] text-white font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("home.step3")}</h3>
                  <p className="text-[#7F8CD5]">{t("home.step3Desc")}</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex relative z-10">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#2C3E50] text-white font-bold mr-4">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("home.step4")}</h3>
                  <p className="text-[#7F8CD5]">{t("home.step4Desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#F5F7FA]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t("home.ready")}</h2>
            <p className="text-lg text-[#7F8CD5] mb-8">{t("home.readyDesc")}</p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {currentUser ? (
                <Link to="/dashboard">
                  <Button className="w-full sm:w-auto" size="lg">
                    {t("home.goToDashboard")}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button className="w-full sm:w-auto" size="lg">
                      {t("home.startNow")}
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      size="lg"
                    >
                      {t("home.login")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <div className="flex items-center justify-center bg-[#2C3E50]/20 rounded-full w-16 h-16 mb-6">
                <MdSecurity className="h-8 w-8 text-[#2C3E50]" />
              </div>
              <h2 className="text-3xl font-bold mb-4">{t("home.secure")}</h2>
              <p className="text-[#7F8CD5] mb-6">{t("home.secureDesc")}</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#27AE60] mr-2">✓</span>
                  <span>{t("home.secureBullet1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#27AE60] mr-2">✓</span>
                  <span>{t("home.secureBullet2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#27AE60] mr-2">✓</span>
                  <span>{t("home.secureBullet3")}</span>
                </li>
              </ul>
            </div>

            <div className="md:w-1/2">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-center">
                  {t("home.whyChoose")}
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#2C3E50] text-white text-xs font-bold mr-3 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">{t("home.reason1")}</h4>
                      <p className="text-sm text-[#7F8CD5]">
                        {t("home.reason1Desc")}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#2C3E50] text-white text-xs font-bold mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">{t("home.reason2")}</h4>
                      <p className="text-sm text-[#7F8CD5]">
                        {t("home.reason2Desc")}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#2C3E50] text-white text-xs font-bold mr-3 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">{t("home.reason3")}</h4>
                      <p className="text-sm text-[#7F8CD5]">
                        {t("home.reason3Desc")}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
