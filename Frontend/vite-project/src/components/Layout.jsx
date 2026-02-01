import Footer from "./Footer";
import Navbar from "./Navbar";
import { Outlet, ScrollRestoration } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollRestoration />           {/* ← Add this line */}

      <Navbar />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;