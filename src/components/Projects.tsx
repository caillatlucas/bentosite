"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  status: string;
  linkType?: "external" | "internal";
  url?: string;
}

const defaultProjects: Project[] = [
  {
    id: "1",
    title: "Refonte E-commerce",
    category: "Développement Web",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    status: "Publié",
    linkType: "internal",
    url: ""
  },
  {
    id: "2",
    title: "Application SaaS",
    category: "React & Node.js",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    status: "Publié",
    linkType: "internal",
    url: ""
  },
  {
    id: "3",
    title: "Dashboard Admin",
    category: "UI/UX Design & Intégration",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2264&auto=format&fit=crop",
    status: "Publié",
    linkType: "internal",
    url: ""
  },
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("portfolio_projects");
    if (saved) {
      const parsed = JSON.parse(saved) as Project[];
      setProjects(parsed.filter(p => p.status === "Publié"));
    } else {
      setProjects(defaultProjects);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {projects.map((project, index) => {
          const isInternal = project.linkType === "internal" || !project.linkType;
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
                    <p className="text-white/70 text-xs md:text-sm tracking-widest uppercase mb-2">
                      {project.category}
                    </p>
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
