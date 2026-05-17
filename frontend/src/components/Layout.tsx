import NavBar from "./NavBar";
import Footer from "./Footer";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div style={styles.container}>
      <NavBar />
      <main style={styles.mainContent}>{children}</main>
      <Footer />
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
