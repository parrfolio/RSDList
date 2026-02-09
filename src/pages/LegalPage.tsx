import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LEGAL_DOCS: Record<string, { title: string; file: string }> = {
  terms: { title: 'Terms of Service', file: '/legal/terms-of-service.md' },
  privacy: { title: 'Privacy Policy', file: '/legal/privacy-policy.md' },
  cookies: { title: 'Cookie Policy', file: '/legal/cookie-policy.md' },
};

/** Simple markdown-to-HTML renderer for legal docs (no external dep needed) */
function renderMarkdown(md: string): string {
  return (
    md
      // Remove the disclaimer blockquote styling but keep content
      .replace(/^> \*\*Disclaimer:\*\*/gm, '**Disclaimer:**')
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="my-6 border-border" />')
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-8 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      // Bold + italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-[#E8A530] underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Tables (simple)
      .replace(/\|---.*\|/g, '')
      .replace(/^\|(.+)\|$/gm, (_, row) => {
        const cells = row
          .split('|')
          .map((c: string) => c.trim())
          .filter(Boolean);
        return `<tr>${cells.map((c: string) => `<td class="border border-border px-3 py-2 text-sm">${c}</td>`).join('')}</tr>`;
      })
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm leading-relaxed">$1</li>')
      // Paragraphs (lines that aren't already HTML)
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<')) return trimmed;
        return `<p class="text-sm leading-relaxed mb-3">${trimmed}</p>`;
      })
      .join('\n')
      // Wrap consecutive <tr> in table
      .replace(/((?:<tr>.*<\/tr>\s*)+)/g, '<table class="w-full border-collapse my-4">$1</table>')
      // Wrap consecutive <li> in ul
      .replace(/((?:<li[^>]*>.*<\/li>\s*)+)/g, '<ul class="my-3 space-y-1">$1</ul>')
  );
}

export default function LegalPage() {
  const { docType } = useParams<{ docType: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const doc = docType ? LEGAL_DOCS[docType] : undefined;

  useEffect(() => {
    if (!doc) return;
    setLoading(true);
    fetch(doc.file)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((md) => {
        setContent(renderMarkdown(md));
        setLoading(false);
      })
      .catch(() => {
        setContent('<p class="text-red-400">Failed to load document.</p>');
        setLoading(false);
      });
  }, [doc]);

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <p>Document not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="prose-invert" dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
    </div>
  );
}
