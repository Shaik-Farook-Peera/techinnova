"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, Terminal } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [navItems, setNavItems] = useState<any[]>([]);
  const [moreItems, setMoreItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNav() {
      const { data } = await supabase.from('site_config').select('nav_items, more_items').single();
      if (data) {
        const filteredNav = (data.nav_items || []).filter(
          (item: any) => item.id !== 'about' && item.id !== 'home'
        );
        setNavItems(filteredNav);
        setMoreItems(data.more_items || []);
      }
    }
    fetchNav();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 20);
      
      if (pathname === "/") {
        // Nav Spy Logic for home page
        // Default to home if at top
        if (scrollPosition < 500) {
          setActiveSection("home");
          return;
        }
        
        // Check sections for primary and dropdown items
        const allSpyItems = [...navItems, ...moreItems];
        for (const item of allSpyItems) {
          const element = document.getElementById(item.id);
          if (element) {
            const offsetTop = element.offsetTop - 100;
            const offsetBottom = offsetTop + element.offsetHeight;
            
            if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
              setActiveSection(item.id); // As soon as this becomes 'tracks', the navbar turns black
              break;
            }
          }
        }
      } else {
        // If on /about or /register, set active based on pathname
        setActiveSection(pathname.replace("/", ""));
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Run on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems, moreItems, pathname]);

  const handleNavClick = (id: string, href?: string) => {
    setOpen(false);
    
    if (href && !href.startsWith('/#') && href.startsWith('/')) {
      router.push(href);
      return;
    }

    // If clicking "home", always go to home page
    if (id === 'home') {
      router.push('/');
      return;
    }

    if (pathname === "/") {
      // Already on home page - scroll to section
      const section = document.getElementById(id);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      // On other pages (about, gallery, faq, etc) - navigate to home, then scroll
      router.push('/', undefined);
      
      // Longer delay to ensure page renders and sections are available
      const scrollTimeout = setTimeout(() => {
        const section = document.getElementById(id);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
          clearTimeout(scrollTimeout);
        }
      }, 1000);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-[200] transition-all duration-300 border-b 
      ${pathname === "/" && !scrolled && activeSection === "home"
        ? "bg-transparent border-transparent py-4"  
        : scrolled || activeSection !== "home" || pathname !== "/"
        ? "bg-[#0f1419] border-[#30363d] shadow-md py-3"  
        : "bg-transparent border-transparent py-4"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        
        {/* BRAND */}
        <div className="flex items-center gap-4">
          <button onClick={() => handleNavClick('home')} className="flex items-center gap-2 group">
            <div className="bg-[#30363d] p-1.5 rounded-md group-hover:bg-[#a371f7]/20 transition-colors">
              <Terminal size={20} className="text-[#a371f7]" />
            </div>
            <div className="flex items-center text-sm md:text-base">
              <span className="font-semibold text-[#c9d1d9] group-hover:text-white transition-colors uppercase">IIC_BEC</span>
              <span className="mx-2 text-[#484f58]">/</span>
              <span className="font-bold text-white tracking-tight uppercase">TechInnova</span>
            </div>
          </button>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-1">
          <NavItem onClick={() => handleNavClick('home')} active={activeSection === 'home'}>Home</NavItem>
          
          {navItems.map((item) => (
            <NavItem key={item.id} onClick={() => handleNavClick(item.id)} active={activeSection === item.id}>
              {item.name}
            </NavItem>
          ))}
          
          <Link href="/about">
            <NavItem active={pathname === "/about"}>About</NavItem>
          </Link>
          
          {/* PURPLE DROPDOWN */}
          {moreItems.length > 0 && (
            <div className="relative group ml-2">
              <button className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                moreItems.some(item => activeSection === item.id) ? "text-[#a371f7]" : "text-[#8b949e] hover:text-[#c9d1d9]"
              }`}>
                More <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#161b22] border border-[#30363d] rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-[250]">
                {moreItems.map((item: any) => (
                  <button 
                    key={item.name} 
                    onClick={() => handleNavClick(item.id, item.href)}
                    className={`w-full text-left flex items-center px-4 py-2 text-xs font-medium rounded-md transition-colors
                      ${activeSection === item.id ? 'text-[#a371f7] bg-[#a371f715]' : 'text-[#c9d1d9] hover:bg-[#b1bac41f] hover:text-[#a371f7]'}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-4 w-[1px] bg-[#30363d] mx-4" />
          
          {/* PURPLE REGISTER BUTTON */}
          <Link href="/register">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(163, 113, 247, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-1.5 text-sm font-semibold bg-[#a371f7] hover:bg-[#b388f9] text-white rounded-md border border-[#ffffff1a] transition-all uppercase tracking-tight"
            >
              Register
            </motion.button>
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-[#8b949e] hover:text-white transition-colors">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-[64px] bg-[#0d1117] flex flex-col z-[190] lg:hidden p-4 space-y-4"
          >
            <MobileNavItem onClick={() => handleNavClick('home')} active={activeSection === 'home'}>Home</MobileNavItem>
            {navItems.map((item) => (
              <MobileNavItem key={item.id} onClick={() => handleNavClick(item.id)} active={activeSection === item.id}>
                {item.name}
              </MobileNavItem>
            ))}
            <Link href="/about" onClick={() => setOpen(false)}>
              <MobileNavItem active={pathname === "/about"}>About</MobileNavItem>
            </Link>

            {moreItems.length > 0 && (
              <div className="pt-4 border-t border-[#30363d] space-y-2">
                <p className="px-4 text-[10px] font-bold text-[#484f58] uppercase">More Resources</p>
                {moreItems.map((item: any) => (
                  <MobileNavItem key={item.name} onClick={() => handleNavClick(item.id, item.href)} active={activeSection === item.id}>
                    {item.name}
                  </MobileNavItem>
                ))}
              </div>
            )}

            <Link href="/register" onClick={() => setOpen(false)} className="pt-4">
              <button className="w-full py-4 bg-[#a371f7] text-white font-bold rounded-md uppercase tracking-widest shadow-lg shadow-purple-900/20">
                Start Registration
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavItem({ children, onClick, active }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all relative ${
        active 
        ? "text-white bg-[#b1bac41f] after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-[2px] after:bg-[#a371f7]" 
        : "text-[#c9d1d9] hover:bg-[#b1bac41f] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function MobileNavItem({ children, onClick, active }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full text-left px-4 py-3 rounded-md text-base font-medium transition-colors ${
        active ? "text-[#a371f7] bg-[#a371f710]" : "text-[#c9d1d9] hover:bg-[#b1bac41f]"
      }`}
    >
      {children}
    </button>
  );
}
