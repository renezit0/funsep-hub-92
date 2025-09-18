import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Book, Gavel, FileText, BarChart3, Settings } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LoginModal } from "@/components/modals/LoginModal";
import { HomePage } from "@/components/pages/HomePage";
import { NewsPage } from "@/components/pages/NewsPage";
import { BenefitsPage } from "@/components/pages/BenefitsPage";
import { InstructionsPage } from "@/components/pages/InstructionsPage";
import { ContactPage } from "@/components/pages/ContactPage";
import { HealthTipsPage } from "@/components/pages/HealthTipsPage";
import { LinksPage } from "@/components/pages/LinksPage";
import { StatutePage } from "@/components/pages/StatutePage";
import { PlaceholderPage } from "@/components/pages/PlaceholderPage";
import { ReportsPage } from "@/components/pages/ReportsPage";

const pageConfig = {
  home: { title: "Início", component: HomePage, type: "home" as const },
  news: { title: "Notícias", component: NewsPage, type: "regular" as const },
  benefits: { title: "Vantagens", component: BenefitsPage, type: "regular" as const },
  instructions: { title: "Instruções", component: InstructionsPage, type: "regular" as const },
  statute: { title: "Estatuto", component: StatutePage, type: "regular" as const },
  requests: { title: "Requerimentos", component: PlaceholderPage, icon: FileText, type: "placeholder" as const },
  reports: { title: "Relatórios", component: ReportsPage, type: "regular" as const },
  admin: { title: "Administração", component: PlaceholderPage, icon: Settings, type: "placeholder" as const },
  contact: { title: "Localização e Contato", component: ContactPage, type: "regular" as const },
  healthtips: { title: "Dicas de Saúde", component: HealthTipsPage, type: "regular" as const },
  links: { title: "Links", component: LinksPage, type: "regular" as const },
};

const Index = () => {
  const { isAuthenticated, session } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const currentPageConfig = pageConfig[currentPage as keyof typeof pageConfig];

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onLoginClick={openLoginModal}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      
      <div className="lg:ml-sidebar">
        <Header
          title={currentPageConfig.title}
          onMenuToggle={toggleSidebar}
          onLoginClick={openLoginModal}
        />
        
        <main className="p-6 lg:p-8">
          {currentPageConfig.type === "placeholder" && (
            <PlaceholderPage 
              title={currentPageConfig.title}
              icon={currentPageConfig.icon!}
            />
          )}
          {currentPageConfig.type === "home" && (
            <HomePage onNavigate={handlePageChange} />
          )}
          {currentPageConfig.type === "regular" && currentPage === "news" && (
            <NewsPage />
          )}
          {currentPageConfig.type === "regular" && currentPage === "benefits" && (
            <BenefitsPage />
          )}
          {currentPageConfig.type === "regular" && currentPage === "instructions" && (
            <InstructionsPage />
          )}
          {currentPageConfig.type === "regular" && currentPage === "contact" && (
            <ContactPage />
          )}
          {currentPageConfig.type === "regular" && currentPage === "healthtips" && (
            <HealthTipsPage />
          )}
          {currentPageConfig.type === "regular" && currentPage === "links" && (
            <LinksPage />
          )}
          {currentPageConfig.type === "regular" && currentPage === "statute" && (
            <StatutePage />
          )}
          {currentPageConfig.type === "regular" && currentPage === "reports" && (
            <ReportsPage />
          )}
        </main>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={closeLoginModal}
      />
    </div>
  );
};

export default Index;