import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  QrCode,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { name: 'Applications', href: '/admin/applications', icon: FileText },
  { name: 'Attendance', href: '/admin/attendance', icon: QrCode },
  { name: 'Posts', href: '/admin/posts', icon: FileText },
];
export function Sidebar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  const location = useLocation();

  return (
    <div className="flex md:flex-shrink-0 bg-white dark:bg-transparent">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-[#0f172a] dark:text-zinc-100">
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-white/10">
          <h1 className="text-xl font-bold text-primary dark:text-zinc-100">Placement Cell</h1>
        </div>
        <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/25 dark:text-zinc-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-[#182341] dark:hover:text-zinc-100'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto">
            <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 mt-4 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/15">
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
