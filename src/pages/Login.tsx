// src/pages/Login.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowBigLeft } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(t("login.fieldsRequired"));
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        toast.error(t("login.userNotFound"));
      } else if (error.code === "auth/wrong-password") {
        toast.error(t("login.wrongPassword"));
      } else {
        toast.error(t("login.error"));
      }
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.error(t("login.popupClosed"));
      } else {
        toast.error(t("login.error"));
      }
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("login.title")}</CardTitle>
          <CardDescription>{t("login.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t("login.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? t("login.loggingIn") : t("login.submit")}
              </Button>
            </div>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                {t("login.or")}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            {t("login.googleButton")}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center">
            {t("login.noAccount")}{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-800">
              {t("login.register")}
            </Link>
          </p>
          {/* Back to home */}
          <p className="text-sm text-center">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ArrowBigLeft className="inline mr-1" /> Back to Home
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
