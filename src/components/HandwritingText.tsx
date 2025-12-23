"use client";

import { useEffect, useRef, useState } from "react";

interface HandwritingTextProps {
  text: string;
  className?: string;
}

export default function HandwritingText({
  text,
  className = "",
}: HandwritingTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Trigger animation khi component mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <span
      className={`inline-block relative ${className}`}
      style={{
        fontFamily: "FzManchesterSignature, cursive",
        lineHeight: "2.5",
        paddingTop: "0.5em",
        paddingBottom: "0.5em",
        overflow: "visible",
      }}
    >
      <span
        ref={textRef}
        style={{
          clipPath: isVisible ? "inset(-10% 0% -10% 0)" : "inset(-10% 100% -10% 0)",
          transition: "clip-path 2.5s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "inline-block",
          lineHeight: "2.5",
        }}
      >
        {text}
      </span>
    </span>
  );
}
