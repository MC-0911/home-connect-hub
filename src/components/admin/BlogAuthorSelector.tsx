import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type AuthorProfile = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type BlogAuthorValue = {
  author_id: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
};

export function BlogAuthorSelector({
  value,
  onChange,
}: {
  value: BlogAuthorValue;
  onChange: (next: BlogAuthorValue) => void;
}) {
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .order("full_name", { ascending: true });

        if (error) throw error;
        if (mounted) setAuthors((data || []) as AuthorProfile[]);
      } catch {
        if (mounted) setAuthors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const selected = useMemo(() => {
    if (!value.author_id) return null;
    return authors.find((a) => a.user_id === value.author_id) || null;
  }, [authors, value.author_id]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    );
  }

  return (
    <Select
      value={value.author_id ?? "__none__"}
      onValueChange={(next) => {
        if (next === "__none__") {
          onChange({ author_id: null, author_name: null, author_avatar_url: null });
          return;
        }

        const profile = authors.find((a) => a.user_id === next) || null;
        onChange({
          author_id: next,
          author_name: profile?.full_name ?? null,
          author_avatar_url: profile?.avatar_url ?? null,
        });
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an author" aria-label={selected?.full_name ?? "No author"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">No author</SelectItem>
        {authors.map((a) => {
          const label = a.full_name || "Unnamed";
          const initials = label
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join("");

          return (
            <SelectItem key={a.user_id} value={a.user_id}>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={a.avatar_url ?? undefined} alt={label} />
                  <AvatarFallback className="text-xs">{initials || "U"}</AvatarFallback>
                </Avatar>
                <span>{label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
