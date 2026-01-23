import { useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Image,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value changes to editor
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const insertLink = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      editorRef.current?.focus();
      if (selectedText) {
        document.execCommand('createLink', false, url);
      } else {
        const linkText = prompt('Enter link text:', 'Link');
        if (linkText) {
          document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${linkText}</a>`);
        }
      }
      if (editorRef.current) {
        isInternalChange.current = true;
        onChange(editorRef.current.innerHTML);
      }
    }
  }, [onChange]);

  const formatBlock = useCallback((tag: string) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, `<${tag}>`);
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      // Upload to Supabase Storage (avoid storing base64 in the database)
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'png';
      const objectPath = `inline/${crypto.randomUUID()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(objectPath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Blog image upload failed:', uploadError);
        toast.error('Failed to upload image');
        return;
      }

      const { data } = supabase.storage.from('blog-images').getPublicUrl(objectPath);
      const publicUrl = data.publicUrl;

      editorRef.current?.focus();
      document.execCommand(
        'insertHTML',
        false,
        `<img src="${publicUrl}" alt="${file.name || 'Blog image'}" style="max-width: 100%; height: auto; margin: 8px 0;" loading="lazy" />`
      );

      if (editorRef.current) {
        isInternalChange.current = true;
        onChange(editorRef.current.innerHTML);
      }

      toast.success('Image inserted successfully');
    } catch (err) {
      console.error('Blog image upload unexpected error:', err);
      toast.error('Failed to upload image');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const triggerImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    value, 
    title,
    onClick
  }: { 
    icon: React.ElementType; 
    command?: string; 
    value?: string;
    title: string;
    onClick?: () => void;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:bg-muted"
      title={title}
      onMouseDown={(e) => {
        // Prevent losing selection in the contentEditable when clicking toolbar buttons
        e.preventDefault();
      }}
      onClick={() => onClick ? onClick() : command && execCommand(command, value)}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1 bg-muted/50 border-b">
        {/* History */}
        <ToolbarButton icon={Undo} command="undo" title="Undo" />
        <ToolbarButton icon={Redo} command="redo" title="Redo" />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Text formatting */}
        <ToolbarButton icon={Bold} command="bold" title="Bold (Ctrl+B)" />
        <ToolbarButton icon={Italic} command="italic" title="Italic (Ctrl+I)" />
        <ToolbarButton icon={Underline} command="underline" title="Underline (Ctrl+U)" />
        <ToolbarButton icon={Strikethrough} command="strikeThrough" title="Strikethrough" />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Headings */}
        <ToolbarButton icon={Heading1} title="Heading 1" onClick={() => formatBlock('h1')} />
        <ToolbarButton icon={Heading2} title="Heading 2" onClick={() => formatBlock('h2')} />
        <ToolbarButton icon={Heading3} title="Heading 3" onClick={() => formatBlock('h3')} />
        <ToolbarButton icon={Type} title="Normal text" onClick={() => formatBlock('p')} />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Lists */}
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        <ToolbarButton icon={Quote} title="Quote" onClick={() => formatBlock('blockquote')} />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Alignment */}
        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Link & Image */}
        <ToolbarButton icon={Link} title="Insert Link" onClick={insertLink} />
        <ToolbarButton icon={Image} title="Upload Image" onClick={triggerImageUpload} />
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "min-h-[200px] p-3 outline-none",
          "prose prose-sm max-w-none",
          "prose-headings:mt-2 prose-headings:mb-1",
          "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-p:my-1",
          "prose-ul:my-1 prose-ol:my-1",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-2",
          "prose-a:text-primary prose-a:underline",
          "prose-img:rounded-md prose-img:my-2",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground"
        )}
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        suppressContentEditableWarning
      />
    </div>
  );
}