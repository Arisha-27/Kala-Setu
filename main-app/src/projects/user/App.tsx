import { Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkshopBooking from "./pages/WorkshopBooking";
import SearchPage from "./pages/SearchPage";
// Page Imports
import HomePage from "./pages/HomePage";
import ArtisansPage from "./pages/ArtisansPage";
import DashboardPage from "./pages/DashboardPage";
import WorkshopsPage from "./pages/WorkshopsPage";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionDetails from "./pages/CollectionDetails";
import ProductOrder from "./pages/ProductOrder";
import NotFound from "./pages/NotFound";
import ArtisanProfile from "./pages/ArtisanProfile";
import { UserChatWidget } from "./components/UserChatWidget";
import OrdersPage from "./pages/OrdersPage";
const App = () => (
  <div className="theme-user min-h-screen flex flex-col bg-background text-foreground font-sans">
    <Header />
    <main className="flex-1">
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="artisans" element={<ArtisansPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="workshops" element={<WorkshopsPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="artisan/:id" element={<ArtisanProfile />} />
        <Route path="search" element={<SearchPage />} />

        {/* 👇 FIXED: Removed 'customer/' prefix to match your other routes */}
        <Route path="workshop/:id/book" element={<WorkshopBooking />} />

        <Route path="collection/:id" element={<CollectionDetails />} />
        <Route path="product/:id" element={<ProductOrder />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <UserChatWidget />
    </main>
    <Footer />
  </div>
);

export default App;