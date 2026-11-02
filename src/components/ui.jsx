import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Check, Copy, Loader2, X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { STATUS_META, SEVERITY_TONE, humanize } from '../lib/format';

const cx = (...a) => a.filter(Boolean).join(' ');
export { cx };

const BTN = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 shadow-sm',
  ghost: 'text-ink-600 hover:bg-ink-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  dark: 'bg-ink-900 text-white hover:bg-ink-800 shadow-sm',
};
export function Button({ variant = 'primary', size = 'md', icon: Icon, loading, className, children, ...rest }) {
  const sz = size === 'sm' ? 'px-2.5 py-1.5 text-xs gap-1.5' : size === 'lg' ? 'px-5 py-3 text-base gap-2' : 'px-3.5 py-2 text-sm gap-2';
  return (
    <button
      className={cx('inline-flex items-center justify-center rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50', BTN[variant], sz, className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} /> : null}
      {children}
    </button>
  );
}

export function Card({ title, subtitle, action, children, className, bodyClass = 'p-5', icon: Icon }) {
  return (
    <section className={cx('card', className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="h-4 w-4 text-ink-400" />}
            <div>
              <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
              {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

const TONES = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  gray: 'bg-ink-100 text-ink-600 ring-ink-500/20',
};
export const toneText = { brand: 'text-brand-600', red: 'text-red-600', amber: 'text-amber-600', blue: 'text-sky-600', purple: 'text-violet-600', gray: 'text-ink-500' };
export const toneBg = { brand: 'bg-brand-50', red: 'bg-red-50', amber: 'bg-amber-50', blue: 'bg-sky-50', purple: 'bg-violet-50', gray: 'bg-ink-100' };

export function Badge({ tone = 'gray', children, className, dot }) {
  return (
    <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset', TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: humanize(status), tone: 'gray' };
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}

export const SeverityBadge = ({ severity }) => <Badge tone={SEVERITY_TONE[severity]}>{severity}</Badge>;

export function Stat({ label, value, icon: Icon, tone = 'brand', hint }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-500">{label}</p>
        {Icon && (
          <span className={cx('rounded-lg p-1.5', toneBg[tone])}>
            <Icon className={cx('h-4 w-4', toneText[tone])} />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink-900">{value ?? '—'}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function Field({ label, hint, children, className }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="label">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-400">{hint}</span>}
    </label>
  );
}

export function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <div className={cx('flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')} onMouseDown={(e) => e.stopPropagation()}>
        <header className="flex items-start justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-ink-100 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

export function Empty({ icon: Icon = Info, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="rounded-full bg-ink-100 p-3"><Icon className="h-6 w-6 text-ink-400" /></span>
      <p className="mt-3 text-sm font-semibold text-ink-800">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const Spinner = ({ className }) => <Loader2 className={cx('h-5 w-5 animate-spin text-brand-600', className)} />;

export function Loading({ text = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
      <Spinner /> {text}
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {error.message || String(error)}
      {error.details?.length > 0 && <ul className="mt-1 list-disc pl-5 text-xs">{[].concat(error.details).map((d, i) => <li key={i}>{typeof d === 'string' ? d : JSON.stringify(d)}</li>)}</ul>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs font-medium text-ink-500">{eyebrow}</div>}
        <h1 className="truncate text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Hash({ value, len = 10, className }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-ink-400">—</span>;
  const copy = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <span className={cx('group inline-flex items-center gap-1 font-mono text-[12px] text-ink-600', className)} title={value}>
      {value.length > len + 6 ? `${value.slice(0, len)}…${value.slice(-4)}` : value}
      <button onClick={copy} className="text-ink-300 hover:text-ink-600" aria-label="Copy">
        {copied ? <Check className="h-3 w-3 text-brand-600" /> : <Copy className="h-3 w-3" />}
      </button>
    </span>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-ink-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            '-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition',
            value === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800',
          )}
        >
          {t.icon && <t.icon className="h-4 w-4" />}
          {t.label}
          {t.count != null && <span className="rounded-full bg-ink-100 px-1.5 text-[10px] font-semibold text-ink-600">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ── toasts ──────────────────────────────────────────────────────────────────
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, tone = 'success') => {
    const id = Math.random();
    setItems((x) => [...x, { id, msg, tone }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto flex items-start gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm shadow-lg">
            {t.tone === 'error' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />}
            <span className="text-ink-800">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      setState({ loading: false, data: await fn(), error: null });
    } catch (error) {
      setState({ loading: false, data: null, error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    run();
  }, [run]);
  return { ...state, reload: run };
}
