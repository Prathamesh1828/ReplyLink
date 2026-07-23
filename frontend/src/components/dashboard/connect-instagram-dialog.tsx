"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Instagram } from "@/components/icons"
import { useRouter } from "next/navigation"

interface ConnectInstagramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectInstagramDialog({ open, onOpenChange }: ConnectInstagramDialogProps) {
  const router = useRouter()

  const handleConnect = () => {
    onOpenChange(false)
    router.push("/instagram")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4 mt-2">
            <Instagram className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <DialogTitle className="text-center text-xl">Connect Instagram</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You need to connect an Instagram Business account before you can use templates or enable the AI Assistant.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-4">
          <Button onClick={handleConnect} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
            <Instagram className="mr-2 h-4 w-4" />
            Connect Instagram Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
