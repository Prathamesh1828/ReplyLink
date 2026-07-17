"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, RefreshCw, Trash2 } from "lucide-react"
import { Instagram } from "@/components/icons"
import { createClient } from "@/utils/supabase/client"

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
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Instagram className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No accounts connected</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Connect your first Instagram Business account to start automating your replies and DMs.
              </p>
            </div>
            <Button onClick={handleConnect} className="mt-4">
              Connect Instagram Account
            </Button>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  )
}
