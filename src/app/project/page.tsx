"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-serif text-2xl animate-pulse">Chargement...</p>
      </div>
    );
  }

  const hasExternalLink = project.link_type === "external" && project.url;

  return (
    <main className="min-h-screen bg-background text-text-black pb-32">
      <section className="relative h-[60vh] overflow-hidden">
        <Image 
          src={project.image} 
          alt={project.title} 
          fill 
          className="object-cover opacity-60" 
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-12 max-w-[1600px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link href="/" className="inline-flex items-center gap-2 text-text-black/50 hover:text-primary-red mb-8 transition-colors uppercase tracking-widest text-xs font-bold">
              <ArrowLeft size={16} /> Retour au portfolio
            </Link>
            <h1 className="font-serif text-6xl md:text-8xl lg:text-[120px] leading-tight tracking-tighter mb-4">
              {project.title}
            </h1>
            {project.category && (
              <p className="text-xl md:text-3xl text-primary-red font-light italic">
                {project.category}
              </p>
            )}
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
            <h2 className="font-serif text-4xl mb-8">À propos du projet</h2>
            <div className="text-lg leading-relaxed text-text-black/80 whitespace-pre-wrap">
              {project.content || "Aucune description disponible."}
            </div>
            
            <div className="my-16 aspect-video relative rounded-sm overflow-hidden shadow-2xl">
               <Image src={project.image} alt="detail" fill className="object-cover" unoptimized />
            </div>
          </div>
        </motion.div>

        <motion.aside 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-4 space-y-12"
        >
          <div className="bg-white/40 border border-text-black/10 p-10 rounded-sm">
            <h4 className="font-serif text-2xl mb-8 border-b border-text-black/10 pb-4 italic">Détails</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-red/10 flex items-center justify-center rounded-sm text-primary-red">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Date</p>
                  <p className="font-medium">{project.date || "Mai 2024"}</p>
                </div>
              </div>
              {project.category && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-red/10 flex items-center justify-center rounded-sm text-primary-red">
                    <Tag size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Expertise</p>
                    <p className="font-medium">{project.category}</p>
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
                   className="block w-full text-center bg-text-black text-white py-4 rounded-sm hover:bg-soft-black transition-all font-bold text-xs tracking-widest uppercase"
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif">Chargement...</div>}>
      <ProjectContent />
    </Suspense>
  );
}
