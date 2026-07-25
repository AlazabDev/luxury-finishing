import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ChatBot from "./components/ChatBot.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import BackToTop from "./components/BackToTop.tsx";

const Index = lazy(() => import("./pages/Index.tsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.tsx"));
const ServicesPage = lazy(() => import("./pages/ServicesPage.tsx"));
const CalculatorPage = lazy(() => import("./pages/CalculatorPage.tsx"));
const EstimateRequestPage = lazy(() => import("./pages/EstimateRequestPage.tsx"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage.tsx"));
const BlogPage = lazy(() => import("./pages/BlogPage.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
const QuotePage = lazy(() => import("./pages/QuotePage.tsx"));
const FaqPage = lazy(() => import("./pages/FaqPage.tsx"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage.tsx"));
const TermsPage = lazy(() => import("./pages/TermsPage.tsx"));
const CookiesPage = lazy(() => import("./pages/CookiesPage.tsx"));
const DataDeletionPage = lazy(() => import("./pages/DataDeletionPage.tsx"));
const LegalCenterPage = lazy(() => import("./pages/LegalCenterPage.tsx"));
const ChannelsPage = lazy(() => import("./pages/ChannelsPage.tsx"));
const SitemapPage = lazy(() => import("./pages/SitemapPage.tsx"));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-live="polite">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    <span className="sr-only">Loading</span>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/estimate-request" element={<EstimateRequestPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/quote" element={<QuotePage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="/data-deletion" element={<DataDeletionPage />} />
                <Route path="/legal" element={<LegalCenterPage />} />
                <Route path="/channels" element={<ChannelsPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/uberfix" element={<SubscriptionsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ChatBot />
            <BackToTop />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
