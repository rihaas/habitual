"use client";

import * as React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { getJournalEntry, saveJournalEntry } from "@/services/journalService";
import { useToast } from "@/hooks/use-toast";
import type { User } from "firebase/auth";

interface JournalSectionProps {
  user: User | null;
  selectedDate: Date;
}

export function JournalSection({ user, selectedDate }: JournalSectionProps) {
  const { toast } = useToast();
  const [content, setContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const fetchEntry = async () => {
      try {
        const entry = await getJournalEntry(user.uid, selectedDate);
        setContent(entry?.content || "");
      } catch (e) {
        console.error("Failed to fetch journal entry:", e);
        toast({ title: "Error", description: "Could not load journal entry.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntry();
  }, [user, selectedDate, toast]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await saveJournalEntry(user.uid, selectedDate, content);
      toast({ title: "Journal Saved!", description: "Your entry has been saved successfully." });
    } catch (e) {
      console.error("Failed to save journal entry:", e);
      toast({ title: "Error", description: "Could not save your journal entry.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Book className="w-5 h-5" />
            Daily Journal
        </CardTitle>
        <CardDescription>
          Reflections for {format(selectedDate, "MMMM do, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Jot down your thoughts, challenges, or successes..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          disabled={isLoading}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving || isLoading} className="w-full">
          {isSaving ? "Saving..." : "Save Entry"}
        </Button>
      </CardFooter>
    </Card>
  );
}
