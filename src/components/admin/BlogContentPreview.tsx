import DOMPurify from "dompurify";

type Props = {
  html: string;
  className?: string;
};

export function BlogContentPreview({ html, className }: Props) {
  const safeHtml = DOMPurify.sanitize(html || "", {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });

  return (
    <div
      className={
        className ??
        "prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-img:rounded-xl prose-img:my-6"
      }
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
