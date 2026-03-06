import NavBar from "./NavBar";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div style={styles.container}>
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
  } as React.CSSProperties,
  mainContent: {
    flex: 1,
    marginTop: "0",
  } as React.CSSProperties,
};

export default Layout;
