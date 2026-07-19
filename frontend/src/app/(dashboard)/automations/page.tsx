import { Metadata } from "next"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AutomationsTable } from "@/components/automations/automations-table"

export const metadata: Metadata = {
  title: "Automations | ReplyLink",
  description: "Manage your AI Instagram automations.",
}

export default function AutomationsPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automations</h2>
          <p className="text-muted-foreground">
            Create and manage your automation flows
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/templates">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create New Automation
            </Button>
          </Link>
        </div>
      </div>

      <AutomationsTable />
    </div>
  )
}
