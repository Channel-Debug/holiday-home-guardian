
import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { 
  Home, 
  Plus, 
  CheckCircle, 
  FileText, 
  Upload, 
  User,
  Menu,
  X,
  Download,
  Archive,
  LogOut,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Layout = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout effettuato con successo");
    } catch (error) {
      console.error("Errore durante il logout:", error);
      toast.error("Errore durante il logout");
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Nuova Task", href: "/nuova-task", icon: Plus },
    { name: "Task Completate", href: "/task-completate", icon: CheckCircle },
    { name: "Archiviati", href: "/archiviati", icon: Archive },
    { name: "Numeri Utili", href: "/numeri-utili", icon: Phone },
    { name: "Esporta Report", href: "/esporta-report", icon: Download },
    { name: "Import CSV", href: "/import-csv", icon: Upload },
    { name: "Profilo", href: "/profilo", icon: User },
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <img 
                src="https://i.postimg.cc/7PMqjt8g/MManutenzioni.png" 
                alt="MManutenzioni" 
                className="h-8"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  title={isSidebarCollapsed ? item.name : ''}
                >
                  <item.icon className={`${isSidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'} flex-shrink-0`} />
                  {!isSidebarCollapsed && item.name}
                </Link>
              );
            })}
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full"
              title={isSidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut className={`${isSidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'} flex-shrink-0`} />
              {!isSidebarCollapsed && "Logout"}
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
