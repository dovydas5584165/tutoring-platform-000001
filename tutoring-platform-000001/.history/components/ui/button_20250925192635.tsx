import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => {
  return (
    <button
      {...props}
      className={`px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition transform hover:scale-105 ${className}`}
    >
      {children}
    </button>
  );
};
