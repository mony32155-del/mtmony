import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Demo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-4 bg-cyan-700">
      <Link
        href="https://mtdemo-pi.vercel.app/login"
        role="button"
        aria-label="Go to Login Page"
        className="rounded-full bg-black/10 p-2 transition-all duration-300 hover:bg-white hover:scale-105 block"
      >
        <Image
          src="/avatar.png"
          alt="User avatar, link to login page"
          width={300}
          height={300}
          className="rounded-full border-8 border-gray-700 shadow-md"
        />
      </Link>
      <h1 className="text-4xl font-normal text-white">WELCOME</h1>
    </div>
  );
}
