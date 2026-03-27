import React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy, limit, doc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { AdminGuard } from '@/src/components/auth/AdminGuard';
import { Users, FileText, Settings, Activity, ShieldAlert, Ban, CheckCircle, User, Calendar, ShieldCheck, ArrowUpRight, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/src/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';

export function Admin() {
  const [profile, setProfile] = React.useState<any>(null);
  const [users, setUsers] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalMerges: 0,
    activeUsers: 0,
  });
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [adminName, setAdminName] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [settings, setSettings] = React.useState({
    max_file_size_mb: 50,
    max_files_per_merge: 20,
  });

  React.useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === "askservicesbyme@gmail.com") {
          const profileRef = doc(db, 'profiles', user.uid);
          unsubscribeProfile = onSnapshot(
            profileRef,
            async (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                setProfile(data);
                setAdminName(data.full_name || '');
                
                if (data.role !== 'admin' || !data.is_admin) {
                  await updateDoc(profileRef, { 
                    role: 'admin',
                    is_admin: true 
                  }).catch(err => {
                    handleFirestoreError(err, OperationType.UPDATE, `profiles/${user.uid}`);
                  });
                }
              } else {
                const newAdminProfile = {
                  uid: user.uid,
                  full_name: user.displayName || 'Admin',
                  email: user.email,
                  role: 'admin',
                  is_admin: true,
                  created_at: new Date().toISOString(),
                  is_active: true,
                  total_merges: 0
                };
                await setDoc(profileRef, newAdminProfile).catch(err => {
                  handleFirestoreError(err, OperationType.CREATE, `profiles/${user.uid}`);
                });
                setProfile(newAdminProfile);
                setAdminName(newAdminProfile.full_name);
              }
            },
            (err) => {
              handleFirestoreError(err, OperationType.GET, `profiles/${user.uid}`);
            }
          );
        } else {
          unsubscribeProfile = onSnapshot(
            doc(db, 'profiles', user.uid),
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                setProfile(data);
                setAdminName(data.full_name || '');
              }
            },
            (err) => {
              handleFirestoreError(err, OperationType.GET, `profiles/${user.uid}`);
            }
          );
        }
      }
    });

    const unsubscribeProfiles = onSnapshot(
      collection(db, 'profiles'),
      (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setUsers(usersList);
        
        const totalMerges = usersList.reduce((acc, user) => acc + (user.total_merges || 0), 0);
        setStats({
          totalUsers: usersList.length,
          totalMerges,
          activeUsers: usersList.filter(u => u.is_active).length,
        });
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'profiles');
        setLoading(false);
      }
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const jobsQuery = query(
      collection(db, 'merge_jobs'),
      where('created_at', '>=', sevenDaysAgo.toISOString()),
      orderBy('created_at', 'asc')
    );

    const unsubscribeJobs = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const jobs = snapshot.docs.map(doc => doc.data());
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            name: days[d.getDay()],
            date: d.toLocaleDateString(),
            merges: 0
          };
        });

        jobs.forEach(job => {
          const jobDate = new Date(job.created_at).toLocaleDateString();
          const dayData = last7Days.find(d => d.date === jobDate);
          if (dayData) {
            dayData.merges++;
          }
        });

        setChartData(last7Days);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'merge_jobs');
      }
    );

    const unsubscribeSettings = onSnapshot(
      doc(db, 'system_settings', 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'system_settings/main');
      }
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribeProfiles();
      unsubscribeJobs();
      unsubscribeSettings();
    };
  }, []);

  const updateAdminProfile = async () => {
    if (!auth.currentUser || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'profiles', auth.currentUser.uid), {
        full_name: adminName,
      }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `profiles/${auth.currentUser.uid}`);
      });

      await setDoc(doc(db, 'system_settings', 'main'), {
        ...settings,
        updated_at: new Date().toISOString(),
      }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, 'system_settings/main');
      });

      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'profiles', userId), { is_active: !currentStatus }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `profiles/${userId}`);
      });
      toast.success('User status updated');
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <AdminGuard>
      <div className="responsive-container py-16 space-y-16">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-8"
        >
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white transition-transform duration-500 group-hover:rotate-12">
                <ShieldAlert className="h-10 w-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-full border-4 border-[#F8FAFC] animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-500 mt-1 font-medium">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'}. Monitor platform usage and manage user accounts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-100 rounded-full flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <Activity className="h-4 w-4 text-primary" />
              Live Monitoring
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Merges', value: stats.totalMerges, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Active Users', value: stats.activeUsers, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'System Status', value: 'Healthy', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
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
                <ArrowUpRight className="h-4 w-4 text-slate-200 group-hover:text-primary/20 transition-colors" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-slate-900 mt-2">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 glass-card p-8 shadow-xl space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Merge Activity</h2>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 7 Days</div>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMerges" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: 700, color: '#2563EB' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="merges" 
                    stroke="#2563EB" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorMerges)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* System Settings */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 shadow-xl space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Settings className="h-5 w-5 text-slate-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Platform</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin Display Name</label>
                <input 
                  type="text" 
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="input-field py-3" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max File Size (MB)</label>
                <input 
                  type="number" 
                  value={settings.max_file_size_mb} 
                  onChange={(e) => setSettings({ ...settings, max_file_size_mb: parseInt(e.target.value) })}
                  className="input-field py-3" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Files Per Merge</label>
                <input 
                  type="number" 
                  value={settings.max_files_per_merge} 
                  onChange={(e) => setSettings({ ...settings, max_files_per_merge: parseInt(e.target.value) })}
                  className="input-field py-3" 
                />
              </div>
              
              <button 
                onClick={updateAdminProfile}
                disabled={isUpdating}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                {isUpdating && <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />}
                <span>Update Settings</span>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Security Status
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed">
                  All platform settings are synchronized in real-time across all active user sessions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* User Management */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">User Management</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field py-2.5 pl-11 pr-4 w-full sm:w-64 text-sm"
                />
              </div>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary transition-colors">
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="glass-card overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total Merges</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user, idx) => (
                      <motion.tr 
                        key={user.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                              <p className="text-xs font-medium text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider",
                            user.role === 'admin' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-300" />
                            <span className="text-sm font-bold text-slate-700">{user.total_merges || 0}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                            user.is_active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                          )}>
                            <div className={cn("h-1.5 w-1.5 rounded-full", user.is_active ? "bg-success" : "bg-danger")} />
                            {user.is_active ? 'Active' : 'Banned'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                            className={cn(
                              "p-2.5 rounded-xl transition-all",
                              user.is_active 
                                ? "text-slate-400 hover:text-danger hover:bg-danger/10" 
                                : "text-success bg-success/10 hover:bg-success hover:text-white"
                            )}
                            title={user.is_active ? "Ban User" : "Unban User"}
                          >
                            {user.is_active ? <Ban className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <div className="bg-slate-50 h-16 w-16 rounded-3xl flex items-center justify-center mx-auto border border-slate-100">
                  <Search className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-slate-500 font-medium">No users found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
