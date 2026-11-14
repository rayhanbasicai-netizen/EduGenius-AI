import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  compact?: boolean;
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match inline code `...`, bold **...**, italic *...*
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={`c-${keyIdx++}`}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-indigo-50 text-[#4338CA] font-mono text-[0.875em] border border-indigo-100"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-[#1E1B4B]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={`i-${keyIdx++}`} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-[#1E1B4B] text-slate-100">
      <div className="flex items-center justify-between px-4 py-2 bg-[#16133A] border-b border-white/10 text-xs text-indigo-200">
        <span className="font-mono">{language || 'notes'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content, compact = false }: MarkdownRendererProps) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(<CodeBlock key={`code-${blockKey++}`} language={lang} code={codeLines.join('\n')} />);
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      if (level === 1) {
        elements.push(
          <h1
            key={`h1-${blockKey++}`}
            className={`${compact ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold text-[#1E1B4B] mt-5 mb-2.5 first:mt-0`}
          >
            {renderInline(text)}
          </h1>
        );
      } else if (level === 2) {
        elements.push(
          <h2
            key={`h2-${blockKey++}`}
            className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} font-bold text-[#1E1B4B] mt-5 mb-2 pb-1.5 border-b border-slate-200 first:mt-0`}
          >
            {renderInline(text)}
          </h2>
        );
      } else {
        elements.push(
          <h3
            key={`h3-${blockKey++}`}
            className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-[#4338CA] mt-4 mb-1.5 first:mt-0`}
          >
            {renderInline(text)}
          </h3>
        );
      }
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      elements.push(<hr key={`hr-${blockKey++}`} className="my-4 border-slate-200" />);
      i++;
      continue;
    }

    // Blockquote (clean rounded callout without thick left accent bar)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`q-${blockKey++}`}
          className="my-3 rounded-xl bg-indigo-50/70 border border-indigo-100 px-4 py-3 text-slate-700 text-sm leading-relaxed"
        >
          {renderInline(quoteLines.join(' '))}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${blockKey++}`} className="my-3 space-y-2 pl-5 list-disc marker:text-[#7C3AED]">
          {items.map((item, idx) => (
            <li key={idx} className="text-slate-700 leading-relaxed text-[15px]">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${blockKey++}`} className="my-3 space-y-2 pl-5 list-decimal marker:text-[#4338CA] marker:font-semibold">
          {items.map((item, idx) => (
            <li key={idx} className="text-slate-700 leading-relaxed text-[15px]">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph (group consecutive plain lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !/^[-*•]\s+/.test(lines[i].trim()) &&
      !/^\d+[.)]\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    elements.push(
      <p
        key={`p-${blockKey++}`}
        className={`${compact ? 'text-sm leading-relaxed' : 'text-[15px] leading-7'} text-slate-700 my-2.5 first:mt-0 last:mb-0`}
      >
        {renderInline(paraLines.join(' '))}
      </p>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}
