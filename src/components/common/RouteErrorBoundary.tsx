import React from 'react';
import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, RefreshCw, ArrowLeft, Home, ShieldCheck } from 'lucide-react';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = 'An unexpected runtime condition occurred.';
  let errorDetails = '';

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
    errorDetails = error.data?.message || '';
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // User-friendly message for camera/scanner hiccups
  const isScannerError = errorMessage.toLowerCase().includes('scanner') || errorMessage.toLowerCase().includes('cannot stop');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
            {isScannerError ? 'Scanner Camera Recovery' : 'Application Resilience'}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isScannerError ? 'Scanner Stopped Safely' : 'Unexpected Application Event'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            {isScannerError
              ? 'The optical camera feed was released or transitioned between viewports. The system has safely preserved all lineage data.'
              : errorMessage}
          </p>
        </div>

        {errorDetails && (
          <details className="text-left text-[11px] font-mono text-slate-400 bg-slate-950/70 p-3 rounded-xl border border-slate-800 max-h-32 overflow-y-auto">
            <summary className="cursor-pointer text-slate-300 font-medium">Diagnostic Details</summary>
            <div className="mt-2 text-rose-300/80 whitespace-pre-wrap">{errorDetails}</div>
          </details>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <RefreshCw size={14} />
            <span>Reload Station</span>
          </button>

          <button
            onClick={() => navigate('/passport/AAA12345678')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Showcase Passport</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Home size={14} />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
