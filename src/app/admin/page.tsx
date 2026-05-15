"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Settings, FileText, Image as ImageIcon, 
  LogOut, Check, X as CloseIcon, Edit2, Trash2, Upload, AlertCircle, Link as LinkIcon,
  Share2, Mail, MessageSquare, Zap, User, Clock, Music, Play, Pause, Send
} from "lucide-react";
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";
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
}

interface SocialConfig {
  email: string;
  linkedin: { url: string; enabled: boolean };
  github: { url: string; enabled: boolean };
  twitter: { url: string; enabled: boolean };
  instagram: { url: string; enabled: boolean };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("pages");
  const [projects, setProjects] = useState<Project[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  
  // Settings State
  const [profileName, setProfileName] = useState("Lucas Caillat");
  const [profileProfession, setProfileProfession] = useState("Freelance Informatique");
  const [profileBio, setProfileBio] = useState("");
  const [projectsTitle, setProjectsTitle] = useState("Sélection 2024");
  const [galleryTitle, setGalleryTitle] = useState("Galerie");
  const [heroTitleMain, setHeroTitleMain] = useState("CAILLAT");
  const [heroTitleSub, setHeroTitleSub] = useState("Lucas");
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const [musicCover, setMusicCover] = useState("");

  const [socials, setSocials] = useState<SocialConfig>({
    email: "contact@lucascaillat.fr",
    linkedin: { url: "https://linkedin.com/in/lucascaillat", enabled: true },
    github: { url: "https://github.com/lucascaillat", enabled: true },
    twitter: { url: "https://twitter.com/lucascaillat", enabled: false },
    instagram: { url: "https://instagram.com/lucascaillat", enabled: false },
  });

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formStatus, setFormStatus] = useState<"Publié" | "Brouillon">("Publié");
  const [formLinkType, setFormLinkType] = useState<"external" | "internal">("internal");
  const [formUrl, setFormUrl] = useState("");
  const [formContent, setFormContent] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth !== "true") router.push("/admin/login");
    fetchData();
  }, [router]);

  const fetchData = async () => {
    const { data: pData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (pData) setProjects(pData);
    const { data: mData } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    if (mData) setMediaItems(mData);
    const { data: msgData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (msgData) setMessages(msgData);
    const { data: sData } = await supabase.from('settings').select('*');
    if (sData) {
      const global = sData.find(s => s.key === 'global')?.value;
      if (global) {
        setProfileName(global.name || "Lucas Caillat");
        setProfileProfession(global.profession || "Freelance Informatique");
        setProfileBio(global.bio || "");
        setProjectsTitle(global.projectsTitle || "Sélection 2024");
        setGalleryTitle(global.galleryTitle || "Galerie");
        setHeroTitleMain(global.heroTitleMain || "CAILLAT");
        setHeroTitleSub(global.heroTitleSub || "Lucas");
        setMusicEnabled(global.musicEnabled || false);
        setMusicUrl(global.musicUrl || "");
        setMusicCover(global.musicCover || "");
      }
      const soc = sData.find(s => s.key === 'socials')?.value;
      if (soc) setSocials(soc);
    }
  };

  const handleSaveSettings = async () => {
    const s = { name: profileName, profession: profileProfession, bio: profileBio, projectsTitle, galleryTitle, heroTitleMain, heroTitleSub, musicEnabled, musicUrl, musicCover };
    await supabase.from('settings').upsert({ key: 'global', value: s });
    setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleSaveSocials = async () => {
    await supabase.from('settings').upsert({ key: 'socials', value: socials });
    setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 3000);
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

  const addMediaByUrl = async () => {
    const url = prompt("URL Image :");
    if (url) {
      const { data } = await supabase.from('media').insert({ url, name: "URL Image" }).select();
      if (data) setMediaItems([data[0], ...mediaItems]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = { title: formTitle, category: formCategory || null, date: formDate, image: formImage, status: formStatus, link_type: formLinkType, url: formUrl, content: formContent };
    if (editingProject) await supabase.from('projects').update(projectData).eq('id', editingProject.id);
    else await supabase.from('projects').insert(projectData);
    setIsModalOpen(false); fetchData();
  };

  const tabs = [
    { id: "pages", label: "Projets", icon: FileText },
    { id: "media", label: "Médias", icon: ImageIcon },
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
            <button onClick={() => { setEditingProject(null); setFormTitle(""); setFormCategory(""); setFormDate(""); setFormImage(""); setFormContent(""); setIsModalOpen(true); }} className="bg-primary-red text-white px-8 py-3.5 rounded-sm hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-bold shadow-xl shadow-shadow-red/20">
              <Plus size={18} /> NOUVEAU PROJET
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
                    <button onClick={() => { setEditingProject(project); setFormTitle(project.title); setFormCategory(project.category || ""); setFormDate(project.date); setFormImage(project.image); setFormStatus(project.status); setFormLinkType(project.link_type); setFormUrl(project.url); setFormContent(project.content); setIsModalOpen(true); }} className="p-2 text-text-black/30 hover:text-primary-red"><Edit2 size={16} /></button>
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
                {mediaItems.map((item) => (
                  <div key={item.id} className="group relative aspect-square border border-text-black/5 rounded-sm overflow-hidden shadow-sm">
                    <Image src={item.url} alt={item.name} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-soft-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => deleteMedia(item.id)} className="p-2 bg-red-600 text-white rounded-sm"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "social" && (
            <motion.div key="social" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl space-y-8">
              <div className="bg-white/40 border border-text-black/5 rounded-sm p-8 space-y-10">
                <div className="space-y-6"> <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4">Email</h3> <input type="email" value={socials.email} onChange={(e) => setSocials({...socials, email: e.target.value})} className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" /> </div>
                <div className="space-y-8">
                  <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4">Réseaux</h3>
                  {[ { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedin }, { id: 'github', label: 'GitHub', icon: FaGithub }, { id: 'twitter', label: 'Twitter (X)', icon: FaTwitter }, { id: 'instagram', label: 'Instagram', icon: FaInstagram } ].map((platform) => (
                    <div key={platform.id} className="flex items-center gap-8">
                      <div className="w-12 h-12 bg-text-black/5 rounded-sm flex items-center justify-center"><platform.icon size={20} /></div>
                      <div className="flex-1"> <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">{platform.label}</label> <input type="text" value={(socials as any)[platform.id].url} onChange={(e) => setSocials({...socials, [platform.id]: {...(socials as any)[platform.id], url: e.target.value}})} className="w-full bg-transparent border-b border-text-black/20 py-1 outline-none text-sm" /> </div>
                      <button onClick={() => setSocials({...socials, [platform.id]: {...(socials as any)[platform.id], enabled: !(socials as any)[platform.id].enabled}})} className={`w-12 h-6 rounded-full transition-colors relative ${ (socials as any)[platform.id].enabled ? 'bg-primary-red' : 'bg-text-black/10' }`}> <motion.div animate={{ x: (socials as any)[platform.id].enabled ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" /> </button>
                    </div>
                  ))}
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
                  <h3 className="font-serif text-2xl text-soft-black">{msg.title}</h3>
                  <p className="text-sm leading-relaxed text-text-black/70">{msg.content}</p>
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

          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl space-y-8">
              <div className="bg-white/40 border border-text-black/5 rounded-sm p-8 space-y-8">
                <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4">Musique & Hero</h3>
                <div className="grid grid-cols-2 gap-6"> <input type="text" value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="URL YouTube Music" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" /> <input type="text" value={musicCover} onChange={(e) => setMusicCover(e.target.value)} placeholder="URL Pochette" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none text-sm" /> </div>
                <div className="flex items-center gap-3"> <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Musique Active</span> <button onClick={() => setMusicEnabled(!musicEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${ musicEnabled ? 'bg-primary-red' : 'bg-text-black/10' }`}> <motion.div animate={{ x: musicEnabled ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" /> </button> </div>
                <div className="grid grid-cols-2 gap-6"> <input type="text" value={heroTitleMain} onChange={(e) => setHeroTitleMain(e.target.value)} placeholder="Titre Principal" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none font-serif text-xl" /> <input type="text" value={heroTitleSub} onChange={(e) => setHeroTitleSub(e.target.value)} placeholder="Titre Secondaire" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none font-serif italic text-xl" /> </div>
                <h3 className="font-serif text-2xl border-b border-text-black/10 pb-4 pt-4">Profil</h3>
                <div className="grid grid-cols-2 gap-6"> <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nom" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" /> <input type="text" value={profileProfession} onChange={(e) => setProfileProfession(e.target.value)} placeholder="Profession" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" /> </div>
                <textarea value={profileBio} onChange={(e) => setProfileBio(e.target.value)} rows={3} placeholder="Bio" className="w-full bg-transparent border border-text-black/10 p-4 outline-none resize-none" />
                <button onClick={handleSaveSettings} className="bg-text-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase">Enregistrer</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-soft-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-background border border-text-black/10 rounded-sm shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="font-serif text-3xl italic">{editingProject ? "Modifier" : "Nouveau"} Projet</h3>
                  <div className="grid grid-cols-3 gap-6"> <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Titre" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" required /> <input type="text" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="Catégorie (Optionnel)" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" /> <input type="text" value={formDate} onChange={(e) => setFormDate(e.target.value)} placeholder="Date" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" required /> </div>
                  <input type="text" value={formImage} onChange={(e) => setFormImage(e.target.value)} placeholder="URL Image" className="w-full bg-transparent border-b border-text-black/20 py-2 outline-none" required />
                  <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={8} className="w-full bg-transparent border border-text-black/10 p-4 outline-none resize-none" placeholder="Blog content..." />
                  <button type="submit" className="w-full bg-primary-red text-white py-3 font-bold text-xs tracking-widest uppercase">Enregistrer</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {uploadSuccess && <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-12 right-12 bg-green-600 text-white px-8 py-3 rounded-sm font-bold text-xs tracking-widest shadow-2xl uppercase">Synchronisé !</motion.div>}
      </main>
    </div>
  );
}
