"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Instagram } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { CheckCircle2 } from "lucide-react"

export function ConnectAccountButton({ initialIsConnected = false }: { initialIsConnected?: boolean }) {
  const [isConnected, setIsConnected] = useState(initialIsConnected)
  const supabase = createClient()

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch("http://127.0.0.1:8000/api/accounts/", {
          headers: {
            "Authorization": `Bearer ${session.access_token}`
          }
        })
        
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setIsConnected(true)
          } else {
            setIsConnected(false)
          }
        }
      } catch (err) {
        console.error("Failed to fetch accounts status", err)
      }
    }

    checkConnection()
  }, [])

  return (
    <Link 
      href="/instagram" 
      className={buttonVariants({ 
        variant: isConnected ? "outline" : "default",
        className: isConnected ? "border-green-500/30 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20" : ""
      })}
    >
      {isConnected ? (
        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <Instagram className="mr-2 h-4 w-4" />
      )}
      {isConnected ? "Instagram Account Connected" : "Connect Account"}
    </Link>
  )
}
