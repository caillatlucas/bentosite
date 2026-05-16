"use client";

import { motion } from "framer-motion";
import { 
  FaLinkedin, 
  FaGithub, 
  FaTwitter, 
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaGlobe,
  FaDiscord,
  FaPhone
} from "react-icons/fa";

interface SocialLink {
  url: string;
  enabled: boolean;
}

interface SocialConfig {
  linkedin: SocialLink;
  github: SocialLink;
  twitter: SocialLink;
  instagram: SocialLink;
  youtube: SocialLink;
  tiktok: SocialLink;
  discord: SocialLink;
  phone: SocialLink;
  customLinks: { name: string; url: string; enabled: boolean }[];
}

const defaultSocials: SocialConfig = {
  linkedin: { url: "https://linkedin.com/in/lucascaillat", enabled: true },
  github: { url: "https://github.com/lucascaillat", enabled: true },
  twitter: { url: "https://twitter.com/lucascaillat", enabled: false },
  instagram: { url: "https://instagram.com/lucascaillat", enabled: false },
  youtube: { url: "", enabled: false },
  tiktok: { url: "", enabled: false },
  discord: { url: "", enabled: false },
  phone: { url: "", enabled: false },
  customLinks: []
};

export default function Socials({ config }: { config?: SocialConfig | null }) {
  const socials = config || defaultSocials;

  const socialItems = [
    { id: "linkedin", icon: FaLinkedin, label: "LinkedIn", data: socials.linkedin },
    { id: "github", icon: FaGithub, label: "GitHub", data: socials.github },
    { id: "twitter", icon: FaTwitter, label: "Twitter", data: socials.twitter },
    { id: "instagram", icon: FaInstagram, label: "Instagram", data: socials.instagram },
    { id: "youtube", icon: FaYoutube, label: "YouTube", data: socials.youtube },
    { id: "tiktok", icon: FaTiktok, label: "TikTok", data: socials.tiktok },
    { id: "discord", icon: FaDiscord, label: "Discord", data: socials.discord },
    { id: "phone", icon: FaPhone, label: "Téléphone", data: socials.phone ? { ...socials.phone, url: socials.phone.url.startsWith('tel:') ? socials.phone.url : `tel:${socials.phone.url}` } : null },
  ];

  const customItems = (socials.customLinks || []).map(link => ({
    id: link.name,
    icon: FaGlobe,
    label: link.name,
    data: { url: link.url, enabled: link.enabled }
  }));

  const enabledItems = [...socialItems, ...customItems].filter(item => item.data?.enabled && item.data?.url);

  if (enabledItems.length === 0) return null;

  return (
    <div className="flex gap-8 md:gap-12 items-center">
      {enabledItems.map((item, index) => (
        <motion.a
          key={item.id}
          href={item.data.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group relative"
          title={item.label}
        >
          <item.icon className="text-2xl text-white/40 group-hover:text-primary-red transition-all duration-300 transform group-hover:-translate-y-1" />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-40 transition-all duration-300">
            {item.label}
          </span>
        </motion.a>
      ))}
    </div>
  );
}
