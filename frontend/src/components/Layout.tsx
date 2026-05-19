import NavBar from "./NavBar";
import Footer from "./Footer";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  /** Set to true on pages that shouldn't show the global footer. */
  hideFooter?: boolean;
}

function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div style={styles.container}>
      <NavBar />
      <main style={styles.mainContent}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "var(--color-bg-base)",
    color: "var(--color-text-primary)",
  } as React.CSSProperties,
  mainContent: {
    flex: 1,
    marginTop: "0",
  } as React.CSSProperties,
};

export default Layout;
