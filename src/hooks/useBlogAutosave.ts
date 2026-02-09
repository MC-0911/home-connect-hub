import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
 *
 * For **existing** blogs (editingBlogId is set) it updates the row.
 * For **new** blogs (editingBlogId is null) it auto-creates a draft row on the
 * first autosave cycle when the title & slug are filled, then switches to
 * update mode via the `onDraftCreated` callback.
 */
export function useBlogAutosave(
  formData: BlogFormData,
  editingBlogId: string | null,
  isDialogOpen: boolean,
  onDraftCreated?: (id: string) => void
) {
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');
  const lastSavedSnapshot = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const creatingRef = useRef(false); // guards against double-insert

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

  // Mutable refs so the interval always reads the latest values
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const editingIdRef = useRef(editingBlogId);
  editingIdRef.current = editingBlogId;

  const onDraftCreatedRef = useRef(onDraftCreated);
  onDraftCreatedRef.current = onDraftCreated;

  const parsePublishAt = (local: string) => {
    if (!local) return null;
    const d = new Date(local);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };

  const buildPayload = (current: BlogFormData) => {
    const publishAtIso = parsePublishAt(current.publish_at_local);
    return {
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
    };
  };

  const save = useCallback(async () => {
    const currentId = editingIdRef.current;
    const current = formDataRef.current;
    const snapshot = getSnapshot(current);

    // Don't autosave if title or slug is empty (required fields)
    if (!current.title.trim() || !current.slug.trim()) return;

    // Skip if nothing changed since last save
    if (snapshot === lastSavedSnapshot.current) return;

    setAutosaveStatus('saving');

    try {
      if (currentId) {
        // --- UPDATE existing blog ---
        const { error } = await supabase
          .from('blogs')
          .update(buildPayload(current))
          .eq('id', currentId);

        if (error) throw error;
      } else {
        // --- CREATE a new draft ---
        if (creatingRef.current) return; // prevent double insert
        creatingRef.current = true;

        const { data, error } = await supabase
          .from('blogs')
          .insert([buildPayload(current)])
          .select('id')
          .single();

        creatingRef.current = false;

        if (error) throw error;

        // Notify the parent so it can switch to "edit" mode
        if (data?.id) {
          onDraftCreatedRef.current?.(data.id);
        }
      }

      lastSavedSnapshot.current = snapshot;
      setAutosaveStatus('saved');
    } catch (err) {
      creatingRef.current = false;
      console.error('Autosave failed:', err);
      setAutosaveStatus('error');
    }
  }, [getSnapshot]);

  // Start / stop the interval when the dialog opens / closes
  useEffect(() => {
    if (!isDialogOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setAutosaveStatus('idle');
      lastSavedSnapshot.current = '';
      creatingRef.current = false;
      return;
    }

    // Take an initial snapshot so we don't save immediately
    lastSavedSnapshot.current = getSnapshot(formDataRef.current);

    timerRef.current = setInterval(save, AUTOSAVE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isDialogOpen, save, getSnapshot]);

  return { autosaveStatus };
}
