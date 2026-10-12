import React from 'react';
import { Braces } from 'lucide-react';
import { inputCls } from './ui';
import { variableLabel } from '../utils/variables';

interface Props {
  variables: string[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  title?: string;
  hint?: string;
}

// One input per {variable} found in the message; the values replace the variables when sending
export const VariableFields: React.FC<Props> = ({ variables, values, onChange, title = 'Message variables', hint }) => {
  if (variables.length === 0) return null;
  const missing = variables.filter((v) => !values[v]?.trim()).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <Braces className="h-3.5 w-3.5 text-green-600" /> {title}
        </span>
        <span className={`text-[11px] font-medium ${missing ? 'text-amber-600' : 'text-green-600'}`}>
          {missing ? `${missing} of ${variables.length} to fill` : 'All filled ✓'}
        </span>
      </div>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {variables.map((v) => (
          <label key={v} className="block min-w-0">
            <span className="mb-1 block text-[11px] font-semibold text-slate-600">{variableLabel(v)}</span>
            <input
              type="text"
              value={values[v] ?? ''}
              onChange={(e) => onChange(v, e.target.value)}
              placeholder={`{${v}}`}
              className={inputCls}
            />
          </label>
        ))}
      </div>
    </div>
  );
};
