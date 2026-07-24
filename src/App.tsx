import { Route, Routes } from "react-router-dom";
import GetParamsPage from "./pages/GetParamsPage";
import WelcomePage from "./pages/WelcomePage";
import PublicLayout from "./components/Layout";
import { PrivateRoute } from "./components/PrivateRoute";
import FormsPage from "./pages/FormsPage";
import FormsSuccessPage from "./pages/FormsSuccessPage";

// Lead Proposal components
import LeadGetParamsPage from "./pages/LeadGetParamsPage";
import LeadWelcomePage from "./pages/LeadWelcomePage";

// Risk Inspection components
import InspectionGetParamsPage from "./pages/InspectionGetParamsPage";
import InspectionWelcomePage from "./pages/InspectionWelcomePage";
import InspectionFormsPage from "./pages/InspectionFormsPage";
import InspectionSuccessPage from "./pages/InspectionSuccessPage";
import InspectionPrivateRoute from "./components/InspectionPrivateRoute";

function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<GetParamsPage />} />
      <Route path="/risk/inspection" element={<InspectionGetParamsPage />} />

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

      {/* lead proposal routes */}
      <Route path="/lead/proposal" element={<LeadGetParamsPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/lead/proposal/welcome" element={<LeadWelcomePage />} />
          <Route path="/lead/proposal/forms" element={<FormsPage isLeadFlow={true} />} />
          <Route path="/lead/proposal/forms/success" element={<FormsSuccessPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="/*" element={<h1>NOT FOUND</h1>} />
      <Route path="/notfound" element={<h1>NOT FOUND</h1>} />
    </Routes>
  );
}

export default App;
