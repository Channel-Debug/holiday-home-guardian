
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Plus, 
  CheckCircle, 
  FileText, 
  Upload, 
  User, 
  Menu,
  X,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MobileOptimizedLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
    { name: "Esporta Report", href: "/esporta-report", icon: Download },
    { name: "Import CSV", href: "/import-csv", icon: Upload },
    { name: "Profilo", href: "/profilo", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile */}
      <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <img 
          src="https://i.postimg.cc/bJ0jcrMz/MManutenzioni.png" 
          alt="MManutenzioni" 
          className="h-8"
        />
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col h-full">
              <div className="py-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Menu</h2>
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              <div className="mt-auto pt-4 border-t">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Bottom navigation mobile */}
      <nav className="bg-white border-t px-4 py-2 fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-around items-center">
          {navigation.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="truncate max-w-12">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom navigation */}
      <div className="h-16"></div>
    </div>
  );
};

export default MobileOptimizedLayout;
