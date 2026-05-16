"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Settings, FileText, ImageIcon, 
  LogOut, Check, X as CloseIcon, X, Edit2, Trash2, Upload, AlertCircle, Link as LinkIcon,
  Share2, Mail, MessageSquare, Zap, User, Clock, Music, Play, Pause, Send, ArrowLeft,
  Download, ExternalLink, Users, Phone
} from "lucide-react";
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaGlobe, FaDiscord, FaPhone } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SocialConfig } from "@/components/Socials";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from 'qrcode.react';

interface Project {
  id: string;
  title: string;
  category?: string;
  date: string;
  image: string;
  status: "Publié" | "Brouillon";
  link_type: "external" | "internal";
  url: string;
  content: string;
  gallery: { url: string; type: 'image' | 'video' }[];
}

interface MediaItem {
  id: string;
  url: string;
  name: string;
  created_at: string;
}

interface Message {
  id: string;
  name: string;
  title: string;
  content: string;
  contact?: string;
  date: string;
  reply?: string;
  order_id?: string;
  attachments?: string[];
  agreed_to_pay?: boolean;
  replies?: { text: string; date: string; from: string; media?: { url: string; type: 'image' | 'video' }[] }[];
  user_id?: string;
  user_email?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  link?: string;
  link_text?: string;
  purchase_message?: string;
  created_at?: string;
}


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("pages");
  const [projects, setProjects] = useState<Project[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyMedia, setReplyMedia] = useState<{ [key: string]: { url: string; type: 'image' | 'video' }[] }>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const router = useRouter();
  
  const [profileName, setProfileName] = useState("Lucas Caillat");
  const [profileProfession, setProfileProfession] = useState("Freelance Informatique");
  const [profileBio, setProfileBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [heroTitleMain, setHeroTitleMain] = useState("CAILLAT");
  const [heroTitleSub, setHeroTitleSub] = useState("Lucas");
  const [textEffectImage, setTextEffectImage] = useState("");
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const [musicCover, setMusicCover] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#ff3131");
  const [show3DBackground, setShow3DBackground] = useState(false);
  const [musicRotationEnabled, setMusicRotationEnabled] = useState(true);
  const [sectionsConfig, setSectionsConfig] = useState([
    { id: 'projects', label: 'Projets', subLabel: 'Sélection 2024', visible: true },
    { id: 'shop', label: 'Boutique', subLabel: 'Nos Produits', visible: true },
    { id: 'gallery', label: 'Galerie', subLabel: 'Galerie Photo/Vidéo', visible: true },
    { id: 'bento', label: 'À propos', subLabel: 'Bento Grid', visible: true }
  ]);

  const [socials, setSocials] = useState<SocialConfig>({
    email: "contact@lucascaillat.fr",
    linkedin: { url: "https://linkedin.com/in/lucascaillat", enabled: true },
    github: { url: "https://github.com/lucascaillat", enabled: true },
    twitter: { url: "https://twitter.com/lucascaillat", enabled: false },
    instagram: { url: "https://instagram.com/lucascaillat", enabled: false },
    youtube: { url: "", enabled: false },
    tiktok: { url: "", enabled: false },
    discord: { url: "", enabled: false },
    phone: { url: "", enabled: false },
    customLinks: []
  });

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formStatus, setFormStatus] = useState<"Publié" | "Brouillon">("Publié");
  const [formLinkType, setFormLinkType] = useState<"external" | "internal">("internal");
  const [formUrl, setFormUrl] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formGallery, setFormGallery] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState(0);
  const [prodDesc, setProdDesc] = useState("");
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodImagesText, setProdImagesText] = useState("");
  const [prodLink, setProdLink] = useState("");
  const [prodLinkText, setProdLinkText] = useState("");
  const [prodPurchaseMsg, setProdPurchaseMsg] = useState("");

  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [mfaEnrollment, setMfaEnrollment] = useState<any>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      } 
      if (session.user.email !== 'caillatlucas2304@gmail.com') {
        router.push("/");
        return;
      }
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (mfaError) {
        console.error("Erreur check MFA:", mfaError);
      } else if (mfaData.nextLevel === 'aal2' && mfaData.currentLevel !== 'aal2') {
        router.push("/admin/login");
        return;
      }
      fetchData();
    };
    checkAuth();

    const fetchMfa = async () => {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors) setMfaFactors(factors.all.filter(f => f.status === 'verified'));
    };
    fetchMfa();

    const msgChannel = supabase.channel('admin-msgs')
      .on('postgres_changes', { event: 'INSERT', table: 'messages', schema: 'public' }, (payload) => {
        setMessages(prev => [payload.new as Message, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
    };
  }, [router]);

  const getYoutubeId = (url: string) => { 
    if (!url) return null;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/); 
    return (match && match[2].length === 11) ? match[2] : null; 
  };
  const getYoutubeThumbnail = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  const fetchData = async () => {
    const { data: pData } = await supabase.from('projects').select('*');
    const { data: prodData } = await supabase.from('products').select('*');
    const { data: msgData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    const { data: sData } = await supabase.from('settings').select('*');
    
    if (msgData) {
      setMessages(msgData);
      const userIds = Array.from(new Set(msgData.map((m: any) => m.user_id).filter(Boolean)));
      if (userIds.length > 0) {
        const { data: profData } = await supabase.from('profiles').select('id, avatar_url, full_name').in('id', userIds);
        if (profData) {
          const enriched = msgData.map((m: any) => ({
            ...m,
            profiles: profData.find(p => p.id === m.user_id)
          }));
          setMessages(enriched);
        }
      }
    }

    const { data: allP } = await supabase.from('profiles').select('*');
    if (allP) setAllProfiles(allP);

    if (sData) {
      const global = sData.find(s => s.key === 'global')?.value;
      if (global) {
        if (pData && global.projectOrder) {
          pData.sort((a, b) => {
            const idxA = global.projectOrder.indexOf(a.id);
            const idxB = global.projectOrder.indexOf(b.id);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });
        }
        if (prodData && global.productOrder) {
          prodData.sort((a, b) => {
            const idxA = global.productOrder.indexOf(a.id);
            const idxB = global.productOrder.indexOf(b.id);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });
        }
        setProfileName(global.profileName || "Lucas Caillat");
        setProfileProfession(global.profileProfession || "Freelance Informatique");
        setProfileBio(global.profileBio || "");
        setProfileImage(global.profileImage || "");
        setHeroTitleMain(global.heroTitleMain || "CAILLAT");
        setHeroTitleSub(global.heroTitleSub || "Lucas");
        setTextEffectImage(global.textEffectImage || "");
        setMusicEnabled(global.musicEnabled || false);
        setMusicUrl(global.musicUrl || "");
        setMusicCover(global.musicCover || "");
        setPrimaryColor(global.primaryColor || "#ff3131");
        setShow3DBackground(global.show3DBackground ?? false);
        setMusicRotationEnabled(global.musicRotationEnabled ?? true);
        if (global.sectionsConfig) {
          const migratedSections = global.sectionsConfig.map((s: { id: string; label: string; subLabel?: string; visible: boolean }) => {
            if (s.id === 'projects' && s.subLabel === undefined) return { ...s, subLabel: global.projectsTitle || "Sélection 2024", label: global.recentProjectsTitle || "Postes" };
            if (s.id === 'gallery' && s.subLabel === undefined) return { ...s, subLabel: "Galerie Photo/Vidéo", label: global.galleryTitle || s.label };
            if (s.id === 'shop' && s.subLabel === undefined) return { ...s, subLabel: "Nos Produits" };
            if (s.id === 'bento' && s.subLabel === undefined) return { ...s, subLabel: "Bento Grid", label: global.bentoGridTitle || s.label };
            if (s.id === 'projects' && s.label === 'Projets') return { ...s, label: 'Postes' };
            return s;
          });
          setSectionsConfig(migratedSections);
        }
      }
      const soc = sData.find(s => s.key === 'socials')?.value;
      if (soc) setSocials(soc);
    }
    
    if (pData) setProjects(pData);
    if (prodData) setProducts(prodData);

    const { data: mData } = await supabase.from('media').select('*');
    if (mData) {
      const global = sData?.find(s => s.key === 'global')?.value;
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
      setMediaItems(mData);
    }
  };

  const moveItem = async (type: 'projects' | 'products' | 'media', index: number, direction: 'up' | 'down') => {
    const items = type === 'projects' ? [...projects] : type === 'products' ? [...products] : [...mediaItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const itemsCopy = items as any[];
    const [removed] = itemsCopy.splice(index, 1);
    itemsCopy.splice(newIndex, 0, removed);
    if (type === 'projects') setProjects(itemsCopy as Project[]);
    else if (type === 'products') setProducts(itemsCopy as Product[]);
    else setMediaItems(itemsCopy as MediaItem[]);
    const orderKey = type === 'projects' ? 'projectOrder' : type === 'products' ? 'productOrder' : 'mediaOrder';
    const { data: globalData } = await supabase.from('settings').select('*').eq('key', 'global').single();
    const globalValue = globalData?.value || {};
    const { error } = await supabase.from('settings').upsert({
      key: 'global',
      value: { ...globalValue, [orderKey]: itemsCopy.map(i => i.id) }
    });
    if (error) console.error("Error saving order:", error);
  };

  const handleSaveSettings = async () => {
    const s = { profileName, profileProfession, profileBio, profileImage, heroTitleMain, heroTitleSub, textEffectImage, musicEnabled, musicUrl, musicCover, primaryColor, show3DBackground, musicRotationEnabled, sectionsConfig, mediaOrder: mediaItems.map(m => m.id) };
    const { error } = await supabase.from('settings').upsert({ key: 'global', value: s });
    if (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement : " + error.message);
    } else {
      setUploadSuccess(true); 
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const handleSaveSocials = async () => {
    const { error } = await supabase.from('settings').upsert({ key: 'socials', value: socials });
    if (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement des réseaux : " + error.message);
    } else {
      setUploadSuccess(true); 
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const handleReply = async (msgId: string) => {
    const text = replyText[msgId];
    const media = replyMedia[msgId] || [];
    if (!text && media.length === 0) return;
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    const newReply = { text, date: new Date().toLocaleString("fr-FR"), from: "Lucas", media };
    const updatedReplies = [...(msg.replies || []), newReply];
    const { error } = await supabase.from('messages').update({ reply: text, replies: updatedReplies }).eq('id', msgId);
    if (!error) {
      setMessages(messages.map(m => m.id === msgId ? { ...m, reply: text, replies: updatedReplies } : m));
      setReplyText({ ...replyText, [msgId]: "" });
      setReplyMedia({ ...replyMedia, [msgId]: [] });
    }
  };

  const deleteProject = async (id: string) => { if (confirm("Supprimer?")) { await supabase.from('projects').delete().eq('id', id); setProjects(projects.filter(p => p.id !== id)); } };
  const deleteMedia = async (id: string) => { await supabase.from('media').delete().eq('id', id); setMediaItems(mediaItems.filter(m => m.id !== id)); };
  const deleteMessage = async (id: string) => { await supabase.from('messages').delete().eq('id', id); setMessages(messages.filter(m => m.id !== id)); };

  const handleMfaEnroll = async () => {
    setMfaError("");
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors) {
        const unverified = factors.all.filter(f => f.status === 'unverified');
        for (const factor of unverified) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Lucas Portfolio', friendlyName: 'Admin Access' });
      if (error) {
        setMfaError(error.message);
        alert("Erreur A2F : " + error.message);
      } else {
        setMfaEnrollment(data);
      }
    } catch (err: any) {
      setMfaError(err.message);
    }
  };

  const handleMfaVerify = async () => {
    setMfaError("");
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfaEnrollment.id, code: mfaCode });
    if (error) {
      setMfaError(error.message);
    } else {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors) setMfaFactors(factors.all.filter(f => f.status === 'verified'));
      setMfaEnrollment(null);
      setMfaCode("");
      alert("Double authentification activée !");
    }
  };

  const handleMfaUnenroll = async (factorId: string) => {
    if (confirm("Désactiver la double authentification ?")) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (!error) {
        setMfaFactors(mfaFactors.filter(f => f.id !== factorId));
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const { data } = await supabase.from('media').insert({ url: reader.result as string, name: file.name }).select();
      if (data) setMediaItems([data[0], ...mediaItems]);
      setIsUploading(false); setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = prodImagesText.split('\n').map(img => img.trim()).filter(img => img !== "");
    const pData = { name: prodName, price: prodPrice, description: prodDesc, images: finalImages, link: prodLink, link_text: prodLinkText, purchase_message: prodPurchaseMsg };
    let error;
    if (editingProduct) {
      const { error: err } = await supabase.from('products').update(pData).eq('id', editingProduct.id);
      error = err;
    } else {
      const { data: newProd, error: err } = await supabase.from('products').insert(pData).select().single();
      error = err;
      if (newProd) {
        const { data: globalData } = await supabase.from('settings').select('*').eq('key', 'global').single();
        const globalValue = globalData?.value || {};
        const newOrder = [...(globalValue.productOrder || []), newProd.id];
        await supabase.from('settings').upsert({ key: 'global', value: { ...globalValue, productOrder: newOrder } });
      }
    }
    if (error) {
      alert("Erreur lors de l'enregistrement : " + error.message);
    } else {
      setIsProductModalOpen(false); fetchData(); setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const deleteProduct = async (id: string) => { if (confirm("Supprimer ce produit ?")) { await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p => p.id !== id)); } };

  const addMediaByUrl = async () => {
    const url = prompt("URL Image ou Vidéo YouTube :");
    if (url) {
      const ytId = getYoutubeId(url);
      const name = ytId ? "Vidéo YouTube" : "URL Image";
      const { data } = await supabase.from('media').insert({ url, name }).select();
      if (data) setMediaItems([data[0], ...mediaItems]);
    }
  };

  const addGalleryItem = (type: 'image' | 'video') => {
    const url = prompt(type === 'video' ? "Lien YouTube :" : "URL Image :");
    if (url) { setFormGallery([...formGallery, { url, type }]); }
  };

  const removeGalleryItem = (idx: number) => { setFormGallery(formGallery.filter((_, i) => i !== idx)); };

  const moveGalleryItem = (idx: number, direction: 'up' | 'down') => {
    const newGallery = [...formGallery];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newGallery.length) return;
    [newGallery[idx], newGallery[targetIdx]] = [newGallery[targetIdx], newGallery[idx]];
    setFormGallery(newGallery);
  };

  const moveSection = (idx: number, direction: 'up' | 'down') => {
    const newSections = [...sectionsConfig];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;
    [newSections[idx], newSections[targetIdx]] = [newSections[targetIdx], newSections[idx]];
    setSectionsConfig(newSections);
  };

  const moveMediaItem = async (idx: number, direction: 'left' | 'right') => {
    const newMedia = [...mediaItems];
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newMedia.length) return;
    [newMedia[idx], newMedia[targetIdx]] = [newMedia[targetIdx], newMedia[idx]];
    setMediaItems(newMedia);
    const { data: sData } = await supabase.from('settings').select('*').eq('key', 'global').single();
    if (sData) {
      const newValue = { ...sData.value, mediaOrder: newMedia.map(m => m.id) };
      await supabase.from('settings').upsert({ key: 'global', value: newValue });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectData: any = { title: formTitle, category: formCategory || null, date: formDate, image: formImage, status: formStatus, link_type: formLinkType, url: formUrl, content: formContent };
    if (formGallery && formGallery.length > 0) { projectData.gallery = formGallery; }
    let error;
    if (editingProject) {
      const { error: err } = await supabase.from('projects').update(projectData).eq('id', editingProject.id);
      error = err;
    } else {
      const { data: newProj, error: err } = await supabase.from('projects').insert(projectData).select().single();
      error = err;
      if (newProj) {
        const { data: globalData } = await supabase.from('settings').select('*').eq('key', 'global').single();
        const globalValue = globalData?.value || {};
        const newOrder = [...(globalValue.projectOrder || []), newProj.id];
        await supabase.from('settings').upsert({ key: 'global', value: { ...globalValue, projectOrder: newOrder } });
      }
    }
    if (error) {
      alert("Erreur lors de l'enregistrement : " + error.message);
    } else {
      setIsModalOpen(false); fetchData(); setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const tabs = [
    { id: "pages", label: "Postes", icon: FileText },
    { id: "media", label: "Médias", icon: ImageIcon },
    { id: "shop", label: "Boutique", icon: Zap },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "social", label: "Social", icon: Share2 },
    { id: "settings", label: "Réglages", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 p-8 flex flex-col justify-between bg-white/5 backdrop-blur-xl">
        <div>
          <Link href="/" className="inline-block mb-12 group">
            <motion.h1 className="font-serif text-3xl tracking-tighter text-primary-red group-hover:scale-105 transition-transform">
              CAILLAT
              <span className="block text-xs font-sans tracking-[0.2em] text-white/40 mt-1 uppercase">Console Admin</span>
            </motion.h1>
          </Link>
          <nav className="space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? "bg-primary-red text-white shadow-2xl shadow-primary-red/20 translate-x-2" : "text-white/60 hover:bg-white/5 hover:text-white hover:translate-x-1"}`}>
                  <Icon size={20} strokeWidth={1.5} />
                  <span className="font-medium tracking-wide flex-1 text-left">{tab.label}</span>
                  {tab.id === "messages" && messages.length > 0 && <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">{messages.length}</span>}
                </button>
              );
            })}
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 text-white/30 hover:text-primary-red transition-all p-4">
          <LogOut size={20} /> <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-16 overflow-y-auto relative bg-[#0a0a0a]">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <h2 className="font-serif text-5xl text-white italic">{tabs.find((t) => t.id === activeTab)?.label}</h2>
          {activeTab === "pages" && (
            <button onClick={() => { setEditingProject(null); setFormTitle(""); setFormCategory(""); setFormDate(""); setFormImage(""); setFormContent(""); setFormGallery([]); setIsModalOpen(true); }} className="bg-primary-red text-white px-8 py-3.5 rounded-2xl hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-bold shadow-2xl shadow-primary-red/30">
              <Plus size={18} /> NOUVEAU POSTE
            </button>
          )}
          {activeTab === "shop" && (
            <button onClick={() => { setEditingProduct(null); setProdName(""); setProdPrice(0); setProdDesc(""); setProdImages([]); setProdImagesText(""); setProdLink(""); setProdLinkText(""); setProdPurchaseMsg(""); setIsProductModalOpen(true); }} className="bg-primary-red text-white px-8 py-3.5 rounded-2xl hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-bold shadow-2xl shadow-primary-red/30">
              <Plus size={18} /> NOUVEAU PRODUIT
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "pages" && (
            <motion.div key="pages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {projects.map((project, idx) => (
                <div key={project.id} className="flex items-center gap-6 px-8 py-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-black/30 transition-all group shadow-xl">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveItem('projects', idx, 'up')} className="opacity-30 hover:opacity-100 text-white"><ArrowLeft size={14} className="rotate-90" /></button>
                    <button onClick={() => moveItem('projects', idx, 'down')} className="opacity-30 hover:opacity-100 text-white"><ArrowLeft size={14} className="-rotate-90" /></button>
                  </div>
                  <div className="flex-1 flex items-center gap-6">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10"><Image src={project.image} alt={project.title} fill className="object-cover" unoptimized /></div>
                    <div className="flex flex-col">
                      <span className="font-serif text-xl text-white">{project.title}</span>
                      <span className="text-[9px] font-bold text-white/40 tracking-[0.2em] uppercase">{project.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingProject(project); setFormTitle(project.title); setFormCategory(project.category || ""); setFormDate(project.date); setFormImage(project.image); setFormStatus(project.status); setFormLinkType(project.link_type); setFormUrl(project.url); setFormContent(project.content); setFormGallery(project.gallery || []); setIsModalOpen(true); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-primary-red transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => deleteProject(project.id)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "media" && (
            <motion.div key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative flex flex-col items-center justify-center min-h-[150px] border-2 border-dashed border-text-black/10 rounded-sm bg-white/20 hover:border-primary-red/30 transition-all cursor-pointer">
                  {isUploading ? <div className="animate-pulse text-primary-red font-bold">Envoi...</div> : (
                    <> <Upload className="mx-auto mb-2 text-primary-red" size={32} /> <p className="font-serif text-lg">Upload Local</p> <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} /> </>
                  )}
                </div>
                <button onClick={addMediaByUrl} className="flex flex-col items-center justify-center min-h-[150px] border-2 border-dashed border-text-black/10 rounded-sm bg-white/20 hover:border-primary-red/30 transition-all"> <LinkIcon className="mx-auto mb-2 text-primary-red" size={32} /> <p className="font-serif text-lg">Ajouter par URL</p> </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {mediaItems.map((item) => {
                  const ytId = getYoutubeId(item.url);
                  const displayUrl = ytId ? getYoutubeThumbnail(ytId) : item.url;
                  return (
                    <div key={item.id} className="group relative aspect-square border border-text-black/5 rounded-sm overflow-hidden shadow-sm bg-text-black/5">
                      <Image src={displayUrl} alt={item.name} fill className="object-cover" unoptimized />
                      {ytId && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Zap size={20} className="text-white fill-current" /></div>}
                      <div className="absolute inset-0 bg-soft-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <div className="flex flex-col gap-1 mr-2">
                          <button onClick={() => moveMediaItem(mediaItems.indexOf(item), 'left')} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-sm text-white transition-colors"><ArrowLeft size={14} /></button>
                          <button onClick={() => moveMediaItem(mediaItems.indexOf(item), 'right')} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-sm text-white transition-colors"><ArrowLeft size={14} className="rotate-180" /></button>
                        </div>
                        <button onClick={() => deleteMedia(item.id)} className="p-2 bg-red-600 text-white rounded-sm"><Trash2 size={14} /></button>
                      </div>
                      {ytId && <div className="absolute bottom-2 left-2 bg-text-black/80 text-white text-[8px] px-1.5 py-0.5 rounded-xs uppercase tracking-widest font-bold">Vidéo</div>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "social" && (
            <motion.div key="social" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl space-y-8">
              <div className="bg-white/40 border border-text-black/5 rounded-sm p-8 space-y-10">
                <div className="space-y-6"> <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4">Email</h3> <input type="email" value={socials.email} onChange={(e) => setSocials({...socials, email: e.target.value})} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" /> </div>
                <div className="space-y-8">
                  <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4">Réseaux</h3>
                  {[ { id: "linkedin", label: "LinkedIn", icon: FaLinkedin }, { id: "github", label: "GitHub", icon: FaGithub }, { id: "twitter", label: "Twitter (X)", icon: FaTwitter }, { id: "instagram", label: "Instagram", icon: FaInstagram }, { id: "youtube", label: "YouTube", icon: FaYoutube }, { id: "tiktok", label: "TikTok", icon: FaTiktok }, { id: "discord", label: "Discord", icon: FaDiscord }, { id: "phone", label: "Téléphone", icon: FaPhone } ].map((platform) => (
                    <div key={platform.id} className="flex items-center gap-8">
                      <div className="w-12 h-12 bg-text-black/5 rounded-sm flex items-center justify-center"><platform.icon size={20} /></div>
                      <div className="flex-1"> <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">{platform.label}</label> <input type="text" value={(socials as any)[platform.id]?.url || ""} onChange={(e) => setSocials({...socials, [platform.id]: {...(socials as any)[platform.id], url: e.target.value}})} className="w-full bg-transparent border-b border-text-black/20 py-1 outline-none text-sm" /> </div>
                      <button onClick={() => setSocials({...socials, [platform.id]: {...(socials as any)[platform.id], enabled: !(socials as any)[platform.id]?.enabled}})} className={`w-12 h-6 rounded-full transition-colors relative ${ (socials as any)[platform.id]?.enabled ? "bg-primary-red" : "bg-text-black/10" }`}> <motion.div animate={{ x: (socials as any)[platform.id]?.enabled ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" /> </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleSaveSocials} className="bg-text-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase">Sauvegarder</button>
              </div>
            </motion.div>
          )}

          {activeTab === "messages" && (
            <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-8 relative group shadow-2xl">
                  <button onClick={() => deleteMessage(msg.id)} className="absolute top-8 right-8 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/10 overflow-hidden relative shrink-0">
                      {(msg as any).profiles?.avatar_url ? (
                        <Image src={(msg as any).profiles.avatar_url} alt="Profile" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-red/10 text-primary-red">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="font-serif text-3xl text-white">{(msg as any).profiles?.full_name || msg.name || "Anonyme"}</h3>
                        <span className="text-white/40 text-xs">{(msg as any).profiles?.full_name ? `(${msg.name})` : ''}</span>
                        {msg.order_id && <span className="bg-primary-red/20 text-primary-red px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary-red/20 shadow-lg shadow-primary-red/10">Commande: {msg.order_id}</span>}
                        {msg.user_email && <span className="bg-blue-500/20 text-blue-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20 flex items-center gap-2"><User size={12} /> {msg.user_email}</span>}
                        {(msg as any).contact && <span className="bg-green-500/20 text-green-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20 flex items-center gap-2"><Phone size={12} /> {(msg as any).contact}</span>}
                      </div>
                      <h4 className="text-xl font-medium text-white/90">{msg.title}</h4>
                      <p className="text-base leading-relaxed text-white/70 bg-white/5 p-6 rounded-2xl border border-white/5">{msg.content}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {msg.replies && msg.replies.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        {msg.replies.map((rep, ridx) => (
                          <div key={ridx} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-40">
                              <span>Lucas</span>
                              <span>{rep.date}</span>
                            </div>
                            <p className="text-sm text-white/80">{rep.text}</p>
                            {rep.media && rep.media.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {rep.media.map((m, midx) => (
                                  <div key={midx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                                    <Image src={m.url} alt="Reply Media" fill className="object-cover" unoptimized />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-3">
                      {replyMedia[msg.id]?.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
                          {replyMedia[msg.id].map((m, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                              <Image src={m.url} alt="Pending Media" fill className="object-cover" unoptimized />
                              <button onClick={() => setReplyMedia({ ...replyMedia, [msg.id]: replyMedia[msg.id].filter((_, i) => i !== idx) })} className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4 items-end">
                        <div className="flex-1 relative">
                          <textarea 
                            placeholder="Votre réponse..." 
                            value={replyText[msg.id] || ""} 
                            onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })} 
                            rows={2} 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white outline-none focus:border-primary-red transition-all resize-none" 
                          />
                          <button 
                            onClick={() => {
                              const url = prompt("URL de l'image :");
                              if (url) {
                                const current = replyMedia[msg.id] || [];
                                setReplyMedia({ ...replyMedia, [msg.id]: [...current, { url, type: 'image' }] });
                              }
                            }}
                            className="absolute right-4 bottom-4 text-white/30 hover:text-primary-red transition-colors"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                        <button onClick={() => handleReply(msg.id)} className="bg-primary-red text-white px-8 py-4 text-xs font-bold rounded-2xl flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl shadow-primary-red/20 h-[52px]"> <Send size={16} /> RÉPONDRE </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProfiles.map((profile) => {
                  const userMessages = messages.filter(m => m.user_id === profile.id);
                  return (
                    <div key={profile.id} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-5 group hover:bg-black/30 transition-all shadow-xl">
                      <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 overflow-hidden relative shrink-0">
                        {profile.avatar_url ? (
                          <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <User size={32} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-white truncate">{profile.full_name || "Anonyme"}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 truncate">ID: {profile.id.substring(0, 8)}...</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold bg-primary-red/10 text-primary-red px-2 py-0.5 rounded-full border border-primary-red/20">
                            {userMessages.length} message{userMessages.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "shop" && (
            <motion.div key="shop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {products.length === 0 ? <p className="text-center py-20 text-white/30 italic">Aucun produit en vente.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product, idx) => (
                    <div key={product.id} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden group shadow-2xl transition-all hover:bg-black/30">
                      <div className="relative aspect-square">
                        <Image src={product.images[0] || ""} alt={product.name} fill className="object-cover" unoptimized />
                        <div className="absolute top-4 right-4 bg-primary-red text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">{product.price}€</div>
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <button onClick={() => moveItem('products', idx, 'up')} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all"><ArrowLeft size={14} className="rotate-90" /></button>
                          <button onClick={() => moveItem('products', idx, 'down')} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all"><ArrowLeft size={14} className="-rotate-90" /></button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <h3 className="font-serif text-2xl text-white">{product.name}</h3>
                        <div className="flex justify-between items-center pt-6 border-t border-white/10">
                          <button onClick={() => { setEditingProduct(product); setProdName(product.name); setProdPrice(product.price); setProdDesc(product.description); setProdImages(product.images); setProdImagesText(product.images.join('\n')); setProdLink(product.link || ""); setProdLinkText(product.link_text || ""); setProdPurchaseMsg(product.purchase_message || ""); setIsProductModalOpen(true); }} className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-primary-red transition-colors flex items-center gap-2"><Edit2 size={14} /> Modifier</button>
                          <button onClick={() => deleteProduct(product.id)} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors flex items-center gap-2"><Trash2 size={14} /> Supprimer</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl space-y-8">
              <div className="bg-white/40 border border-text-black/5 rounded-sm p-8 space-y-8">
                <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4">Musique & Hero</h3>
                <div className="grid grid-cols-2 gap-6"> <input type="text" value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="URL YouTube Music" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" /> <input type="text" value={musicCover} onChange={(e) => setMusicCover(e.target.value)} placeholder="URL Pochette" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" /> </div>
                <div className="flex items-center gap-3"> <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Musique Active</span> <button onClick={() => setMusicEnabled(!musicEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${ musicEnabled ? "bg-primary-red" : "bg-text-black/10" }`}> <motion.div animate={{ x: musicEnabled ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" /> </button> </div>
                <div className="grid grid-cols-2 gap-6"> <input type="text" value={heroTitleMain} onChange={(e) => setHeroTitleMain(e.target.value)} placeholder="Titre Principal" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none font-serif text-xl" /> <input type="text" value={heroTitleSub} onChange={(e) => setHeroTitleSub(e.target.value)} placeholder="Titre Secondaire" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none font-serif italic text-xl" /> </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Image d&apos;effet de texte (Remplace la couleur)</label>
                  <input type="text" value={textEffectImage} onChange={(e) => setTextEffectImage(e.target.value)} placeholder="URL Image (ex: grain, gradient...)" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Modèle 3D Arrière-plan</span>
                  <button onClick={() => setShow3DBackground(!show3DBackground)} className={`w-12 h-6 rounded-full transition-colors relative ${ show3DBackground ? "bg-primary-red" : "bg-text-black/10" }`}>
                    <motion.div animate={{ x: show3DBackground ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Rotation Image Lecteur</span>
                  <button onClick={() => setMusicRotationEnabled(!musicRotationEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${ musicRotationEnabled ? "bg-primary-red" : "bg-text-black/10" }`}>
                    <motion.div animate={{ x: musicRotationEnabled ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" />
                  </button>
                </div>

                <div className="space-y-6 pt-6 border-t border-text-black/10">
                  <h3 className="font-serif text-2xl">Configuration des Sections</h3>
                  <div className="space-y-4">
                    {sectionsConfig.map((section, idx) => (
                      <div key={section.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-sm border border-text-black/5">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => moveSection(idx, 'up')} className="opacity-30 hover:opacity-100"><ArrowLeft size={12} className="rotate-90" /></button>
                          <button onClick={() => moveSection(idx, 'down')} className="opacity-30 hover:opacity-100"><ArrowLeft size={12} className="-rotate-90" /></button>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase opacity-40">Titre</label>
                            <input type="text" value={section.label} onChange={(e) => {
                              const newSections = [...sectionsConfig];
                              newSections[idx].label = e.target.value;
                              setSectionsConfig(newSections);
                            }} className="w-full bg-transparent border-b border-text-black/10 py-1 text-sm outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase opacity-40">Sous-titre</label>
                            <input type="text" value={section.subLabel || ""} onChange={(e) => {
                              const newSections = [...sectionsConfig];
                              newSections[idx].subLabel = e.target.value;
                              setSectionsConfig(newSections);
                            }} className="w-full bg-transparent border-b border-text-black/10 py-1 text-sm outline-none" />
                          </div>
                        </div>
                        <button onClick={() => {
                          const newSections = [...sectionsConfig];
                          newSections[idx].visible = !newSections[idx].visible;
                          setSectionsConfig(newSections);
                        }} className={`w-10 h-5 rounded-full transition-colors relative ${ section.visible ? "bg-primary-red" : "bg-text-black/10" }`}>
                          <motion.div animate={{ x: section.visible ? 20 : 4 }} className="w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleSaveSettings} className="bg-text-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase hover:bg-primary-red transition-colors">Enregistrer les réglages</button>
                <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4 pt-4">Sécurité (A2F)</h3>
                <div className="space-y-6">
                  {mfaFactors.length > 0 ? (
                    <div className="bg-green-600/5 p-6 rounded-sm border border-green-600/10 flex justify-between items-center">
                      <div className="flex items-center gap-3 text-green-600"><Check size={20} /><div><p className="font-bold text-sm uppercase tracking-widest">A2F Activée</p></div></div>
                      <button onClick={() => handleMfaUnenroll(mfaFactors[0].id)} className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline">Désactiver</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!mfaEnrollment ? (
                        <button type="button" onClick={handleMfaEnroll} className="bg-primary-red text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xs hover:bg-red-600 transition-all">Activer l&apos;A2F</button>
                      ) : (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl space-y-8">
                          <QRCodeSVG value={mfaEnrollment.totp.uri} size={180} />
                          <input type="text" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="000 000" className="flex-1 bg-white/5 border border-white/10 py-4 rounded-xl outline-none text-center text-3xl tracking-[0.2em] font-serif focus:border-primary-red transition-all text-white" maxLength={6} autoFocus />
                          <button type="button" onClick={handleMfaVerify} className="bg-text-black text-white px-8 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xs">Vérifier & Activer</button>
                          {mfaError && <p className="text-red-600 text-[10px] font-bold uppercase">{mfaError}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProductModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto text-white">
                <form onSubmit={handleSubmitProduct} className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-6"><h3 className="font-serif text-3xl italic text-primary-red">Produit</h3><button type="button" onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"><X size={24} /></button></div>
                  <button type="submit" className="w-full bg-primary-red text-white py-4 rounded-2xl font-bold text-xs tracking-widest uppercase hover:bg-red-600 transition-all shadow-2xl shadow-primary-red/30">Enregistrer le Produit</button>
                </form>
              </motion.div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-5xl bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 max-h-[90vh] overflow-y-auto text-white">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex justify-between items-center border-b border-white/10 pb-6"><h3 className="font-serif text-4xl italic text-primary-red">Poste</h3><button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"><X size={24} /></button></div>
                  <button type="submit" className="w-full bg-primary-red text-white py-5 rounded-2xl font-bold text-xs tracking-widest uppercase hover:bg-red-600 transition-all shadow-2xl shadow-primary-red/30">ENREGISTRER LE POSTE</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {uploadSuccess && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="fixed bottom-12 right-12 bg-primary-red text-white px-8 py-4 rounded-2xl font-bold text-xs tracking-widest shadow-2xl uppercase flex items-center gap-3 border border-white/20 backdrop-blur-xl">
            <Check size={18} /> Synchronisé !
          </motion.div>
        )}

        {selectedAttachment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAttachment(null)} className="absolute inset-0 bg-soft-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full h-full flex items-center justify-center">
              <button onClick={() => setSelectedAttachment(null)} className="absolute top-8 right-8 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"><CloseIcon size={32} /></button>
              <div className="relative w-full h-full"><Image src={selectedAttachment} alt="full-attachment" fill className="object-contain" unoptimized /></div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
