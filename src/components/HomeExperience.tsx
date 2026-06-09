"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import Loader from "@/components/Loader";

const Navbar = dynamic(() => import("@/components/Navbar"));
const Hero = dynamic(() => import("@/components/Hero"));
const Features = dynamic(() => import("@/components/Features"));
const Templates = dynamic(() => import("@/components/Templates"));
const WhyZorviq = dynamic(() => import("@/components/WhyZorviq"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const Pricing = dynamic(() => import("@/components/Pricing"));
const CTA = dynamic(() => import("@/components/CTA"));
const Footer = dynamic(() => import("@/components/Footer"));

type Chunk = {
  id: string;
  label: string;
  Component: ComponentType;
  slot: "header" | "main" | "footer";
};

function TrackedChunk({ chunk, onLoad }: { chunk: Chunk; onLoad: () => void }) {
  const Component = chunk.Component;
  
  useEffect(() => {
    onLoad();
  }, [onLoad]);

  return (
    <div
      className="content-chunk is-loaded"
      data-content-chunk={chunk.id}
      style={chunk.id === "navigation" ? { zIndex: 2000 } : undefined}
    >
      <Component />
    </div>
  );
}

export default function HomeExperience() {
  const [loadedCount, setLoadedCount] = useState(0);

  const chunks = useMemo<Chunk[]>(
    () => [
      { id: "navigation", label: "Navigation", Component: Navbar, slot: "header" },
      { id: "hero", label: "Hero", Component: Hero, slot: "main" },
      { id: "features", label: "Features", Component: Features, slot: "main" },
      { id: "templates", label: "Templates", Component: Templates, slot: "main" },
      { id: "why", label: "Use cases", Component: WhyZorviq, slot: "main" },
      { id: "testimonials", label: "Testimonials", Component: Testimonials, slot: "main" },
      { id: "pricing", label: "Pricing", Component: Pricing, slot: "main" },
      { id: "cta", label: "Call to action", Component: CTA, slot: "main" },
      { id: "footer", label: "Footer", Component: Footer, slot: "footer" },
    ],
    [],
  );

  const handleChunkLoad = () => {
    setLoadedCount((prev) => Math.min(prev + 1, chunks.length));
  };

  const actualProgress = (loadedCount / chunks.length) * 100;

  const headerChunks = chunks.filter((chunk) => chunk.slot === "header");
  const mainChunks = chunks.filter((chunk) => chunk.slot === "main");
  const footerChunks = chunks.filter((chunk) => chunk.slot === "footer");

  const renderChunk = (chunk: Chunk) => {
    return <TrackedChunk key={chunk.id} chunk={chunk} onLoad={handleChunkLoad} />;
  };

  return (
    <>
      <Loader actualProgress={actualProgress} />
      <div id="main-content">
        {headerChunks.map(renderChunk)}
        <main>{mainChunks.map(renderChunk)}</main>
        {footerChunks.map(renderChunk)}
      </div>
    </>
  );
}

