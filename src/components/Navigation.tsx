import { motion } from 'motion/react';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Navigation() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] border-b border-sophisticated-border/30 bg-sophisticated-black/90 backdrop-blur-md px-10 h-20 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <h1 className="text-xl font-serif tracking-[0.3em] uppercase text-sophisticated-text italic font-light">
          Aeterna
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-sophisticated-border/50">
              <div className="w-8 h-8 rounded-full border border-gold/40 overflow-hidden bg-sophisticated-gray">
                <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] uppercase tracking-widest text-sophisticated-text font-bold leading-none">
                  {user?.name}
                </p>
                <p className="text-[8px] uppercase tracking-[0.2em] text-gold/60 font-medium">
                  Verified Curator
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logout();
              }}
              className="flex items-center gap-2 text-sophisticated-text/40 hover:text-red-400 transition-colors text-[10px] uppercase tracking-[0.2em] font-bold cursor-pointer pointer-events-auto bg-transparent border-none py-2"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              login();
            }}
            className="group flex items-center gap-3 px-6 py-2.5 border border-gold/30 hover:border-gold hover:bg-gold/5 transition-all text-[10px] uppercase tracking-[0.3em] font-bold text-gold cursor-pointer pointer-events-auto bg-transparent"
          >
            <LogIn size={14} className="group-hover:translate-x-0.5 transition-transform" />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
