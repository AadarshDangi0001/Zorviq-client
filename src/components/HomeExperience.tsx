"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import Loader from "@/components/Loader";
import { ZorviqLoadingBar } from "@/shared/components/zorviq-loading-bar";

const Navbar = dynamic(() => import("@/components/Navbar"), {
  loading: () => <ChunkSkeleton compact label="Navigation" />,
});
const Hero = dynamic(() => import("@/components/Hero"), {
  loading: () => <ChunkSkeleton tall label="Hero" />,
});
const Features = dynamic(() => import("@/components/Features"), {
  loading: () => <ChunkSkeleton label="Features" />,
});
const Templates = dynamic(() => import("@/components/Templates"), {
  loading: () => <ChunkSkeleton label="Templates" />,
});
const WhyZorviq = dynamic(() => import("@/components/WhyZorviq"), {
  loading: () => <ChunkSkeleton label="Use cases" />,
});
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <ChunkSkeleton label="Testimonials" />,
});
const Pricing = dynamic(() => import("@/components/Pricing"), {
  loading: () => <ChunkSkeleton label="Pricing" />,
});
const CTA = dynamic(() => import("@/components/CTA"), {
  loading: () => <ChunkSkeleton compact label="Call to action" />,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <ChunkSkeleton compact label="Footer" />,
});

type Chunk = {
  id: string;
  label: string;
  Component: ComponentType;
  slot: "header" | "main" | "footer";
};

function ChunkSkeleton({
  compact = false,
  tall = false,
  label,
}: {
  compact?: boolean;
  tall?: boolean;
  label: string;
}) {
  return (
    <div data-inline-editor-ignore aria-label={`Loading ${label}`}>
      <ZorviqLoadingBar
        variant={tall ? "page" : compact ? "inline" : "section"}
        label={`Loading ${label}`}
        detail="Bringing this Zorviq section online"
      />
    </div>
  );
}

function ProgressiveChunk({
  chunk,
  isVisible,
}: {
  chunk: Chunk;
  isVisible: boolean;
}) {
  const Component = chunk.Component;

  return (
    <div
      className={isVisible ? "content-chunk is-loaded" : "content-chunk is-pending"}
      data-content-chunk={chunk.id}
      aria-busy={!isVisible}
      style={chunk.id === "navigation" ? { zIndex: 2000 } : undefined}
    >
      {isVisible ? <Component /> : <ChunkSkeleton label={chunk.label} tall={chunk.id === "hero"} />}
    </div>
  );
}

export default function HomeExperience() {
  const [visibleCount, setVisibleCount] = useState(1);

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

  useEffect(() => {
    const timers = chunks.map((_, index) =>
      window.setTimeout(() => {
        setVisibleCount((count) => Math.max(count, index + 1));
      }, 3850 + index * 360),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [chunks]);

  const headerChunks = chunks.filter((chunk) => chunk.slot === "header");
  const mainChunks = chunks.filter((chunk) => chunk.slot === "main");
  const footerChunks = chunks.filter((chunk) => chunk.slot === "footer");

  const renderChunk = (chunk: Chunk) => {
    const index = chunks.findIndex((item) => item.id === chunk.id);
    return <ProgressiveChunk key={chunk.id} chunk={chunk} isVisible={index < visibleCount} />;
  };

  return (
    <>
      <Loader />
      <div id="main-content">
        {headerChunks.map(renderChunk)}
        <main>{mainChunks.map(renderChunk)}</main>
        {footerChunks.map(renderChunk)}
      </div>
    </>
  );
}
