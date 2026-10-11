import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, Trash2 } from 'lucide-react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  /** Text chip used as the icon (e.g. a country ISO code), styled with iconClassName */
  iconText?: string;
  iconClassName?: string;
  description?: string;
  /** Short text shown in an "attached" trigger instead of the full label (e.g. "+91") */
  short?: string;
  /** Extra text matched by search */
  keywords?: string;
  /** Shows a delete button on the option (e.g. for user-created entries) */
  onRemove?: () => void;
}

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  ariaLabel?: string;
  id?: string;
  size?: 'sm' | 'md';
  /** "attached" renders a borderless trigger for use inside another input (e.g. a phone country code) */
  variant?: 'default' | 'attached';
  searchable?: boolean;
  searchPlaceholder?: string;
  menuWidth?: string;
  className?: string;
  /** Extra content pinned under the options (e.g. an "Add new" action); receives a function that closes the menu */
  footer?: (close: () => void) => React.ReactNode;
}

const MENU_MAX_H = 320;

function OptionIcon({ opt, selected }: { opt: SelectOption; selected: boolean }) {
  if (opt.iconText) return <span className={opt.iconClassName}>{opt.iconText}</span>;
  if (opt.icon) return <span className={`flex shrink-0 ${selected ? 'text-green-600' : 'text-slate-500'}`}>{opt.icon}</span>;
  return null;
}

// Accessible custom dropdown (combobox + listbox): icons, descriptions, optional search, full keyboard support.
// The menu sits below the sticky header (z-30) and opens upwards when there is not enough room below.
export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  ariaLabel,
  id,
  size = 'md',
  variant = 'default',
  searchable = false,
  searchPlaceholder = 'Search…',
  menuWidth,
  className = '',
  footer,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState('');
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const baseId = id ?? autoId;
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => `${o.label} ${o.description ?? ''} ${o.keywords ?? ''}`.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    // open upwards if the menu would run past the bottom of the viewport
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setDropUp(window.innerHeight - rect.bottom < MENU_MAX_H + 24 && rect.top > window.innerHeight - rect.bottom);
    setQuery('');
    const idx = options.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : 0);
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus());

    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Keep the keyboard-highlighted option in view
  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const choose = (i: number) => {
    const opt = filtered[i];
    if (opt) onChange(opt.value);
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' || (e.key === ' ' && !searchable)) {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      close(false);
    }
  };

  const pad = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-3.5 py-2.5 text-sm';
  const trigger =
    variant === 'attached'
      ? `h-full rounded-l-xl border-r border-slate-200 ${open ? 'bg-green-50' : 'bg-slate-50 hover:bg-slate-100'}`
      : `w-full rounded-xl border bg-white shadow-sm transition ${
          open ? 'border-green-500 bg-green-50/60 ring-4 ring-green-500/15' : 'border-slate-300 hover:border-slate-400'
        }`;

  return (
    <div ref={rootRef} className={`relative ${variant === 'attached' ? 'shrink-0' : ''} ${className}`}>
      <button
        ref={buttonRef}
        id={baseId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${baseId}-list`}
        aria-activedescendant={open && !searchable ? `${baseId}-opt-${active}` : undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`flex items-center gap-2 text-left font-semibold text-navy-900 outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 ${pad} ${trigger}`}
      >
        {selected && <OptionIcon opt={selected} selected={false} />}
        <span className={`flex-1 truncate ${selected ? '' : 'font-medium text-slate-400'}`}>
          {selected ? (variant === 'attached' && selected.short ? selected.short : selected.label) : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180 text-green-600' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute left-0 z-30 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_50px_-20px_rgba(10,31,51,0.35)] ${
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${menuWidth ?? (variant === 'attached' ? 'w-72' : 'w-full min-w-[14rem]')}`}
        >
          {searchable && (
            <div className="border-b border-slate-100 p-2">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 focus-within:ring-2 focus-within:ring-green-500/30">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  aria-controls={`${baseId}-list`}
                  aria-activedescendant={filtered.length ? `${baseId}-opt-${active}` : undefined}
                  className="w-full bg-transparent py-2 text-sm text-navy-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>
          )}
          <ul
            ref={listRef}
            id={`${baseId}-list`}
            role="listbox"
            aria-labelledby={baseId}
            className="no-scrollbar overflow-y-auto p-1.5"
            style={{ maxHeight: searchable ? MENU_MAX_H - 56 : MENU_MAX_H }}
          >
            {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-500">No matches</li>}
            {filtered.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  id={`${baseId}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${i === active ? 'bg-slate-100/80' : ''}`}
                >
                  <OptionIcon opt={opt} selected={isSelected} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-semibold ${isSelected ? 'text-green-700' : 'text-navy-900'}`}>{opt.label}</span>
                    {opt.description && <span className="block truncate text-xs font-normal text-slate-500">{opt.description}</span>}
                  </span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-green-600" />}
                  {opt.onRemove && (
                    <button
                      type="button"
                      aria-label={`Delete ${opt.label}`}
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        opt.onRemove?.();
                      }}
                      className={`shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {footer && <div className="border-t border-slate-100 p-1.5">{footer(() => close(false))}</div>}
        </div>
      )}
    </div>
  );
}
