// src/pages/PrivacyPolicy.tsx

import { useLanguage } from "@/hooks/useLanguage";
import MainLayout from "@/layout/MainLayout";

const PrivacyPolicy = () => {
  const { language } = useLanguage();

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">
          {language === "es" ? "Política de Privacidad" : "Privacy Policy"}
        </h1>

        <div className="prose max-w-none">
          {language === "es" ? (
            <>
              <p>Última actualización: Mayo 2025</p>

              <h2>1. Introducción</h2>
              <p>
                Spanish Tax Buddy ("nosotros", "nuestro", o "nos") respeta tu
                privacidad y se compromete a proteger tus datos personales. Esta
                política de privacidad te informará sobre cómo cuidamos tus
                datos personales cuando utilizas nuestra aplicación web y te
                informará sobre tus derechos de privacidad y cómo la ley te
                protege.
              </p>

              <h2>2. Datos que Recopilamos</h2>
              <p>
                Podemos recopilar, usar, almacenar y transferir diferentes tipos
                de datos personales sobre ti, que hemos agrupado de la siguiente
                manera:
              </p>
              <ul>
                <li>
                  <strong>Datos de Identidad</strong>: incluye nombre,
                  apellidos, nombre de usuario o identificador similar.
                </li>
                <li>
                  <strong>Datos de Contacto</strong>: incluye dirección de
                  correo electrónico.
                </li>
                <li>
                  <strong>Datos Fiscales</strong>: incluye información
                  proporcionada para completar formularios fiscales.
                </li>
                <li>
                  <strong>Datos de Perfil</strong>: incluye tu nombre de usuario
                  y contraseña, y preferencias.
                </li>
                <li>
                  <strong>Datos de Uso</strong>: incluye información sobre cómo
                  utilizas nuestra aplicación web.
                </li>
              </ul>

              <h2>3. Cómo Utilizamos tus Datos</h2>
              <p>
                Utilizaremos tus datos personales solo cuando la ley nos lo
                permita. Más comúnmente, utilizaremos tus datos personales en
                las siguientes circunstancias:
              </p>
              <ul>
                <li>Para registrarte como usuario.</li>
                <li>
                  Para proporcionarte nuestros servicios de asistencia fiscal.
                </li>
                <li>Para gestionar nuestra relación contigo.</li>
                <li>Para mejorar nuestra aplicación y servicio al cliente.</li>
              </ul>

              <h2>4. Tus Derechos</h2>
              <p>
                Bajo el RGPD, tienes derechos específicos en relación con tus
                datos personales. Estos incluyen el derecho a:
              </p>
              <ul>
                <li>Solicitar acceso a tus datos personales.</li>
                <li>Solicitar la corrección de tus datos personales.</li>
                <li>Solicitar la eliminación de tus datos personales.</li>
                <li>Oponerte al procesamiento de tus datos personales.</li>
                <li>
                  Solicitar la restricción del procesamiento de tus datos
                  personales.
                </li>
                <li>Solicitar la transferencia de tus datos personales.</li>
                <li>Retirar el consentimiento en cualquier momento.</li>
              </ul>

              <h2>5. Seguridad de Datos</h2>
              <p>
                Hemos implementado medidas de seguridad apropiadas para prevenir
                que tus datos personales se pierdan, utilicen o accedan
                accidentalmente de manera no autorizada, se modifiquen o
                divulguen.
              </p>

              <h2>6. Contacto</h2>
              <p>
                Si tienes alguna pregunta sobre esta política de privacidad o
                nuestras prácticas de privacidad, contáctanos en:
                privacy@ImpuestIA.com
              </p>
            </>
          ) : (
            <>
              <p>Last updated: May 2025</p>

              <h2>1. Introduction</h2>
              <p>
                Spanish Tax Buddy ("we", "our", or "us") respects your privacy
                and is committed to protecting your personal data. This privacy
                policy will inform you about how we look after your personal
                data when you use our web application and tell you about your
                privacy rights and how the law protects you.
              </p>

              <h2>2. Data We Collect</h2>
              <p>
                We may collect, use, store and transfer different kinds of
                personal data about you which we have grouped as follows:
              </p>
              <ul>
                <li>
                  <strong>Identity Data</strong>: includes first name, last
                  name, username or similar identifier.
                </li>
                <li>
                  <strong>Contact Data</strong>: includes email address.
                </li>
                <li>
                  <strong>Tax Data</strong>: includes information provided to
                  complete tax forms.
                </li>
                <li>
                  <strong>Profile Data</strong>: includes your username and
                  password, and preferences.
                </li>
                <li>
                  <strong>Usage Data</strong>: includes information about how
                  you use our web application.
                </li>
              </ul>

              <h2>3. How We Use Your Data</h2>
              <p>
                We will only use your personal data when the law allows us to.
                Most commonly, we will use your personal data in the following
                circumstances:
              </p>
              <ul>
                <li>To register you as a user.</li>
                <li>To provide you with our tax assistance services.</li>
                <li>To manage our relationship with you.</li>
                <li>To improve our application and customer service.</li>
              </ul>

              <h2>4. Your Rights</h2>
              <p>
                Under the GDPR, you have specific rights in relation to your
                personal data. These include the right to:
              </p>
              <ul>
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
                <li>Request restriction of processing your personal data.</li>
                <li>Request transfer of your personal data.</li>
                <li>Withdraw consent at any time.</li>
              </ul>

              <h2>5. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent
                your personal data from being accidentally lost, used or
                accessed in an unauthorized way, altered or disclosed.
              </p>

              <h2>6. Contact</h2>
              <p>
                If you have any questions about this privacy policy or our
                privacy practices, please contact us at: privacy@ImpuestIA.com
              </p>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;
