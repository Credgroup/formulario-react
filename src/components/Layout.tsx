import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-1 w-full flex-col justify-start items-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
