import React, { useEffect, useMemo, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PageShell, Highlight } from './components/PageShell';
import { LinkStatusCard } from './components/LinkStatusCard';
import { DirectSender } from './components/DirectSender';
import { LinkOnboarding } from './components/LinkOnboarding';
import { NvidiaStudio } from './components/NvidiaStudio';
import { HomePage } from './pages/HomePage';
import { ScriptsPage } from './pages/ScriptsPage';
import { HelpPage } from './pages/HelpPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { BackToTop } from './components/BackToTop';
import { AuthProvider, AuthState, useAuth } from './auth/AuthContext';
import { navigate, PROTECTED_ROUTES, Route, useRoute } from './hooks/useRoute';
import { useWaStatus } from './hooks/useWaStatus';
import { getScripts } from './data/scriptsData';
import { ScriptLanguage } from './types';
import { PAGE_META } from './seo';

export default function App({ initialRoute, initialAuth }: { initialRoute: Route; initialAuth: AuthState }) {
  return (
    <AuthProvider initial={initialAuth}>
      <AppShell initialRoute={initialRoute} />
    </AuthProvider>
  );
}

function AppShell({ initialRoute }: { initialRoute: Route }) {
  const requestedRoute = useRoute(initialRoute);
  const { user, registrationOpen } = useAuth();
  // WhatsApp status is per account, so it is only polled while logged in
  const waStatus = useWaStatus(Boolean(user));

  // Sending needs an account: show sign-up (or log-in) in place of protected pages
  const authRoute: Route = registrationOpen ? 'register' : 'login';
  const needsAuth = PROTECTED_ROUTES.includes(requestedRoute) && !user;
  const route: Route = needsAuth ? authRoute : requestedRoute;

  useEffect(() => {
    if (needsAuth) navigate(authRoute, `?next=/${requestedRoute}`);
    else if (user && (requestedRoute === 'login' || requestedRoute === 'register')) navigate('send');
  }, [needsAuth, authRoute, requestedRoute, user]);

  const [phone, setPhone] = useState('9876543210');
  const [message, setMessage] = useState(
    'Hello! This message was sent directly in the background via Baileys, with no Meta account required. 🚀'
  );
  const [selectedScriptId, setSelectedScriptId] = useState<ScriptLanguage>('nvidia-bot');

  // Scripts embed the current phone & message
  const scripts = useMemo(() => getScripts(phone, message), [phone, message]);

  useEffect(() => {
    document.title = PAGE_META[route].title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', PAGE_META[route].description);
  }, [route]);

  const handleUseGeneratedMessage = (msg: string) => {
    setMessage(msg);
    navigate('send');
  };

  const handleSelectNvidiaScript = () => {
    setSelectedScriptId('nvidia-bot');
    navigate('scripts');
  };

  // Log-in and sign-up are full-screen split layouts without the site header and footer
  if (route === 'login') return <LoginPage />;
  if (route === 'register') return <RegisterPage />;

  return (
    <div className="min-h-screen bg-[#f5f8fa] text-slate-800 flex flex-col font-sans selection:bg-green-200 selection:text-navy-900">
      <Header route={route} waStatus={waStatus} />

      <main className={route === 'home' ? 'flex-1 w-full' : 'flex-1 w-full pb-16'}>
        {route === 'home' && <HomePage waStatus={waStatus} />}

        {route === 'send' && (
          <PageShell
            eyebrow="Send Messages"
            icon={<Send className="h-3.5 w-3.5" />}
            title={<>Send WhatsApp messages <Highlight>instantly</Highlight></>}
            description="Send to one number or a whole list. Messages go out from your linked WhatsApp in the background, without opening WhatsApp Web."
            aside={<LinkStatusCard waStatus={waStatus} />}
          >
            {!waStatus?.ready && <LinkOnboarding waStatus={waStatus} />}
            <DirectSender phone={phone} setPhone={setPhone} message={message} setMessage={setMessage} waStatus={waStatus} />
          </PageShell>
        )}

        {route === 'ai' && (
          <PageShell
            eyebrow="AI Composer"
            icon={<Sparkles className="h-3.5 w-3.5" />}
            title={<>Write messages with <Highlight>AI</Highlight></>}
            description="Describe what you need and the AI drafts a ready-to-send WhatsApp message. Use it on the Send Messages page with one click, or preview automatic replies to customers."
          >
            <NvidiaStudio onUseGeneratedMessage={handleUseGeneratedMessage} onSelectNvidiaScript={handleSelectNvidiaScript} />
          </PageShell>
        )}

        {route === 'scripts' && (
          <ScriptsPage scripts={scripts} selectedScriptId={selectedScriptId} setSelectedScriptId={setSelectedScriptId} />
        )}

        {route === 'help' && <HelpPage />}


      </main>

      <Footer waStatus={waStatus} />
      <BackToTop />
    </div>
  );
}
