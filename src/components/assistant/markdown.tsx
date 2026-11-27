import type { Components } from "react-markdown"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

const components: Components = {
  p: ({ className, ...props }) => (
    <p className={cn("leading-relaxed", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "font-medium text-primary underline underline-offset-4",
        className
      )}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("list-disc space-y-1 pl-5", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("list-decimal space-y-1 pl-5", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("leading-relaxed", className)} {...props} />
  ),
  h1: ({ className, ...props }) => (
    <h1
      className={cn("mt-5 font-heading text-base font-semibold", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("mt-5 font-heading text-base font-semibold", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("mt-4 font-heading text-sm font-semibold", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "border-l-2 border-border pl-4 text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  code: ({ className, children, ...props }) => (
    <code
      className={cn(
        "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em]",
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ className, children, ...props }) => (
    <pre
      className={cn(
        "overflow-x-auto rounded-xl border border-input bg-muted/40 p-3 font-mono text-xs leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ className, ...props }) => (
    <div className="overflow-x-auto">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead className={cn("border-b bg-muted/50", className)} {...props} />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn("px-3 py-2 text-left font-medium", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td className={cn("border-t px-3 py-2 align-top", className)} {...props} />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-4 border-border", className)} {...props} />
  ),
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
