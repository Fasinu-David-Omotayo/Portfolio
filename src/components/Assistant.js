'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { safeJson } from '@/lib/apiClient';

// "Dee" - a small scripted guide for the portfolio. It is NOT an AI model:
// it understands a fixed set of topics (work, about, skills, CV, contact),
// scrolls the page to the right section, and can walk a visitor through
// leaving a message, which is sent through the same /api/contact route the
// contact form uses (so it lands in the admin inbox like any other message).

const OWNER = 'David';
const PROJECT_TYPES = ['Software Development', 'Graphic Design', 'Data Analysis', 'Something else'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_QUERY = '(max-width: 560px)';

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function goTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

// Original mascot: a friendly speech-bubble face.
function DeeFace({ className = '' }) {
  return (
    <svg className={`dee ${className}`} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        className="dee-body"
        d="M24 5C13.5 5 6 12 6 21.5c0 6 3 10.8 8 13.8-.4 3-1.8 5.4-4 7 4.4-.2 8.2-1.8 11-4.2.9.1 1.9.2 3 .2 10.5 0 18-7 18-16.8S34.5 5 24 5Z"
      />
      <g className="dee-eyes">
        <ellipse className="dee-eye" cx="18" cy="21" rx="2.6" ry="3.4" />
        <ellipse className="dee-eye" cx="30" cy="21" rx="2.6" ry="3.4" />
      </g>
      <path className="dee-smile" d="M19 29c1.6 1.8 3.4 2.6 5 2.6s3.4-.8 5-2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function matchIntent(text) {
  const t = text.toLowerCase();
  if (/\b(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(t)) return 'hello';
  if (/\b(thanks|thank you|thx|cheers)\b/.test(t)) return 'thanks';
  if (/\b(cv|resume|résumé|curriculum)\b/.test(t)) return 'cv';
  if (/whatsapp/.test(t)) return 'whatsapp';
  if (/linkedin/.test(t)) return 'linkedin';
  if (/github/.test(t)) return 'github';
  if (/\b(email|e-mail|mail)\b/.test(t)) return 'email';
  if (/(contact|hire|reach|talk to|message|quote|collab|work with|get in touch|enquir|inquir)/.test(t)) return 'contact';
  if (/(logo|brand|graphic|design|flyer|poster)/.test(t)) return 'work:design';
  if (/(data|analy[sz]|dashboard|excel|sql)/.test(t)) return 'work:data';
  if (/(software|develop|code|coding|web ?site|app|react|next)/.test(t)) return 'work:dev';
  if (/(project|portfolio|work|built|showcase)/.test(t)) return 'work';
  if (/(skill|stack|tech|tool|language|framework|know)/.test(t)) return 'skills';
  if (/(about|who|background|yourself|bio|david)/.test(t)) return 'about';
  if (/(home|top|start)/.test(t)) return 'home';
  return null;
}

export default function Assistant({ content = {}, skills = [] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [flow, setFlowState] = useState(null);
  const [nudge, setNudge] = useState(false);

  const flowRef = useRef(null);
  const idRef = useRef(0);
  const timers = useRef([]);
  const started = useRef(false);
  const everOpened = useRef(false);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  const waDigits = String(content.whatsappUrl || '').replace(/\D/g, '');
  const links = {
    whatsapp: waDigits ? `https://wa.me/${waDigits}` : null,
    email: content.contactEmail ? `mailto:${content.contactEmail}` : null,
    linkedin: content.linkedinUrl || null,
    github: content.githubUrl || null,
  };

  function setFlow(next) {
    flowRef.current = next;
    setFlowState(next);
  }

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ---- say(): bot messages appear one after another with a typing pause ----
  const say = useCallback((items) => {
    const arr = Array.isArray(items) ? items : [items];
    setBusy(true);
    let t = 0;
    arr.forEach((m, i) => {
      const text = m.text || '';
      const dur = reducedMotion() ? 80 : Math.min(1100, Math.max(420, 320 + text.length * 7));
      later(() => setTyping(true), t);
      later(() => {
        setTyping(false);
        setMessages((prev) => [...prev, { id: ++idRef.current, from: 'bot', ...m }]);
        if (i === arr.length - 1) setBusy(false);
      }, t + dur);
      t += dur + 90;
    });
    return t;
  }, []);

  function userSay(text) {
    setMessages((prev) => [...prev.map((m) => ({ ...m, chips: undefined })), { id: ++idRef.current, from: 'user', text }]);
  }

  // After taking someone to a section on a phone, tuck the chat away so the
  // page they asked to see is actually visible. The conversation is kept.
  function tuckAwayOnPhone(afterMs) {
    if (window.matchMedia(MOBILE_QUERY).matches) later(() => setOpen(false), afterMs + 1500);
  }

  const menuChips = () => [
    { label: 'Explore the work', intent: 'work' },
    { label: `About ${OWNER}`, intent: 'about' },
    { label: 'Skills & tools', intent: 'skills' },
    { label: 'Download CV', intent: 'cv' },
    { label: `Contact ${OWNER}`, intent: 'contact' },
  ];

  const contactChips = () =>
    [
      { label: 'Send a message here', intent: 'form' },
      links.whatsapp && { label: 'WhatsApp', href: links.whatsapp },
      links.email && { label: 'Email', href: links.email },
      links.linkedin && { label: 'LinkedIn', href: links.linkedin },
      links.github && { label: 'GitHub', href: links.github },
    ].filter(Boolean);

  // ---- the little message-sending conversation ----
  function startForm() {
    setFlow({ step: 'name', data: {} });
    say({ text: `Happy to. I'll pass it straight to ${OWNER}. What's your name?`, chips: [{ label: 'Cancel', intent: 'cancel' }] });
  }

  async function sendMessage() {
    const f = flowRef.current;
    if (!f) return;
    setBusy(true);
    setTyping(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f.data),
      });
      const data = await safeJson(res);
      setTyping(false);
      if (!res.ok) {
        setBusy(false);
        say({
          text: `${data.error || 'Something went wrong.'} Want to try again?`,
          chips: [{ label: 'Try again', intent: 'send' }, { label: 'Cancel', intent: 'cancel' }],
        });
        return;
      }
      setFlow(null);
      setBusy(false);
      say([
        { text: `Sent! ${OWNER} will reply to ${f.data.email} as soon as he can.` },
        { text: 'Is there anything else I can help you with?', chips: menuChips() },
      ]);
    } catch {
      setTyping(false);
      setBusy(false);
      say({
        text: "I couldn't reach the server. Check your connection and try again.",
        chips: [{ label: 'Try again', intent: 'send' }, { label: 'Cancel', intent: 'cancel' }],
      });
    }
  }

  function answerFlow(raw) {
    const f = flowRef.current;
    const text = raw.trim();
    const cancel = [{ label: 'Cancel', intent: 'cancel' }];
    if (/^(cancel|stop|never ?mind|exit)$/i.test(text)) return run('cancel');

    if (f.step === 'name') {
      if (!text || text.length > 200) return say({ text: 'Could you tell me your name?', chips: cancel });
      const data = { ...f.data, name: text };
      setFlow({ step: 'email', data });
      return say({ text: `Nice to meet you, ${text.split(' ')[0]}. What's your email address, so ${OWNER} can reply?`, chips: cancel });
    }
    if (f.step === 'email') {
      if (!EMAIL_RE.test(text)) return say({ text: "That doesn't look like an email address. Could you check it?", chips: cancel });
      setFlow({ step: 'type', data: { ...f.data, email: text } });
      return say({
        text: "What's it about?",
        chips: [...PROJECT_TYPES.map((p) => ({ label: p, intent: `type:${p}` })), ...cancel],
      });
    }
    if (f.step === 'type') {
      const found = PROJECT_TYPES.find((p) => p.toLowerCase() === text.toLowerCase());
      const projectType = found || text.slice(0, 100) || 'Something else';
      setFlow({ step: 'message', data: { ...f.data, projectType } });
      return say({ text: `Got it. Write your message for ${OWNER}. Add as much detail as you like.`, chips: cancel });
    }
    if (f.step === 'message') {
      if (text.length < 5) return say({ text: 'Could you add a little more detail?', chips: cancel });
      if (text.length > 5000) return say({ text: 'That is a bit long. Could you shorten it to under 5000 characters?', chips: cancel });
      const data = { ...f.data, message: text };
      setFlow({ step: 'confirm', data });
      const preview = text.length > 220 ? `${text.slice(0, 220)}...` : text;
      return say({
        text: `Here's what I'll send:\n\nName: ${data.name}\nEmail: ${data.email}\nAbout: ${data.projectType}\n\n"${preview}"`,
        chips: [
          { label: 'Send it', intent: 'send' },
          { label: 'Start over', intent: 'form' },
          ...cancel,
        ],
      });
    }
    // confirm step
    if (/^(y|yes|yep|send|send it|ok|okay|sure)$/i.test(text)) return sendMessage();
    return say({
      text: 'Tap "Send it" to confirm, or "Start over" to change anything.',
      chips: [{ label: 'Send it', intent: 'send' }, { label: 'Start over', intent: 'form' }, ...cancel],
    });
  }

  // ---- intents ----
  function run(intent) {
    if (intent.startsWith('type:')) return answerFlow(intent.slice(5));

    switch (intent) {
      case 'hello':
        return say({
          text: `Hi! I'm Dee, a small guide for ${OWNER}'s portfolio. I can show you around, share his CV, or help you get in touch. What would you like to do?`,
          chips: menuChips(),
        });
      case 'thanks':
        return say({ text: 'Anytime! Is there anything else I can help with?', chips: menuChips() });
      case 'work':
      case 'work:dev':
      case 'work:design':
      case 'work:data': {
        const filter = intent === 'work' ? 'all' : intent.split(':')[1];
        window.dispatchEvent(new CustomEvent('portfolio:filter', { detail: filter }));
        goTo('work');
        const label = { all: 'his selected work', dev: 'his software projects', design: 'his design work', data: 'his data analysis projects' }[filter];
        const t = say({
          text: `Taking you to ${label}. Click any project to see the full details, links and case study.`,
          chips: [
            { label: 'Software', intent: 'work:dev' },
            { label: 'Design', intent: 'work:design' },
            { label: 'Data', intent: 'work:data' },
            { label: `Contact ${OWNER}`, intent: 'contact' },
          ],
        });
        return tuckAwayOnPhone(t);
      }
      case 'about': {
        goTo('about');
        const bio = (content.aboutParagraph1 || '').trim();
        const t = say({
          text: bio || `${OWNER} is a software developer, graphic designer and data analyst.`,
          chips: [{ label: 'See his work', intent: 'work' }, { label: 'Download CV', intent: 'cv' }, { label: `Contact ${OWNER}`, intent: 'contact' }],
        });
        return tuckAwayOnPhone(t);
      }
      case 'skills': {
        goTo('skills');
        const groups = {};
        skills.forEach((s) => {
          (groups[s.category] = groups[s.category] || []).push(s.name);
        });
        const lines = Object.entries(groups).map(([cat, names]) => `${cat}: ${names.join(', ')}`);
        const t = say({
          text: lines.length ? `Here's what he works with:\n\n${lines.join('\n')}` : "Here's what he works with.",
          chips: [{ label: 'See his work', intent: 'work' }, { label: `Contact ${OWNER}`, intent: 'contact' }],
        });
        return tuckAwayOnPhone(t);
      }
      case 'cv':
        if (content.cvUrl) {
          return say({
            text: `Here's ${OWNER}'s CV.`,
            chips: [{ label: 'Download CV', href: content.cvUrl, download: true }, { label: `Contact ${OWNER}`, intent: 'contact' }],
          });
        }
        return say({
          text: `His CV isn't uploaded yet, but you can message him and he'll send it over.`,
          chips: [{ label: 'Send a message here', intent: 'form' }],
        });
      case 'contact':
        return say({ text: `Happy to connect you. How would you like to reach ${OWNER}?`, chips: contactChips() });
      case 'whatsapp':
      case 'email':
      case 'linkedin':
      case 'github': {
        const url = links[intent];
        if (!url) return say({ text: `I don't have that one listed, but I can pass a message to ${OWNER} for you.`, chips: [{ label: 'Send a message here', intent: 'form' }] });
        const label = { whatsapp: 'WhatsApp', email: 'Email', linkedin: 'LinkedIn', github: 'GitHub' }[intent];
        return say({ text: `Here you go.`, chips: [{ label: `Open ${label}`, href: url }, { label: 'Send a message here', intent: 'form' }] });
      }
      case 'form':
        return startForm();
      case 'send':
        return sendMessage();
      case 'cancel':
        setFlow(null);
        return say({ text: "No problem, I've cancelled that. Anything else I can help with?", chips: menuChips() });
      case 'home': {
        goTo('home');
        const t = say({ text: 'Back to the top.', chips: menuChips() });
        return tuckAwayOnPhone(t);
      }
      default:
        return say({
          text: "I'm a simple guide, so I might have missed that. I can show you the work, tell you about David, share his CV, or help you send him a message.",
          chips: menuChips(),
        });
    }
  }

  function onChip(c) {
    if (busy) return;
    userSay(c.label);
    run(c.intent);
  }

  function submit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    if (inputRef.current) inputRef.current.style.height = '';
    userSay(text);
    if (flowRef.current) return answerFlow(text);
    run(matchIntent(text) || 'fallback');
  }

  // ---- open / close ----
  function openChat() {
    everOpened.current = true;
    setNudge(false);
    try { sessionStorage.setItem('dee-nudge', '1'); } catch {}
    setOpen(true);
    if (!started.current) {
      started.current = true;
      run('hello');
    }
  }

  function closeChat() {
    setOpen(false);
    later(() => launcherRef.current && launcherRef.current.focus(), 0);
  }

  // A gentle one-time nudge, never more than once per visit.
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('dee-nudge') === '1'; } catch {}
    if (seen) return;
    const show = setTimeout(() => {
      if (!everOpened.current) {
        setNudge(true);
        try { sessionStorage.setItem('dee-nudge', '1'); } catch {}
      }
    }, 7000);
    const hide = setTimeout(() => setNudge(false), 16000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  // Dee's eyes follow the pointer while she floats in the corner.
  useEffect(() => {
    if (open || reducedMotion()) return;
    const el = launcherRef.current;
    if (!el) return;
    function look(e) {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 220);
      el.style.setProperty('--lx', `${((dx / d) * 1.6 * k).toFixed(2)}px`);
      el.style.setProperty('--ly', `${((dy / d) * 1.2 * k).toFixed(2)}px`);
    }
    window.addEventListener('pointermove', look, { passive: true });
    return () => window.removeEventListener('pointermove', look);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      later(() => inputRef.current && inputRef.current.focus(), 320);
    }
    function onKey(e) {
      if (e.key === 'Escape') closeChat();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // On phones, size the sheet to the *visible* viewport so the on-screen
  // keyboard never hides the input.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const vv = window.visualViewport;
    const mq = window.matchMedia(MOBILE_QUERY);
    if (!panel) return;
    function fit() {
      if (!mq.matches || !vv) {
        panel.style.removeProperty('top');
        panel.style.removeProperty('height');
        panel.style.removeProperty('bottom');
        return;
      }
      const h = Math.min(Math.round(vv.height * 0.86), 660);
      panel.style.height = `${h}px`;
      panel.style.bottom = 'auto';
      panel.style.top = `${Math.max(0, vv.offsetTop + vv.height - h - 10)}px`;
    }
    fit();
    if (vv) {
      vv.addEventListener('resize', fit);
      vv.addEventListener('scroll', fit);
    }
    mq.addEventListener('change', fit);
    return () => {
      if (vv) {
        vv.removeEventListener('resize', fit);
        vv.removeEventListener('scroll', fit);
      }
      mq.removeEventListener('change', fit);
    };
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [messages, typing, open]);

  const last = messages[messages.length - 1];
  const step = flow && flow.step;
  const placeholder =
    step === 'name' ? 'Your name'
    : step === 'email' ? 'you@example.com'
    : step === 'message' ? 'Write your message...'
    : step === 'type' ? 'Pick one above, or type it'
    : 'Ask me anything...';

  return (
    <div className={`assistant${open ? ' is-open' : ''}`}>
      {open && (
        <section ref={panelRef} className="assistant-panel" role="dialog" aria-label="Chat with Dee, the portfolio guide">
          <header className="assistant-head">
            <span className="assistant-avatar"><DeeFace /></span>
            <div className="assistant-who">
              <strong>Dee</strong>
              <span>Portfolio guide</span>
            </div>
            <button type="button" className="assistant-close" onClick={closeChat} aria-label="Close chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </header>

          <div className="assistant-messages" ref={listRef} role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((m) => (
              <div key={m.id} className={`assistant-msg ${m.from}`}>
                {m.from === 'bot' && <span className="assistant-msg-avatar"><DeeFace /></span>}
                <div className="assistant-bubble">{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="assistant-msg bot">
                <span className="assistant-msg-avatar"><DeeFace /></span>
                <div className="assistant-bubble assistant-typing" aria-label="Dee is typing"><i /><i /><i /></div>
              </div>
            )}
            {last && last.from === 'bot' && last.chips && !typing && !busy && (
              <div className="assistant-chips">
                {last.chips.map((c) =>
                  c.href ? (
                    <a
                      key={c.label}
                      className="assistant-chip"
                      href={c.href}
                      {...(c.href.startsWith('mailto:') || c.download ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                      {...(c.download ? { download: '' } : {})}
                    >
                      {c.label}
                    </a>
                  ) : (
                    <button key={c.label} type="button" className="assistant-chip" onClick={() => onChip(c)}>
                      {c.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <form className="assistant-form" onSubmit={submit} noValidate>
            <textarea
              ref={inputRef}
              className="assistant-input"
              rows={1}
              value={input}
              placeholder={placeholder}
              aria-label="Type a message"
              maxLength={5000}
              inputMode={step === 'email' ? 'email' : 'text'}
              autoComplete={step === 'email' ? 'email' : step === 'name' ? 'name' : 'off'}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 110)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) submit(e);
              }}
            />
            <button type="submit" className="assistant-send" disabled={busy || !input.trim()} aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </form>
        </section>
      )}

      {!open && nudge && (
        <button type="button" className="assistant-nudge" onClick={openChat}>
          Need a hand finding something?
        </button>
      )}

      {!open && (
        <button ref={launcherRef} type="button" className="assistant-launcher" onClick={openChat} aria-label="Open chat with Dee, the portfolio guide" aria-expanded="false">
          <span className="assistant-float"><DeeFace /></span>
          <span className="assistant-shadow" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}