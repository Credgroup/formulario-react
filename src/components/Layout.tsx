import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout() {
  return (
    <div className="relative flex w-screen h-screen items-center justify-center flex-col">
      <Header />
      <div className="w-full h-full">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
