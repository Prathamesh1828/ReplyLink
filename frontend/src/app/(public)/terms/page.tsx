import { Metadata } from "next"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | ReplyLink",
  description: "Terms of Service for ReplyLink",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>

        <div>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="space-y-8 text-foreground leading-7">
          
          <section>
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight border-b mt-10 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using ReplyLink, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight border-b mt-10 mb-4">2. Meta Platform Compliance</h2>
            <p>
              ReplyLink acts as a bridge to Instagram. By using ReplyLink, you also agree to comply with Instagram's Terms of Service and Meta's Developer Policies. You must not use ReplyLink to send spam, malicious links, or any content that violates Instagram's community guidelines.
            </p>
          </section>

          <section>
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight border-b mt-10 mb-4">3. Service Usage</h2>
            <p>
              You are responsible for the AI automations you configure. ReplyLink provides the tools to automate your workflow, but you are solely responsible for the content of the messages sent on your behalf.
            </p>
          </section>

          <section>
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight border-b mt-10 mb-4">4. Account Termination</h2>
            <p>
              We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms, particularly related to spam or platform abuse.
            </p>
          </section>

          <section>
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight border-b mt-10 mb-4">5. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. We will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
