
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

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg flex flex-col border-r`}>
        <div className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <img 
                src="https://s3-eu-west-1.amazonaws.com/house.italianway.production/organization/logos/attachments/000/918/164/original/MONHOLIDAY_PITTOGRAMMA.jpg?1669386087" 
                alt="MonHoliday" 
                className="w-8 h-8 rounded"
              />
              <span className="text-lg font-semibold text-white">MonHoliday</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-white/20"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="mt-2 pb-4 flex-1">
          {sidebarOpen && (
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Principale</p>
            </div>
          )}
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center px-4 py-3 text-left transition-all duration-200 mx-2 my-1 rounded-lg
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'} ${isActive ? 'text-blue-600' : ''}`} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}

          <div className={`mt-8 pt-4 border-t border-gray-200 ${sidebarOpen ? 'mx-4' : 'mx-2'}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-lg`}
              title={!sidebarOpen ? "Logout" : undefined}
            >
              <LogOut className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
