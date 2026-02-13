import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import {
  FaXTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa6";

const footerLinks = {
  Product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Security", href: "/#security" },
    { name: "Changelog", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "#" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "GDPR", href: "#" },
  ],
};

const socials = [
  { icon: FaXTwitter, href: "#", label: "X (Twitter)" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
  { icon: FaGithub, href: "#", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={Logo}
                alt="Nockslock Logo"
                width={160}
                className="brightness-0 invert"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-6">
              The all-in-one vault for your passwords, crypto keys, and digital
              inheritance. Bank-grade security, beautifully simple.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <s.icon size={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Nockslock. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
