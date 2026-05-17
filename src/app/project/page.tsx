"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Tag, User, Info, Maximize2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  status: string;
  link_type?: "external" | "internal";
  url?: string;
  content?: string;
  gallery?: { url: string; type: 'image' | 'video' }[];
  details?: string;
}

// Markdown parser helper for bold text (**text**) and newlines (\n -> <br />)
function parseMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.flatMap((part, index) => {
    const isBold = part.startsWith("**") && part.endsWith("**");
    const content = isBold ? part.slice(2, -2) : part;
    const lines = content.split('\n');
    const nodes: React.ReactNode[] = [];
    lines.forEach((line, lineIdx) => {
      if (isBold) {
        nodes.push(<strong key={`${index}-${lineIdx}`} className="font-bold text-white">{line}</strong>);
      } else {
        nodes.push(line);
      }
      if (lineIdx < lines.length - 1) {
        nodes.push(<br key={`br-${index}-${lineIdx}`} />);
      }
    });
    return nodes;
  });
}

function ProjectContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      const { data } = await supabase.from('projects').select('*').eq('id', id).single();
      if (data) setProject(data);
    };
    fetchProject();
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <p className="font-serif text-2xl animate-pulse">Chargement...</p>
      </div>
    );
  }

  const hasExternalLink = project.link_type === "external" && project.url;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      <section className="relative h-[65vh] overflow-hidden">
        <Image 
          src={project.image} 
          alt={project.title} 
          fill 
          className="object-cover opacity-40 blur-[2px] scale-105" 
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
        
        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-12 max-w-[1600px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Link href="/" className="inline-flex items-center gap-3 text-white/50 hover:text-primary-red mb-8 transition-all uppercase tracking-[0.2em] text-[10px] font-bold group">
              <div className="p-2 bg-white/5 rounded-full group-hover:bg-primary-red/10 transition-all"><ArrowLeft size={14} /></div> Retour au portfolio
            </Link>
            <h1 className="font-serif text-6xl md:text-8xl lg:text-[140px] leading-[0.9] tracking-tighter mb-4 text-white drop-shadow-2xl">
              {parseMarkdown(project.title)}
            </h1>
            <div className="flex items-center gap-4">
              <span className="w-3 h-3 bg-primary-red rounded-full animate-pulse"></span>
              <p className="text-xl md:text-3xl text-white/60 font-light italic font-serif">
                {parseMarkdown(project.category)}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-16 max-w-[1600px] mx-auto w-full mt-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-8 space-y-12"
        >
          <div className="prose prose-xl prose-red">
            <div className="flex justify-start mb-8">
              <div className="inline-flex items-center gap-4 bg-[#0c0c0c]/85 backdrop-blur-2xl border border-white/15 px-6 py-3.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-300">
                <span className="w-2.5 h-2.5 bg-primary-red rounded-full animate-pulse shadow-[0_0_10px_var(--primary-red)]"></span>
                <h2 className="font-serif text-xl md:text-2xl text-white tracking-tight leading-none italic">À propos du projet</h2>
              </div>
            </div>
            <div className="text-lg leading-relaxed text-white/80 whitespace-pre-wrap">
              {project.content ? parseMarkdown(project.content) : "Aucune description disponible."}
            </div>
            
            {project.gallery && project.gallery.length > 0 && (
              <div className="mt-16 space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-8">
                  <div className="inline-flex items-center gap-4 bg-[#0c0c0c]/85 backdrop-blur-2xl border border-white/15 px-6 py-3.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-300">
                    <span className="w-2.5 h-2.5 bg-primary-red rounded-full animate-pulse shadow-[0_0_10px_var(--primary-red)]"></span>
                    <h3 className="font-serif text-xl md:text-2xl text-white tracking-tight leading-none italic">Galerie Media</h3>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Défilement horizontal →</p>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar">
                  {project.gallery.map((item, i) => {
                    const isVideo = item.type === 'video';
                    const ytId = isVideo ? item.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] : null;
                    
                    return (
                      <div key={i} className="min-w-[85vw] md:min-w-[700px] aspect-video relative rounded-sm overflow-hidden shadow-2xl bg-text-black/5 snap-center">
                        {isVideo ? (
                          <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${ytId}`} 
                            title={`Video ${i}`}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          />
                        ) : (
                          <Image src={item.url} alt={`Detail ${i}`} fill className="object-cover" unoptimized />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!project.gallery && project.image && (
              <div className="my-16 aspect-video relative rounded-sm overflow-hidden shadow-2xl">
                 <Image src={project.image} alt="detail" fill className="object-cover" unoptimized />
              </div>
            )}
          </div>
        </motion.div>

        <motion.aside 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-4 space-y-12"
        >
          <div className="bg-[#0c0c0c]/85 backdrop-blur-2xl border border-white/15 p-12 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-300">
            <div className="flex justify-start mb-10 pb-6 border-b border-white/10">
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <span className="w-2 h-2 bg-primary-red rounded-full animate-pulse shadow-[0_0_8px_var(--primary-red)]"></span>
                <span className="font-serif italic text-white text-lg font-medium">Détails</span>
              </div>
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-2xl text-primary-red border border-white/5 shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Date de publication</p>
                  <p className="font-medium text-lg text-white/80">{parseMarkdown(project.date || "Mai 2024")}</p>
                </div>
              </div>
              {project.category && (
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-2xl text-primary-red border border-white/5 shrink-0">
                    <Tag size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Catégorie</p>
                    <p className="font-medium text-lg text-white/80">{parseMarkdown(project.category)}</p>
                  </div>
                </div>
              )}
              {project.details && (
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-2xl text-primary-red border border-white/5 shrink-0">
                    <Info size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Infos complémentaires</p>
                    <p className="font-medium text-lg text-white/85 whitespace-pre-wrap">{parseMarkdown(project.details)}</p>
                  </div>
                </div>
              )}
            </div>
            
            {hasExternalLink && (
              <div className="mt-12">
                 <a 
                   href={project.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block w-full text-center bg-primary-red text-white py-5 rounded-2xl hover:bg-red-600 transition-all font-bold text-xs tracking-widest uppercase shadow-2xl shadow-primary-red/30"
                 >
                    Voir le site live
                 </a>
              </div>
            )}
          </div>
        </motion.aside>
      </section>
    </main>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif bg-[#0a0a0a] text-white">Chargement...</div>}>
      <ProjectContent />
    </Suspense>
  );
}
