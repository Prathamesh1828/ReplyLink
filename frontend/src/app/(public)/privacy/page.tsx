import { Metadata } from "next"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | ReplyLink",
  description: "Privacy Policy for ReplyLink",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>

        <div>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="space-y-8 text-foreground leading-7">
          
          <section>
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight border-b mt-10 mb-4">1. Information We Collect</h2>
            <p>
              When you use ReplyLink to automate your Instagram interactions, we collect your Instagram Profile Information (Name, Username, Profile Picture) and messages/comments strictly for the purpose of processing automations. We also collect the email address you use to sign up for your account.
            </p>
          </section>

          <section>
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight border-b mt-10 mb-4">2. How We Use Your Information</h2>
            <p>
              We use your Instagram data exclusively to trigger AI automations on your behalf based on your explicitly configured workflows. We do not use your messages for any purpose other than executing your ReplyLink automations.
            </p>
          </section>

          <section>
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight border-b mt-10 mb-4">3. Data Retention and Deletion</h2>
            <p>
              Your automation logs and message data are stored securely. You can delete your account and all associated data at any time from the "Settings" page inside the ReplyLink dashboard. Upon deletion, your Instagram data is permanently removed from our servers.
            </p>
          </section>

          <section>
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight border-b mt-10 mb-4">4. Third-Party Access</h2>
            <p>
              We use OpenAI's API to process AI responses if you enable the AI Agent feature. Your messages are sent securely to OpenAI strictly for generating replies and are not used to train public models. We do not sell or share your data with any other third parties.
            </p>
          </section>

          <section>
            <h2 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight border-b mt-10 mb-4">5. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to request data deletion manually, please contact us at privacy@replylink.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
