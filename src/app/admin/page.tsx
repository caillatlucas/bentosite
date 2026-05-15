"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Settings, FileText, Image as ImageIcon, 
  LogOut, Check, X as CloseIcon, Edit2, Trash2, Upload, AlertCircle, Link as LinkIcon,
  Share2, Mail, MessageSquare, Zap, User, Clock, Music, Play, Pause, Send, ArrowLeft
} from "lucide-react";
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaGlobe } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  created_at?: string;
}

interface SocialConfig {
  email: string;
  linkedin: { url: string; enabled: boolean };
  github: { url: string; enabled: boolean };
  twitter: { url: string; enabled: boolean };
  instagram: { url: string; enabled: boolean };
  youtube: { url: string; enabled: boolean };
  tiktok: { url: string; enabled: boolean };
  customLinks: { name: string; url: string; enabled: boolean }[];
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
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();
  
  // Settings State
  const [profileName, setProfileName] = useState("Lucas Caillat");
  const [profileProfession, setProfileProfession] = useState("Freelance Informatique");
  const [profileBio, setProfileBio] = useState("");
  const [projectsTitle, setProjectsTitle] = useState("Sélection 2024");
  const [recentProjectsTitle, setRecentProjectsTitle] = useState("Projets Récents");
  const [galleryTitle, setGalleryTitle] = useState("Galerie");
  const [bentoGridTitle, setBentoGridTitle] = useState("Bento Grid");
  const [heroTitleMain, setHeroTitleMain] = useState("CAILLAT");
  const [heroTitleSub, setHeroTitleSub] = useState("Lucas");
  const [textEffectImage, setTextEffectImage] = useState("");
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const [musicCover, setMusicCover] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#ff3131");
  const [sectionsConfig, setSectionsConfig] = useState([
    { id: 'projects', label: 'Projets', visible: true },
    { id: 'shop', label: 'Boutique', visible: true },
    { id: 'gallery', label: 'Galerie', visible: true },
    { id: 'bento', label: 'Bento Grid', visible: true }
  ]);

