// src/pages/TermsOfUse.tsx

import { useLanguage } from "@/hooks/useLanguage";
import MainLayout from "@/layout/MainLayout";

const TermsOfUse = () => {
  const { language } = useLanguage();

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">
          {language === "es" ? "Términos de Uso" : "Terms of Use"}
        </h1>

        <div className="prose max-w-none">
          {language === "es" ? (
            <>
              <p>Última actualización: Mayo 2025</p>

              <h2>1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar Spanish Tax Buddy ("la aplicación"),
                aceptas estar legalmente vinculado por estos Términos de Uso. Si
                no estás de acuerdo con estos términos, no debes utilizar la
                aplicación.
              </p>

              <h2>2. Descripción del Servicio</h2>
              <p>
                Spanish Tax Buddy es una aplicación web diseñada para ayudar a
                los residentes españoles a rellenar formularios fiscales. La
                aplicación proporciona asistencia a través de un chat
                interactivo con IA, entrada manual o subida de PDF para
                extracción de datos mediante OCR.
              </p>

              <h2>3. Registro de Cuenta</h2>
              <p>
                Para utilizar la aplicación, debes crear una cuenta
                proporcionando información precisa y completa. Eres responsable
                de mantener la confidencialidad de tu contraseña y de todas las
                actividades que ocurran bajo tu cuenta.
              </p>

              <h2>4. Limitación de Responsabilidad</h2>
              <p>
                La aplicación se proporciona "tal cual" y "según disponibilidad"
                sin garantías de ningún tipo. No garantizamos que la aplicación
                esté libre de errores o que funcione sin interrupciones. No
                somos responsables de errores en la información fiscal o
                resultados incorrectos.
              </p>

              <h2>5. No Asesoramiento Profesional</h2>
              <p>
                Spanish Tax Buddy no proporciona asesoramiento fiscal
                profesional. La aplicación es solo una herramienta para ayudar
                con el proceso de rellenar formularios. Para asesoramiento
                fiscal profesional, consulta a un asesor fiscal cualificado.
              </p>

              <h2>6. Propiedad Intelectual</h2>
              <p>
                Todos los derechos de propiedad intelectual relacionados con la
                aplicación son propiedad de Spanish Tax Buddy o sus
                licenciantes. No se otorga ningún derecho o licencia para
                utilizar ninguna propiedad intelectual sin nuestro
                consentimiento previo por escrito.
              </p>

              <h2>7. Terminación</h2>
              <p>
                Podemos terminar o suspender tu acceso a la aplicación
                inmediatamente, sin previo aviso o responsabilidad, por
                cualquier razón, incluyendo, sin limitación, si incumples estos
                Términos de Uso.
              </p>

              <h2>8. Cambios en los Términos</h2>
              <p>
                Nos reservamos el derecho, a nuestra sola discreción, de
                modificar o reemplazar estos términos en cualquier momento. Es
                tu responsabilidad revisar estos términos periódicamente para
                conocer los cambios.
              </p>

              <h2>9. Ley Aplicable</h2>
              <p>
                Estos términos se regirán e interpretarán de acuerdo con las
                leyes de España, sin tener en cuenta sus disposiciones sobre
                conflictos de leyes.
              </p>

              <h2>10. Contacto</h2>
              <p>
                Si tienes alguna pregunta sobre estos Términos de Uso,
                contáctanos en: terms@spanishtaxbuddy.com
              </p>
            </>
          ) : (
            <>
              <p>Last updated: May 2025</p>

              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using Spanish Tax Buddy ("the application"),
                you agree to be legally bound by these Terms of Use. If you do
                not agree to these terms, you should not use the application.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                Spanish Tax Buddy is a web application designed to help Spanish
                residents fill out tax forms. The application provides
                assistance through an interactive AI chat, manual entry, or PDF
                upload for data extraction using OCR.
              </p>

              <h2>3. Account Registration</h2>
              <p>
                To use the application, you must create an account by providing
                accurate and complete information. You are responsible for
                maintaining the confidentiality of your password and for all
                activities that occur under your account.
              </p>

              <h2>4. Limitation of Liability</h2>
              <p>
                The application is provided "as is" and "as available" without
                warranties of any kind. We do not guarantee that the application
                will be error-free or operate without interruptions. We are not
                responsible for errors in tax information or incorrect results.
              </p>

              <h2>5. No Professional Advice</h2>
              <p>
                Spanish Tax Buddy does not provide professional tax advice. The
                application is only a tool to help with the process of filling
                out forms. For professional tax advice, consult a qualified tax
                advisor.
              </p>

              <h2>6. Intellectual Property</h2>
              <p>
                All intellectual property rights relating to the application are
                owned by Spanish Tax Buddy or its licensors. No right or license
                is granted to use any intellectual property without our prior
                written consent.
              </p>

              <h2>7. Termination</h2>
              <p>
                We may terminate or suspend your access to the application
                immediately, without prior notice or liability, for any reason
                whatsoever, including, without limitation, if you breach these
                Terms of Use.
              </p>

              <h2>8. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or
                replace these terms at any time. It is your responsibility to
                review these terms periodically for changes.
              </p>

              <h2>9. Governing Law</h2>
              <p>
                These terms shall be governed and construed in accordance with
                the laws of Spain, without regard to its conflict of law
                provisions.
              </p>

              <h2>10. Contact</h2>
              <p>
                If you have any questions about these Terms of Use, please
                contact us at: terms@spanishtaxbuddy.com
              </p>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfUse;
