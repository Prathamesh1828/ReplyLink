"use client"

import { useEffect, useState } from "react"
import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

interface UserData {
  email: string
  fullName: string
  initials: string
}

export function UserNav() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const fullName = authUser.user_metadata?.full_name || "User"
        const email = authUser.email || ""
        const nameParts = fullName.split(" ")
        const initials = nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : fullName.substring(0, 2).toUpperCase()
        setUser({ email, fullName, initials })
      }
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/01.png" alt={user?.fullName || "User"} />
              <AvatarFallback>{user?.initials || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-9 w-9 rounded-md bg-[#009698] text-white">
            <AvatarFallback className="bg-transparent rounded-md text-base">{user?.initials?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <p className="text-[15px] font-medium leading-none">{user?.fullName || "User"}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-2">
          <LogOut className="mr-2 h-[18px] w-[18px] text-muted-foreground" />
          <span className="text-[15px]">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
