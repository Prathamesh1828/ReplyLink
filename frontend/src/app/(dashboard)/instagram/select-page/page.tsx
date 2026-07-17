"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Instagram } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function SelectPage() {
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<any[]>([])
  const [activating, setActivating] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchPendingAccounts = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/login")
          return
        }

        const res = await fetch("http://127.0.0.1:8000/api/accounts/", {
          headers: {
            "Authorization": `Bearer ${session.access_token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          // Only show inactive/pending accounts
          setAccounts(data.filter((acc: any) => !acc.active))
        }
      } catch (err) {
        console.error("Failed to fetch pending accounts", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingAccounts()
  }, [router])

  const handleActivate = async (id: string) => {
    setActivating(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }

      const res = await fetch(`http://127.0.0.1:8000/api/accounts/${id}/activate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      })
      
      if (res.ok) {
        toast.success("Account activated successfully!")
        router.push("/instagram?success=true")
      } else {
        toast.error("Failed to activate account")
        setActivating(null)
      }
    } catch (error) {
      console.error(error)
      setActivating(null)
    }
  }

  return (
    <div className="flex-1 space-y-6 max-w-4xl mx-auto">
      <div className="pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Select Instagram Account</h2>
        <p className="text-muted-foreground">
          We found multiple Facebook Pages with linked Instagram Business accounts. Please select which one(s) to activate.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No pending accounts found.</p>
            <Button className="mt-4" onClick={() => router.push("/instagram")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Instagram className="h-5 w-5" />
                  {account.instagram_username ? `@${account.instagram_username}` : "Instagram Account"}
                </CardTitle>
                <CardDescription>
                  Facebook Page: {account.facebook_page_name || account.facebook_page_id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instagram ID</span>
                  <span className="font-medium">{account.instagram_account_id}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleActivate(account.id)}
                  disabled={activating === account.id}
                >
                  {activating === account.id ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Connect this Account"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
