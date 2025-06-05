
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
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MobileOptimizedLayout = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout effettuato con successo");
      setIsOpen(false);
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
    { name: "Esporta Report", href: "/esporta-report", icon: Download },
    { name: "Import CSV", href: "/import-csv", icon: Upload },
    { name: "Profilo", href: "/profilo", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile ottimizzato */}
      <header className="bg-white shadow-sm border-b px-3 py-2 flex items-center justify-between sticky top-0 z-50">
        <img 
          src="https://i.postimg.cc/bJ0jcrMz/MManutenzioni.png" 
          alt="MManutenzioni" 
          className="h-7"
        />
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              </div>
              <div className="flex-1 p-4">
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              <div className="p-4 border-t bg-gray-50">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full h-10 text-sm flex items-center justify-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main content con padding ottimizzato */}
      <main className="min-h-[calc(100vh-60px)]">
        <Outlet />
      </main>
    </div>
  );
};

export default MobileOptimizedLayout;
