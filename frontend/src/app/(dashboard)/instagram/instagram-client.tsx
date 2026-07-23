"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, RefreshCw, Trash2, ShieldCheck, Lock } from "lucide-react"
import { Instagram } from "@/components/icons"
import { createClient } from "@/utils/supabase/client"

const TrustBadges = () => (
  <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl text-left bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mx-auto mt-8">
    <div className="flex gap-3 items-start">
      <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg shrink-0">
        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Official Meta API</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">We use Instagram's official partner API. Your account is 100% safe from bans or restrictions.</p>
      </div>
    </div>
    <div className="flex gap-3 items-start">
      <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg shrink-0">
        <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Read & Reply Only</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">We only request permissions to read and reply to messages. We can never post on your behalf.</p>
      </div>
    </div>
  </div>
)

export function InstagramClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<any[]>([])
  const supabase = createClient()

  const getToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push("/login")
      return null
    }
    return session.access_token
  }

  const fetchAccounts = async () => {
    try {
      const token = await getToken()
      if (!token) return

      const res = await fetch("http://127.0.0.1:8000/api/accounts/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setAccounts(data)
      }
    } catch (err) {
      console.error("Failed to fetch accounts", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success) {
      toast.success("Instagram account connected successfully!")
    } else if (error) {
      toast.error(`Failed to connect account: ${error}`)
    }

    fetchAccounts()
  }, [searchParams])

  const handleConnect = async () => {
    try {
      const token = await getToken()
      if (!token) return

      const res = await fetch("http://127.0.0.1:8000/api/auth/meta/intent", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!res.ok) throw new Error("Failed to initialize connection")
      const { state } = await res.json()
      
      window.location.href = `http://127.0.0.1:8000/api/auth/meta/login?state=${state}`
    } catch (error) {
      toast.error("Could not start Instagram connection process.")
      console.error(error)
    }
  }

  const handleDisconnect = async (id: string) => {
    try {
      const token = await getToken()
      if (!token) return

      const res = await fetch(`http://127.0.0.1:8000/api/accounts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (res.ok) {
        toast.success("Account disconnected")
        fetchAccounts()
      } else {
        toast.error("Failed to disconnect account")
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex justify-between items-start pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Instagram Connections</h2>
          <p className="text-muted-foreground">
            Connect and manage your Instagram business accounts.
          </p>
        </div>
        <Button onClick={handleConnect}>
          <Instagram className="mr-2 h-4 w-4" />
          Connect New Account
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : accounts.length === 0 ? (
        <Card className="border-dashed bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center p-12 space-y-8 text-center max-w-3xl mx-auto">
            
            {/* Header Section */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shadow-inner">
                <Instagram className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Connect Your Instagram</h3>
                <p className="text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Connect your Instagram Business account to let our AI handle your DMs, comment replies, and funnel automations.
                </p>
              </div>
            </div>

            <TrustBadges />

            {/* CTA */}
            <Button onClick={handleConnect} className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base shadow-md hover:shadow-lg transition-all">
              <Instagram className="mr-2 h-5 w-5" />
              Connect Instagram Account
            </Button>
            <p className="text-xs text-slate-400 mt-4 max-w-sm">
              By connecting, you agree to our Terms of Service and Privacy Policy regarding data handling.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Card key={account.id} className={!account.active ? "opacity-75" : ""}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-lg">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-5 w-5" />
                      {account.instagram_username ? `@${account.instagram_username}` : "Instagram Account"}
                    </div>
                    {account.active ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Linked to Page: {account.facebook_page_name || account.facebook_page_id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IG ID</span>
                    <span className="font-medium">{account.instagram_account_id}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" onClick={() => handleDisconnect(account.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-start w-full">
            <TrustBadges />
          </div>
        </div>
      )}
    </div>
  )
}
