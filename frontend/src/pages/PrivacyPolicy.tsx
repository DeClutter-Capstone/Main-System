import type { CSSProperties } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

function PrivacyPolicy() {
  const s: Record<string, CSSProperties> = {
    page: {
      display: "flex", flexDirection: "column", minHeight: "100vh",
      backgroundColor: "var(--color-bg-base)", transition: "background-color 0.3s ease",
      fontFamily: "'Alata', sans-serif",
    },
    badge: {
      display: "inline-block", padding: "4px 14px", borderRadius: "999px",
      background: "var(--color-brand-soft)", color: "var(--color-brand-primary)",
      fontSize: "0.78rem", fontWeight: 600, letterSpacing: "1.5px",
      textTransform: "uppercase", marginBottom: "16px",
    },
    heroTitle: {
      fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15,
      color: "var(--color-text-primary)", margin: "0 0 16px",
    },
    heroSub: {
      fontSize: "1.05rem", lineHeight: 1.7, margin: "0 0 8px",
      color: "var(--color-text-secondary)",
    },
    main: { flex: 1, padding: "70px 24px", background: "var(--color-bg-base)" },
    card: {
      maxWidth: "1080px", margin: "0 auto",
    },
    updated: { fontSize: "0.85rem", color: "var(--color-text-secondary)", margin: "0 0 32px" },
    sectionTitle: {
      fontSize: "1.3rem", fontWeight: 800, color: "var(--color-text-primary)",
      margin: "32px 0 12px",
    },
    paragraph: {
      fontSize: "0.95rem", lineHeight: 1.8, color: "var(--color-text-secondary)", margin: "0 0 12px",
    },
    list: {
      fontSize: "0.95rem", lineHeight: 1.8, color: "var(--color-text-secondary)",
      margin: "0 0 12px", paddingLeft: "20px",
    },
  };

  const sections = [
    {
      title: "1. Information We Collect",
      body: (
        <>
          <p style={s.paragraph}>
            When you use DeClutter, we collect the following information to provide our AI-powered
            interior design service:
          </p>
          <ul style={s.list}>
            <li>Account details such as your name and email address when you sign up.</li>
            <li>Room photos you upload to be transformed by our AI model.</li>
            <li>The styles and room types you select for each transformation.</li>
            <li>Generated images and the history of your transformations.</li>
          </ul>
        </>
      ),
    },
    {
      title: "2. How We Use Your Information",
      body: (
        <>
          <p style={s.paragraph}>
            We use the information we collect to operate and improve DeClutter, including:
          </p>
          <ul style={s.list}>
            <li>Processing your uploaded photos through the Replicate AI model to generate redesigns.</li>
            <li>Saving your transformation history so you can revisit past results.</li>
            <li>Authenticating your account and keeping it secure.</li>
            <li>Improving the quality and accuracy of our design transformations.</li>
          </ul>
        </>
      ),
    },
    {
      title: "3. Image Processing",
      body: (
        <p style={s.paragraph}>
          Room photos you upload are sent to our backend and forwarded to the Replicate API to
          generate your redesigned image. We only process your images to deliver the transformation
          you requested. We do not sell your photos or use them for purposes other than providing
          this service.
        </p>
      ),
    },
    {
      title: "4. Data Storage & Security",
      body: (
        <p style={s.paragraph}>
          Your account information and transformation records are stored securely. We use
          industry-standard authentication (Firebase) and take reasonable measures to protect your
          data from unauthorized access. No method of transmission or storage is completely secure,
          but we work to safeguard your information.
        </p>
      ),
    },
    {
      title: "5. Third-Party Services",
      body: (
        <>
          <p style={s.paragraph}>
            DeClutter relies on trusted third-party providers to deliver its features:
          </p>
          <ul style={s.list}>
            <li><strong>Firebase</strong> — authentication and storage.</li>
            <li><strong>Replicate</strong> — AI image transformation.</li>
          </ul>
          <p style={s.paragraph}>
            These providers process data in accordance with their own privacy policies.
          </p>
        </>
      ),
    },
    {
      title: "6. Your Rights",
      body: (
        <p style={s.paragraph}>
          You may access, update, or delete your account and associated data at any time. If you
          would like to remove your data or have questions about how it is handled, please reach out
          to us through our contact page.
        </p>
      ),
    },
    {
      title: "7. Changes to This Policy",
      body: (
        <p style={s.paragraph}>
          We may update this Privacy Policy from time to time. Any changes will be posted on this
          page with an updated revision date. We encourage you to review this policy periodically.
        </p>
      ),
    },
    {
      title: "8. Contact Us",
      body: (
        <p style={s.paragraph}>
          If you have any questions about this Privacy Policy or how we handle your data, please
          visit our Contact page or email us at hello@declutter.app.
        </p>
      ),
    },
  ];

  return (
    <div style={s.page}>
      <style>{`
        @media (max-width: 768px) {
          .pp-title { font-size: 2rem !important; }
        }
      `}</style>

      <TopBar showSignIn={true} />

      {/* Main */}
      <section style={s.main}>
        <div style={s.card} className="pp-card">
          <h1 style={s.heroTitle} className="pp-title">Privacy Policy</h1>
          <p style={s.heroSub}>
            Your privacy matters to us. This policy explains what data we collect and how we use it
            to power your DeClutter experience.
          </p>
          <p style={s.updated}>Last updated: June 6, 2026</p>
          {sections.map(({ title, body }) => (
            <div key={title}>
              <h2 style={s.sectionTitle}>{title}</h2>
              {body}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
