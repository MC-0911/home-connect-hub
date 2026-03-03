import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, File, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface DocumentsSectionProps {
  documents: { name: string; id: string; created_at: string; metadata?: { size?: number } }[];
  onRefresh: () => void;
}

export function DocumentsSection({ documents, onRefresh }: DocumentsSectionProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("property-images").upload(path, file);
    if (error) toast.error("Upload failed");
    else { toast.success("Document uploaded"); onRefresh(); }
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border border-border/50">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Documents & Files
          </CardTitle>
          <Button size="sm" className="gap-2" disabled={uploading} asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload"}
              <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.jpg,.png" />
            </label>
          </Button>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No documents uploaded yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload property deeds, agreements, and contracts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                  <File className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
