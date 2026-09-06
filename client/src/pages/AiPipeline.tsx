import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Play, RefreshCw, Send, CheckCircle2, XCircle, AlertTriangle, Clock,
  Database, CalendarClock, Sparkles, Workflow, Loader2,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const token = () => { try { const s = JSON.parse(localStorage.getItem('kalisoft-storage')!); return s?.state?.token || null; } catch { return null; } };

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const t = token();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as T;
  return res.json();
}

interface Stage { key: string; label: string; status: string; detail: Record<string, unknown> }
interface Job {
  id: string; name: string; status: string; progress: number; current_stage: string;
  model: string; error?: string; created_at?: string;
  governance?: { checks?: { check: string; status: string; detail: string }[]; passed?: boolean };
  output_summary?: { ai_summary?: string; review_thread?: { q: string; a: string; at: string }[] };
  stages: Stage[];
}
interface SyncRun { id: string; status: string; total: number; inserted: number; updated: number; skipped: number; error?: string; created_at?: string }

const stageStatusColor: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground', running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  passed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};
const checkColor: Record<string, string> = {
  pass: 'text-green-500', warn: 'text-amber-500', fail: 'text-red-500',
};

export default function AiPipeline() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState('gemma-3-27b-it');
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState('');
  const [apply, setApply] = useState(false);
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [syncBusy, setSyncBusy] = useState(false);
  const [schedule, setSchedule] = useState<{ enabled: boolean; interval_minutes: number; next_run_at?: string }>({ enabled: false, interval_minutes: 60 });
  const pollRef = useRef<number | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const data = await api<Job[]>('/admin/pipeline/jobs');
      setJobs(data);
      setSelected(prev => {
        if (!prev) return data[0] ?? null;
        const updated = data.find(j => j.id === prev.id);
        return updated ?? data[0] ?? null;
      });
      const anyRunning = data.some(j => j.status === 'running');
      if (anyRunning && pollRef.current === null) {
        pollRef.current = window.setInterval(loadJobs, 2500);
      } else if (!anyRunning && pollRef.current !== null) {
        clearInterval(pollRef.current); pollRef.current = null;
      }
    } catch { /* backend may be down - keep UI alive */ }
    finally { setLoading(false); }
  }, []);

  const loadSync = useCallback(async () => {
    try {
      const data = await api<SyncRun[]>('/admin/pipeline/sync/last');
      setSyncRuns(data);
      const s = await api<{ enabled: boolean; interval_minutes: number; next_run_at?: string }>('/admin/pipeline/schedule');
      setSchedule(s);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadJobs(); loadSync();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadJobs, loadSync]);

  useEffect(() => {
    if (selected?.output_summary?.review_thread) {
      setChat(selected.output_summary.review_thread.map(t => ({ q: t.q, a: t.a })));
    }
  }, [selected?.id]);

  const runJob = async () => {
    setRunning(true);
    try {
      const res = await api<{ job_id: string }>('/admin/pipeline/run', { method: 'POST', body: JSON.stringify({ model, name: `Data prep ${new Date().toLocaleString()}` }) });
      if (pollRef.current === null) pollRef.current = window.setInterval(loadJobs, 2500);
      await loadJobs();
      setSelected(jobs.find(j => j.id === res.job_id) ?? null);
    } catch (e) { alert(`Failed: ${e}`); }
    finally { setRunning(false); }
  };

  const release = async () => {
    if (!selected) return;
    const res = await api<{ released: boolean }>(`/admin/pipeline/jobs/${selected.id}/release`, { method: 'POST' });
    await loadJobs();
    alert(res.released ? 'Released: governance green' : 'Blocked: governance has failures');
  };

  const sendReview = async () => {
    if (!selected || !msg.trim()) return;
    setSending(true);
    try {
      const res = await api<{ answer: string; thread: { q: string; a: string }[] }>(
        `/admin/pipeline/jobs/${selected.id}/review`,
        { method: 'POST', body: JSON.stringify({ message: msg, apply }) },
      );
      setChat(res.thread); setMsg('');
      await loadJobs();
    } catch (e) { alert(`Review failed: ${e}`); }
    finally { setSending(false); }
  };

  const syncNow = async () => {
    setSyncBusy(true);
    try {
      const res = await api<{ status: string }>('/admin/pipeline/sync', { method: 'POST', body: JSON.stringify({}) });
      alert(`Sync ${res.status}`);
      await loadSync();
    } catch (e) { alert(`Sync failed: ${e}`); }
    finally { setSyncBusy(false); }
  };

  const toggleSchedule = async (enabled: boolean) => {
    await api('/admin/pipeline/schedule', { method: 'PUT', body: JSON.stringify({ enabled, interval_minutes: schedule.interval_minutes }) });
    await loadSync();
  };

  const governance = selected?.governance;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">AI Process Automation</h1>
          <p className="text-muted-foreground mt-1">Data prep → governance → Gemma model → release · intermediate progress live</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Workflow className="w-4 h-4" /><span>{jobs.length} runs</span>
        </div>
      </div>

      {/* Run bar */}
      <div className="bg-card border border-border rounded-3xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <Database className="w-5 h-5 text-primary shrink-0" />
        <input
          value={model}
          onChange={e => setModel(e.target.value)}
          placeholder="Gemma model (e.g. gemma-3-27b-it)"
          className="flex-1 min-w-[220px] px-4 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button onClick={runJob} disabled={running}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run Pipeline
        </button>
        <button onClick={loadJobs} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted/50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Job list */}
        <div className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <h2 className="font-bold text-sm mb-3 px-1">Job History</h2>
          {loading ? <p className="text-sm text-muted-foreground p-2">Loading…</p> :
            jobs.length === 0 ? <p className="text-sm text-muted-foreground p-2">No runs yet. Start one above.</p> :
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {jobs.map(j => (
                <button key={j.id} onClick={() => setSelected(j)}
                  className={`w-full text-left p-3 rounded-2xl border transition-colors ${selected?.id === j.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate">{j.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${j.status === 'released' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : j.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                      {j.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${j.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{j.progress}%</span>
                  </div>
                </button>
              ))}
            </div>}
        </div>

        {/* Selected job detail */}
        <div className="xl:col-span-2 space-y-6">
          {!selected ? (
            <div className="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground shadow-sm">
              <Workflow className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Select a run to see intermediate stages, governance and Gemma output.</p>
            </div>
          ) : (
            <>
              {/* Overall progress */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold">{selected.name}</h2>
                  <span className="text-xs text-muted-foreground">model: {selected.model} · {selected.created_at ? new Date(selected.created_at).toLocaleString() : ''}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${selected.progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selected.status === 'running' ? `Processing: ${selected.current_stage}…` : selected.error ? `Error: ${selected.error}` : `Status: ${selected.status}`}
                </p>
                {selected.status === 'released' && (
                  <button onClick={release} className="mt-3 text-xs font-semibold text-primary hover:underline">Re-run release gate</button>
                )}
              </div>

              {/* Stages */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                <h2 className="font-bold mb-4">Pipeline Stages</h2>
                <div className="space-y-2.5">
                  {selected.stages.map(s => (
                    <div key={s.key} className="flex items-center gap-3">
                      {s.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
                        : s.status === 'passed' ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        : s.status === 'failed' ? <XCircle className="w-4 h-4 text-red-500 shrink-0" /> : <Clock className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${stageStatusColor[s.status] || ''}`}>{s.label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.status === 'passed' ? 'bg-green-500' : s.status === 'failed' ? 'bg-red-500' : s.status === 'running' ? 'bg-blue-500 animate-pulse' : ''}`}
                          style={{ width: s.status === 'pending' ? '0%' : '100%' }} />
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{JSON.stringify(s.detail ?? {}).slice(0, 60)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Governance */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold">Governance & Guardrails</h2>
                  {governance && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${governance.passed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                      {governance.passed ? 'PASS' : 'FAIL'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(governance?.checks ?? []).map(c => (
                    <div key={c.check} className="flex items-start gap-2 p-2.5 bg-muted/30 rounded-xl text-sm">
                      {c.status === 'pass' ? <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${checkColor[c.status]}`} />
                        : c.status === 'warn' ? <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${checkColor[c.status]}`} /> : <XCircle className={`w-4 h-4 shrink-0 mt-0.5 ${checkColor[c.status]}`} />}
                      <div>
                        <p className="font-medium text-xs">{c.check}</p>
                        <p className="text-[11px] text-muted-foreground">{c.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gemma output */}
              {selected.output_summary?.ai_summary && (
                <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h2 className="font-bold">Gemma Model Output</h2>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-2xl p-4">{selected.output_summary.ai_summary}</p>
                </div>
              )}

              {/* Chat review */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                <h2 className="font-bold mb-3">Chat-Assisted Review (prompts from kalisoftai-datahub/prompts)</h2>
                <div className="space-y-2 max-h-52 overflow-y-auto mb-3">
                  {chat.map((c, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs font-semibold text-primary">You: {c.q}</p>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-xl p-2.5">{c.a}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Ask to review / suggest changes…"
                    className="flex-1 min-w-[200px] px-4 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                    <input type="checkbox" checked={apply} onChange={e => setApply(e.target.checked)} className="accent-primary" /> Apply
                  </label>
                  <button onClick={sendReview} disabled={sending || !msg.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sync & schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <h2 className="font-bold">Sync to kalika_enterprises</h2>
            </div>
            <button onClick={syncNow} disabled={syncBusy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50">
              {syncBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Sync now
            </button>
          </div>
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {syncRuns.map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm p-2.5 bg-muted/30 rounded-xl">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === 'ok' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>{r.status}</span>
                <span className="text-xs text-muted-foreground">{r.total} total · {r.inserted} new · {r.updated} updated · {r.skipped} skipped</span>
                <span className="text-[11px] text-muted-foreground">{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</span>
              </div>
            ))}
            {syncRuns.length === 0 && <p className="text-sm text-muted-foreground p-2">No syncs yet.</p>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="w-4 h-4 text-primary" />
            <h2 className="font-bold">Schedule (in-DB, Cloud Function ready)</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={schedule.enabled} onChange={e => toggleSchedule(e.target.checked)} className="accent-primary w-4 h-4" />
              Enable auto-sync
            </label>
            <label className="text-sm text-muted-foreground">every
              <input type="number" min={5} value={schedule.interval_minutes}
                onChange={e => api('/admin/pipeline/schedule', { method: 'PUT', body: JSON.stringify({ interval_minutes: Number(e.target.value) }) })}
                className="mx-2 w-20 px-3 py-1.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              minutes
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {schedule.enabled
              ? `Active · next run ${schedule.next_run_at ? new Date(schedule.next_run_at).toLocaleString() : 'asap'}`
              : 'Scheduler off. The same SQL shape is used by the GCP Cloud Function.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}