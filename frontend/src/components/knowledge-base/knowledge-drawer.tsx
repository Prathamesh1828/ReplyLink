"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { knowledgeApi, KnowledgeItem } from "@/lib/api/knowledge"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const knowledgeSchema = z.object({
  question: z.string().min(1, { message: "Question is required." }),
  answer: z.string().min(1, { message: "Answer is required." }),
})

type KnowledgeFormValues = z.infer<typeof knowledgeSchema>

interface KnowledgeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: KnowledgeItem
}

export function KnowledgeDrawer({ open, onOpenChange, item }: KnowledgeDrawerProps) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const [aliases, setAliases] = useState<string[]>([])
  const [aliasInput, setAliasInput] = useState("")

  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession()
      return data.session
    }
  })
  const userId = sessionData?.user?.id || "test_user_id"

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KnowledgeFormValues>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          question: item.question,
          answer: item.answer,
        })
        setAliases(item.aliases || [])
      } else {
        reset({
          question: "",
          answer: "",
        })
        setAliases([])
      }
      setAliasInput("")
    }
  }, [open, item, reset])

  const createMutation = useMutation({
    mutationFn: (data: Partial<KnowledgeItem>) => knowledgeApi.create(userId as string, data),
    onSuccess: () => {
      toast.success("Knowledge added successfully.")
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error("Failed to add knowledge.")
      console.error(error)
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<KnowledgeItem>) => knowledgeApi.update(item!.id, data),
    onSuccess: () => {
      toast.success("Knowledge updated successfully.")
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error("Failed to update knowledge.")
      console.error(error)
    }
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: KnowledgeFormValues) => {
    if (!userId) return

    const payload = {
      ...data,
      aliases,
    }

    if (item) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleAddAlias = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && aliasInput.trim()) {
      e.preventDefault()
      if (!aliases.includes(aliasInput.trim())) {
        setAliases([...aliases, aliasInput.trim()])
      }
      setAliasInput("")
    }
  }

  const removeAlias = (aliasToRemove: string) => {
    setAliases(aliases.filter(a => a !== aliasToRemove))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] flex flex-col h-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{item ? 'Edit Knowledge' : 'Add Knowledge'}</SheetTitle>
          <SheetDescription>
            {item 
              ? 'Update the details of this knowledge base entry.' 
              : 'Add a new piece of knowledge for the AI to use.'}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 py-6 flex-1">
          <div className="grid gap-2">
            <Label htmlFor="question">Question / Topic</Label>
            <Input
              id="question"
              placeholder="E.g. What are your opening hours?"
              disabled={isPending}
              {...register("question")}
            />
            {errors.question && (
              <p className="text-sm text-destructive">{errors.question.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="aliases">Aliases (Press Enter to add)</Label>
            <Input
              id="aliases"
              placeholder="E.g. when do you open?"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              onKeyDown={handleAddAlias}
              disabled={isPending}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {aliases.map((alias) => (
                <Badge key={alias} variant="secondary" className="pl-2 pr-1 py-1">
                  {alias}
                  <button
                    type="button"
                    onClick={() => removeAlias(alias)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="grid gap-2 flex-1">
            <Label htmlFor="answer">Answer</Label>
            <textarea
              id="answer"
              className="flex min-h-[150px] flex-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="We are open Monday to Friday from 9am to 5pm."
              disabled={isPending}
              {...register("answer")}
            />
            {errors.answer && (
              <p className="text-sm text-destructive">{errors.answer.message}</p>
            )}
          </div>

          <SheetFooter className="mt-auto pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {item ? 'Save Changes' : 'Add to Knowledge Base'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
