"use client";

import { InputHTMLAttributes, ReactNode, useState } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  error?: boolean;
}

export function InputField({
  leftIcon,
  rightElement,
  error,
  onFocus,
  onBlur,
  style,
  ...props
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "rgba(255,68,68,0.4)"
    : focused
    ? "rgba(0,255,65,0.4)"
    : "rgba(0,255,65,0.1)";

  const boxShadow =
    focused && !error ? "0 0 0 3px rgba(0,255,65,0.1)" : "none";

  return (
    <div
      style={{
        position: "relative",
        height: 52,
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        boxShadow,
        transition: "border-color 0.18s, box-shadow 0.18s",
      }}
    >
      {leftIcon && (
        <div
          style={{
            position: "absolute",
            left: 16,
            display: "flex",
            alignItems: "center",
            color: "rgba(120,160,120,0.65)",
            pointerEvents: "none",
            flexShrink: 0,
          }}
        >
          {leftIcon}
        </div>
      )}
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          paddingLeft: leftIcon ? 48 : 16,
          paddingRight: rightElement ? 52 : 16,
          color: "rgba(255,255,255,0.9)",
          fontFamily: "Outfit, sans-serif",
          fontSize: 14,
          ...style,
        }}
      />
      {rightElement && (
        <div
          style={{
            position: "absolute",
            right: 14,
            display: "flex",
            alignItems: "center",
          }}
        >
          {rightElement}
        </div>
      )}
    </div>
  );
}


