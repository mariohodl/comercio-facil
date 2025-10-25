'use client'
import React from "react";
import { cn } from "@/lib/utils";

export type LogoVariant = "default" | "textOnly" | "iconOnly" | "stacked";

interface LogoProps {
  text?: string;
  icon?: React.ReactNode;
  variant?: LogoVariant;
  color?: string;
  size?: number | string;
  onClick?: () => void;
  classNames?: string;
  fontWeight?: string;
}

export const AppLogo: React.FC<LogoProps> = ({
  text = "AppLogo",
  icon,
  variant = "default",
  color = "#111827",
  size = 40,
  onClick,
  classNames,
  fontWeight = "font-bold",
}) => {
  const iconSize =
    typeof size === "number" ? `${size}px` : size || "2.5rem";

  const textStyle = {
    color,
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center cursor-pointer select-none",
        variant === "stacked" && "flex-col",
        classNames
      )}
    >
      {variant !== "textOnly" && (
        <div
          style={{ width: iconSize, height: iconSize, color }}
          className="flex items-center justify-center"
        >
          {icon || (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8a8.009 8.009 0 0 1-8 8z" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          )}
        </div>
      )}

      {variant !== "iconOnly" && (
        <span
          style={textStyle}
          className={cn("ml-2 text-xl tracking-tight", fontWeight)}
        >
          {text}
        </span>
      )}
    </div>
  );
};
