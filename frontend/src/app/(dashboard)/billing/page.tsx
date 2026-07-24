"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Users, MessageSquare, Wand2, AlertTriangle } from "lucide-react"

export default function BillingPage() {
  const maxContacts = 10;
  const maxMessages = 100;
  const maxAutomations = 5;
  
  // Dummy usage data for demonstration
  const [contactsUsed, setContactsUsed] = useState(2);
  const [messagesUsed, setMessagesUsed] = useState(11);
  const [automationsUsed, setAutomationsUsed] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/automations/`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setAutomationsUsed(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch automations count", err);
      }
    }
    fetchData();
  }, []);

  const contactsPercent = contactsUsed > 0 ? Math.max((contactsUsed / maxContacts) * 100, 2) : 0;
  const messagesPercent = messagesUsed > 0 ? Math.max((messagesUsed / maxMessages) * 100, 2) : 0;
  const automationsPercent = automationsUsed > 0 ? Math.max((automationsUsed / maxAutomations) * 100, 2) : 0;

  const isContactsLimitReached = contactsUsed >= maxContacts;
  const isMessagesLimitReached = messagesUsed >= maxMessages;
  const isAutomationsLimitReached = automationsUsed >= maxAutomations;
  const isAnyLimitReached = isContactsLimitReached || isMessagesLimitReached || isAutomationsLimitReached;

  return (
    <div className="flex-1 space-y-6">
      <div className="pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Billing overview</h2>
        <p className="text-muted-foreground">
          Manage your subscription
        </p>
      </div>

      <Card className="w-full max-w-5xl">
        <CardHeader className="pb-6">
          {isAnyLimitReached && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Free tier limit reached</p>
                <p className="text-sm">You have reached the maximum limits for your current plan. Please upgrade to continue using these features without interruption.</p>
              </div>
            </div>
          )}

          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            CURRENT PLAN
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold">Premium Plus • Free</h3>
            <span className="bg-blue-100 text-[#4F46E5] text-xs font-semibold px-2.5 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
              For Limited time
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Includes all features and sufficient usage credits.
          </p>
        </CardHeader>
        
        <div className="px-6 py-6 border-t">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Contacts */}
            <div className="space-y-3">
              <div className="font-medium text-sm">Total Contacts</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-[#4F46E5] h-2 rounded-full" 
                  style={{ width: `${contactsPercent}%` }} 
                />
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Users className="h-[14px] w-[14px]" />
                <span className={isContactsLimitReached ? "text-red-600 font-medium dark:text-red-400" : ""}>
                  {contactsUsed} / {maxContacts.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3">
              <div className="font-medium text-sm">Total Messages</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-[#4F46E5] h-2 rounded-full" 
                  style={{ width: `${messagesPercent}%` }} 
                />
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <MessageSquare className="h-[14px] w-[14px]" />
                <span className={isMessagesLimitReached ? "text-red-600 font-medium dark:text-red-400" : ""}>
                  {messagesUsed} / {maxMessages.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Automation Runs */}
            <div className="space-y-3">
              <div className="font-medium text-sm">Total Automation Runs</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-[#4F46E5] h-2 rounded-full" 
                  style={{ width: `${automationsPercent}%` }} 
                />
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Wand2 className="h-[14px] w-[14px]" />
                <span className={isAutomationsLimitReached ? "text-red-600 font-medium dark:text-red-400" : ""}>
                  {automationsUsed} / {maxAutomations.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
