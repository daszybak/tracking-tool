import "primereact/resources/primereact.min.css";
import "./global.css";
import { Nunito_Sans } from "next/font/google";
import AuthContext from "../contexts/AuthContext";
import RouteCheck from "../components/RouteCheck/RouteCheck";
import Navbar from "../components/Navbar/Navbar";
import styles from "./root.module.css";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";

const nunitoSans = Nunito_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Tracking Tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={nunitoSans.className}>
        <ErrorBoundary>
          <AuthContext>
            <Navbar />
            <RouteCheck>
              <div className={styles["container"]}>{children}</div>
            </RouteCheck>
          </AuthContext>
        </ErrorBoundary>
      </body>
    </html>
  );
}
