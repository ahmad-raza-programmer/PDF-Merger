import { Link } from 'react-router-dom';
import { Files, RotateCw, Trash2, LayoutDashboard, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Home() {
  const features = [
    {
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into one professional document in seconds.',
      icon: Files,
    },
    {
      title: 'Rotate Pages',
      description: 'Easily rotate individual pages to correct orientation issues.',
      icon: RotateCw,
    },
    {
      title: 'Delete Pages',
      description: 'Remove unwanted pages before merging to keep your files clean.',
      icon: Trash2,
    },
    {
      title: 'Reorder Pages',
      description: 'Drag and drop pages to arrange them exactly how you need.',
      icon: LayoutDashboard,
    },
    {
      title: 'Secure & Private',
      description: 'Your files are processed in your browser and deleted from our servers after 24 hours.',
      icon: ShieldCheck,
    },
    {
      title: 'Fast & Free',
      description: 'No watermarks, no paywalls, no complexity. Just fast PDF merging.',
      icon: Zap,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-32 pb-32 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-white overflow-hidden">
        <div className="responsive-container relative z-10">
          <div className="text-center space-y-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-primary-light px-4 py-1.5 rounded-full border border-primary/10"
            >
              <span className="text-primary text-sm font-bold uppercase tracking-wider">New Features Available</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[37px] font-display font-bold text-slate-900 tracking-tight leading-[1.1]"
            >
              Merge PDFs in Seconds — <span className="text-primary">Free, Forever</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-fluid-p text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium"
            >
              The most reliable, clean, and accessible PDF merging tool. 
              Organize, rotate, and combine your documents with ease.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/merge"
                className="btn-primary w-full sm:w-auto px-10 py-5 flex items-center justify-center space-x-2 group"
              >
                <span className="text-[17px]">Start Merging — It's Free</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/signup"
                className="btn-secondary w-full sm:w-auto px-10 py-5 text-lg"
              >
                Create Account
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 font-medium"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>No registration required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>No watermarks</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Fast & Secure</span>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-[26px] font-display font-bold text-slate-900">Everything you need for PDF management</h2>
          <p className="text-slate-500 mt-4 text-lg">Powerful tools to help you organize your documents perfectly.</p>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="bg-primary-light w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner shadow-primary/5">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-lg text-justify">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="bg-slate-950 py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-[30px] font-display font-bold">How It Works</h2>
            <p className="text-slate-400 mt-4 text-lg">Three simple steps to your perfect PDF.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { step: '01', title: 'Upload', desc: 'Drag and drop your PDF files into our secure tool.' },
              { step: '02', title: 'Organize', desc: 'Reorder, rotate, or delete pages to get them just right.' },
              { step: '03', title: 'Download', desc: 'Click merge and download your new PDF instantly.' },
            ].map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center group"
              >
                <div className="text-8xl font-display font-black text-white/5 absolute -top-12 left-1/2 -translate-x-1/2 group-hover:text-primary/10 transition-colors duration-500">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <span className="text-primary group-hover:text-white font-bold text-xl">{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4">{item.title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[24px] font-display font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: 'Is it really free?', a: 'Yes, PDF Merger is completely free to use with no hidden costs or watermarks.' },
            { q: 'Are my files secure?', a: 'Absolutely. We process files in your browser when possible. Uploaded files are deleted from our servers after 24 hours.' },
            { q: 'What is the file size limit?', a: 'You can upload files up to 50MB each, with a total limit of 200MB per merge job.' },
          ].map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary/30 transition-colors group"
            >
              <h4 className="text-xl font-display font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">{faq.q}</h4>
              <p className="text-slate-500 text-lg leading-relaxed text-justify">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
