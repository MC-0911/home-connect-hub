import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, Upload, File, Trash2, Search, Download, Eye,
  FolderOpen, FileCheck, FileWarning, ClipboardList, Shield, MoreVertical,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface AgentDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  document_type: string;
  property_name: string | null;
  notes: string | null;
  created_at: string;
}

const DOC_TYPES = [
  { value: "deed", label: "Deed", icon: FileText, color: "bg-blue-100 text-blue-600" },
  { value: "agreement", label: "Agreement", icon: FileCheck, color: "bg-emerald-100 text-emerald-600" },
  { value: "contract", label: "Contract", icon: ClipboardList, color: "bg-violet-100 text-violet-600" },
  { value: "inspection", label: "Inspection", icon: FileWarning, color: "bg-orange-100 text-orange-600" },
  { value: "disclosure", label: "Disclosure", icon: Shield, color: "bg-amber-100 text-amber-600" },
  { value: "other", label: "Other", icon: File, color: "bg-muted text-muted-foreground" },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  const cfg = DOC_TYPES.find((d) => d.value === type);
  return cfg || DOC_TYPES[DOC_TYPES.length - 1];
}

export function DocumentsSection() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<AgentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState("other");
  const [uploadPropertyName, setUploadPropertyName] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("agent_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setDocuments(data as AgentDocument[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDocuments();
    if (!user) return;
    const channel = supabase
      .channel("agent-documents")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_documents", filter: `user_id=eq.${user.id}` }, fetchDocuments)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchDocuments]);

  const handleUpload = async () => {
    if (!user || !uploadFile) {
      toast.error("Please select a file");
      return;
    }
    setUploading(true);
    const path = `${user.id}/${Date.now()}_${uploadFile.name}`;
    const { error: storageError } = await supabase.storage.from("agent-documents").upload(path, uploadFile);
    if (storageError) {
      toast.error("File upload failed");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("agent-documents").getPublicUrl(path);

    const { error: dbError } = await supabase.from("agent_documents").insert({
      user_id: user.id,
      file_name: uploadFile.name,
      file_url: urlData.publicUrl,
      file_size: uploadFile.size,
      file_type: uploadFile.type,
      document_type: uploadDocType,
      property_name: uploadPropertyName || null,
      notes: uploadNotes || null,
    });

    if (dbError) {
      toast.error("Failed to save document record");
    } else {
      toast.success("Document uploaded successfully");
      setUploadDialogOpen(false);
      resetUploadForm();
    }
    setUploading(false);
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadDocType("other");
    setUploadPropertyName("");
    setUploadNotes("");
  };

  const handleDelete = async (doc: AgentDocument) => {
    // Extract storage path from URL
    const urlParts = doc.file_url.split("/agent-documents/");
    const storagePath = urlParts[1] ? decodeURIComponent(urlParts[1]) : null;

    const { error: dbError } = await supabase.from("agent_documents").delete().eq("id", doc.id);
    if (dbError) {
      toast.error("Failed to delete document");
      return;
    }
    if (storagePath) {
      await supabase.storage.from("agent-documents").remove([storagePath]);
    }
    toast.success("Document deleted");
  };

  // Filtering
  const filtered = documents.filter((d) => {
    const matchesSearch = d.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.property_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || d.document_type === filterType;
    return matchesSearch && matchesType;
  });

  // Stats per type
  const typeCounts = DOC_TYPES.map((dt) => ({
    ...dt,
    count: documents.filter((d) => d.document_type === dt.value).length,
  }));

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading documents...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Documents & Contracts</h1>
                <p className="text-sm text-muted-foreground">{documents.length} document{documents.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <Button className="rounded-xl gap-2" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4" /> Upload Document
            </Button>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-border/50 rounded-xl"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DOC_TYPES.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Type Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {typeCounts.map((dt) => {
          const Icon = dt.icon;
          return (
            <motion.div key={dt.value} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card
                className={`border border-border/50 shadow-sm cursor-pointer transition-all hover:shadow-md ${filterType === dt.value ? "ring-2 ring-primary" : ""}`}
                onClick={() => setFilterType(filterType === dt.value ? "all" : dt.value)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 rounded-xl ${dt.color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{dt.count}</p>
                  <p className="text-xs text-muted-foreground">{dt.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Document List */}
      <Card className="border border-border/50 shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No documents found</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                {documents.length === 0 ? "Upload your first document to get started." : "Try adjusting your search or filter."}
              </p>
              {documents.length === 0 && (
                <Button onClick={() => setUploadDialogOpen(true)} className="rounded-xl gap-2">
                  <Upload className="h-4 w-4" /> Upload Your First Document
                </Button>
              )}
            </div>
          ) : (
            <div>
              {filtered.map((doc, i) => {
                const cfg = getFileIcon(doc.document_type);
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-5 py-4 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${cfg.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{doc.file_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{cfg.label}</Badge>
                        {doc.property_name && (
                          <span className="text-xs text-muted-foreground truncate">{doc.property_name}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatFileSize(doc.file_size)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(doc.created_at), "MMM d, yyyy")}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(doc.file_url, "_blank")}>
                          <Eye className="h-4 w-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={doc.file_url} download={doc.file_name}>
                            <Download className="h-4 w-4 mr-2" /> Download
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(doc)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={(o) => { setUploadDialogOpen(o); if (!o) resetUploadForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>File *</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <label className="cursor-pointer">
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <File className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{uploadFile.name}</span>
                      <span className="text-xs text-muted-foreground">({formatFileSize(uploadFile.size)})</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to select a file</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, JPG, PNG (max 20MB)</p>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Document Type</Label>
                <Select value={uploadDocType} onValueChange={setUploadDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((dt) => (
                      <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Property (optional)</Label>
                <Input value={uploadPropertyName} onChange={(e) => setUploadPropertyName(e.target.value)} placeholder="e.g. Sunset Villa" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes (optional)</Label>
              <Input value={uploadNotes} onChange={(e) => setUploadNotes(e.target.value)} placeholder="Brief description..." />
            </div>
            <Button onClick={handleUpload} className="w-full gap-2" disabled={uploading || !uploadFile}>
              <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
