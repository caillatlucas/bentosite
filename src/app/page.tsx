"use client";

import { motion, useMotionValue, useSpring, useTransform, useScroll, useMotionTemplate, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, Zap, X, Send, User, MessageSquare, CheckCircle2, Mail, Music, Volume2, VolumeX, Copy, Check, Bell } from "lucide-react";
import Projects from "@/components/Projects";
import Socials from "@/components/Socials";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface MediaItem { id: string; url: string; name: string; }
interface Message { id: string; name: string; title: string; content: string; contact?: string; date: string; reply?: string; }

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState({ 
    profession: "Freelance informatique", 
    bio: "", 
    email: "", 
    projectsTitle: "Sélection 2024", 
    recentProjectsTitle: "Projets Récents",
    galleryTitle: "Galerie", 
    bentoGridTitle: "Bento Grid",
    heroTitleMain: "CAILLAT", 
    heroTitleSub: "Lucas", 
    textEffectImage: "",
    musicEnabled: false, 
    musicUrl: "", 
    musicCover: "" 
  });
  const [galleryMedia, setGalleryMedia] = useState<MediaItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Notification System
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [replies, setReplies] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Form State
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formContact, setFormContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [isMuted, setIsMuted] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { scrollYProgress } = useScroll();

  // Color transition - Adjusted for portrait
  const backgroundColor = useTransform(scrollYProgress, [0, 0.15], ["#ff3131", "#d3d3d3"]);
  const textColor = useTransform(scrollYProgress, [0, 0.15], ["#ffffff", "#ff3131"]);
  const secondaryTextColor = useTransform(scrollYProgress, [0, 0.15], ["rgba(255,255,255,0.7)", "rgba(17,17,17,0.6)"]);
  const adminBtnColor = useTransform(scrollYProgress, [0, 0.15], ["#ffffff", "#111111"]);
  const lucasColor = useTransform(scrollYProgress, [0, 0.15], ["#ffffff", "#ff3131"]);

  // Text Effect Image
  const hasTextImg = settings.textEffectImage && settings.textEffectImage.length > 0;
  const textBgImage = useTransform(scrollYProgress, [0, 0.15], ["none", hasTextImg ? `url(${settings.textEffectImage})` : "none"]);
  const textBgClip = useTransform(scrollYProgress, [0, 0.15], ["none", hasTextImg ? "text" : "none"]);
  const textFinalColor = useTransform(scrollYProgress, [0, 0.15], ["#ffffff", hasTextImg ? "transparent" : "#ff3131"]);

  const springConfig = { damping: 50, stiffness: 400 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);
  const textShadowX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const textShadowY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
  const shadowColor = useTransform(scrollYProgress, [0, 0.15], ["rgba(255,255,255,0.3)", "rgba(255, 49, 49, 0.2)"]);
  const textShadow = useMotionTemplate`${textShadowX}px ${textShadowY}px 40px ${shadowColor}`;

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth - 0.5);
      mouseY.set(e.clientY / innerHeight - 0.5);
    };
    fetchData();
    checkReplies();

    const msgChannel = supabase.channel('msg-realtime').on('postgres_changes', { event: '*', table: 'messages', schema: 'public' }, () => { checkReplies(); }).subscribe();
    window.addEventListener("mousemove", handleMouseMove);
    return () => { window.removeEventListener("mousemove", handleMouseMove); supabase.removeChannel(msgChannel); };
  }, [mouseX, mouseY]);

  const fetchData = async () => {
    const { data: sData } = await supabase.from('settings').select('*');
    if (sData) {
      const global = sData.find(s => s.key === 'global')?.value;
      const soc = sData.find(s => s.key === 'socials')?.value;
      if (global) setSettings(prev => ({ ...prev, ...global }));
      if (soc) setSettings(prev => ({ ...prev, email: soc.email }));
    }
    const { data: mData } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    if (mData) setGalleryMedia(mData);
  };

  const checkReplies = async () => {
    const myMsgIdsRaw = localStorage.getItem("my_sent_messages");
    if (!myMsgIdsRaw) return;
    const myMsgIds = JSON.parse(myMsgIdsRaw);
    const { data } = await supabase.from('messages').select('*').in('id', myMsgIds).not('reply', 'is', null);
    if (data) {
      setReplies(data);
      setUnreadCount(data.length);
    }
  };

  const copyEmail = () => { navigator.clipboard.writeText(settings.email || "contact@lucascaillat.fr"); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const getYoutubeId = (url: string) => { const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/); return (match && match[2].length === 11) ? match[2] : null; };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newMessage = { name: formName, title: formTitle, content: formContent, contact: formContact, date: new Date().toLocaleString("fr-FR") };
    const { data, error } = await supabase.from('messages').insert(newMessage).select();
    if (data) {
      const existing = localStorage.getItem("my_sent_messages");
      const ids = existing ? JSON.parse(existing) : [];
      localStorage.setItem("my_sent_messages", JSON.stringify([...ids, data[0].id]));
      setIsSubmitting(false); setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); setIsContactOpen(false); setFormName(""); setFormTitle(""); setFormContent(""); setFormContact(""); }, 2000);
    }
  };

  if (!isClient) return null;
  const musicId = settings.musicUrl ? getYoutubeId(settings.musicUrl) : null;

  return (
    <motion.main 
      style={{ backgroundColor }}
      className="min-h-screen relative flex flex-col pt-24 pb-24 md:pt-32 md:pb-32 px-6 md:px-16 w-full overflow-x-hidden"
    >
      {/* Portrait Header Force Red Style */}
      <style jsx global>{`
        @media (max-width: 768px) {
          html, body { background-color: #ff3131 !important; }
        }
      `}</style>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[200] bg-soft-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out">
            <button className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={32} /></button>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full h-full"> <Image src={selectedImage.url} alt={selectedImage.name} fill className="object-contain" unoptimized /> </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-16 z-[100] flex flex-col gap-4">
        <motion.button onClick={() => setIsNotifOpen(!isNotifOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white text-primary-red w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center relative">
          <Bell size={24} />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>}
        </motion.button>
        <motion.button onClick={() => setIsContactOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary-red text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center group overflow-hidden">
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Zap size={24} fill="currentColor" /></motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isNotifOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-32 right-8 md:bottom-44 md:right-16 z-[150] w-72 md:w-96 bg-white shadow-2xl rounded-sm border border-text-black/10 overflow-hidden">
            <div className="bg-text-black p-4 flex justify-between items-center"> <h4 className="text-white font-serif italic">Réponses</h4> <button onClick={() => setIsNotifOpen(false)}><X size={16} className="text-white/50" /></button> </div>
            <div className="p-4 max-h-[300px] overflow-y-auto space-y-4">
              {replies.length === 0 ? <p className="text-xs text-text-black/40 text-center py-8">Aucune réponse pour le moment.</p> : (
                replies.map(r => (
                  <div key={r.id} className="border-l-2 border-primary-red pl-4 py-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">{r.title}</p>
                    <p className="text-sm font-medium mb-2">{r.reply}</p>
                    <p className="text-[9px] opacity-30 italic">Répondu par Lucas</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsContactOpen(false)} className="absolute inset-0 bg-soft-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="relative w-full max-w-lg bg-background border border-text-black/10 rounded-sm shadow-2xl p-8 md:p-12 overflow-hidden">
              {showSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={40} /></motion.div>
                  <h3 className="font-serif text-3xl">Message envoyé !</h3>
                  <p className="text-xs opacity-50">Lucas vous répondra bientôt.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <h3 className="font-serif text-4xl italic text-primary-red">Me contacter</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nom & Prénom" className="w-full bg-transparent border-b border-text-black/10 py-3 outline-none focus:border-primary-red" required />
                    <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Objet" className="w-full bg-transparent border-b border-text-black/10 py-3 outline-none focus:border-primary-red" required />
                    <input type="text" value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="Email / Tél" className="w-full bg-transparent border-b border-text-black/10 py-3 outline-none focus:border-primary-red" />
                  </div>
                  <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} placeholder="Message..." rows={5} className="w-full bg-text-black/5 p-4 rounded-sm outline-none focus:border-primary-red resize-none" required />
                  <button type="submit" disabled={isSubmitting} className="w-full bg-text-black text-white py-4 rounded-sm font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-3"> {isSubmitting ? "Envoi..." : <>ENVOYER <Send size={14} /></>} </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="fixed top-8 right-8 md:top-12 md:right-16 z-50">
        <Link href="/admin" className="transition-colors"> <motion.span style={{ color: adminBtnColor }} className="flex items-center gap-1 text-[10px] md:text-sm uppercase tracking-widest font-bold">Admin <ArrowUpRight size={14} /></motion.span> </Link>
      </motion.div>

      <section className="flex-1 flex flex-col justify-center min-h-[85vh] relative z-10 mt-24 md:mt-0 max-w-[1600px] mx-auto w-full">
        <div className="relative" style={{ perspective: 1000 }}>
          {settings.musicEnabled && musicId && (
            <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="absolute -top-24 right-0 md:-top-16 md:-right-12 z-30 scale-90 md:scale-100 origin-right">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 md:p-3 rounded-2xl flex items-center gap-3 md:gap-4 shadow-2xl group hover:bg-white/20 transition-all">
                <div className="relative w-10 h-10 md:w-16 md:h-16 overflow-hidden rounded-xl shadow-lg animate-spin-slow flex-shrink-0"> {settings.musicCover ? <Image src={settings.musicCover} alt="Cover" fill className="object-cover" unoptimized /> : <div className="w-full h-full bg-primary-red flex items-center justify-center"><Music size={20} className="text-white" /></div>} </div>
                <div className="pr-2 md:pr-4">
                  <div className="flex items-center gap-1.5 mb-0.5 md:mb-1"> <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Live</p> </div>
                  <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-primary-red transition-colors flex items-center gap-2"> {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />} <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{isMuted ? "Unmute" : "Mute"}</span> </button>
                </div>
                <iframe width="0" height="0" src={`https://www.youtube.com/embed/${musicId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${musicId}`} allow="autoplay" className="hidden" />
              </div>
            </motion.div>
          )}

          <motion.div style={{ rotateX, rotateY, textShadow, transformStyle: "preserve-3d" }} className="relative z-10 flex justify-center md:justify-start">
            <motion.h1 
              style={{ 
                color: textFinalColor,
                backgroundImage: textBgImage,
                WebkitBackgroundClip: textBgClip as any,
                backgroundClip: textBgClip as any,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} 
              className="font-serif text-[20vw] md:text-[180px] lg:text-[220px] leading-[0.8] tracking-tighter select-none relative z-10"
            >
              {settings.heroTitleMain}
            </motion.h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }} className="absolute -top-12 md:-top-32 left-[10%] md:left-[15%] z-20 pointer-events-none">
            <motion.h2 
              style={{ 
                color: hasTextImg ? textFinalColor : lucasColor,
                backgroundImage: textBgImage,
                WebkitBackgroundClip: textBgClip as any,
                backgroundClip: textBgClip as any,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} 
              className="font-serif italic text-5xl md:text-8xl lg:text-[140px] opacity-90 select-none"
            >
              {settings.heroTitleSub}
            </motion.h2>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="mt-12 md:mt-24 max-w-xl self-center md:self-start text-center md:text-left">
          <motion.p style={{ color: textColor }} className="text-lg md:text-3xl font-light tracking-wide leading-relaxed mb-3 md:mb-4">{settings.profession}</motion.p>
          {settings.bio && <motion.p style={{ color: secondaryTextColor }} className="text-xs md:text-lg font-medium leading-relaxed max-w-md px-4 md:px-0">{settings.bio}</motion.p>}
          <motion.div style={{ backgroundColor: textColor }} className="h-[1px] w-12 mt-6 md:mt-8 opacity-30 mx-auto md:mx-0"></motion.div>
        </motion.div>
      </section>

      <div className="h-24 md:h-48"></div>

      <div className="max-w-[1600px] mx-auto w-full space-y-32 md:space-y-48">
        <section>
          <div className="flex justify-between items-end mb-12 md:mb-16 border-b border-text-black/10 pb-6">
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-soft-black">{settings.recentProjectsTitle || "Projets Récents"}</h2>
            <span className="text-text-black/50 text-[10px] md:text-sm tracking-widest uppercase hidden md:block">{settings.projectsTitle}</span>
          </div>
          <Projects />
        </section>

        {galleryMedia.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-12 md:mb-16 border-b border-text-black/10 pb-6"> 
              <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-soft-black">{settings.galleryTitle}</h2> 
              <span className="text-text-black/50 text-[10px] md:text-sm tracking-widest uppercase hidden md:block">{settings.bentoGridTitle || "Bento Grid"}</span> 
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[800px]">
              {galleryMedia.slice(0, 5).map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} onClick={() => setSelectedImage(item)} className={`relative overflow-hidden rounded-sm bg-text-black/5 group cursor-zoom-in aspect-square md:aspect-auto ${i === 0 ? "md:col-span-2 md:row-span-2" : i === 1 ? "md:col-span-2 md:row-span-1" : "md:col-span-1 md:row-span-1"}`}>
                  <Image src={item.url} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-16 border-t border-text-black/10 flex flex-col md:flex-row justify-between items-center md:items-end gap-12 w-full pb-16">
          <div className="max-w-md text-center md:text-left relative">
            <motion.h3 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="font-serif text-3xl md:text-4xl text-soft-black mb-6">Discutons de votre projet.</motion.h3>
            <div className="relative inline-block">
              <button onClick={copyEmail} className="group flex items-center gap-3 text-lg md:text-xl border-b border-primary-red text-text-black hover:text-primary-red transition-all pb-1 font-medium"> {settings.email || "contact@lucascaillat.fr"} <Copy size={16} className="opacity-0 group-hover:opacity-40 transition-opacity" /> </button>
              <AnimatePresence> {copied && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0, y: 0 }} className="absolute -top-12 left-0 bg-text-black text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl"><Check size={12} className="text-green-500" /> Email Copié !</motion.div>} </AnimatePresence>
            </div>
          </div>
          <Socials />
        </footer>
      </div>
    </motion.main>
  );
}
