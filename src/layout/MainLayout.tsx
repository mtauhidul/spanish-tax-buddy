// src/components/layout/MainLayout.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import {
  FolderClosed,
  LanguagesIcon,
  LayoutDashboard,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  UserCircle,
} from "lucide-react";
import { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                SpanishTaxBuddy
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {currentUser && (
                <Link to="/dashboard">
                  <Button
                    variant={isActivePath("/dashboard") ? "default" : "ghost"}
                  >
                    {t("nav.dashboard")}
                  </Button>
                </Link>
              )}

              {currentUser && isAdmin && (
                <Link to="/admin">
                  <Button
                    variant={isActivePath("/admin") ? "default" : "ghost"}
                  >
                    {t("nav.admin")}
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <LanguagesIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={toggleLanguage}>
                    {language === "en" ? "Español" : "English"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserCircle className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost">{t("nav.login")}</Button>
                  </Link>
                  <Link to="/register">
                    <Button>{t("nav.register")}</Button>
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full py-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold">SpanishTaxBuddy</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <FolderClosed className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {currentUser && (
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <LayoutDashboard className="mr-2 h-5 w-5" />
                          {t("nav.dashboard")}
                        </Button>
                      </Link>
                    )}

                    {currentUser && isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <SettingsIcon className="mr-2 h-5 w-5" />
                          {t("nav.admin")}
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={toggleLanguage}
                    >
                      <LanguagesIcon className="mr-2 h-5 w-5" />
                      {language === "en" ? "Español" : "English"}
                    </Button>

                    {currentUser ? (
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleLogout}
                      >
                        <LogOutIcon className="mr-2 h-5 w-5" />
                        {t("nav.logout")}
                      </Button>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            {t("nav.login")}
                          </Button>
                        </Link>
                        <Link to="/register" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">
                            {t("nav.register")}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                &copy; {new Date().getFullYear()} SpanishTaxBuddy.{" "}
                {t("footer.rights")}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/privacy"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                to="/terms"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                {t("footer.terms")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
