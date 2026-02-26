"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaShieldHalved,
    FaHandHoldingHeart,
    FaBitcoin,
    FaArrowsRotate,
    FaBell,
    FaEyeSlash,
    FaLock,
    FaFingerprint,
    FaKey,
    FaChevronDown,
    FaQuoteLeft,
    FaStar,
    FaMobileScreen,
    FaDesktop,
} from "react-icons/fa6";
import DemoImg from "@/public/demo-img.png";
import HeroImg from "@/public/hero-img.png";

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   REUSABLE: useGsapReveal — apply scroll-reveal to child elements
   ============================================================ */
function useGsapReveal(
    containerRef: React.RefObject<HTMLElement | null>,
    selector: string,
    options?: { stagger?: number; y?: number; x?: number; scale?: number; duration?: number; start?: string }
) {
    useEffect(() => {
        const ctx = gsap.context(() => {
            const els = containerRef.current?.querySelectorAll(selector);
            if (!els || els.length === 0) return;

            gsap.fromTo(
                els,
                {
                    opacity: 0,
                    y: options?.y ?? 60,
                    x: options?.x ?? 0,
                    scale: options?.scale ?? 1,
                },
                {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    scale: 1,
                    duration: options?.duration ?? 0.8,
                    stagger: options?.stagger ?? 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: options?.start ?? "top 85%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
        return () => ctx.revert();
    }, [containerRef, selector, options]);
}

/* ===========================================================
   SECTION 1: TRUSTED BY MARQUEE
   =========================================================== */

function TrustedBySection() {
    const marqueeRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Fade in the whole section
            gsap.fromTo(
                sectionRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 90%",
                        toggleActions: "play none none reverse",
                    },
                }
            );

            // Marquee scroll
            const marquee = marqueeRef.current;
            if (!marquee) return;
            gsap.to(marquee, {
                xPercent: -50,
                ease: "none",
                duration: 25,
                repeat: -1,
            });
        });
        return () => ctx.revert();
    }, []);

    const logos = [
        "TechCrunch",
        "Forbes",
        "Wired",
        "The Verge",
        "Product Hunt",
        "Y Combinator",
        "Bloomberg",
        "Fast Company",
    ];

    return (
        <section
            ref={sectionRef}
            className="py-16 border-y border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50/50 dark:bg-gray-900/30 opacity-0"
        >
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-10">
                Featured & Trusted By
            </p>
            <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 dark:from-gray-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 dark:from-gray-950 to-transparent z-10 pointer-events-none" />
                <div ref={marqueeRef} className="flex gap-20 whitespace-nowrap w-max">
                    {[...logos, ...logos].map((name, i) => (
                        <div key={i} className="flex items-center justify-center px-6 py-3">
                            <span className="text-2xl font-black text-gray-300 dark:text-gray-700 tracking-tight select-none">
                                {name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ===========================================================
   SECTION 2: APP SHOWCASE — Split with mockup slots
   =========================================================== */

function AppShowcaseSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Mockup: slide in + scale
            gsap.fromTo(
                ".showcase-mockup",
                { opacity: 0, y: 80, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        toggleActions: "play none none reverse",
                    },
                }
            );

            // Text content slides in
            gsap.fromTo(
                ".showcase-text",
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                        toggleActions: "play none none reverse",
                    },
                }
            );

            // Phone mockup floats in from right
            gsap.fromTo(
                ".showcase-phone",
                { opacity: 0, x: 60, rotate: 6 },
                {
                    opacity: 1,
                    x: 0,
                    rotate: 0,
                    duration: 1,
                    delay: 0.3,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 65%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 lg:py-32 px-5">
            <div className="max-w-7xl mx-auto">
                {/* Section header */}
                <div className="showcase-text opacity-0 text-center mb-16">
                    <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-[0.2em] mb-4">
                        Beautiful & Powerful
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
                        See it in action
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        A dashboard designed for clarity. Organize your secrets in one
                        stunning, encrypted interface.
                    </p>
                </div>

                {/* Desktop + Phone mockup layout */}
                <div className="relative flex items-end justify-center gap-0">
                    {/* Desktop mockup */}
                    <div className="showcase-mockup opacity-0 w-full max-w-5xl">
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl shadow-black/10 dark:shadow-black/30 bg-gray-100 dark:bg-gray-800">
                            {/* Browser bar */}
                            <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="bg-white dark:bg-gray-900 rounded-lg px-4 py-1 text-xs text-gray-400 font-mono w-52 text-center flex items-center justify-center gap-2">
                                        <FaLock className="text-green-500 text-[8px]" />
                                        nockslock.com
                                    </div>
                                </div>
                            </div>
                            {/* Screenshot slot — replace with your mockup */}
                            <div className="relative">
                                <Image
                                    src={DemoImg}
                                    alt="Nockslock Dashboard"
                                    className="w-full h-auto"
                                    placeholder="blur"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Phone mockup — overlapping */}
                    <div className="showcase-phone opacity-0 hidden lg:block absolute -right-4 xl:right-8 bottom-0 w-56 xl:w-64 z-20">
                        <div className="bg-gray-900 rounded-[2rem] p-2 shadow-2xl shadow-black/30 border border-gray-700">
                            {/* Phone notch */}
                            <div className="relative rounded-[1.5rem] overflow-hidden bg-gray-800">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-10" />
                                {/* Phone screen — replace with your mobile mockup */}
                                <Image
                                    src={HeroImg}
                                    alt="Nockslock Mobile View"
                                    className="w-full h-auto"
                                    placeholder="blur"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ===========================================================
   SECTION 3: FEATURES BENTO GRID
   =========================================================== */

const features = [
    {
        title: "Military-Grade Vault",
        desc: "AES-256 bit encryption for unlimited passwords, cards, and secure notes.",
        icon: FaShieldHalved,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "hover:border-blue-200 dark:hover:border-blue-800",
        span: "md:col-span-2 md:row-span-2",
        big: true,
    },
    {
        title: "Digital Inheritance",
        desc: "Next of Kin access for your digital legacy.",
        icon: FaHandHoldingHeart,
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        border: "hover:border-rose-200 dark:hover:border-rose-800",
        span: "",
        big: false,
    },
    {
        title: "Crypto Wallet Storage",
        desc: "Encrypted seed phrases and private keys.",
        icon: FaBitcoin,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "hover:border-amber-200 dark:hover:border-amber-800",
        span: "",
        big: false,
    },
    {
        title: "Cross-Platform",
        desc: "Seamless, encrypted sync across all your devices.",
        icon: FaArrowsRotate,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "hover:border-emerald-200 dark:hover:border-emerald-800",
        span: "",
        big: false,
    },
    {
        title: "Breach Alerts",
        desc: "Instant notifications for compromised credentials.",
        icon: FaBell,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        border: "hover:border-orange-200 dark:hover:border-orange-800",
        span: "",
        big: false,
    },
    {
        title: "Zero-Knowledge",
        desc: "We never see your data. Your key, your control.",
        icon: FaEyeSlash,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "hover:border-purple-200 dark:hover:border-purple-800",
        span: "md:col-span-2",
        big: false,
    },
];

function FeaturesSection() {
    const gridRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header reveal
            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                }
            );

            // Cards: staggered from bottom with scale
            const cards = gridRef.current?.querySelectorAll(".feature-card");
            if (!cards) return;
            gsap.fromTo(
                cards,
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.08,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: gridRef.current,
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <section
            id="features"
            className="py-20 lg:py-32 px-5 bg-gray-50/50 dark:bg-gray-900/30 scroll-mt-24"
        >
            <div className="max-w-7xl mx-auto">
                <div ref={headerRef} className="text-center mb-16 opacity-0">
                    <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-[0.2em] mb-4">
                        Features
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                        Everything you need to stay safe
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
                        More than a password manager — a complete digital security platform.
                    </p>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className={`feature-card group p-7 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 ${f.border} shadow-sm hover:shadow-xl transition-all duration-300 cursor-default flex flex-col ${f.span}`}
                        >
                            <div
                                className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                            >
                                <f.icon className={`text-lg ${f.color}`} />
                            </div>
                            <h4 className={`font-bold text-gray-900 dark:text-white mb-2 ${f.big ? "text-2xl" : "text-lg"}`}>
                                {f.title}
                            </h4>
                            <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${f.big ? "text-base" : "text-sm"}`}>
                                {f.desc}
                            </p>
                            {/* Image slot for bigger cards */}
                            {f.big && (
                                <div className="mt-auto pt-6">
                                    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <Image
                                            src={DemoImg}
                                            alt={`${f.title} preview`}
                                            className="w-full h-auto"
                                            placeholder="blur"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ===========================================================
   SECTION 4: SECURITY DEEP-DIVE
   =========================================================== */

function SecuritySection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".sec-visual",
                { opacity: 0, x: -80, rotate: -3 },
                {
                    opacity: 1,
                    x: 0,
                    rotate: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
            gsap.fromTo(
                ".sec-content",
                { opacity: 0, x: 80 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
            // Stagger the detail cards
            gsap.fromTo(
                ".sec-detail-card",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".sec-detail-card",
                        start: "top 90%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
        return () => ctx.revert();
    }, []);

    const details = [
        { icon: FaLock, title: "AES-256 Encryption", desc: "Government and bank-grade standard." },
        { icon: FaEyeSlash, title: "Zero-Knowledge", desc: "Encrypted before it hits our servers." },
        { icon: FaFingerprint, title: "Biometric Auth", desc: "Face ID and fingerprint unlock." },
        { icon: FaKey, title: "End-to-End", desc: "Only you hold the decryption key." },
    ];

    return (
        <section id="security" ref={sectionRef} className="py-20 lg:py-32 px-5 scroll-mt-24 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    {/* Left: Visual with mockup slot */}
                    <div className="sec-visual opacity-0">
                        <div className="relative">
                            <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/15 to-indigo-500/15 rounded-[2rem] blur-2xl pointer-events-none" />
                            <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 rounded-3xl p-8 md:p-10 border border-gray-800 overflow-hidden">
                                {/* Grid pattern */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

                                {/* Floating shield */}
                                <div className="relative z-10 flex flex-col items-center py-6">
                                    <motion.div
                                        animate={{ y: [0, -12, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                                            <FaShieldHalved className="text-4xl text-blue-400" />
                                        </div>
                                    </motion.div>

                                    {/* Mockup slot inside security card */}
                                    <div className="w-full rounded-xl overflow-hidden border border-gray-700/50 shadow-inner mt-4">
                                        <Image
                                            src={HeroImg}
                                            alt="Encrypted vault view"
                                            className="w-full h-auto opacity-60"
                                            placeholder="blur"
                                        />
                                    </div>

                                    <div className="mt-6 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-emerald-400 text-xs font-bold font-mono tracking-wider">
                                            256-BIT ENCRYPTION ACTIVE
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="sec-content opacity-0">
                        <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-[0.2em] mb-4">
                            Security First
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
                            Built for{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                paranoid
                            </span>{" "}
                            people
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg leading-relaxed">
                            We built Nockslock because existing solutions weren&apos;t secure enough
                            for our own families. Every byte is encrypted before it leaves your
                            device.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {details.map((d) => (
                                <div
                                    key={d.title}
                                    className="sec-detail-card flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <d.icon className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{d.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{d.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ===========================================================
   SECTION 5: HOW IT WORKS — with mockup slots
   =========================================================== */

const steps = [
    {
        number: "01",
        title: "Create Your Vault",
        desc: "Sign up and set a master password. This single key encrypts everything — we never see it.",
        color: "from-blue-500 to-indigo-500",
        img: HeroImg,
    },
    {
        number: "02",
        title: "Add & Encrypt Assets",
        desc: "Store passwords, files, seed phrases, and notes. Everything encrypted with AES-256 on your device.",
        color: "from-emerald-500 to-teal-500",
        img: DemoImg,
    },
    {
        number: "03",
        title: "Set Up Next of Kin",
        desc: "Designate a trusted person to inherit vault access. Your digital legacy, protected forever.",
        color: "from-rose-500 to-pink-500",
        img: HeroImg,
    },
];

function HowItWorksSection() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header
            gsap.fromTo(
                ".hiw-header",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".hiw-header",
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                }
            );

            // Each step row slides in alternately
            const rows = sectionRef.current?.querySelectorAll(".step-row");
            rows?.forEach((row, i) => {
                const fromX = i % 2 === 0 ? -60 : 60;
                gsap.fromTo(
                    row,
                    { opacity: 0, x: fromX, y: 30 },
                    {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        duration: 0.9,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: row,
                            start: "top 80%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            });
        });
        return () => ctx.revert();
    }, []);

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            className="py-20 lg:py-32 px-5 bg-gray-50/50 dark:bg-gray-900/30 scroll-mt-24 overflow-hidden"
        >
            <div className="max-w-6xl mx-auto">
                <div className="hiw-header text-center mb-20 opacity-0">
                    <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-[0.2em] mb-4">
                        How It Works
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                        Secured in{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            3 easy steps
                        </span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
                        From sign-up to fully secured in under 5 minutes.
                    </p>
                </div>

                <div className="space-y-16 lg:space-y-24">
                    {steps.map((step, i) => (
                        <div
                            key={step.number}
                            className={`step-row opacity-0 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${i % 2 !== 0 ? "lg:direction-rtl" : ""
                                }`}
                        >
                            {/* Text side */}
                            <div className={`${i % 2 !== 0 ? "lg:order-2" : ""}`}>
                                <div
                                    className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} items-center justify-center shadow-lg mb-5`}
                                >
                                    <span className="text-white font-black text-lg">{step.number}</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg max-w-md">
                                    {step.desc}
                                </p>
                            </div>

                            {/* Mockup slot */}
                            <div className={`${i % 2 !== 0 ? "lg:order-1" : ""}`}>
                                <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl shadow-black/5 dark:shadow-black/20 bg-white dark:bg-gray-800">
                                    <Image
                                        src={step.img}
                                        alt={step.title}
                                        className="w-full h-auto"
                                        placeholder="blur"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ===========================================================
   SECTION 6: TESTIMONIALS
   =========================================================== */

const testimonials = [
    {
        quote:
            "Nockslock is the first security app I actually enjoy using. The interface is stunning and the peace of mind is priceless.",
        name: "Sarah Chen",
        role: "Product Designer",
        stars: 5,
    },
    {
        quote:
            "Finally a place to store my seed phrases without paranoia. The Next of Kin feature is genius — my family is protected.",
        name: "Marcus Johnson",
        role: "Crypto Investor",
        stars: 5,
    },
    {
        quote:
            "We switched our entire team to Nockslock. The zero-knowledge architecture gives us the compliance confidence we need.",
        name: "Elena Rodriguez",
        role: "CTO, Finstack",
        stars: 5,
    },
];

function TestimonialsSection() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".test-header",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".test-header",
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                }
            );

            const cards = sectionRef.current?.querySelectorAll(".testimonial-card");
            if (!cards) return;
            gsap.fromTo(
                cards,
                { opacity: 0, y: 40, scale: 0.92, rotate: -1 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotate: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <section className="py-20 lg:py-32 px-5 overflow-hidden">
            <div className="max-w-7xl mx-auto" ref={sectionRef}>
                <div className="test-header text-center mb-16 opacity-0">
                    <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-[0.2em] mb-4">
                        Testimonials
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                        Loved by thousands
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
                        See what our users have to say about Nockslock.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t) => (
                        <div
                            key={t.name}
                            className="testimonial-card p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <FaQuoteLeft className="text-2xl text-blue-100 dark:text-blue-900/50 mb-5" />
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-[15px]">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-1 mb-4">
                                {Array.from({ length: t.stars }).map((_, i) => (
                                    <FaStar key={i} className="text-amber-400 text-sm" />
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                                    <p className="text-xs text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ===========================================================
   SECTION 7: STATS
   =========================================================== */

function StatsSection() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Fade in whole section
            gsap.fromTo(
                sectionRef.current,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                    },
                }
            );

            // Animate each stat
            const statEls = sectionRef.current?.querySelectorAll(".stat-block");
            if (statEls) {
                gsap.fromTo(
                    statEls,
                    { opacity: 0, y: 30, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "back.out(1.7)",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top 75%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            }

            // Counter animation
            const counters = sectionRef.current?.querySelectorAll(".stat-num");
            counters?.forEach((el) => {
                const target = parseInt(el.getAttribute("data-target") || "0", 10);
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: "power1.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none reset",
                    },
                    onUpdate: () => {
                        (el as HTMLElement).textContent = Math.round(obj.val).toLocaleString();
                    },
                });
            });
        });
        return () => ctx.revert();
    }, []);

    const stats = [
        { number: 10000, suffix: "+", label: "Active Users" },
        { number: 1, suffix: "M+", label: "Items Secured" },
        { number: 50, suffix: "+", label: "Countries" },
        { number: 99, suffix: ".9%", label: "Uptime" },
    ];

    return (
        <section
            ref={sectionRef}
            className="py-20 lg:py-28 px-5 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 relative overflow-hidden opacity-0"
        >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((s) => (
                        <div key={s.label} className="stat-block text-center">
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span
                                    className="stat-num text-4xl md:text-5xl lg:text-6xl font-black text-white"
                                    data-target={s.number}
                                >
                                    0
                                </span>
                                <span className="text-2xl md:text-3xl font-black text-blue-400">
                                    {s.suffix}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ===========================================================
   SECTION 8: FAQ
   =========================================================== */

const faqs = [
    {
        q: "How does Nockslock encryption work?",
        a: "All data is encrypted with AES-256 on your device before transmission. Your master password never leaves your device — we use zero-knowledge architecture.",
    },
    {
        q: "What is the Next of Kin feature?",
        a: "Designate a trusted person who can request access to your vault. Your digital assets — passwords, crypto keys, files — get passed on securely to loved ones.",
    },
    {
        q: "Is my data really private?",
        a: "Absolutely. Zero-knowledge architecture means your data is encrypted before it reaches our servers. We physically cannot read your data.",
    },
    {
        q: "Can I access my vault offline?",
        a: "Yes. Your vault is cached locally in an encrypted state. Access your saved items even without an internet connection.",
    },
    {
        q: "What happens if I forget my master password?",
        a: "Due to zero-knowledge design, we cannot reset your master password. We recommend storing a backup in a secure physical location.",
    },
    {
        q: "Is Nockslock free?",
        a: "Yes! Nockslock offers a generous free tier. Premium plans are available for power users with extended storage and priority support.",
    },
];

function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".faq-header",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".faq-header",
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                }
            );

            const items = sectionRef.current?.querySelectorAll(".faq-item");
            if (!items) return;
            gsap.fromTo(
                items,
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <section className="py-20 lg:py-32 px-5 bg-gray-50/50 dark:bg-gray-900/30">
            <div className="max-w-3xl mx-auto" ref={sectionRef}>
                <div className="faq-header text-center mb-16 opacity-0">
                    <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-[0.2em] mb-4">
                        FAQ
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                        Questions? Answered.
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Everything you need to know about Nockslock.
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="faq-item bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="flex items-center justify-between w-full p-6 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/80 transition-colors"
                            >
                                <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                                <FaChevronDown
                                    className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            <AnimatePresence initial={false}>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ===========================================================
   SECTION 9: CTA BANNER
   =========================================================== */

function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".cta-card",
                { opacity: 0, y: 50, scale: 0.97 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.9,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <section id="contact" ref={sectionRef} className="py-20 lg:py-32 px-5 scroll-mt-24">
            <div className="max-w-7xl mx-auto">
                <div className="cta-card opacity-0 relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 px-8 py-20 md:px-20 shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-15 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-10 pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                            Ready to secure your{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                digital legacy?
                            </span>
                        </h2>
                        <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
                            Join thousands who sleep better knowing their passwords, crypto, and
                            files are under lock and key.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register">
                                <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50 hover:shadow-blue-800/60 text-base hover:-translate-y-0.5">
                                    Get Started — It&apos;s Free
                                </button>
                            </Link>
                            <Link href="/#features">
                                <button className="px-8 py-4 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-bold rounded-xl transition-all text-base hover:-translate-y-0.5">
                                    Explore Features
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ===========================================================
   MAIN EXPORT
   =========================================================== */

export default function LandingSections() {
    return (
        <>
            <TrustedBySection />
            <AppShowcaseSection />
            <FeaturesSection />
            <SecuritySection />
            <HowItWorksSection />
            <TestimonialsSection />
            <StatsSection />
            <FAQSection />
            <CTASection />
        </>
    );
}
