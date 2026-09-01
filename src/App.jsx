import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import AdminRoute from "./components/AdminRoute";
import DriverRoute from "./components/DriverRoute";
import Navbar from "./components/Navbar";

import AdminPricing from "./pages/AdminPricing";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";

import CustomerDashboard from "./pages/CustomerDashboard";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import BookDelivery from "./pages/BookDelivery";
import TrackDelivery from "./pages/TrackDelivery";
import DeliveryHistory from "./pages/DeliveryHistory";

import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import { getCurrentUser } from "./utils/authStorage";

import "./App.css";


// ======================================================
// CUSTOMER ROUTE
// ======================================================

function CustomerRoute({ children }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "customer") {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ======================================================
// NAVBAR CONTROL
// ======================================================

function AppContent() {
  const location = useLocation();

  const user = getCurrentUser();

  /*
    The customer dashboard pages have their own sidebar.

    Therefore we DO NOT show the normal public Navbar
    on customer dashboard pages.

    This prevents the Navbar from overlapping the sidebar.
  */

  const customerPages = [
    "/customer-dashboard",
    "/book-delivery",
    "/track-delivery",
    "/track-deliveries",
    "/delivery-history",
    "/profile",
  ];

  const isCustomerPage =
    customerPages.includes(location.pathname) ||
    location.pathname.startsWith("/track-delivery/") ||
    location.pathname.startsWith("/track-deliveries/");

  /*
    Driver and admin pages also have their own layouts,
    so don't show the public Navbar there either.
  */

  const staffPage =
    location.pathname.startsWith("/driver") ||
    location.pathname.startsWith("/admin");

  const showNavbar =
    !isCustomerPage && !staffPage;

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>

        {/* ==================================================
            PUBLIC PAGES
        ================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==================================================
            CUSTOMER
        ================================================== */}

        <Route
          path="/customer-dashboard"
          element={
            <CustomerRoute>
              <CustomerDashboard />
            </CustomerRoute>
          }
        />

        <Route
          path="/book-delivery"
          element={
            <CustomerRoute>
              <BookDelivery />
            </CustomerRoute>
          }
        />

        {/* Main track route */}
        <Route
          path="/track-delivery"
          element={
            <CustomerRoute>
              <TrackDelivery />
            </CustomerRoute>
          }
        />

        {/* Plural route used by the sidebar */}
        <Route
          path="/track-deliveries"
          element={
            <CustomerRoute>
              <TrackDelivery />
            </CustomerRoute>
          }
        />

        {/* Track individual delivery */}
        <Route
          path="/track-delivery/:id"
          element={
            <CustomerRoute>
              <TrackDelivery />
            </CustomerRoute>
          }
        />

        {/* Also support plural individual route */}
        <Route
          path="/track-deliveries/:id"
          element={
            <CustomerRoute>
              <TrackDelivery />
            </CustomerRoute>
          }
        />

        {/* Delivery history */}
        <Route
          path="/delivery-history"
          element={
            <CustomerRoute>
              <DeliveryHistory />
            </CustomerRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <CustomerRoute>
              <Profile />
            </CustomerRoute>
          }
        />


        {/* ==================================================
            DRIVER
        ================================================== */}

        <Route
          path="/driver-login"
          element={<DriverLogin />}
        />

        <Route
          path="/driver-dashboard"
          element={
            <DriverRoute>
              <DriverDashboard />
            </DriverRoute>
          }
        />


        {/* ==================================================
            ADMIN
        ================================================== */}

        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-pricing"
          element={
            <AdminRoute>
              <AdminPricing />
            </AdminRoute>
          }
        />


        {/* ==================================================
            404
        ================================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </>
  );
}


// ======================================================
// APP
// ======================================================

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;