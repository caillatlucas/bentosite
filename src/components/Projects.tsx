"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  status: string;
  link_type?: "external" | "internal";
  url?: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'Publié')
        .order('created_at', { ascending: false });
      
      if (data) setProjects(data);
    };
    fetchProjects();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {projects.map((project, index) => {
          const isInternal = project.link_type === "internal" || !project.link_type;
          const href = isInternal ? `/project?id=${project.id}` : project.url || "#";
          const Wrapper = isInternal ? Link : "a";
          const wrapperProps = isInternal ? { href } : { href, target: "_blank", rel: "noopener noreferrer" };

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group relative cursor-pointer"
            >
              {/* @ts-ignore */}
              <Wrapper {...wrapperProps}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-text-black/5 transition-transform duration-700 ease-out group-hover:scale-[1.02] shadow-sm group-hover:shadow-2xl group-hover:shadow-shadow-red">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-soft-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {project.category && (
                      <p className="text-white/70 text-xs md:text-sm tracking-widest uppercase mb-2">
                        {project.category}
                      </p>
                    )}
                    <h3 className="text-white font-serif text-2xl md:text-3xl flex justify-between items-center">
                      {project.title}
                      <ArrowUpRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-primary-red" />
                    </h3>
                  </div>
                </div>
              </Wrapper>
            </motion.div>
          );
        })}
      </div>
  );
}
