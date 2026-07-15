import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activity = [
  {
    user: "Sarah Johnson",
    action: "commented on your post",
    time: "2 minutes ago",
    aiResponded: true,
    avatar: "/avatars/02.png",
    initials: "SJ"
  },
  {
    user: "Mike Ross",
    action: "sent a DM regarding pricing",
    time: "15 minutes ago",
    aiResponded: true,
    avatar: "/avatars/03.png",
    initials: "MR"
  },
  {
    user: "Alex Wong",
    action: "replied to your story",
    time: "1 hour ago",
    aiResponded: true,
    avatar: "/avatars/04.png",
    initials: "AW"
  },
  {
    user: "Emily Davis",
    action: "commented 'link'",
    time: "3 hours ago",
    aiResponded: true,
    avatar: "/avatars/05.png",
    initials: "ED"
  },
  {
    user: "Jordan Lee",
    action: "was captured as a new lead",
    time: "5 hours ago",
    aiResponded: false,
    avatar: "/avatars/06.png",
    initials: "JL"
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8 mt-2">
      {activity.map((item, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={item.avatar} alt="Avatar" />
            <AvatarFallback>{item.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{item.user}</p>
            <p className="text-sm text-muted-foreground">
              {item.action}
            </p>
          </div>
          <div className="ml-auto font-medium text-xs text-muted-foreground">
            {item.time}
          </div>
        </div>
      ))}
    </div>
  )
}
