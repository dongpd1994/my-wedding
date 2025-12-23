"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

interface HorizontalTextProps {
  text: string;
  className?: string;
  wrapperClassName?: string;
  scrollDistance?: string; // e.g., "+=5000px"
}

export default function HorizontalText({
  text,
  className = "",
  wrapperClassName = "",
  scrollDistance = "+=5000px",
}: HorizontalTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !textRef.current) return;

    const wrapper = wrapperRef.current;
    const textElement = textRef.current;

    const ctx = gsap.context(() => {
      // Split text thành chars và words
      const split = new GSAPSplitText(textElement, {
        type: "chars, words"
      });

      // Horizontal scroll animation - pin wrapper và scroll text sang trái
      const scrollTween = gsap.to(textElement, {
        xPercent: -100,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          pin: true,
          end: scrollDistance,
          scrub: true,
        },
      });

      // Animate từng char bay vào khi scroll
      if (split.chars) {
        split.chars.forEach((char) => {
          gsap.from(char, {
            yPercent: "random(-200, 200)",
            rotation: "random(-20, 20)",
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: char,
              containerAnimation: scrollTween, // Quan trọng: animation trong animation
              start: "left 100%",
              end: "left 30%",
              scrub: 1,
            },
          });
        });
      }
    }, wrapper);

    return () => ctx.revert();
  }, [text, scrollDistance]);

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden ${wrapperClassName}`}
    >
      <div
        ref={textRef}
        className={`whitespace-nowrap ${className}`}
      >
        {text}
      </div>
    </div>
  );
}
