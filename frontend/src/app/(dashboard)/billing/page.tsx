import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Sparkles, Zap, Crown } from "lucide-react"

export const metadata: Metadata = {
  title: "Billing | ReplyLink",
  description: "Manage your subscription and billing.",
}

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "For individuals getting started.",
    features: ["500 messages/mo", "1 automation", "1 Instagram account", "Email support"],
    current: false,
    icon: Zap,
  },
  {
    name: "Pro",
    price: "$79",
    description: "For growing businesses.",
    features: ["5,000 messages/mo", "10 automations", "3 Instagram accounts", "Priority support", "Analytics dashboard"],
    current: true,
    icon: Sparkles,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale operations.",
    features: ["Unlimited messages", "Unlimited automations", "Unlimited accounts", "Dedicated support", "Custom integrations", "SLA guarantee"],
    current: false,
    icon: Crown,
  },
]

export default function BillingPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription and payment method.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are on the <span className="font-semibold text-foreground">Pro</span> plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next billing date</span>
            <span className="text-sm font-medium">Feb 1, 2024</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Messages used</span>
            <span className="text-sm font-medium">2,340 / 5,000</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: "46.8%" }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.current ? "ring-2 ring-primary border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <plan.icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                {plan.current && <Badge>Current</Badge>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                {plan.price}
                {plan.price !== "Custom" && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant={plan.current ? "outline" : "default"} className="w-full" disabled={plan.current}>
                {plan.current ? "Current Plan" : plan.price === "Custom" ? "Contact Sales" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
