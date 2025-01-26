import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Project Manager",
    company: "BuildTech Construction",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop",
    quote: "Weather Shield has transformed how we manage weather risks. The real-time alerts have saved us countless hours and resources.",
  },
  {
    name: "Michael Chen",
    role: "Site Supervisor",
    company: "Urban Development Corp",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop",
    quote: "The accuracy of weather predictions and risk assessments has been invaluable for our crane operations and concrete pours.",
  },
  {
    name: "Emma Davis",
    role: "Safety Director",
    company: "Skyline Builders",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&auto=format&fit=crop",
    quote: "This platform has significantly improved our site safety. The proactive alerts help us make informed decisions quickly.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how Weather Shield is helping construction teams stay safe and efficient.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gray-50 dark:bg-gray-800 border-0">
              <CardContent className="p-6 space-y-4">
                <Quote className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-lg italic text-muted-foreground">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <Avatar className="h-12 w-12 border-2 border-blue-500/10">
                    <AvatarImage 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="object-cover"
                    />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 
