"use client";

import { motion, useMotionValue, useSpring, useTransform, useScroll, useMotionTemplate, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, Zap, X, Send, User, MessageSquare, CheckCircle2, Mail, Music, Volume2, VolumeX, Copy, Check, Bell, Play, Upload, Maximize2, Minimize2 } from "lucide-react";
import Projects from "@/components/Projects";
import Socials from "@/components/Socials";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface MediaItem { id: string; url: string; name: string; }
interface Message { id: string; name: string; title: string; content: string; contact?: string; date: string; reply?: string; order_id?: string; attachments?: string[]; agreed_to_pay?: boolean; replies?: { text: string; date: string; from: string }[]; }
interface Product { id: string; name: string; price: number; description: string; images: string[]; link?: string; link_text?: string; }

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
    musicCover: "",
    primaryColor: "#ff3131",
    sectionsConfig: [
      { id: 'projects', label: 'Projets', visible: true },
      { id: 'shop', label: 'Boutique', visible: true },
      { id: 'gallery', label: 'Galerie', visible: true },
      { id: 'bento', label: 'Bento Grid', visible: true }
    ]
  });
  const [socialsConfig, setSocialsConfig] = useState<any>(null);
  const [galleryMedia, setGalleryMedia] = useState<MediaItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeProdImg, setActiveProdImg] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Notification System
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isInboxExpanded, setIsInboxExpanded] = useState(false);
  const [replies, setReplies] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Form State
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formOrderId, setFormOrderId] = useState("");
  const [formAttachments, setFormAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderAgreed, setOrderAgreed] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [isMuted, setIsMuted] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { scrollYProgress } = useScroll();

  // Color transition - Adjusted for portrait
  const pColor = settings.primaryColor || "#ff3131";
  const backgroundColor = useTransform(scrollYProgress, [0, 0.15], [pColor, "#d3d3d3"]);
  const textColor = useTransform(scrollYProgress, [0, 0.15], ["#ffffff", pColor]);
  const secondaryTextColor = useTransform(scrollYProgress, [0, 0.15], ["rgba(255,255,255,0.7)", "rgba(17,17,17,0.6)"]);
  const adminBtnColor = useTransform(scrollYProgress, [0, 0.15], ["#ffffff", "#111111"]);
  const lucasColor = useTransform(scrollYProgress, [0, 0.15], ["#ffffff", pColor]);

  // Text Effect Image & Background Texture
  const hasTextImg = settings.textEffectImage && settings.textEffectImage.length > 0;
  const textBgImage = useTransform(scrollYProgress, [0, 0.15], ["none", hasTextImg ? `url(${settings.textEffectImage})` : "none"]);
  const textBgClip = useTransform(scrollYProgress, [0, 0.15], ["none", hasTextImg ? "text" : "none"]);
  const textFinalColor = useTransform(scrollYProgress, [0, 0.15], ["#ffffff", hasTextImg ? "transparent" : pColor]);
  
  // Background texture opacity transition
  const textureOpacity = useTransform(scrollYProgress, [0, 0.15], [hasTextImg ? 1 : 0, 0]);

  const springConfig = { damping: 50, stiffness: 400 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);
  const textShadowX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const textShadowY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
  const shadowColor = useTransform(scrollYProgress, [0, 0.15], ["rgba(255,255,255,0.3)", `${pColor}33`]);
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
    const settingsChannel = supabase.channel('settings-realtime').on('postgres_changes', { event: '*', table: 'settings', schema: 'public' }, () => { fetchData(); }).subscribe();
    const mediaChannel = supabase.channel('media-realtime').on('postgres_changes', { event: '*', table: 'media', schema: 'public' }, () => { fetchData(); }).subscribe();
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => { 
      window.removeEventListener("mousemove", handleMouseMove); 
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(mediaChannel);
    };
  }, [mouseX, mouseY]);

  const fetchData = async () => {
    const { data: sData } = await supabase.from('settings').select('*');
    if (sData) {
      const global = sData.find(s => s.key === 'global')?.value;
      const soc = sData.find(s => s.key === 'socials')?.value;
      if (global) setSettings(prev => ({ ...prev, ...global }));
      if (soc) {
        setSocialsConfig(soc);
        setSettings(prev => ({ ...prev, email: soc.email }));
      }
    }
    const { data: mData } = await supabase.from('media').select('*');
    if (mData) {
      const global = (await supabase.from('settings').select('*').eq('key', 'global').single()).data?.value;
      if (global?.mediaOrder) {
        mData.sort((a, b) => {
          const idxA = global.mediaOrder.indexOf(a.id);
          const idxB = global.mediaOrder.indexOf(b.id);
          if (idxA === -1 && idxB === -1) return 0;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
      }
      setGalleryMedia(mData);
    }
    const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (pData) setProducts(pData);
  };

  const checkReplies = async () => {
    const myMsgIdsRaw = localStorage.getItem("my_sent_messages");
    if (!myMsgIdsRaw) return;
    const myMsgIds = JSON.parse(myMsgIdsRaw);
    const { data } = await supabase.from('messages').select('*').in('id', myMsgIds).order('created_at', { ascending: false });
    if (data) {
      setReplies(data);
      const unread = data.filter(m => m.reply && !localStorage.getItem(`read_reply_${m.id}`)).length;
      setUnreadCount(unread);
    }
  };

  const handleReplyToMessage = (msg: Message) => {
    setFormName(msg.name);
    setFormTitle(`Re: ${msg.title}`);
    setFormContact(msg.contact || "");
    setFormOrderId(msg.order_id || "");
    setIsContactOpen(true);
    setIsNotifOpen(false);
  };

  const handleBuyProduct = (product: Product) => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormTitle(`Achat: ${product.name}`);
    setFormOrderId(randomId);
    setFormContent(`Bonjour, je souhaite commander le produit "${product.name}" (${product.price}€).\n\nL'album est : [Titre de l'album]\nL'artiste est : [Nom de l'artiste]`);
    setIsContactOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormAttachments([...formAttachments, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const copyEmail = () => { navigator.clipboard.writeText(settings.email || "contact@lucascaillat.fr"); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const getYoutubeId = (url: string) => { 
    if (!url) return null;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/); 
    return (match && match[2].length === 11) ? match[2] : null; 
  };
  const getYoutubeThumbnail = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newMessage = { 
      name: formName, 
      title: formTitle, 
      content: formContent, 
      contact: formContact, 
      order_id: formOrderId || null,
      attachments: formAttachments,
      agreed_to_pay: orderAgreed,
      date: new Date().toLocaleString("fr-FR") 
    };
    
    try {
      const { data, error } = await supabase.from('messages').insert(newMessage).select();
      if (error) throw error;
      
      if (data) {
        const existing = localStorage.getItem("my_sent_messages");
        const ids = existing ? JSON.parse(existing) : [];
        localStorage.setItem("my_sent_messages", JSON.stringify([...ids, data[0].id]));
        setIsSubmitting(false); 
        setShowSuccess(true);
        setOrderAgreed(false);
        setTimeout(() => { 
          setShowSuccess(false); 
          setIsContactOpen(false); 
          setFormName(""); 
          setFormTitle(""); 
          setFormContent(""); 
          setFormContact(""); 
          setFormOrderId(""); 
          setFormAttachments([]); 
        }, 2000);
      }
    } catch (error: any) {
      console.error("Erreur d'envoi:", error);
      alert("Erreur lors de l'envoi du message : " + (error.message || "Erreur inconnue"));
      setIsSubmitting(false);
    }
  };

  if (!isClient) return null;
  const musicId = settings.musicUrl ? getYoutubeId(settings.musicUrl) : null;

  return (
    <motion.main 
      style={{ backgroundColor }}
      className="min-h-screen relative flex flex-col pt-24 pb-24 md:pt-32 md:pb-32 px-6 md:px-16 w-full overflow-x-hidden"
    >
      {/* Background Texture Overlay */}
      {hasTextImg && (
        <motion.div 
          style={{ 
            backgroundImage: `url(${settings.textEffectImage})`,
            opacity: textureOpacity 
          }}
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center"
        />
      )}
      {/* Dynamic Theme Styles */}
      <style jsx global>{`
        :root {
          --primary-red: ${pColor};
          --color-primary-red: ${pColor};
          --shadow-red: ${pColor}22;
          --color-shadow-red: ${pColor}22;
        }
        @media (max-width: 768px) {
          html, body { background-color: ${pColor} !important; }
        }
      `}</style>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[200] bg-soft-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out">
            <button className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={32} /></button>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full h-full flex items-center justify-center"> 
              {getYoutubeId(selectedImage.url) ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${getYoutubeId(selectedImage.url)}?autoplay=1`} 
                  title={selectedImage.name}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="max-w-5xl aspect-video shadow-2xl"
                />
              ) : (
                <Image src={selectedImage.url} alt={selectedImage.name} fill className="object-contain" unoptimized /> 
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-16 z-[100] flex flex-col gap-4">
        <motion.button onClick={() => setIsNotifOpen(!isNotifOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white text-[var(--primary-red)] w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center relative">
          <Bell size={24} />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>}
        </motion.button>
        <motion.button onClick={() => setIsContactOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-[var(--primary-red)] text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center group overflow-hidden">
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Zap size={24} fill="currentColor" /></motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-soft-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-6xl bg-background border border-text-black/10 rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
              
              {/* Product Visuals */}
              <div className="w-full h-80 md:h-auto md:w-3/5 relative bg-text-black/5 group shrink-0">
                <Image src={selectedProduct.images[activeProdImg] || ""} alt={selectedProduct.name} fill className="object-contain p-8 md:p-12" unoptimized />
                <button onClick={() => setSelectedProduct(null)} className="absolute top-6 left-6 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"><X size={24} /></button>
                
                {selectedProduct.images.length > 1 && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full">
                    {selectedProduct.images.map((_, i) => (
                      <button key={i} onClick={() => setActiveProdImg(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${activeProdImg === i ? 'bg-primary-red scale-125' : 'bg-white/40 hover:bg-white/60'}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="w-full md:w-2/5 p-8 md:p-16 flex flex-col justify-center bg-white overflow-y-auto">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-primary-red">Produit Premium</p>
                    <h2 className="font-serif text-3xl md:text-5xl text-soft-black leading-tight">{selectedProduct.name}</h2>
                    <p className="text-3xl font-serif italic text-soft-black/40">{selectedProduct.price}€</p>
                  </div>

                  <div className="h-[1px] w-20 bg-primary-red/30"></div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-30">Description du produit</h4>
                    <p className="text-sm md:text-base leading-relaxed text-soft-black/70 whitespace-pre-line">{selectedProduct.description}</p>
                    
                    {selectedProduct.link && (
                      <div className="pt-4">
                        <Link 
                          href={selectedProduct.link} 
                          target="_blank"
                          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-red border-b border-primary-red/30 pb-1 hover:border-primary-red transition-all"
                        >
                          {selectedProduct.link_text || "En savoir plus"} <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 space-y-4">
                    <button 
                      onClick={() => { handleBuyProduct(selectedProduct); setSelectedProduct(null); }} 
                      className="w-full bg-text-black text-white py-5 rounded-sm font-bold text-xs tracking-widest uppercase hover:bg-primary-red transition-all shadow-xl shadow-primary-red/10 flex items-center justify-center gap-3"
                    >
                      COMMANDER MAINTENANT <Zap size={16} fill="currentColor" />
                    </button>
                    <p className="text-[9px] text-center opacity-30 uppercase tracking-widest">Paiement en cash sur place</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNotifOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isInboxExpanded ? '90vw' : undefined,
              height: isInboxExpanded ? '85vh' : undefined,
              maxWidth: isInboxExpanded ? '1200px' : undefined,
              bottom: isInboxExpanded ? '5vh' : undefined,
              right: isInboxExpanded ? '5vw' : undefined,
              left: isInboxExpanded ? '5vw' : undefined,
              margin: isInboxExpanded ? 'auto' : undefined
            }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }} 
            className={`fixed z-[200] bg-white shadow-2xl rounded-sm border border-text-black/10 overflow-hidden flex flex-col ${isInboxExpanded ? '' : 'bottom-32 right-8 md:bottom-44 md:right-16 w-72 md:w-96'}`}
          >
            <div className="bg-text-black p-4 flex justify-between items-center shrink-0"> 
              <h4 className="text-white font-serif italic">Réponses</h4> 
              <div className="flex items-center gap-3">
                <button onClick={() => setIsInboxExpanded(!isInboxExpanded)} className="text-white/50 hover:text-white transition-colors">
                  {isInboxExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button onClick={() => setIsNotifOpen(false)}><X size={16} className="text-white/50" /></button> 
              </div>
            </div>
            <div className={`p-4 overflow-y-auto space-y-4 flex-1 ${isInboxExpanded ? '' : 'max-h-[400px]'}`}>
              {replies.length === 0 ? <p className="text-xs text-text-black/40 text-center py-8">Aucune réponse pour le moment.</p> : (
                replies.map(r => (
                  <div key={r.id} className="bg-text-black/[0.02] border border-text-black/5 rounded-sm p-4 relative group" onClick={() => { if(r.reply) localStorage.setItem(`read_reply_${r.id}`, "true"); checkReplies(); }}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{r.title}</p>
                      {r.order_id && <span className="text-[9px] font-bold text-primary-red">Code: {r.order_id}</span>}
                    </div>
                    <div className="space-y-3 mb-3">
                      {r.replies && r.replies.length > 0 ? (
                        r.replies.map((rep, idx) => (
                          <div key={idx} className={`${rep.from === 'Lucas' ? 'bg-text-black/5 border-l-2 border-primary-red pl-3 py-1' : ''}`}>
                            <p className="text-[9px] font-bold uppercase opacity-30 mb-1">{rep.from} • {rep.date}</p>
                            <p className="text-sm font-medium">{rep.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm font-medium">{r.reply || <span className="opacity-30 italic">En attente de réponse...</span>}</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] opacity-30 italic">{r.reply ? "Répondu par Lucas" : "Envoyé par vous"}</p>
                      {r.reply && (
                        <button 
                          onClick={() => handleReplyToMessage(r)}
                          className="text-[10px] font-bold text-primary-red uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          <Send size={10} /> Répondre
                        </button>
                      )}
                    </div>
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
                <div className="py-12 text-center space-y-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={40} /></motion.div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-3xl italic">Message envoyé !</h3>
                    <p className="text-xs opacity-50">Lucas vous répondra bientôt.</p>
                  </div>
                  {formOrderId && (
                    <div className="bg-primary-red/5 p-6 rounded-sm border border-primary-red/20 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-red">Votre code de commande</p>
                      <p className="text-4xl font-serif text-soft-black">{formOrderId}</p>
                      <p className="text-[9px] opacity-40 italic">Notez ce code pour le donner lors du paiement en cash.</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <h3 className="font-serif text-4xl italic text-[var(--primary-red)]">Me contacter</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nom & Prénom" className="w-full bg-transparent border-b border-text-black/10 py-3 outline-none focus:border-[var(--primary-red)]" required />
                    <input type="text" value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="Email / Tél" className="w-full bg-transparent border-b border-text-black/10 py-3 outline-none focus:border-[var(--primary-red)]" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Objet" className="w-full bg-transparent border-b border-text-black/10 py-3 outline-none focus:border-[var(--primary-red)]" required />
                    <input type="text" value={formOrderId} onChange={(e) => setFormOrderId(e.target.value)} placeholder="ID Commande (Optionnel)" className="w-full bg-transparent border-b border-text-black/10 py-3 outline-none focus:border-[var(--primary-red)]" readOnly={formTitle.startsWith("Achat:")} />
                  </div>
                  <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} placeholder="Message..." rows={4} className="w-full bg-text-black/5 p-4 rounded-sm outline-none focus:border-[var(--primary-red)] resize-none" required />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Pièces jointes</label>
                      <label className="cursor-pointer text-[10px] font-bold text-primary-red uppercase tracking-widest flex items-center gap-2">
                        <Upload size={14} /> Joindre une image
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                    </div>
                    {formAttachments.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {formAttachments.map((img, i) => (
                          <div key={i} className="relative w-12 h-12 rounded-xs overflow-hidden border border-text-black/10 flex-shrink-0 group">
                            <Image src={img} alt="attachment" fill className="object-cover" unoptimized />
                            <button type="button" onClick={() => setFormAttachments(formAttachments.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"><X size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {(formOrderId || formTitle.startsWith("Achat:")) && (
                    <div className="flex items-start gap-3 bg-primary-red/5 p-4 rounded-sm border border-primary-red/10">
                      <input 
                        type="checkbox" 
                        id="orderAgree" 
                        checked={orderAgreed} 
                        onChange={(e) => setOrderAgreed(e.target.checked)} 
                        className="mt-1 accent-primary-red w-4 h-4 rounded-xs border-text-black/20" 
                        required 
                      />
                      <label htmlFor="orderAgree" className="text-[11px] leading-relaxed opacity-70 cursor-pointer">
                        Je m'engage à régler le montant de ce produit ({selectedProduct ? `${selectedProduct.price}€` : "indiqué"}) une fois la commande validée par Lucas. <span className="text-primary-red font-bold">*</span>
                      </label>
                    </div>
                  )}

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

      <div className="max-w-[1600px] mx-auto w-full space-y-32 md:space-y-48">
        {(settings.sectionsConfig || []).filter(s => s.visible).map((section) => {
          if (section.id === 'projects') return <Projects key="projects" config={settings} label={section.label} />;
          
          if (section.id === 'shop' && products.length > 0) return (
            <section key="shop" className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
                <h2 className="font-serif text-6xl md:text-8xl tracking-tighter leading-none italic">{section.label || "Boutique"}</h2>
                <p className="text-xl md:text-2xl text-[var(--primary-red)] font-light italic">Nos Produits</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <motion.div 
                    key={product.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    onClick={() => { setSelectedProduct(product); setActiveProdImg(0); }}
                    className="group bg-white/40 border border-text-black/5 rounded-sm overflow-hidden backdrop-blur-md cursor-pointer"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image src={product.images[0] || ""} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                      <div className="absolute top-6 right-6 bg-text-black text-white px-4 py-2 text-sm font-bold shadow-xl">{product.price}€</div>
                    </div>
                    <div className="p-8 space-y-4">
                      <h3 className="font-serif text-2xl">{product.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Voir les détails</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          );

          if (section.id === 'gallery' && galleryMedia.length > 0) {
            const itemsPerPage = 5;
            const totalPages = Math.ceil(galleryMedia.length / itemsPerPage);
            const currentItems = galleryMedia.slice(galleryIndex * itemsPerPage, (galleryIndex + 1) * itemsPerPage);

            return (
              <section key="gallery" className="relative">
                <div className="flex justify-between items-end mb-12 md:mb-16 border-b border-text-black/10 pb-6"> 
                  <div className="space-y-2">
                    <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-soft-black">{settings.galleryTitle}</h2> 
                    <div className="flex items-center gap-4">
                      <span className="text-text-black/50 text-[10px] md:text-sm tracking-widest uppercase">Galerie Photo/Vidéo</span>
                      {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setGalleryIndex(prev => (prev - 1 + totalPages) % totalPages)}
                            className="w-8 h-8 rounded-full border border-text-black/10 flex items-center justify-center hover:bg-primary-red hover:text-white transition-all"
                          >
                            <ArrowUpRight size={14} style={{ transform: 'rotate(-135deg)' }} />
                          </button>
                          <span className="text-[10px] font-bold opacity-30">{galleryIndex + 1} / {totalPages}</span>
                          <button 
                            onClick={() => setGalleryIndex(prev => (prev + 1) % totalPages)}
                            className="w-8 h-8 rounded-full border border-text-black/10 flex items-center justify-center hover:bg-primary-red hover:text-white transition-all"
                          >
                            <ArrowUpRight size={14} style={{ transform: 'rotate(45deg)' }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={galleryIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, ease: "anticipate" }}
                      className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[800px]"
                    >
                      {currentItems.map((item, i) => {
                        const ytId = getYoutubeId(item.url);
                        const displayUrl = ytId ? getYoutubeThumbnail(ytId) : item.url;
                        
                        // Bento layout patterns
                        let gridClass = "md:col-span-1 md:row-span-1";
                        if (i === 0) gridClass = "md:col-span-2 md:row-span-2";
                        else if (i === 1) gridClass = "md:col-span-2 md:row-span-1";

                        return (
                          <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }} 
                            onClick={() => setSelectedImage(item)} 
                            className={`relative overflow-hidden rounded-sm bg-text-black/5 group cursor-zoom-in aspect-square md:aspect-auto ${gridClass}`}
                          >
                            <Image src={displayUrl} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                            {ytId && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-primary-red transition-all duration-500 border border-white/30">
                                  <Play size={24} fill="currentColor" className="ml-1" />
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      {/* Fill empty slots if currentItems.length < 5 to keep the layout consistent if needed */}
                      {currentItems.length < 5 && Array.from({ length: 5 - currentItems.length }).map((_, i) => (
                         <div key={`empty-${i}`} className="hidden md:block bg-text-black/[0.02] border border-dashed border-text-black/5 rounded-sm" />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>
            );
          }

          if (section.id === 'bento') return (
            <section key="bento" className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
                <h2 className="font-serif text-6xl md:text-8xl tracking-tighter leading-none italic">{settings.bentoGridTitle}</h2>
                <p className="text-xl md:text-2xl text-[var(--primary-red)] font-light italic">À propos</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 aspect-square md:aspect-video bg-white/40 backdrop-blur-md border border-text-black/5 rounded-sm p-12 flex flex-col justify-between group overflow-hidden relative">
                  <div className="relative z-10"> <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary-red)] mb-4">Ma Bio</p> <h3 className="font-serif text-3xl md:text-5xl leading-tight mb-6">{settings.bio || "Exploration créative et solutions techniques."}</h3> </div>
                  <Socials config={socialsConfig} />
                </div>
                <div className="aspect-square bg-[var(--primary-red)] rounded-sm p-10 flex flex-col justify-between text-white relative overflow-hidden group">
                  <motion.div initial={{ scale: 1 }} whileHover={{ scale: 1.1 }} className="absolute -right-8 -bottom-8 opacity-20"><Zap size={200} fill="white" /></motion.div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">Disponibilité</p>
                  <h3 className="font-serif text-4xl italic relative z-10">Ouvert aux projets freelance</h3>
                </div>
                <div className="aspect-square bg-text-black rounded-sm p-10 flex flex-col justify-between text-white relative overflow-hidden group">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Contact</p>
                  <div className="space-y-4 relative z-10">
                    <p className="font-serif text-2xl">{settings.email || "hello@lucascaillat.fr"}</p>
                    <button onClick={copyEmail} className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-primary-red transition-colors"> {copied ? <><Check size={14} /> Copié</> : <><Copy size={14} /> Copier l'email</>} </button>
                  </div>
                </div>
              </div>
            </section>
          );
          
          return null;
        })}

        <footer className="pt-16 border-t border-text-black/10 flex flex-col md:flex-row justify-between items-center md:items-end gap-12 w-full pb-16">
          <div className="max-w-md text-center md:text-left relative">
            <motion.h3 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="font-serif text-3xl md:text-4xl text-soft-black mb-6">Discutons de votre projet.</motion.h3>
            <div className="relative inline-block">
              <button onClick={copyEmail} className="group flex items-center gap-3 text-lg md:text-xl border-b border-primary-red text-text-black hover:text-primary-red transition-all pb-1 font-medium"> {settings.email || "contact@lucascaillat.fr"} <Copy size={16} className="opacity-0 group-hover:opacity-40 transition-opacity" /> </button>
              <AnimatePresence> {copied && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0, y: 0 }} className="absolute -top-12 left-0 bg-text-black text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl"><Check size={12} className="text-green-500" /> Email Copié !</motion.div>} </AnimatePresence>
            </div>
          </div>
          <Socials config={socialsConfig} />
        </footer>
      </div>
    </motion.main>
  );
}
