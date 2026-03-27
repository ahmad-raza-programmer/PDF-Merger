import React from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function ForgotPassword() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-slate-50/50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 relative"
      >
        <Link to="/login" className="absolute -top-12 left-0 flex items-center space-x-2 text-slate-500 hover:text-primary transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Login</span>
        </Link>

        {!submitted ? (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Forgot Password?</h2>
              <p className="text-slate-500">Enter your email to receive a reset link</p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field !pl-12"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="bg-success/10 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto border border-success/20">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Check Your Email</h2>
              <p className="text-slate-500">
                We've sent a password reset link to <span className="font-bold text-slate-900">{email}</span>.
              </p>
            </div>
            <p className="text-sm text-slate-400">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => setSubmitted(false)}
                className="text-primary font-bold hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        )}

        <p className="text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
