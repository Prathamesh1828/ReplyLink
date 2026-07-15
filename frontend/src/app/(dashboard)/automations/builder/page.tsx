"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageSquare,
  Reply,
  AtSign,
  Zap,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Trigger", description: "What starts this automation?" },
  { id: 2, title: "Conditions", description: "When should the AI respond?" },
  { id: 3, title: "Response", description: "How should the AI reply?" },
  { id: 4, title: "Review", description: "Confirm and launch" },
]

const triggerOptions = [
  {
    id: "dm",
    label: "Direct Message",
    description: "Respond when someone sends you a DM",
    icon: MessageSquare,
  },
  {
    id: "comment",
    label: "Comment on Post",
    description: "Reply when someone comments on your post",
    icon: Reply,
  },
  {
    id: "story_reply",
    label: "Story Reply",
    description: "Respond to story mentions and replies",
    icon: AtSign,
  },
]

export default function AutomationBuilderPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null)
  const [automationName, setAutomationName] = useState("")
  const [keywords, setKeywords] = useState("")
  const [responseType, setResponseType] = useState<"ai" | "template">("ai")

  const canProceed = () => {
    if (currentStep === 1) return selectedTrigger !== null
    if (currentStep === 2) return automationName.trim() !== ""
    if (currentStep === 3) return responseType !== null
    return true
  }

  return (
    <div className="flex-1 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/automations")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Automation</h2>
          <p className="text-muted-foreground">
            Set up a new AI-powered reply workflow.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <nav aria-label="Progress">
        <ol className="flex items-center gap-2">
          {steps.map((step, idx) => (
            <li key={step.id} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold border-2 transition-all",
                  currentStep > step.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "border-primary text-primary"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="hidden sm:block">
                <p className={cn("text-sm font-medium", currentStep >= step.id ? "text-foreground" : "text-muted-foreground")}>{step.title}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn("flex-1 h-[2px] mx-2", currentStep > step.id ? "bg-primary" : "bg-muted")} />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
      >
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select a trigger</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {triggerOptions.map((trigger) => (
                <Card
                  key={trigger.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedTrigger === trigger.id ? "ring-2 ring-primary border-primary" : ""
                  )}
                  onClick={() => setSelectedTrigger(trigger.id)}
                >
                  <CardHeader className="space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <trigger.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{trigger.label}</CardTitle>
                    <CardDescription className="text-sm">{trigger.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Set conditions</h3>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Automation Name</Label>
                  <Input
                    id="name"
                    placeholder="E.g. Lead Gen - Story Reply"
                    value={automationName}
                    onChange={(e) => setAutomationName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="keywords">Trigger Keywords (comma separated, optional)</Label>
                  <Input
                    id="keywords"
                    placeholder='E.g. "link", "price", "info"'
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to respond to all messages of this type.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Choose response method</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  responseType === "ai" ? "ring-2 ring-primary border-primary" : ""
                )}
                onClick={() => setResponseType("ai")}
              >
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">AI-Generated</CardTitle>
                  <CardDescription>
                    Let AI craft a contextual response using your Knowledge Base.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  responseType === "template" ? "ring-2 ring-primary border-primary" : ""
                )}
                onClick={() => setResponseType("template")}
              >
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                  <CardTitle className="text-base">Template Reply</CardTitle>
                  <CardDescription>
                    Use a fixed message template for consistent responses.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review your automation</h3>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="font-medium">{automationName || "Untitled"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trigger</span>
                  <Badge variant="outline">{selectedTrigger || "None"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Keywords</span>
                  <span className="font-medium">{keywords || "All messages"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response</span>
                  <Badge className={responseType === "ai" ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"}>
                    {responseType === "ai" ? "AI-Generated" : "Template"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => {
              // TODO: call create automation API
              router.push("/automations")
            }}
          >
            <Zap className="mr-2 h-4 w-4" /> Launch Automation
          </Button>
        )}
      </div>
    </div>
  )
}
