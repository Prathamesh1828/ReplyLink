import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | ReplyLink",
  description: "Privacy Policy for ReplyLink",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-200 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-slate-400">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8">1. Information We Collect</h2>
          <p>
            When you use ReplyLink to automate your Instagram interactions, we collect your Instagram Profile Information (Name, Username, Profile Picture) and messages/comments strictly for the purpose of processing automations. We also collect the email address you use to sign up for your account.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
          <p>
            We use your Instagram data exclusively to trigger AI automations on your behalf based on your explicitly configured workflows. We do not use your messages for any purpose other than executing your ReplyLink automations.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">3. Data Retention and Deletion</h2>
          <p>
            Your automation logs and message data are stored securely. You can delete your account and all associated data at any time from the "Settings" page inside the ReplyLink dashboard. Upon deletion, your Instagram data is permanently removed from our servers.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">4. Third-Party Access</h2>
          <p>
            We use OpenAI's API to process AI responses if you enable the AI Agent feature. Your messages are sent securely to OpenAI strictly for generating replies and are not used to train public models. We do not sell or share your data with any other third parties.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">5. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to request data deletion manually, please contact us at privacy@replylink.app.
          </p>
        </div>
      </div>
    </div>
  )
}
