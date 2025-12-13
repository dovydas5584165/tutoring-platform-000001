import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => {
  return (
    <button
      {...props}
      className={`px-6 py-3 bg-[#3B65CE] text-white rounded-xl font-semibold hover:bg-blue-700 transition transform hover:scale-105 ${className}`}
    >
      {children}
    </button>
  );
};
