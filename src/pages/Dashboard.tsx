import React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, orderBy, limit, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { AuthGuard } from '@/src/components/auth/AuthGuard';
import { User, Calendar, FileText, Clock, ShieldCheck, LogOut, Settings, ArrowRight, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/src/lib/utils';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';

export function Dashboard() {
  const [profile, setProfile] = React.useState<any>(null);
  const [recentJobs, setRecentJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newName, setNewName] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let unsubscribeJobs: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribeProfile = onSnapshot(
          doc(db, 'profiles', user.uid),
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setProfile(data);
              setNewName(data.full_name || '');
            }
            setLoading(false);
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `profiles/${user.uid}`);
            setLoading(false);
          }
        );

        const jobsQuery = query(
          collection(db, 'merge_jobs'),
          where('user_id', '==', user.uid),
          orderBy('created_at', 'desc'),
          limit(5)
        );

        unsubscribeJobs = onSnapshot(
          jobsQuery,
          (snapshot) => {
            setRecentJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'merge_jobs');
          }
        );
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeJobs) unsubscribeJobs();
    };
  }, []);

  const updateProfile = async () => {
    if (!auth.currentUser || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'profiles', auth.currentUser.uid), {
        full_name: newName,
      }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `profiles/${auth.currentUser.uid}`);
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="responsive-container py-16 space-y-16">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-8"
        >
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary transition-transform duration-500 group-hover:rotate-12">
                <User className="h-10 w-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-success rounded-full border-4 border-[#F8FAFC]"></div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Manage your PDF merge history and account settings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => auth.signOut()}
              className="btn-secondary px-6 py-2.5 flex items-center gap-2 text-slate-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Merges', value: profile?.total_merges || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Active Jobs', value: recentJobs.filter(j => j.status === 'processing').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Account Status', value: profile?.is_active ? 'Active' : 'Inactive', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 group hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <Activity className="h-4 w-4 text-slate-200 group-hover:text-primary/20 transition-colors" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-slate-900 mt-2">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent History */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Recent Activity</h2>
              </div>
              <button className="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 group">
                View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            
            <div className="glass-card overflow-hidden shadow-xl">
              {recentJobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-200">
                      <tr>
                        <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Filename</th>
                        <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Files</th>
                        <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentJobs.map((job, idx) => (
                        <motion.tr 
                          key={job.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (idx * 0.05) }}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-8 py-5 text-sm font-medium text-slate-900">
                            {new Date(job.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-700">
                            {job.output_filename || 'merged.pdf'}
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-300" />
                              <span className="font-bold text-slate-700">{job.file_count}</span> files
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider",
                              job.status === 'completed' 
                                ? "bg-success/10 text-success" 
                                : "bg-amber-100 text-amber-700"
                            )}>
                              <div className={cn("h-1.5 w-1.5 rounded-full", job.status === 'completed' ? "bg-success" : "bg-amber-500")} />
                              {job.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-20 text-center space-y-6">
                  <div className="bg-slate-50 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto border border-slate-100">
                    <FileText className="h-10 w-10 text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-slate-900">No merge jobs found yet</p>
                    <p className="text-slate-500 max-w-xs mx-auto">Start merging your PDF files to see your history here.</p>
                  </div>
                  <button className="btn-primary px-8 py-3">Start your first merge</button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Settings */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Settings className="h-5 w-5 text-slate-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Settings</h2>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 shadow-xl space-y-8"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input-field py-3"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      disabled
                      value={profile?.email || ''}
                      className="input-field py-3 bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100"
                    />
                    <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={updateProfile}
                disabled={isUpdating}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
              >
                {isUpdating && <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />}
                <span>Save Changes</span>
              </button>
              
              <div className="pt-8 border-t border-slate-100 flex flex-col gap-4">
                <p className="text-xs text-slate-400 font-medium text-center">
                  Need to close your account?
                </p>
                <button className="text-sm font-bold text-danger hover:text-danger/80 transition-colors text-center">
                  Delete Account Permanently
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
