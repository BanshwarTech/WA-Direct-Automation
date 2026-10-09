export type ScriptLanguage =
  | 'nvidia-bot'
  | 'baileys'
  | 'local-api'
  | 'android-adb'
  | 'android-termux'
  | 'python'
  | 'bash';

export interface ScriptTemplate {
  id: ScriptLanguage;
  name: string;
  badge: string;
  category:
    | 'NVIDIA AI + WhatsApp'
    | 'Headless Socket (No Browser)'
    | 'Local REST API'
    | 'Android Direct (ADB)'
    | 'Termux Direct (Mobile)'
    | 'Python'
    | 'CLI/URL';
  description: string;
  pros: string[];
  cons: string[];
  prerequisites: string[];
  setupCommands: string;
  code: string;
  filename: string;
  doesOpenWhatsAppWeb: boolean;
}

export interface Recipient {
  id: string;
  name: string;
  phone: string;
  customData?: Record<string, string>;
  status: 'pending' | 'sent' | 'skipped';
}
