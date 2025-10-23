import React from "react";
import Link from "next/link";

const Hero = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
      {/* <h1 className="text-4xl font-bold text-center mt-10">{children}</h1> */}
      {/* <p className="text-center mt-4 text-lg text-gray-600">
        Your gateway to seamless financial management.
      </p>
      <div className="flex justify-center mt-8">
        <Link
          href="/dashboard"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg text-lg font-semibold transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
        >
          Go to Dashboard
        </Link> */}
    </div>
  );
};

export default Hero;
