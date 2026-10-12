import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, History, Loader2, Sparkles } from 'lucide-react';
import { Select, SelectOption } from './Select';
import { confirmDialog, promptDialog } from './Dialog';
import { Notice } from './Notice';
import { MESSAGE_TEMPLATES } from '../data/messageTemplates';
import { isPinned, SavedMessage, useSavedMessages } from '../hooks/useSavedMessages';

interface Props {
  message: string;
  setMessage: (val: string) => void;
  library: ReturnType<typeof useSavedMessages>;
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Dropdown for loading a message into the editor: AI Composer messages, the user's saved messages and
// built-in templates. The entry matching the editor text shows as selected; "Save" keeps the current text
// (an AI history entry is promoted so it is no longer auto-trimmed).
export const MessagePicker: React.FC<Props> = ({ message, setMessage, library }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const saved = library.messages.filter(isPinned);
  const history = library.messages.filter((m) => !isPinned(m));

  const toOption = (m: SavedMessage, icon: React.ReactNode, kind: string): SelectOption => ({
    value: m.id,
    label: m.title,
    icon,
    description: `${kind} · ${shortDate(m.createdAt)}`,
    keywords: m.text,
    onRemove: async () => {
      const ok = await confirmDialog({
        title: 'Delete this message?',
        message: <>“{m.title}” will be removed from your saved messages. This cannot be undone.</>,
        confirmLabel: 'Delete',
        tone: 'danger',
      });
      if (ok) library.remove(m.id);
    },
  });

  // Saved first, then the AI history (newest first), then the built-in templates
  const options: SelectOption[] = [
    ...saved.map((m) =>
      m.source === 'ai'
        ? toOption(m, <Sparkles className="h-4 w-4" />, 'Saved · AI')
        : toOption(m, <Bookmark className="h-4 w-4" />, 'Saved')
    ),
    ...history.map((m) => toOption(m, <History className="h-4 w-4" />, 'AI history')),
    ...MESSAGE_TEMPLATES.map((t) => ({
      value: t.id,
      label: `${t.emoji} ${t.title}`,
      description: `Template · ${t.category}`,
      keywords: `${t.category} ${t.text}`,
    })),
  ];

  const all = [...library.messages, ...MESSAGE_TEMPLATES];
  const current = all.find((m) => m.text === message.trim());
  const isSaved = saved.some((m) => m.text === message.trim());

  const pick = (id: string) => {
    const found = all.find((m) => m.id === id);
    if (found) setMessage(found.text);
  };

  const saveCurrent = async () => {
    if (!message.trim() || isSaved) return;
    const title = await promptDialog({
      title: 'Save this message',
      message: 'It will appear under Saved in the message list, ready to reuse.',
      label: 'Message name',
      defaultValue: message.trim().split('\n')[0].replace(/[*_~`>]/g, '').trim().slice(0, 60),
      placeholder: 'e.g. Payment reminder – October',
      maxLength: 60,
      confirmLabel: 'Save message',
      icon: <Bookmark className="h-5 w-5" />,
    });
    if (title === null) return;
    setSaving(true);
    setError('');
    try {
      const fromHistory = history.find((m) => m.text === message.trim());
      await library.save(message, fromHistory ? 'ai' : 'manual', { title, pin: true });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1">
      {/* The row is the positioning context so the menu spans the full width (picker + Save) like the editor below */}
      <div className="relative flex gap-2">
        <Select
          ariaLabel="Choose a message"
          value={current?.id ?? ''}
          onChange={pick}
          options={options}
          placeholder={message.trim() ? 'Custom message (not saved)' : 'Choose a message…'}
          searchable
          searchPlaceholder="Search messages"
          className="min-w-0 flex-1 static!"
        />
        <button
          type="button"
          onClick={saveCurrent}
          disabled={saving || isSaved || !message.trim()}
          title={isSaved ? 'This message is already saved' : 'Save the current message for later'}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isSaved ? <BookmarkCheck className="h-4 w-4 text-green-600" /> : <Bookmark className="h-4 w-4" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
      {error && (
        <Notice tone="error" onDismiss={() => setError('')}>
          {error}
        </Notice>
      )}
    </div>
  );
};
