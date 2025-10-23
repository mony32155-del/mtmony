"use client";
import { useState } from "react";
import Link from "next/link";
import { X, Menu } from "lucide-react";

// Define the structure for a navigation link
interface types {
  name: string;
  link: string;
  id: number;
}

// Data for the navigation links
const nameList: types[] = [
  { name: "Home", link: "/", id: 1 },
  { name: "Gallery", link: "/pages/gallery", id: 2 },
  { name: "Demo", link: "/pages/demo", id: 3 },
  { name: "Projects", link: "/pages/projects", id: 4 },
  { name: "About", link: "/pages/about", id: 5 },
];

const NavBar: React.FC = () => {
  const [notset, setC] = useState(false);

  return (
    <nav className="bg-gray-900 shadow-xl border-b border-indigo-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex-shrink-0">
            <a
              href="#"
              className="text-2xl font-extrabold text-white tracking-wider hover:text-indigo-400 transition duration-300"
            >
              <h2>MT MONY</h2>
            </a>
          </div>

          {/* Desktop Links (Hidden on small screens) */}
          <div className="hidden sm:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {nameList.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-indigo-700 hover:text-white transition duration-200"
                >
                  {item.name}
                </Link>
              ))}
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900">
                Sign In
              </button>
            </div>
          </div>

          {/* Mobile Menu Button (Hidden on larger screens) */}
          <div className="-mr-2 flex sm:hidden">
            <button
              onClick={() => setC(!notset)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition duration-200"
              aria-controls="mobile-menu"
              aria-expanded={notset}
            >
              <span className="sr-only">Open main menu</span>
              {notset ? (
                <div className="block h-6 w-6" aria-hidden="true">
                  <X />
                </div>
              ) : (
                <div className="block h-6 w-6" aria-hidden="true">
                  <Menu />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`${
          notset ? "block" : "hidden"
        } sm:hidden transition-all duration-300 ease-out`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {nameList.map((item) => (
            <Link
              key={item.id} // Unique key for each link
              href={item.link}
              onClick={() => setC(false)} // Close menu on click
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-indigo-700 hover:text-white transition duration-200"
            >
              {item.name}
            </Link>
          ))}
          <button className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-base font-semibold transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
