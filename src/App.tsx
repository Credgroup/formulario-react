import { Route, Routes } from "react-router-dom";
import GetParamsPage from "./pages/GetParamsPage";
import WelcomePage from "./pages/WelcomePage";
import PublicLayout from "./components/Layout";
import { PrivateRoute } from "./components/PrivateRoute";
import FormsPage from "./pages/FormsPage";

function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<GetParamsPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/forms" element={<FormsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="/*" element={<h1>NOT FOUND</h1>} />
      <Route path="/notfound" element={<h1>NOT FOUND</h1>} />
    </Routes>
  );
}

export default App;
