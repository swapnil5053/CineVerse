import { Film, Github } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="glass-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* User Display */}
          {user && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Logged in as: <span className="text-primary font-semibold">{user.name}</span>
              </p>
            </div>
          )}
          
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">
                © 2025 CineVerse | Theatre Management System
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with Flask & MySQL | DBMS Project
            </div>
          </div>

          {/* GitHub Link */}
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
