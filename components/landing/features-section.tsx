import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, BarChart3, Bell, Cloud, Compass, Map, Shield, Sun, Wind } from "lucide-react";

const features = [
  {
    title: "Real-time Monitoring",
    description: "Track weather conditions across all your project sites in real-time.",
    icon: Cloud,
    color: "text-blue-500",
  },
  {
    title: "Risk Assessment",
    description: "Automated risk analysis based on weather conditions and project parameters.",
    icon: AlertTriangle,
    color: "text-yellow-500",
  },
  {
    title: "Smart Alerts",
    description: "Receive instant notifications about weather risks and changes.",
    icon: Bell,
    color: "text-purple-500",
  },
  {
    title: "Interactive Maps",
    description: "Visualize all your project sites and weather patterns on interactive maps.",
    icon: Map,
    color: "text-green-500",
  },
  {
    title: "Weather Forecasting",
    description: "Advanced forecasting to help you plan ahead and prevent delays.",
    icon: Sun,
    color: "text-orange-500",
  },
  {
    title: "Data Analytics",
    description: "Comprehensive weather data analysis and historical trends.",
    icon: BarChart3,
    color: "text-indigo-500",
  },
  {
    title: "Wind Monitoring",
    description: "Detailed wind speed and direction monitoring for crane operations.",
    icon: Wind,
    color: "text-teal-500",
  },
  {
    title: "Site Protection",
    description: "Proactive measures to protect your sites from weather damage.",
    icon: Shield,
    color: "text-red-500",
  },
  {
    title: "Location Tracking",
    description: "Precise location-based weather monitoring for each site.",
    icon: Compass,
    color: "text-gray-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to Stay Weather-Ready
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive weather monitoring and risk management tools designed for construction and outdoor projects.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="mb-4">
                  <feature.icon className={`h-8 w-8 ${feature.color} transition-transform group-hover:scale-110`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 