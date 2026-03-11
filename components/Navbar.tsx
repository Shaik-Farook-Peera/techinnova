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
      setScrolled(window.scrollY > 20);

      if (pathname === "/") {
        const scrollPosition = window.scrollY + 120;

        if (scrollPosition < 500) {
          setActiveSection("home");
          return;
        }

        const allSpyItems = [...navItems, ...moreItems];
        for (const item of allSpyItems) {
          const element = document.getElementById(item.id);
          if (element) {
            const offsetTop = element.offsetTop - 100;
            const offsetBottom = offsetTop + element.offsetHeight;

            if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
              setActiveSection(item.id);
              break;
            }
          }
        }
      } else {
        setActiveSection(pathname.replace("/", ""));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems, moreItems, pathname]);

  const handleNavClick = (id: string, href?: string) => {
    setOpen(false);

    if (href && !href.startsWith('/#') && href.startsWith('/')) {
      router.push(href);
      return;
    }

    if (pathname === "/") {
      const section = document.getElementById(id);
      if (section) window.scrollTo({ top: section.offsetTop - 80, behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-[300] transition-all duration-300 border-b ${scrolled || pathname !== "/" || open
        ? "bg-background/95 backdrop-blur-md border-border-bright py-3"
        : "bg-transparent border-transparent py-4"
      }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">

        {/* BRAND */}
        <div className="flex items-center gap-4">
          <button onClick={() => handleNavClick('home')} className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-all">
              <Terminal size={20} className="text-primary" />
            </div>
            <div className="flex items-center text-sm">
              <span className="font-bold text-foreground group-hover:text-white transition-colors uppercase tracking-tight">IIC_BEC</span>
              <span className="mx-2 text-text-dim">/</span>
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tighter uppercase text-base">TECHINNOVA</span>
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

          {/* DROPDOWN */}
          {moreItems.length > 0 && (
            <div className="relative group ml-1">
              <button className={`flex items-center gap-1 px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${moreItems.some(item => activeSection === item.id) ? "text-primary bg-primary/10" : "text-text-muted hover:text-white hover:bg-white/5"
                }`}>
                Resources <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-border-dim rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-[250]">
                {moreItems.map((item: any) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.id, item.href)}
                    className={`w-full text-left flex items-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors
                      ${activeSection === item.id ? 'text-primary bg-primary/15' : 'text-text-muted hover:bg-white/5 hover:text-primary'}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-4 w-[1px] bg-border-dim mx-4" />

          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(192, 132, 252, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-2.5 text-[10px] font-black bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white rounded-lg transition-all uppercase tracking-[.2em] shadow-lg"
            >
              Portal Login
            </motion.button>
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-text-muted hover:text-white transition-colors">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 top-[64px] bg-background flex flex-col z-[190] lg:hidden p-6 space-y-4"
          >
            <MobileNavItem onClick={() => handleNavClick('home')} active={activeSection === 'home'}>Home</MobileNavItem>
            {navItems.map((item) => (
              <MobileNavItem key={item.id} onClick={() => handleNavClick(item.id)} active={activeSection === item.id}>
                {item.name}
              </MobileNavItem>
            ))}
            <Link href="/about" onClick={() => setOpen(false)} className="w-full">
              <MobileNavItem active={pathname === "/about"}>About</MobileNavItem>
            </Link>

            {moreItems.length > 0 && (
              <div className="pt-6 border-t border-border-dim space-y-2">
                <p className="px-4 text-[9px] font-black text-text-dim uppercase tracking-widest">Resources</p>
                {moreItems.map((item: any) => (
                  <MobileNavItem key={item.name} onClick={() => handleNavClick(item.id, item.href)} active={activeSection === item.id}>
                    {item.name}
                  </MobileNavItem>
                ))}
              </div>
            )}

            <Link href="/register" onClick={() => setOpen(false)} className="pt-6">
              <button className="w-full py-5 bg-gradient-to-r from-primary to-accent text-white font-black rounded-xl uppercase tracking-[.3em] text-[10px] shadow-2xl shadow-primary/20">
                Join Event
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
      className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all relative group/item ${active
          ? "text-white bg-primary/10"
          : "text-text-muted hover:text-white hover:bg-white/5"
        }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full shadow-[0_0_10px_#c084fc]"
        />
      )}
    </button>
  );
}

function MobileNavItem({ children, onClick, active }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${active ? "text-primary bg-primary/10 border-l-2 border-primary" : "text-text-muted hover:bg-white/5"
        }`}
    >
      {children}
    </button>
  );
}
