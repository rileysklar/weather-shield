import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for small teams and projects",
    features: [
      "Up to 5 project sites",
      "Real-time weather monitoring",
      "Basic risk assessment",
      "Email alerts",
      "7-day weather forecast",
    ],
  },
  {
    name: "Professional",
    price: "$99",
    description: "Ideal for growing construction companies",
    features: [
      "Up to 15 project sites",
      "Advanced risk assessment",
      "SMS & email alerts",
      "14-day weather forecast",
      "Historical weather data",
      "Custom risk thresholds",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with complex needs",
    features: [
      "Unlimited project sites",
      "Custom integrations",
      "API access",
      "30-day weather forecast",
      "Advanced analytics",
      "Dedicated support",
      "Custom reporting",
      "SLA guarantee",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that best fits your needs. All plans include our core weather monitoring features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <Card 
              key={index} 
              className={`relative ${
                tier.popular 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
                
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button asChild className="w-full" variant={tier.popular ? "default" : "outline"}>
                  <Link href="/sign-up">
                    {tier.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 