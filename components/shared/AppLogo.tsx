'use client'
import React from "react";
import { cn } from "@/lib/utils";

import { APP_NAME } from "@/lib/constants";
import { Beef } from "lucide-react";

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
  text = APP_NAME,
  icon,
  variant = "default",
  color = "#111827",
  size = 32,
  onClick,
  classNames,
  fontWeight = "font-black",
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
            <Beef className="w-full h-full" />
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
