// components/Card.tsx
import Image from "next/image";
import React from "react";

type CardProps = {
  image: string;
  title: string;
  description: string;
  color: string;
  children: React.ReactNode;
};
export default function Card({
  image,
  title,
  description,
  color,
  children,
}: CardProps) {
  const dynamicBgClass = `${color}`;
  return (
    <div
      className={`flex-auto w-1/4 m-4  justify-between items-center ${dynamicBgClass}`}
    >
      <div className="mt-2.5">
        <Image
          src={image}
          alt={title}
          width={400}
          height={400}
          className="w-full h-48 object-contain rounded-t-lg mb-4"
        />
      </div>
      <div className="justify-between p-4 ">
        {title && (
          <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
        )}
        {description && <p className="mb-4 ">{description}</p>}
        <div className="rounded p-4 bg-cyan-950">{children}</div>
      </div>
    </div>
  );
}
