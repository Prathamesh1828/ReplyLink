import { Metadata } from "next"
import { ContactsTable } from "@/components/contacts/contacts-table"

export const metadata: Metadata = {
  title: "Contacts | ReplyLink",
  description: "View and manage captured leads and contacts.",
}

export default function ContactsPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
          <p className="text-muted-foreground">
            Browse and manage leads captured by your automations.
          </p>
        </div>
      </div>

      <ContactsTable />
    </div>
  )
}
