import { useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

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
      onClick={() => onClick ? onClick() : command && execCommand(command, value)}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
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
        <ToolbarButton icon={Heading1} command="formatBlock" value="h1" title="Heading 1" />
        <ToolbarButton icon={Heading2} command="formatBlock" value="h2" title="Heading 2" />
        <ToolbarButton icon={Heading3} command="formatBlock" value="h3" title="Heading 3" />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Lists */}
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        <ToolbarButton icon={Quote} command="formatBlock" value="blockquote" title="Quote" />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Alignment */}
        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Link */}
        <ToolbarButton icon={Link} title="Insert Link" onClick={insertLink} />
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "min-h-[200px] p-3 outline-none",
          "prose prose-sm max-w-none",
          "prose-headings:mt-2 prose-headings:mb-1",
          "prose-p:my-1",
          "prose-ul:my-1 prose-ol:my-1",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground"
        )}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleInput}
        onPaste={handlePaste}
      />
    </div>
  );
}
