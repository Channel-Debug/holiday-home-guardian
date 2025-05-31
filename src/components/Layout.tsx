
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Plus, 
  Upload, 
  CheckCircle2, 
  Users, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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
    { path: "/importa-csv", label: "Importa CSV", icon: Upload },
    { path: "/task-completate", label: "Task Completate", icon: CheckCircle2 },
    { path: "/utenti", label: "Utenti", icon: Users },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-3">
            <img 
              src="https://s3-eu-west-1.amazonaws.com/house.italianway.production/organization/logos/attachments/000/918/164/original/MONHOLIDAY_PITTOGRAMMA.jpg?1669386087" 
              alt="MonHoliday" 
              className="w-8 h-8"
            />
            <span className="text-lg font-semibold text-gray-900">MonHoliday</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6">
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
                  w-full flex items-center px-6 py-3 text-left transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-left text-red-600 hover:bg-red-50 transition-colors mt-6"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white shadow-sm border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center space-x-2">
            <img 
              src="https://s3-eu-west-1.amazonaws.com/house.italianway.production/organization/logos/attachments/000/918/164/original/MONHOLIDAY_PITTOGRAMMA.jpg?1669386087" 
              alt="MonHoliday" 
              className="w-6 h-6"
            />
            <span className="font-semibold text-gray-900">MonHoliday</span>
          </div>
          <div></div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay per mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
