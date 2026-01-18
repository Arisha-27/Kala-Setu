import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import AIListingGenerator from "./pages/AIListingGenerator";
import InventoryManagement from "./pages/InventoryManagement";
import OrderDashboard from "./pages/OrderDashboard";
import DigitalWorkshop from "./pages/DigitalWorkshop";
import SalesAnalytics from "./pages/SalesAnalytics";
import AITrendSpotter from "./pages/AITrendSpotter";
import Messenger from "./pages/Messenger";
import CollaborationFinder from "./pages/CollaborationFinder";
import EarningsDashboard from "./pages/EarningsDashboard";
import PayoutSettings from "./pages/PayoutSettings";
import NotFound from "./pages/NotFound";
import ListingsPage from "./pages/ListingsPage";
import EditListingPage from "./pages/EditListingPage";
import ProfileSettings from "./pages/ProfileSettings";

const App = () => (
  <div className="theme-artist w-full min-h-screen bg-background text-foreground">
    <Routes>
      <Route index element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="ai-listing-generator" element={<DashboardLayout><AIListingGenerator /></DashboardLayout>} />
      <Route path="inventory-management" element={<DashboardLayout><InventoryManagement /></DashboardLayout>} />
      <Route path="order-dashboard" element={<DashboardLayout><OrderDashboard /></DashboardLayout>} />
      <Route path="digital-workshop" element={<DashboardLayout><DigitalWorkshop /></DashboardLayout>} />
      <Route path="sales-analytics" element={<DashboardLayout><SalesAnalytics /></DashboardLayout>} />
      <Route path="ai-trend-spotter" element={<DashboardLayout><AITrendSpotter /></DashboardLayout>} />

      {/* 👇 FIXED: Added DashboardLayout Wrapper */}
      <Route path="listings" element={<DashboardLayout><ListingsPage /></DashboardLayout>} />

      <Route path="messenger" element={<DashboardLayout><Messenger /></DashboardLayout>} />
      <Route path="collaboration-finder" element={<DashboardLayout><CollaborationFinder /></DashboardLayout>} />
      <Route path="earnings-dashboard" element={<DashboardLayout><EarningsDashboard /></DashboardLayout>} />
      <Route path="payout-settings" element={<DashboardLayout><PayoutSettings /></DashboardLayout>} />

      {/* 👇 FIXED: Added DashboardLayout Wrapper */}
      <Route path="listings/edit/:id" element={<DashboardLayout><EditListingPage /></DashboardLayout>} />

      <Route path="settings" element={<DashboardLayout><ProfileSettings /></DashboardLayout>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </div>
);

export default App;