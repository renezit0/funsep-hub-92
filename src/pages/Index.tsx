import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { HomePage } from "@/components/pages/HomePage";
import { NewsPage } from "@/components/pages/NewsPage";
import { InstructionsPage } from "@/components/pages/InstructionsPage";
import { LinksPage } from "@/components/pages/LinksPage";
import { BenefitsPage } from "@/components/pages/BenefitsPage";
import { ContactPage } from "@/components/pages/ContactPage";
import { HealthTipsPage } from "@/components/pages/HealthTipsPage";
import { StatutePage } from "@/components/pages/StatutePage";
import { ReportsPage } from "@/components/pages/ReportsPage";
import { PlaceholderPage } from "@/components/pages/PlaceholderPage";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { FileText } from "lucide-react";

export default function Index() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'news':
        return <NewsPage />;
      case 'instructions':
        return <InstructionsPage />;
      case 'links':
        return <LinksPage />;
      case 'benefits':
        return <BenefitsPage />;
      case 'contact':
        return <ContactPage />;
      case 'health-tips':
        return <HealthTipsPage />;
      case 'statute':
        return <StatutePage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <PlaceholderPage title="Página" icon={FileText} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Header 
          title="FUNSEP" 
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
          onLoginClick={() => setCurrentPage('admin')} 
        />
        <div className="flex h-full w-full">
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={setCurrentPage}
            onLoginClick={() => setCurrentPage('admin')}
            isOpen={isMenuOpen}
            onToggle={() => setIsMenuOpen(!isMenuOpen)}
          />
          <main className="flex-1 p-6 lg:ml-64">
            {renderPage()}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}