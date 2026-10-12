import React, { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Strikethrough, Code, SquareCode, List, ListOrdered, Quote,
  Smile, Braces, Undo2, Redo2, Eraser,
} from 'lucide-react';
import { confirmDialog } from './Dialog';

// WhatsApp-flavoured text editor: a toolbar that wraps the current selection with
// WhatsApp markers (*bold*, _italic_, ~strike~, `code`, ```mono```), line prefixes
// (lists, quotes), emoji and {name} insertion. Edits go through execCommand so the
// browser's native undo/redo stack (Ctrl+Z / Ctrl+Y) keeps working.

const EMOJIS = [
  '😀', '😂', '😊', '😍', '🥳', '😎', '🤔', '😢',
  '👍', '👏', '🙏', '💪', '👋', '🤝', '✌️', '👉',
  '❤️', '🔥', '✨', '🎉', '🚀', '✅', '❌', '⚠️',
  '📦', '📅', '⏰', '📞', '💬', '📍', '💰', '🎁',
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  /** Show the {name} variable button (bulk templates). */
  showNameVariable?: boolean;
}

const btn =
  'inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-200 hover:text-navy-900 disabled:opacity-40';
const divider = <span className="mx-1 h-5 w-px bg-slate-200" />;

export const MessageEditor: React.FC<Props> = ({ value, onChange, rows = 5, placeholder, showNameVariable }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emojiOpen) return;
    const close = (e: MouseEvent) => {
      if (!emojiRef.current?.contains(e.target as Node)) setEmojiOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [emojiOpen]);

  // Replace [start, end) with text, then select [selStart, selEnd)
  const replaceRange = (start: number, end: number, text: string, selStart: number, selEnd: number) => {
    const ta = ref.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(start, end);
    if (!document.execCommand('insertText', false, text)) {
      onChange(ta.value.slice(0, start) + text + ta.value.slice(end));
    }
    requestAnimationFrame(() => ta.setSelectionRange(selStart, selEnd));
  };

  const wrap = (open: string, close = open, sample = 'text') => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value: v } = ta;
    const selected = v.slice(s, e);

    // Toggle off when the selection is already wrapped (inside or just outside)
    if (selected.length > open.length + close.length && selected.startsWith(open) && selected.endsWith(close)) {
      const inner = selected.slice(open.length, selected.length - close.length);
      return replaceRange(s, e, inner, s, s + inner.length);
    }
    if (v.slice(s - open.length, s) === open && v.slice(e, e + close.length) === close) {
      return replaceRange(s - open.length, e + close.length, selected, s - open.length, e - open.length);
    }

    const inner = selected || sample;
    replaceRange(s, e, open + inner + close, s + open.length, s + open.length + inner.length);
  };

  const prefixLines = (kind: 'bullet' | 'number' | 'quote') => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value: v } = ta;
    const lineStart = v.lastIndexOf('\n', s - 1) + 1;
    const nl = v.indexOf('\n', e);
    const lineEnd = nl === -1 ? v.length : nl;
    const lines = v.slice(lineStart, lineEnd).split('\n');

    const pattern = kind === 'bullet' ? /^- / : kind === 'number' ? /^\d+\. / : /^> /;
    const allPrefixed = lines.every((l) => pattern.test(l));
    const next = lines
      .map((l, i) => {
        if (allPrefixed) return l.replace(pattern, '');
        const bare = l.replace(/^(- |\d+\. |> )/, '');
        return (kind === 'bullet' ? '- ' : kind === 'number' ? `${i + 1}. ` : '> ') + bare;
      })
      .join('\n');
    replaceRange(lineStart, lineEnd, next, lineStart, lineStart + next.length);
  };

  const insert = (text: string) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    replaceRange(s, e, text, s + text.length, s + text.length);
  };

  const history = (cmd: 'undo' | 'redo') => {
    ref.current?.focus();
    document.execCommand(cmd);
  };

  const clearAll = async () => {
    if (!value) return;
    const ok = await confirmDialog({
      title: 'Clear the message?',
      message: 'The whole message will be removed from the editor. You can bring it back with Undo (Ctrl+Z).',
      confirmLabel: 'Clear',
      tone: 'danger',
    });
    if (!ok) return;
    replaceRange(0, value.length, '', 0, 0);
  };

  // WhatsApp Web / Desktop shortcuts
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    const action =
      !e.shiftKey && k === 'b' ? () => wrap('*') :
      !e.shiftKey && k === 'i' ? () => wrap('_') :
      e.shiftKey && k === 'x' ? () => wrap('~') :
      e.shiftKey && k === 'm' ? () => wrap('```', '```', 'monospace') :
      null;
    if (action) {
      e.preventDefault();
      action();
    }
  };

  // Keep the textarea selection when clicking toolbar buttons
  const keepFocus = (e: React.MouseEvent) => e.preventDefault();

  const tools: Array<{ icon: React.ReactNode; title: string; run: () => void } | 'sep'> = [
    { icon: <Bold className="h-3.5 w-3.5" />, title: 'Bold (Ctrl+B)', run: () => wrap('*') },
    { icon: <Italic className="h-3.5 w-3.5" />, title: 'Italic (Ctrl+I)', run: () => wrap('_') },
    { icon: <Strikethrough className="h-3.5 w-3.5" />, title: 'Strikethrough (Ctrl+Shift+X)', run: () => wrap('~') },
    'sep',
    { icon: <Code className="h-3.5 w-3.5" />, title: 'Inline code', run: () => wrap('`', '`', 'code') },
    { icon: <SquareCode className="h-3.5 w-3.5" />, title: 'Monospace block (Ctrl+Shift+M)', run: () => wrap('```', '```', 'monospace') },
    'sep',
    { icon: <List className="h-3.5 w-3.5" />, title: 'Bulleted list', run: () => prefixLines('bullet') },
    { icon: <ListOrdered className="h-3.5 w-3.5" />, title: 'Numbered list', run: () => prefixLines('number') },
    { icon: <Quote className="h-3.5 w-3.5" />, title: 'Quote', run: () => prefixLines('quote') },
  ];

  return (
    <div className="rounded-xl border border-slate-300 bg-white shadow-sm transition hover:border-slate-400 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/15">
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        {tools.map((t, i) =>
          t === 'sep' ? (
            <React.Fragment key={i}>{divider}</React.Fragment>
          ) : (
            <button key={i} type="button" title={t.title} aria-label={t.title} onMouseDown={keepFocus} onClick={t.run} className={btn}>
              {t.icon}
            </button>
          )
        )}
        {divider}

        <div className="relative" ref={emojiRef}>
          <button type="button" title="Emoji" aria-label="Emoji" onMouseDown={keepFocus} onClick={() => setEmojiOpen((o) => !o)} className={btn}>
            <Smile className="h-3.5 w-3.5" />
          </button>
          {emojiOpen && (
            <div className="absolute left-0 top-9 z-20 grid w-64 grid-cols-8 gap-0.5 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onMouseDown={keepFocus}
                  onClick={() => insert(em)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-base hover:bg-slate-100"
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        {showNameVariable && (
          <button type="button" title="Insert {name} variable" aria-label="Insert name variable" onMouseDown={keepFocus} onClick={() => insert('{name}')} className={btn}>
            <Braces className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="ml-auto flex items-center gap-0.5">
          <button type="button" title="Undo (Ctrl+Z)" aria-label="Undo" onMouseDown={keepFocus} onClick={() => history('undo')} className={btn}>
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" title="Redo (Ctrl+Y)" aria-label="Redo" onMouseDown={keepFocus} onClick={() => history('redo')} className={btn}>
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" title="Clear message" aria-label="Clear message" onMouseDown={keepFocus} onClick={clearAll} disabled={!value} className={`${btn} hover:!bg-red-50 hover:!text-red-600`}>
            <Eraser className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="block w-full resize-y rounded-b-xl border-0 bg-transparent px-3.5 py-3 text-sm leading-relaxed text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-0"
      />

      <div className="flex items-center justify-between border-t border-slate-100 px-3.5 py-1.5 text-[11px] text-slate-400">
        <span>
          {value.length} characters · {value.trim() ? value.trim().split(/\s+/).length : 0} words
        </span>
        <span className="hidden sm:inline">*bold* _italic_ ~strike~ `code`</span>
      </div>
    </div>
  );
};

// Renders WhatsApp markup the way the app shows it, for the live preview bubble
const renderInline = (text: string, keyBase: string): React.ReactNode[] =>
  text.split(/(`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g).map((part, i) => {
    const key = `${keyBase}-${i}`;
    const inner = part.slice(1, -1);
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`'))
      return <code key={key} className="rounded bg-black/5 px-1 font-mono text-[13px]">{inner}</code>;
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) return <strong key={key}>{renderInline(inner, key)}</strong>;
    if (part.length > 2 && part.startsWith('_') && part.endsWith('_')) return <em key={key}>{renderInline(inner, key)}</em>;
    if (part.length > 2 && part.startsWith('~') && part.endsWith('~')) return <s key={key}>{renderInline(inner, key)}</s>;
    return part;
  });

export const WhatsAppText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(```[\s\S]+?```)/g).map((chunk, ci) => {
      if (chunk.startsWith('```') && chunk.endsWith('```') && chunk.length > 6) {
        return (
          <span key={ci} className="font-mono text-[13px]">
            {chunk.slice(3, -3)}
          </span>
        );
      }
      return chunk.split('\n').map((line, li, arr) => {
        const key = `${ci}-${li}`;
        const content = line.startsWith('> ') ? (
          <span key={key} className="block border-l-4 border-slate-400/60 pl-2 text-slate-600">
            {renderInline(line.slice(2), key)}
          </span>
        ) : (
          <React.Fragment key={key}>{renderInline(line, key)}</React.Fragment>
        );
        // Quote lines are blocks already, so they don't need an explicit newline
        return (
          <React.Fragment key={key}>
            {content}
            {li < arr.length - 1 && !line.startsWith('> ') ? '\n' : null}
          </React.Fragment>
        );
      });
    })}
  </>
);
