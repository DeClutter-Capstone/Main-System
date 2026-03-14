import NavBar from "./NavBar";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div style={styles.container} className="layout-container">
      <style>{`
        [data-theme="dark"] .layout-container {
          background-color: #252525ff !important;
        }
      `}</style>
      <NavBar />
      <main style={styles.mainContent}>{children}</main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5ff",
  } as React.CSSProperties,
  mainContent: {
    flex: 1,
    marginTop: "0",
  } as React.CSSProperties,
};

export default Layout;
