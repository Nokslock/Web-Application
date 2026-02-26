"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BgImg from "@/public/hero-img.png";
import NavBar from "@/components/NavBar";
import AuthButton from "@/components/AuthButton";
import LandingSections from "@/components/LandingSections";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.3"
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3"
        )
        .fromTo(
          imageRef.current,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1 },
          "-=0.6"
        );

      // Parallax on hero image
      gsap.to(imageRef.current, {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
      <NavBar />

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative w-full min-h-screen flex items-center pt-24 pb-16 lg:pt-32 lg:pb-24 px-5 lg:px-8 overflow-hidden"
      >
        {/* Background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div ref={badgeRef} className="mb-6 opacity-0">
              <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800/50">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Now in v1.0 — Free to get started
              </span>
            </div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.05] max-w-5xl opacity-0"
            >
              Your digital life,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                secured forever.
              </span>
            </h1>

            {/* Subheadline */}
            <p
              ref={subRef}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed opacity-0"
            >
              Nockslock is your all-in-one vault for passwords, crypto keys,
              files, and digital inheritance. Bank-grade encryption meets
              stunning simplicity.
            </p>

            {/* CTAs */}
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row gap-4 mb-6 opacity-0"
            >
              <Link href="/register">
                <AuthButton
                  variant="dark"
                  type="button"
                  className="shadow-lg shadow-blue-900/20 hover:shadow-xl transition-all px-8 py-4 text-base"
                >
                  Get Started — It&apos;s Free
                </AuthButton>
              </Link>
              <Link href="/#how-it-works">
                <button className="px-8 py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-base">
                  See How It Works
                </button>
              </Link>
            </div>

            <p className="text-sm text-gray-400 dark:text-gray-500 mb-12 opacity-0" ref={ctaRef}>
              Trusted by 10,000+ users • No credit card required
            </p>

            {/* Hero Image */}
            <div ref={imageRef} className="w-full max-w-6xl mx-auto opacity-0">
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl shadow-black/10 dark:shadow-black/30">
                {/* Browser chrome bar */}
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white dark:bg-gray-900 rounded-lg px-4 py-1 text-xs text-gray-400 font-mono w-64 text-center">
                      nockslock.com/dashboard
                    </div>
                  </div>
                </div>
                <Image
                  src={BgImg}
                  alt="Nockslock Dashboard Preview"
                  priority
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingSections />
      <Footer />
    </div>
  );
}
