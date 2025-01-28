'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Cloud, Shield, Sun, CloudSnow, CloudRain, CloudHail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";

const words = ["Assets", "Energy", "Future"];

const TypewriterEffect = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWord];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < word.length) {
          setCurrentText(word.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (currentText.length === 0) {
          setIsDeleting(false);
          setCurrentWord((prev) => (prev + 1) % words.length);
        } else {
          setCurrentText(word.slice(0, currentText.length - 1));
        }
      }
    }, isDeleting ? 100 : 150);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWord]);

  return (
    <motion.div
      className="relative inline-flex black-ops text-blue-500 align-[3px] sm:align-baseline"
      style={{
        width: Math.max(...words.map(word => word.length)) + 'ch',
        height: '1.2em',
        transform: 'translateY(0.4em)'
      }}
      initial={{ opacity: 1 }}
    >
      <span className="absolute whitespace-pre">{currentText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute left-[calc(0ch+var(--cursor-offset))] inline-block w-[4px] h-[1em] bg-current align-middle"
        style={{
          '--cursor-offset': `${currentText.length - .0}ch`
        } as any}
      />
    </motion.div>
  );
};

const IrregularPolygon = () => (
  <div className="relative">
    <div className="absolute -top-6 left-12  whitespace-nowrap bg-red-500/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-md animate-pulse">
      Alert: Hail Imminent
    </div>
    <svg width="100" height="100" viewBox="0 0 100 100" className="transform ml-6 rotate-6">
      <polygon
        points="15,25 70,20 85,30 80,70 75,75 65,80 25,75 20,65"
        className="fill-none stroke-blue-400 stroke-2"
        strokeLinejoin="round"
      />
    </svg>
    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-blue-400/80">
      West Texas Solar Array
    </span>
  </div>
);

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculateTransform = (baseX: number, baseY: number, factor: number = 1) => {
    const offsetX = (mousePosition.x - 0.5) * 30 * factor;
    const offsetY = (mousePosition.y - 0.5) * 30 * factor;
    return `translate(${baseX + offsetX}px, ${baseY + offsetY}px)`;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
      <div className="absolute inset-0 bg-[url('/topo-light.svg')] dark:bg-[url('/topo-dark.svg')] opacity-50 dark:opacity-70 bg-cover" />
      <div className="absolute inset-0 bg-[url('/map.svg')] bg-cover bg-center bg-no-repeat opacity-10 mix-blend-multiply dark:mix-blend-soft-light" />
      
      <div className="relative container mx-auto px-4 py-24 sm:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Floating Icons Container */}
          <div ref={containerRef} className="relative w-[400px] h-72 mb-8">
            {/* Shield Icon - Center */}
            <div 
              className="absolute w-12 h-12 left-1/2 top-1/3 transition-transform duration-700 ease-out"
              style={{ 
                transform: calculateTransform(-50, -50, 0.6),
                willChange: 'transform'
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                <Shield className="h-24 w-24 text-blue-500 animate-float-slow relative z-10" />
              </div>
            </div>
            
            {/* Sun Icon - Top Right */}
            <div 
              className="absolute right-12 top-8 transition-transform duration-1000 ease-out"
              style={{ 
                transform: calculateTransform(0, 0, 0.4),
                willChange: 'transform'
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
                <Sun className="h-16 w-16 text-yellow-500 animate-float-slower relative z-10" />
              </div>
            </div>
            
            {/* Snow Icon - Top Left */}
            <div 
              className="absolute left-16 top-12 transition-transform duration-[1500ms] ease-out"
              style={{ 
                transform: calculateTransform(0, 0, 0.5),
                willChange: 'transform'
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-sky-300/20 rounded-full blur-lg animate-pulse" />
                <CloudSnow className="h-12 w-12 text-sky-300 animate-float-slower relative z-10" />
              </div>
            </div>

            {/* Rain Icon - Bottom Right */}
            <div 
              className="absolute right-16 bottom-20 transition-transform duration-[1200ms] ease-out"
              style={{ 
                transform: calculateTransform(0, 0, 0.35),
                willChange: 'transform'
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg animate-pulse" />
                <CloudRain className="h-14 w-14 text-blue-400 animate-float-slow relative z-10" />
              </div>
            </div>

            {/* Irregular Polygon - Center Left */}
            <div 
              className="absolute  top-2/4 -translate-y-1/2 transition-transform duration-[1600ms] ease-out"
              style={{ 
                transform: calculateTransform(0, 0, 0.25),
                willChange: 'transform'
              }}
            >
              <div className="relative animate-float-slower">
                <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-lg" />
                <IrregularPolygon />
              </div>
            </div>

            {/* Hail Icon - Center Right */}
            <div 
              className="absolute right-6 top-1/2 -translate-y-1/2 transition-transform duration-[1300ms] ease-out"
              style={{ 
                transform: calculateTransform(0, -20, 0.45),
                willChange: 'transform'
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-lg animate-pulse" />
                <CloudHail className="h-12 w-12 text-indigo-400 animate-float relative z-10" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl pretty font-extrabold tracking-tight max-w-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
            Protect Your {' '}
            <TypewriterEffect />
           <br></br>from Weather Risks
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            Real-time weather monitoring and risk assessment for construction sites and outdoor projects. Stay ahead of the elements.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button asChild size="lg" className="text-lg">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 