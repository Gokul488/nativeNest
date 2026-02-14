import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/login";
import Register from "./components/register";
import AboutUs from "./components/aboutUs";
import FAQ from "./components/faq's";
import ContactUs from "./components/contactUs";
import TermsAndConditions from "./components/termsAndConditions";
import PrivacyPolicy from "./components/privacyPolicy";
import BuyerDashboard from "./components/buyer/buyerDashboard";
import BlogDetail from "./components/blogDetail";
import Blog from "./components/blog";
import PropertyDetails from "./components/propertyDetails";
import Buy from "./components/buy";
import AdminDashboard from "./components/admin/adminDashboard";
import WhatsappChatWidget from "./components/WhatsappChatWidget";
import ProtectedRoute from "./components/ProtectedRoute";
import BuilderDashboard from "./components/builder/builderDashboard";
/* 👇 Wrapper to access useLocation */
function AppContent() {
  const location = useLocation();

  // Hide WhatsApp widget on admin dashboard & all its sub-routes
  const hideWhatsapp =
    location.pathname.startsWith("/admin-dashboard");

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq's" element={<FAQ />} />
        <Route path="/contactUs" element={<ContactUs />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route element={<ProtectedRoute allowedRole="buyer" />}>
              <Route path="/buyer-dashboard/*" element={<BuyerDashboard />} />
        </Route>

        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/buy" element={<Buy />} />

        <Route element={<ProtectedRoute allowedRole="admin" />}>
               <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
        </Route>

         <Route element={<ProtectedRoute allowedRole="builder" />}>
               <Route path="/builder-dashboard/*" element={<BuilderDashboard />} />
        </Route>
      </Routes>

      {/* ✅ Render WhatsApp widget only for non-admin pages */}
      {!hideWhatsapp && <WhatsappChatWidget />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
