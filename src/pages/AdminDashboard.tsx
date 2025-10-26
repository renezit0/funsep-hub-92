import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuth, AdminSession } from "@/services/adminAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardPage } from "@/components/admin/pages/DashboardPage";
import { BeneficiariesPage } from "@/components/admin/pages/BeneficiariesPage";
import { DependentsPage } from "@/components/admin/pages/DependentsPage";
import { UsersPage } from "@/components/admin/pages/UsersPage";
import { PasswordsPage } from "@/components/admin/pages/PasswordsPage";
import { NewsPage } from "@/components/admin/pages/NewsPage";
import { ReportsPage } from "@/components/admin/pages/ReportsPage";
import { RequestsPage } from "@/components/admin/pages/RequestsPage";
import { SobreFunsepManagementPage } from "@/components/admin/pages/SobreFunsepManagementPage";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export type AdminPageType = 'dashboard' | 'beneficiarios' | 'dependentes' | 'usuarios' | 'senhas' | 'noticias' | 'relatorios' | 'requerimentos' | 'sobre-funsep';

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<AdminPageType>('dashboard');
  const [session, setSession] = useState<AdminSession | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await adminAuth.validateSession();
      if (!isValid) {
        navigate('/');
        return;
      }
      
      const currentSession = adminAuth.getSession();
      
      // CRITICAL SECURITY CHECK: Verify user is actually an admin
      const adminRoles = ['GERENTE', 'DESENVOLVEDOR', 'ANALISTA DE SISTEMAS'];
      if (!currentSession || !adminRoles.includes(currentSession.user.cargo)) {
        console.error('Unauthorized access attempt to admin panel');
        await adminAuth.logout();
        navigate('/');
        return;
      }
      
      setSession(currentSession);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await adminAuth.logout();
    navigate('/');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'beneficiarios':
        return <BeneficiariesPage />;
      case 'dependentes':
        return <DependentsPage />;
      case 'usuarios':
        return <UsersPage />;
      case 'senhas':
        return <PasswordsPage />;
      case 'noticias':
        return <NewsPage />;
      case 'relatorios':
        return <ReportsPage />;
      case 'requerimentos':
        return <RequestsPage />;
      case 'sobre-funsep':
        return <SobreFunsepManagementPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AdminSidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          session={session}
          onLogout={handleLogout}
        />
        
        <SidebarInset>
          <AdminHeader
            session={session}
            onLogout={handleLogout}
          />
          
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
            {renderPage()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}