  const [socials, setSocials] = useState<SocialConfig>({
    email: "contact@lucascaillat.fr",
    linkedin: { url: "https://linkedin.com/in/lucascaillat", enabled: true },
    github: { url: "https://github.com/lucascaillat", enabled: true },
    twitter: { url: "https://twitter.com/lucascaillat", enabled: false },
    instagram: { url: "https://instagram.com/lucascaillat", enabled: false },
    youtube: { url: "", enabled: false },
    tiktok: { url: "", enabled: false },
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

  // Product Form State
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState(0);
  const [prodDesc, setProdDesc] = useState("");
  const [prodImages, setProdImages] = useState<string[]>([]);

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth !== "true") router.push("/admin/login");
    fetchData();

    // Real-time Messages
    const msgChannel = supabase.channel('admin-msgs')
      .on('postgres_changes', { event: 'INSERT', table: 'messages', schema: 'public' }, (payload) => {
        setMessages(prev => [payload.new as Message, ...prev]);
        // Play sound or notification if needed
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
    const { data: pData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (pData) setProjects(pData);
    const { data: mData } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    if (mData) setMediaItems(mData);
    const { data: msgData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (msgData) setMessages(msgData);
    const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (prodData) setProducts(prodData);
    const { data: sData } = await supabase.from('settings').select('*');
    if (sData) {
      const global = sData.find(s => s.key === 'global')?.value;
      if (global) {
        setProfileName(global.name || "Lucas Caillat");
        setProfileProfession(global.profession || "Freelance Informatique");
        setProfileBio(global.bio || "");
        setProjectsTitle(global.projectsTitle || "Sélection 2024");
        setRecentProjectsTitle(global.recentProjectsTitle || "Projets Récents");
        setGalleryTitle(global.galleryTitle || "Galerie");
        setBentoGridTitle(global.bentoGridTitle || "Bento Grid");
        setHeroTitleMain(global.heroTitleMain || "CAILLAT");
        setHeroTitleSub(global.heroTitleSub || "Lucas");
        setTextEffectImage(global.textEffectImage || "");
        setMusicEnabled(global.musicEnabled || false);
        setMusicUrl(global.musicUrl || "");
        setMusicCover(global.musicCover || "");
        setPrimaryColor(global.primaryColor || "#ff3131");
        if (global.sectionsConfig) setSectionsConfig(global.sectionsConfig);
      }
      const soc = sData.find(s => s.key === 'socials')?.value;
      if (soc) setSocials(soc);
    }
  };

  const handleSaveSettings = async () => {
    const s = { 
      name: profileName, 
      profession: profileProfession, 
      bio: profileBio, 
      projectsTitle, 
      recentProjectsTitle,
      galleryTitle, 
      bentoGridTitle,
      heroTitleMain, 
      heroTitleSub, 
      textEffectImage,
      musicEnabled, 
      musicUrl, 
      musicCover,
      primaryColor,
      sectionsConfig
    };
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
    const reply = replyText[msgId];
    if (!reply) return;
    const { error } = await supabase.from('messages').update({ reply }).eq('id', msgId);
    if (!error) {
      setMessages(messages.map(m => m.id === msgId ? { ...m, reply } : m));
      setReplyText({ ...replyText, [msgId]: "" });
      alert("Réponse envoyée !");
    }
  };

  const deleteProject = async (id: string) => { if (confirm("Supprimer?")) { await supabase.from('projects').delete().eq('id', id); setProjects(projects.filter(p => p.id !== id)); } };
  const deleteMedia = async (id: string) => { await supabase.from('media').delete().eq('id', id); setMediaItems(mediaItems.filter(m => m.id !== id)); };
  const deleteMessage = async (id: string) => { await supabase.from('messages').delete().eq('id', id); setMessages(messages.filter(m => m.id !== id)); };

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
    const pData = { name: prodName, price: prodPrice, description: prodDesc, images: prodImages };
    if (editingProduct) await supabase.from('products').update(pData).eq('id', editingProduct.id);
    else await supabase.from('products').insert(pData);
    setIsProductModalOpen(false); fetchData();
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
    if (url) {
      setFormGallery([...formGallery, { url, type }]);
    }
  };

  const removeGalleryItem = (idx: number) => {
    setFormGallery(formGallery.filter((_, i) => i !== idx));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectData: any = { 
      title: formTitle, 
      category: formCategory || null, 
      date: formDate, 
      image: formImage, 
      status: formStatus, 
      link_type: formLinkType, 
      url: formUrl, 
      content: formContent
    };
    
    // Only add gallery if it's not empty to avoid schema issues if the column doesn't exist yet
    if (formGallery && formGallery.length > 0) {
      projectData.gallery = formGallery;
    }

    let error;
    if (editingProject) {
      const { error: err } = await supabase.from('projects').update(projectData).eq('id', editingProject.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('projects').insert(projectData);
      error = err;
    }

    if (error) {
      console.error("Erreur Supabase:", error);
      alert("Erreur lors de l'enregistrement : " + error.message + "\nAssurez-vous que la colonne 'gallery' existe dans votre table 'projects' sur Supabase.");
    } else {
      setIsModalOpen(false); 
      fetchData();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const tabs = [
    { id: "pages", label: "Projets", icon: FileText },
    { id: "media", label: "Médias", icon: ImageIcon },
    { id: "shop", label: "Boutique", icon: Zap },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "social", label: "Social", icon: Share2 },
    { id: "settings", label: "Réglages", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-text-black font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-text-black/10 p-8 flex flex-col justify-between bg-white/30 backdrop-blur-sm">
        <div>
          <Link href="/" className="inline-block mb-12 group">
            <motion.h1 className="font-serif text-3xl tracking-tighter text-primary-red group-hover:scale-105 transition-transform">
              CAILLAT
              <span className="block text-xs font-sans tracking-[0.2em] text-text-black opacity-40 mt-1 uppercase">Console Admin</span>
            </motion.h1>
          </Link>
          <nav className="space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-sm transition-all duration-300 ${activeTab === tab.id ? "bg-text-black text-background shadow-lg translate-x-2" : "text-text-black hover:bg-text-black/5 hover:translate-x-1"}`}>
                  <Icon size={20} strokeWidth={1.5} />
                  <span className="font-medium tracking-wide flex-1 text-left">{tab.label}</span>
                  {tab.id === "messages" && messages.length > 0 && <span className="bg-primary-red text-white text-[10px] px-2 py-0.5 rounded-full">{messages.length}</span>}
                </button>
              );
            })}
          </nav>
        </div>
        <button onClick={() => { localStorage.removeItem("admin_auth"); router.push("/admin/login"); }} className="flex items-center gap-3 text-text-black/50 hover:text-primary-red transition-all p-4">
          <LogOut size={20} /> <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-16 overflow-y-auto relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <h2 className="font-serif text-5xl text-soft-black italic">{tabs.find((t) => t.id === activeTab)?.label}</h2>
          {activeTab === "pages" && (
            <button onClick={() => { setEditingProject(null); setFormTitle(""); setFormCategory(""); setFormDate(""); setFormImage(""); setFormContent(""); setFormGallery([]); setIsModalOpen(true); }} className="bg-primary-red text-white px-8 py-3.5 rounded-sm hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-bold shadow-xl shadow-shadow-red/20">
              <Plus size={18} /> NOUVEAU PROJET
            </button>
          )}
          {activeTab === "shop" && (
            <button onClick={() => { setEditingProduct(null); setProdName(""); setProdPrice(0); setProdDesc(""); setProdImages([]); setIsProductModalOpen(true); }} className="bg-primary-red text-white px-8 py-3.5 rounded-sm hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-bold shadow-xl shadow-shadow-red/20">
              <Plus size={18} /> NOUVEAU PRODUIT
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "pages" && (
            <motion.div key="pages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {projects.map((project) => (
                <div key={project.id} className="grid grid-cols-12 gap-4 items-center px-8 py-6 bg-white/60 border border-text-black/5 rounded-sm hover:border-primary-red/20 transition-all group">
                  <div className="col-span-6 md:col-span-4 flex items-center gap-6">
                    <div className="relative w-16 h-16 rounded-sm overflow-hidden"><Image src={project.image} alt={project.title} fill className="object-cover" unoptimized /></div>
                    <span className="font-serif text-xl">{project.title}</span>
                  </div>
                  <div className="col-span-4 hidden md:block text-[10px] font-bold text-text-black/40 tracking-widest uppercase truncate">{project.date}</div>
                  <div className="col-span-2 text-right flex justify-end gap-4">
                    <button onClick={() => { setEditingProject(project); setFormTitle(project.title); setFormCategory(project.category || ""); setFormDate(project.date); setFormImage(project.image); setFormStatus(project.status); setFormLinkType(project.link_type); setFormUrl(project.url); setFormContent(project.content); setFormGallery(project.gallery || []); setIsModalOpen(true); }} className="p-2 text-text-black/30 hover:text-primary-red"><Edit2 size={16} /></button>
                    <button onClick={() => deleteProject(project.id)} className="p-2 text-text-black/30 hover:text-red-600"><Trash2 size={16} /></button>
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
                      {ytId && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Zap size={20} className="text-white fill-current" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-soft-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
                  {[ 
                    { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedin }, 
                    { id: 'github', label: 'GitHub', icon: FaGithub }, 
                    { id: 'twitter', label: 'Twitter (X)', icon: FaTwitter }, 
                    { id: 'instagram', label: 'Instagram', icon: FaInstagram },
                    { id: 'youtube', label: 'YouTube', icon: FaYoutube },
                    { id: 'tiktok', label: 'TikTok', icon: FaTiktok }
                  ].map((platform) => (
                    <div key={platform.id} className="flex items-center gap-8">
                      <div className="w-12 h-12 bg-text-black/5 rounded-sm flex items-center justify-center"><platform.icon size={20} /></div>
                      <div className="flex-1"> <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">{platform.label}</label> <input type="text" value={(socials as any)[platform.id]?.url || ""} onChange={(e) => setSocials({...socials, [platform.id]: {...(socials as any)[platform.id], url: e.target.value}})} className="w-full bg-transparent border-b border-text-black/20 py-1 outline-none text-sm" /> </div>
                      <button onClick={() => setSocials({...socials, [platform.id]: {...(socials as any)[platform.id], enabled: !(socials as any)[platform.id]?.enabled}})} className={`w-12 h-6 rounded-full transition-colors relative ${ (socials as any)[platform.id]?.enabled ? 'bg-primary-red' : 'bg-text-black/10' }`}> <motion.div animate={{ x: (socials as any)[platform.id]?.enabled ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" /> </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 pt-4">
                  <div className="flex justify-between items-center border-b border-text-black/10 pb-4">
                    <h3 className="font-serif text-2xl">Liens Personnalisés</h3>
                    <button onClick={() => setSocials({...socials, customLinks: [...(socials.customLinks || []), { name: "Nouveau Lien", url: "https://", enabled: true }]})} className="text-primary-red flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      <Plus size={16} /> Ajouter
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(socials.customLinks || []).map((link, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-text-black/5 p-4 rounded-sm group">
                        <FaGlobe size={18} className="opacity-30" />
                        <input type="text" value={link.name} onChange={(e) => {
                          const newLinks = [...socials.customLinks];
                          newLinks[idx].name = e.target.value;
                          setSocials({...socials, customLinks: newLinks});
                        }} className="w-32 bg-transparent border-b border-text-black/10 text-xs font-bold uppercase outline-none" />
                        <input type="text" value={link.url} onChange={(e) => {
                          const newLinks = [...socials.customLinks];
                          newLinks[idx].url = e.target.value;
                          setSocials({...socials, customLinks: newLinks});
                        }} className="flex-1 bg-transparent border-b border-text-black/10 text-sm outline-none" />
                        <button onClick={() => setSocials({...socials, customLinks: socials.customLinks.filter((_, i) => i !== idx)})} className="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-red-600 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={handleSaveSocials} className="bg-text-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase">Sauvegarder</button>
              </div>
            </motion.div>
          )}

          {activeTab === "messages" && (
            <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-white/60 border border-text-black/5 rounded-sm p-8 space-y-6 relative group">
                  <button onClick={() => deleteMessage(msg.id)} className="absolute top-6 right-6 text-text-black/20 hover:text-red-600"><Trash2 size={18} /></button>
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-2xl text-soft-black">{msg.title}</h3>
                    {msg.order_id && <span className="bg-primary-red/10 text-primary-red px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-xs">Commande: {msg.order_id}</span>}
                  </div>
                  <p className="text-sm leading-relaxed text-text-black/70">{msg.content}</p>
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {msg.attachments.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-sm overflow-hidden border border-text-black/10">
                          <Image src={url} alt="attachment" fill className="object-cover" unoptimized />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Par {msg.name} le {msg.date} • {msg.contact}</div>
                  
                  <div className="mt-8 pt-8 border-t border-text-black/10">
                    {msg.reply ? (
                      <div className="bg-primary-red/5 p-4 rounded-sm border-l-2 border-primary-red">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-red mb-2">Ma Réponse :</p>
                        <p className="text-sm italic">{msg.reply}</p>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          placeholder="Écrire une réponse..." 
                          value={replyText[msg.id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                          className="flex-1 bg-transparent border-b border-text-black/10 py-2 text-sm outline-none focus:border-primary-red"
                        />
                        <button onClick={() => handleReply(msg.id)} className="bg-text-black text-white px-6 py-2 text-xs font-bold rounded-sm flex items-center gap-2"> <Send size={14} /> RÉPONDRE </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "shop" && (
            <motion.div key="shop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {products.length === 0 ? <p className="text-center py-20 opacity-30 italic">Aucun produit en vente.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white/60 border border-text-black/5 rounded-sm overflow-hidden group">
                      <div className="relative aspect-square">
                        <Image src={product.images[0] || ""} alt={product.name} fill className="object-cover" unoptimized />
                        <div className="absolute top-4 right-4 bg-text-black text-white px-3 py-1 text-xs font-bold">{product.price}€</div>
                      </div>
                      <div className="p-6 space-y-4">
                        <h3 className="font-serif text-xl">{product.name}</h3>
                        <div className="flex justify-between items-center pt-4 border-t border-text-black/5">
                          <button onClick={() => { setEditingProduct(product); setProdName(product.name); setProdPrice(product.price); setProdDesc(product.description); setProdImages(product.images); setIsProductModalOpen(true); }} className="text-[10px] font-bold uppercase tracking-widest hover:text-primary-red transition-colors flex items-center gap-2"><Edit2 size={14} /> Modifier</button>
                          <button onClick={() => deleteProduct(product.id)} className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"><Trash2 size={14} /> Supprimer</button>
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
                <div className="flex items-center gap-3"> <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Musique Active</span> <button onClick={() => setMusicEnabled(!musicEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${ musicEnabled ? 'bg-primary-red' : 'bg-text-black/10' }`}> <motion.div animate={{ x: musicEnabled ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" /> </button> </div>
                <div className="grid grid-cols-2 gap-6"> <input type="text" value={heroTitleMain} onChange={(e) => setHeroTitleMain(e.target.value)} placeholder="Titre Principal" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none font-serif text-xl" /> <input type="text" value={heroTitleSub} onChange={(e) => setHeroTitleSub(e.target.value)} placeholder="Titre Secondaire" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none font-serif italic text-xl" /> </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Image d'effet de texte (Remplace la couleur)</label>
                  <input type="text" value={textEffectImage} onChange={(e) => setTextEffectImage(e.target.value)} placeholder="URL Image (ex: grain, gradient...)" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Couleur Principale</label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-sm border-none cursor-pointer bg-transparent" />
                    <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 bg-transparent border-b border-text-black/20 py-2 outline-none text-sm font-mono uppercase" />
                  </div>
                </div>
                
                <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4 pt-4">Visibilité & Ordre des Sections</h3>
                <div className="space-y-4">
                  {sectionsConfig.map((section, idx) => (
                    <div key={section.id} className="flex items-center gap-6 bg-text-black/5 p-4 rounded-sm group">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveSection(idx, 'up')} className="opacity-30 hover:opacity-100"><ArrowLeft size={14} className="rotate-90" /></button>
                        <button onClick={() => moveSection(idx, 'down')} className="opacity-30 hover:opacity-100"><ArrowLeft size={14} className="-rotate-90" /></button>
                      </div>
                      <span className="flex-1 font-serif text-lg">{section.label}</span>
                      <button onClick={() => {
                        const newSections = [...sectionsConfig];
                        newSections[idx].visible = !newSections[idx].visible;
                        setSectionsConfig(newSections);
                      }} className={`w-12 h-6 rounded-full transition-colors relative ${ section.visible ? 'bg-primary-red' : 'bg-text-black/10' }`}>
                        <motion.div animate={{ x: section.visible ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" />
                      </button>
                    </div>
                  ))}
                </div>

                <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4 pt-4">Titres des Sections</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Projets Récents (Grand)</label>
                    <input type="text" value={recentProjectsTitle} onChange={(e) => setRecentProjectsTitle(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Sélection 2024 (Petit)</label>
                    <input type="text" value={projectsTitle} onChange={(e) => setProjectsTitle(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Galerie (Grand)</label>
                    <input type="text" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Bento Grid (Petit)</label>
                    <input type="text" value={bentoGridTitle} onChange={(e) => setBentoGridTitle(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" />
                  </div>
                </div>

                <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4 pt-4">Profil</h3>
                <div className="grid grid-cols-2 gap-6"> <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nom" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" /> <input type="text" value={profileProfession} onChange={(e) => setProfileProfession(e.target.value)} placeholder="Profession" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" /> </div>
                <textarea value={profileBio} onChange={(e) => setProfileBio(e.target.value)} rows={3} placeholder="Bio" className="w-full bg-transparent border border-text-black/10 p-4 outline-none resize-none" />
                <button onClick={handleSaveSettings} className="bg-text-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase">Enregistrer</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProductModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-soft-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-background border border-text-black/10 rounded-sm shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmitProduct} className="space-y-6">
                  <div className="flex justify-between items-center border-b border-text-black/10 pb-6">
                    <h3 className="font-serif text-3xl italic">{editingProduct ? "Modifier" : "Nouveau"} Produit</h3>
                    <button type="button" onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-text-black/5 rounded-full transition-colors"><CloseIcon size={24} /></button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Nom du produit</label>
                        <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Prix (€)</label>
                        <input type="number" value={prodPrice} onChange={(e) => setProdPrice(Number(e.target.value))} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Images (Une URL par ligne)</label>
                      <textarea value={prodImages.join('\n')} onChange={(e) => setProdImages(e.target.value.split('\n').filter(l => l.trim()))} rows={3} className="w-full bg-transparent border border-text-black/10 p-3 outline-none text-sm" placeholder="https://..." />
                      <div className="flex gap-2 overflow-x-auto py-2">
                        {prodImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xs overflow-hidden border border-text-black/10 flex-shrink-0">
                            <Image src={img} alt="preview" fill className="object-cover" unoptimized />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Description</label>
                      <textarea value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} rows={5} className="w-full bg-transparent border border-text-black/10 p-4 outline-none resize-none text-sm" placeholder="Description du produit..." />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-text-black text-white py-4 font-bold text-xs tracking-widest uppercase hover:bg-soft-black transition-all">Enregistrer le Produit</button>
                </form>
              </motion.div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-soft-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-5xl bg-background border border-text-black/10 rounded-sm shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex justify-between items-center border-b border-text-black/10 pb-6">
                    <h3 className="font-serif text-3xl italic">{editingProject ? "Modifier" : "Nouveau"} Projet</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-text-black/5 rounded-full transition-colors"><CloseIcon size={24} /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Titre du projet</label>
                        <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none font-serif text-xl" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Catégorie</label>
                          <input type="text" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Date / Année</label>
                          <input type="text" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Image Principale (URL)</label>
                        <input type="text" value={formImage} onChange={(e) => setFormImage(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Lien</label>
                          <select value={formLinkType} onChange={(e:any) => setFormLinkType(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm">
                            <option value="internal">Interne</option>
                            <option value="external">Externe</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">URL / Slug</label>
                          <input type="text" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Carrousel Media (Galerie)</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => addGalleryItem('image')} className="text-[9px] font-bold text-primary-red uppercase border border-primary-red/20 px-2 py-1 rounded-xs">+ Image</button>
                          <button type="button" onClick={() => addGalleryItem('video')} className="text-[9px] font-bold text-primary-red uppercase border border-primary-red/20 px-2 py-1 rounded-xs">+ Vidéo YT</button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {formGallery.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-text-black/5 p-3 rounded-sm group">
                            <div className="relative w-12 h-12 rounded-xs overflow-hidden flex-shrink-0">
                              <Image src={item.type === 'video' ? `https://img.youtube.com/vi/${getYoutubeId(item.url)}/default.jpg` : item.url} alt="Gallery" fill className="object-cover" unoptimized />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-bold uppercase opacity-30 mb-1">{item.type === 'video' ? 'YouTube' : 'Image'}</p>
                              <p className="text-[10px] truncate opacity-60">{item.url}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => moveGalleryItem(idx, 'up')} className="p-1 hover:text-primary-red opacity-0 group-hover:opacity-100 transition-opacity"><ArrowLeft size={12} className="rotate-90" /></button>
                              <button type="button" onClick={() => moveGalleryItem(idx, 'down')} className="p-1 hover:text-primary-red opacity-0 group-hover:opacity-100 transition-opacity"><ArrowLeft size={12} className="-rotate-90" /></button>
                              <button type="button" onClick={() => removeGalleryItem(idx)} className="p-1 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                        {formGallery.length === 0 && <p className="text-center py-8 text-xs opacity-20 italic">Aucun média dans la galerie</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Description (Contenu HTML)</label>
                      <button type="button" onClick={() => setIsPreviewMode(!isPreviewMode)} className="text-[10px] font-bold uppercase tracking-widest text-primary-red underline">
                        {isPreviewMode ? "Éditeur" : "Prévisualisation"}
                      </button>
                    </div>
                    {isPreviewMode ? (
                      <div className="w-full bg-text-black/5 p-4 rounded-sm min-h-[200px] prose prose-sm max-w-none prose-invert text-text-black" dangerouslySetInnerHTML={{ __html: formContent }} />
                    ) : (
                      <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={10} className="w-full bg-text-black/5 p-4 rounded-sm outline-none focus:border-primary-red resize-none text-sm" placeholder="Contenu du projet..." required />
                    )}
                  </div>

                  <button type="submit" className="w-full bg-text-black text-white py-5 rounded-sm font-bold text-xs tracking-widest uppercase hover:bg-soft-black transition-all shadow-xl">
                    ENREGISTRER LE PROJET
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {uploadSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className="fixed bottom-12 right-12 bg-green-600 text-white px-8 py-3 rounded-sm font-bold text-xs tracking-widest shadow-2xl uppercase"
          >
            Synchronisé !
          </motion.div>
        )}
      </main>
    </div>
  );
}
