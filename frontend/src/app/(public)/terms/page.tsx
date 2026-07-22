import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | ReplyLink",
  description: "Terms of Service for ReplyLink",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-200 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-slate-400">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing and using ReplyLink, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">2. Meta Platform Compliance</h2>
          <p>
            ReplyLink acts as a bridge to Instagram. By using ReplyLink, you also agree to comply with Instagram's Terms of Service and Meta's Developer Policies. You must not use ReplyLink to send spam, malicious links, or any content that violates Instagram's community guidelines.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">3. Service Usage</h2>
          <p>
            You are responsible for the AI automations you configure. ReplyLink provides the tools to automate your workflow, but you are solely responsible for the content of the messages sent on your behalf.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">4. Account Termination</h2>
          <p>
            We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms, particularly related to spam or platform abuse.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">5. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. We will try to provide at least 30 days notice prior to any new terms taking effect.
          </p>
        </div>
      </div>
    </div>
  )
}
