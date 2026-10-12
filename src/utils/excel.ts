// Excel / CSV import and sample-sheet export for bulk sending. SheetJS is loaded on demand so it
// is not part of the main bundle.
import { Recipient } from '../types';
import { VARIABLE_HINTS } from './variables';

const PHONE_HEADERS = ['phone', 'mobile', 'number', 'whatsapp', 'phone_number', 'mobile_number', 'whatsapp_number', 'contact'];
const NAME_HEADERS = ['name', 'full_name', 'customer_name', 'customer'];

/** "Order ID" / "order-id" → "order_id" so headers match {variables} */
const normalizeHeader = (h: string) =>
  h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export interface ImportResult {
  recipients: Recipient[];
  /** Variable columns found in the sheet (normalized), excluding phone and name */
  columns: string[];
  skipped: number;
}

/**
 * Reads the first sheet. Row 1 must be headers: a phone column (phone / mobile / number / whatsapp),
 * an optional name column, and any number of variable columns (order_id, amount, …).
 * Numbers without a country code (10 digits or fewer) get defaultDialCode.
 */
export async function importRecipients(file: File, defaultDialCode: string): Promise<ImportResult> {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new Error('The file has no sheets.');

  // Raw values keep long phone numbers intact; formatted text keeps dates and prices as shown in Excel
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { raw: true, defval: '' });
  const text = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { raw: false, defval: '' });
  if (raw.length === 0) throw new Error('The sheet is empty. Add a header row and at least one recipient.');

  const headers = Object.keys(raw[0]);
  const byNorm = new Map(headers.map((h) => [normalizeHeader(h), h]));
  const phoneKey = PHONE_HEADERS.map((h) => byNorm.get(h)).find(Boolean);
  const nameKey = NAME_HEADERS.map((h) => byNorm.get(h)).find(Boolean);
  if (!phoneKey) throw new Error('No phone column found. Name the first column "phone".');

  const varHeaders = headers.filter((h) => h !== phoneKey && h !== nameKey && normalizeHeader(h));
  const stamp = Date.now();
  let skipped = 0;
  const recipients: Recipient[] = [];

  raw.forEach((row, i) => {
    const rawPhone = row[phoneKey];
    // Local numbers (trunk 0 removed, 10 digits or fewer) get the default country code
    let digits = (typeof rawPhone === 'number' ? rawPhone.toFixed(0) : String(rawPhone)).replace(/[^0-9]/g, '').replace(/^0+/, '');
    if (digits.length > 0 && digits.length <= 10) digits = defaultDialCode + digits;
    if (digits.length < 10 || digits.length > 15) {
      skipped++;
      return;
    }
    const customData: Record<string, string> = {};
    for (const h of varHeaders) {
      // Excel's default date format follows the PC locale, so date cells are formatted here ("20 Oct 2026")
      const cell = row[h];
      const v = (cell instanceof Date ? formatDate(cell) : String(text[i]?.[h] ?? '')).trim();
      if (v) customData[normalizeHeader(h)] = v;
    }
    recipients.push({
      id: `rec-${i}-${stamp}`,
      phone: digits,
      name: (nameKey && String(text[i]?.[nameKey] ?? '').trim()) || `Recipient ${recipients.length + 1}`,
      customData,
      status: 'pending',
    });
  });

  return { recipients, columns: varHeaders.map(normalizeHeader), skipped };
}

/** Downloads an .xlsx with phone, name and one column per variable used in the message, plus 2 example rows */
export async function downloadSampleSheet(variables: string[]) {
  const XLSX = await import('xlsx');
  const cols = ['phone', 'name', ...variables.filter((v) => v !== 'name')];
  const examples = [
    { phone: '919876543210', name: 'Rahul' },
    { phone: '919811223344', name: 'Priya' },
  ];
  const rows = examples.map((ex) =>
    Object.fromEntries(cols.map((c) => [c, ex[c as keyof typeof ex] ?? VARIABLE_HINTS[c] ?? '']))
  );
  const ws = XLSX.utils.json_to_sheet(rows, { header: cols });
  ws['!cols'] = cols.map((c) => ({ wch: Math.max(14, c.length + 2, ...rows.map((r) => String(r[c]).length + 2)) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Recipients');
  XLSX.writeFile(wb, 'bulk-recipients-template.xlsx');
}
