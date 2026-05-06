import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border-color flex items-center justify-center text-accent shadow-2xl">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-bold text-primary">404</h1>
          <p className="text-xl font-heading font-bold text-secondary">Page Not Found</p>
          <p className="text-secondary font-body">
            The page you are looking for doesn't exist or has been moved to a different location.
          </p>
        </div>

        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 px-6 py-3 bg-surface border border-border-color rounded-xl text-sm font-medium hover:text-accent hover:border-accent transition-all duration-300 group"
        >
          <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="fixed bottom-8 text-[10px] uppercase tracking-[0.2em] text-secondary/20 font-body">
        SAMKIEL TECHNOLOGY GROUP
      </div>
    </div>
  );
}
