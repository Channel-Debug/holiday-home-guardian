import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Plus, 
  Upload, 
  CheckCircle2, 
  User, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { toast } from "sonner";

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
}

const MobileOptimizedLayout = ({ children }: MobileOptimizedLayoutProps) => {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate("/login");
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout effettuato con successo");
      navigate("/login");
    } catch (error) {
      toast.error("Errore durante il logout");
    }
  };

  const menuItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/nuova-task", label: "Nuova Task", icon: Plus },
    { path: "/import-csv", label: "Importa CSV", icon: Upload },
    { path: "/task-completate", label: "Task Completate", icon: CheckCircle2 },
    { path: "/profilo", label: "Profilo", icon: User },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 touch-manipulation overflow-hidden">
      {/* Mobile-first Sidebar with improved touch handling */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:w-64 lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-3">
            <img 
              src="https://s3-eu-west-1.amazonaws.com/house.italianway.production/organization/logos/attachments/000/918/164/original/MONHOLIDAY_PITTOGRAMMA.jpg?1669386087" 
              alt="Monholiday" 
              className="w-8 h-8 rounded"
            />
            <span className="text-lg font-semibold text-white">Monholiday</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/20"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-2 pb-4 overflow-y-auto h-full">
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Principale</p>
          </div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-6 py-4 text-left transition-all duration-200 mx-2 my-1 rounded-lg
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                  }
                  active:scale-95 touch-manipulation
                `}
              >
                <item.icon className={`h-6 w-6 mr-4 ${isActive ? 'text-blue-600' : ''}`} />
                <span className="text-base font-medium">{item.label}</span>
              </button>
            );
          })}

          <div className="mt-8 pt-4 border-t border-gray-200 mx-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-6 py-4 text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-lg mx-2 active:scale-95 touch-manipulation"
            >
              <LogOut className="h-6 w-6 mr-4" />
              <span className="text-base font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col overflow-hidden">
        {/* Enhanced Mobile Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white hover:bg-white/20 active:scale-95 touch-manipulation"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center space-x-2">
            <img 
              src="https://s3-eu-west-1.amazonaws.com/house.italianway.production/organization/logos/attachments/000/918/164/original/MONHOLIDAY_PITTOGRAMMA.jpg?1669386087" 
              alt="Monholiday" 
              className="w-7 h-7 rounded"
            />
            <span className="font-semibold text-white text-lg">Monholiday</span>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Page Content optimized for mobile */}
        <main className="flex-1 overflow-auto overscroll-y-contain bg-gray-50">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Enhanced Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MobileOptimizedLayout;
