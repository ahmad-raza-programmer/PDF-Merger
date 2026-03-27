import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Files, LayoutDashboard, Settings, LogOut, User, Menu, X } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { cn } from '@/src/lib/utils';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const profileDoc = await getDoc(doc(db, 'profiles', authUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }
      } else {
        setProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const navItems = [
    { name: 'Merge PDF', path: '/merge', icon: Files },
    ...(user ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] : []),
    ...(profile?.role === 'admin' || user?.email === "askservicesbyme@gmail.com" ? [{ name: 'Admin', path: '/admin', icon: Settings }] : []),
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="responsive-container">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20"
              >
                <Files className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xl font-display font-bold text-slate-900 tracking-tight">PDF Merger</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "text-primary bg-primary-light"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {location.pathname === item.path && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full mx-4"
                  />
                )}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-slate-200 mx-4" />
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <div className="h-7 w-7 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{profile?.full_name || user.email?.split('@')[0]}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-danger hover:bg-danger/5 rounded-xl transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary px-4 py-2 rounded-xl transition-colors">
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn-primary py-2 text-sm">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                    location.pathname === item.path
                      ? "bg-primary-light text-primary"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="border-t border-slate-100 mt-4 pt-4">
                {user ? (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-danger w-full text-left hover:bg-danger/5 rounded-xl transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3 px-2">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="btn-secondary text-center py-2 text-sm">Sign In</Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)} className="btn-primary text-center py-2 text-sm">Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

