import { Route, Routes } from "react-router-dom";
import GetParamsPage from "./pages/GetParamsPage";
import WelcomePage from "./pages/WelcomePage";
import PublicLayout from "./components/Layout";
import { PrivateRoute } from "./components/PrivateRoute";
import FormsPage from "./pages/FormsPage";
import FormsSuccessPage from "./pages/FormsSuccessPage";

// Risk Inspection components
import InspectionGetParamsPage from "./pages/InspectionGetParamsPage";
import InspectionWelcomePage from "./pages/InspectionWelcomePage";
import InspectionFormsPage from "./pages/InspectionFormsPage";
import InspectionSuccessPage from "./pages/InspectionSuccessPage";
import InspectionPrivateRoute from "./components/InspectionPrivateRoute";
import RecommendationPrivateRoute from "./components/RecommendationPrivateRoute";

// Recommendation components
import RecommendationGetParamsPage from "./pages/RecommendationGetParamsPage";
import RecommendationWelcomePage from "./pages/RecommendationWelcomePage";
import RecommendationFormsPage from "./pages/RecommendationFormsPage/";
import RecommendationSuccessPage from "./pages/RecommendationSuccessPage";
function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<GetParamsPage />} />
      <Route path="/risk/inspection" element={<InspectionGetParamsPage />} />
      <Route path="/risk/recom/add" element={<RecommendationGetParamsPage />} />

      {/* proposal routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/forms/success" element={<FormsSuccessPage />} />
        </Route>
      </Route>

      {/* inspection routes */}
      <Route element={<InspectionPrivateRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/risk/inspection/welcome" element={<InspectionWelcomePage />} />
          <Route path="/risk/inspection/forms" element={<InspectionFormsPage />} />
          <Route path="/risk/inspection/success" element={<InspectionSuccessPage />} />
        </Route>
      </Route>

      {/* recommendation routes */}
      <Route element={<RecommendationPrivateRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/risk/recom/welcome" element={<RecommendationWelcomePage />} />
          <Route path="/risk/recom/forms" element={<RecommendationFormsPage />} />
          <Route path="/risk/recom/success" element={<RecommendationSuccessPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="/*" element={<h1>NOT FOUND</h1>} />
      <Route path="/notfound" element={<h1>NOT FOUND</h1>} />
    </Routes>
  );
}

export default App;
