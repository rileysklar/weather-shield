'use client';

import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Double the testimonials to create a seamless loop
const testimonials = [
    {
      quote: "Weather Shield has revolutionized how we monitor and protect our renewable energy sites. The real-time alerts and comprehensive weather data have been invaluable for our operations.",
      author: "Sofia Davis",
      role: "Lead Site Manager",
      avatar: "https://randomuser.me/api/portraits/women/23.jpg",
      initials: "SD"
    },
    {
      quote: "The risk assessment features have helped us make proactive decisions about site maintenance and safety. It's an essential tool for our daily operations.",
      author: "Marcus Chen",
      role: "Operations Director",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      initials: "MC"
    },
    {
      quote: "Since implementing Weather Shield, we've significantly reduced weather-related incidents at our sites. The alert system is incredibly reliable.",
      author: "Sarah Johnson",
      role: "Safety Coordinator",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      initials: "SJ"
    },
    {
      quote: "The analytics provided by Weather Shield have allowed us to better allocate resources and reduce downtime caused by severe weather. It's a game-changer.",
      author: "Raj Patel",
      role: "Renewable Energy Analyst",
      avatar: "https://randomuser.me/api/portraits/men/47.jpg",
      initials: "RP"
    },
    {
      quote: "Weather Shield is a must-have tool for anyone managing outdoor infrastructure. Its accuracy and ease of use set it apart from other solutions we've tried.",
      author: "Emily Nguyen",
      role: "Infrastructure Manager",
      avatar: "https://randomuser.me/api/portraits/women/52.jpg",
      initials: "EN"
    },
    {
      quote: "We can now stay ahead of storms and take proactive measures to safeguard our equipment. Weather Shield has paid for itself many times over.",
      author: "James Carter",
      role: "Site Supervisor",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      initials: "JC"
    },
    {
      quote: "Weather Shield's detailed forecasts and historical weather data have been instrumental in our long-term planning. Highly recommended.",
      author: "Olivia Martinez",
      role: "Strategic Planner",
      avatar: "https://randomuser.me/api/portraits/women/64.jpg",
      initials: "OM"
    },
    {
      quote: "The user-friendly interface and timely notifications make Weather Shield an indispensable tool for our team. It's reliable and incredibly helpful.",
      author: "Ethan Brooks",
      role: "Technical Specialist",
      avatar: "https://randomuser.me/api/portraits/men/25.jpg",
      initials: "EB"
    }
  ];
  

// Triple the array for smoother looping
const allTestimonials = [...testimonials, ...testimonials, ...testimonials];

export function Testimonial() {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pageX = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
    setStartX(pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const pageX = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
    const x = pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div className="relative -mx-[50vw] left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] w-screen overflow-hidden py-12">
      <div 
        ref={containerRef}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onMouseMove={handleDragMove}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onTouchMove={handleDragMove}
        className="relative flex w-full overflow-x-auto scrollbar-hide touch-pan-x [mask-image:linear-gradient(to_right,transparent,black_128px,black_calc(100%-128px),transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_256px,black_calc(100%-256px),transparent)]"
      >
        <div className={cn(
          "flex space-x-8 whitespace-nowrap",
          isDragging ? "animate-none" : "animate-marquee"
        )}>
          {allTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="w-[450px] shrink-0 rounded-xl p-6 shadow-lg border backdrop-blur-sm bg-background/30 hover:shadow-xl transition-shadow duration-300 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12 border-2 border-primary shrink-0">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                  <AvatarFallback className="bg-primary/10">{testimonial.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground leading-relaxed whitespace-normal">"{testimonial.quote}"</p>
                  <div className="mt-2">
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
