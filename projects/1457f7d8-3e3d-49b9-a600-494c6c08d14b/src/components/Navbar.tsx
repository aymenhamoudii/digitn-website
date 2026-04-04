"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Reservations", href: "/reservations" },
    { name: "Order Online", href: "/order" },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-rustic-50/95 shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container-custom flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center">
          <span className={`font-serif text-2xl font-bold tracking-widest ${scrolled ? "text-rustic-900" : "text-rustic-50 md:text-rustic-900"}`}>
            RUSTIC TABLE
          </span>
          <span className={`text-[10px] uppercase tracking-[0.2em] font-light ${scrolled ? "text-rustic-600" : "text-rustic-100 md:text-rustic-700"}`}>
            Est. 2012
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-rustic-500 ${
                pathname === link.href 
                  ? "text-rustic-700 border-b border-rustic-700" 
                  : scrolled ? "text-rustic-800" : "text-rustic-900"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/reservations" className="btn-rustic py-2 px-4 text-xs">
            BOOK A TABLE
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between overflow-hidden">
            <span className={`w-full h-0.5 transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""} ${scrolled ? "bg-rustic-900" : "bg-rustic-900"}`}></span>
            <span className={`w-full h-0.5 transition-all duration-300 ${isOpen ? "opacity-0" : ""} ${scrolled ? "bg-rustic-900" : "bg-rustic-900"}`}></span>
            <span className={`w-full h-0.5 transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""} ${scrolled ? "bg-rustic-900" : "bg-rustic-900"}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-rustic-50 border-t border-rustic-100 transition-all duration-300 ${
          isOpen ? "max-h-screen opacity-100 py-8" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col items-center space-y-6 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-lg font-serif tracking-wide text-rustic-800"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="/reservations" 
            className="btn-rustic w-full text-center"
            onClick={() => setIsOpen(false)}
          >
            BOOK A TABLE
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
