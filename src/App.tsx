import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/src/components/layout/Navbar';
import { Footer } from '@/src/components/layout/Footer';
import { Home } from '@/src/pages/Home';
import { Merge } from '@/src/pages/Merge';
import { Login } from '@/src/pages/Login';
import { Signup } from '@/src/pages/Signup';
import { ForgotPassword } from '@/src/pages/ForgotPassword';
import { Dashboard } from '@/src/pages/Dashboard';
import { Admin } from '@/src/pages/Admin';
import { AuthGuard } from '@/src/components/auth/AuthGuard';
import { AdminGuard } from '@/src/components/auth/AdminGuard';
import { useLocation } from 'react-router-dom';

import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';

function ScrollToTop() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Update last_login_at
        await updateDoc(doc(db, 'profiles', user.uid), {
          last_login_at: new Date().toISOString()
        }).catch(err => {
          // Ignore if profile doesn't exist yet (signup handles it)
          if (err.code !== 'not-found') {
            handleFirestoreError(err, OperationType.UPDATE, `profiles/${user.uid}`);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'glass-card text-sm font-bold',
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            color: '#0F172A',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge" element={<Merge />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/admin/*" element={<AdminGuard><Admin /></AdminGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
