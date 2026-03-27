import { Link } from 'react-router-dom';
import { Files, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center space-x-2 mb-6 group">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Files className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-slate-900 tracking-tight">PDF Merger</span>
            </Link>
            <p className="text-slate-500 max-w-sm leading-relaxed mb-8 text-justify">
              The most reliable, clean, and accessible free PDF merging tool on the web. 
              No watermarks, no paywalls, no complexity. Just your documents, perfectly combined.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-2 md:col-start-7">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Product</h3>
            <ul className="space-y-4">
              <li><Link to="/merge" className="text-slate-500 hover:text-primary transition-colors">Merge PDF</Link></li>
              <li><Link to="/" className="text-slate-500 hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/" className="text-slate-500 hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-slate-500 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="text-slate-500 hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-slate-500 hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/" className="text-slate-500 hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} - PDF Merger | All Rights Reserved.
          </p>
          <div className="flex items-center space-x-2 text-slate-400 text-sm">
          </div>
        </div>
      </div>
    </footer>
  );
}
