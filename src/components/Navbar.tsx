"use client";

import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" onClick={closeMobileMenu}>
            <h1 className="text-2xl font-bold text-purple-600">EventFlow</h1>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/createevent-page"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Create Event
            </Link>
            <Link
              href="/home-page"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Browse Events {/* ⭐ NEW */}
            </Link>
            <Link
              href="/about-page"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              About
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login">
              <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Sign Up
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-purple-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {/* Mobile Navigation Links */}
              <Link
                href="/home-page" // ⭐ NEW
                className="block px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
                onClick={closeMobileMenu}
              >
                Browse Events
              </Link>
              <Link
                href="/createevent-page"
                className="block px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
                onClick={closeMobileMenu}
              >
                Create
              </Link>
              <Link
                href="/about-page"
                className="block px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
                onClick={closeMobileMenu}
              >
                About
              </Link>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 pb-2 border-t border-gray-200">
                <button
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md font-medium transition-colors mb-2"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </button>
                <button
                  className="block w-full text-left px-3 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
