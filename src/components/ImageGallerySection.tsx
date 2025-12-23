"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HorizontalText from "./lib/HorizontalText";

gsap.registerPlugin(ScrollTrigger);

const IMAGES = [
  "/3I7A5209.jpg",
  "/3I7A5323.jpg",
  "/DongHai.41029.jpg",
  "/DongHai.40867.jpg",
  "/DongHai.41149.jpg",
];

const LOREM_TEXT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

export default function ImageGallerySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !imagesRef.current) return;

    const ctx = gsap.context(() => {
      const imageElements = imagesRef.current?.querySelectorAll(".gallery-image");

      if (imageElements) {
        imageElements.forEach((img, index) => {
          // Fade in từng ảnh khi scroll
          gsap.fromTo(
            img,
            {
              opacity: 0,
              scale: 0.8,
            },
            {
              opacity: 1,
              scale: 1,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: img,
                start: "top 80%",
                end: "top 30%",
                scrub: 1,
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#F6F0D7] z-[100]"
      style={{ minHeight: "500vh" }}
    >
      {/* Container với 2 cột */}
      <div className="flex h-screen sticky top-0 z-[100]">
        {/* Cột trái - Horizontal Text (cố định) */}
        <div className="w-1/2 flex items-center justify-center bg-[#E8DFC4]">
          <HorizontalText
            text={LOREM_TEXT}
            className="text-6xl font-bold text-gray-800"
            wrapperClassName="w-full h-full"
            scrollDistance="+=8000px"
          />
        </div>

        {/* Cột phải - Images scroll */}
        <div
          ref={imagesRef}
          className="w-1/2 overflow-y-auto bg-[#F6F0D7]"
          style={{ height: "100vh" }}
        >
          <div className="space-y-8 p-8">
            {IMAGES.map((src, index) => (
              <div
                key={index}
                className="gallery-image w-full h-[80vh] relative"
              >
                <img
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg shadow-2xl"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
