import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author_id: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
  publish_at_local: string;
  status: string;
}

type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_INTERVAL_MS = 30_000;

/**
 * Autosaves blog draft content every 30 seconds when the editor dialog is open.
 * Only autosaves for existing blogs (editingBlogId must be set).
 * Compares a snapshot to detect real changes and avoid unnecessary writes.
 */
export function useBlogAutosave(
  formData: BlogFormData,
  editingBlogId: string | null,
  isDialogOpen: boolean
) {
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');
  const lastSavedSnapshot = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getSnapshot = useCallback((data: BlogFormData) => {
    return JSON.stringify({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      cover_image: data.cover_image,
      author_id: data.author_id,
      author_name: data.author_name,
      author_avatar_url: data.author_avatar_url,
      publish_at_local: data.publish_at_local,
      status: data.status,
    });
  }, []);

  // Keep a mutable ref to formData so the interval always reads the latest
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const save = useCallback(async () => {
    if (!editingBlogId) return;

    const current = formDataRef.current;
    const snapshot = getSnapshot(current);

    // Skip if nothing changed since last save
    if (snapshot === lastSavedSnapshot.current) return;

    // Don't autosave if title or slug is empty (required fields)
    if (!current.title.trim() || !current.slug.trim()) return;

    setAutosaveStatus('saving');

    try {
      const publishAtIso = current.publish_at_local
        ? (() => {
            const d = new Date(current.publish_at_local);
            return Number.isNaN(d.getTime()) ? null : d.toISOString();
          })()
        : null;

      const { error } = await supabase
        .from('blogs')
        .update({
          title: current.title,
          slug: current.slug,
          excerpt: current.excerpt || null,
          content: current.content,
          cover_image: current.cover_image || null,
          author_id: current.author_id || null,
          author_name: current.author_name || null,
          author_avatar_url: current.author_avatar_url || null,
          publish_at: publishAtIso,
          status: publishAtIso ? 'scheduled' : current.status,
        })
        .eq('id', editingBlogId);

      if (error) throw error;

      lastSavedSnapshot.current = snapshot;
      setAutosaveStatus('saved');
    } catch (err) {
      console.error('Autosave failed:', err);
      setAutosaveStatus('error');
    }
  }, [editingBlogId, getSnapshot]);

  // Start / stop the interval when the dialog opens / closes
  useEffect(() => {
    if (!isDialogOpen || !editingBlogId) {
      // Reset on close
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setAutosaveStatus('idle');
      lastSavedSnapshot.current = '';
      return;
    }

    // Take an initial snapshot so we don't save immediately
    lastSavedSnapshot.current = getSnapshot(formDataRef.current);

    timerRef.current = setInterval(save, AUTOSAVE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isDialogOpen, editingBlogId, save, getSnapshot]);

  return { autosaveStatus };
}
