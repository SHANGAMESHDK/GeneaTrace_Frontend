import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronRight, CircuitBoard, Thermometer, AlertTriangle, CheckCircle2, XCircle, Building2, ShieldAlert } from 'lucide-react';
import { Badge, cx, Hash, toneBg, toneText } from './ui';
import { eventMeta, fmtDateTime, ROLE_LABEL, humanize } from '../lib/format';

export function Logo({ className, light }) {
  return (
    <span className={cx('inline-flex items-center gap-2 font-bold tracking-tight', className)}>
      <img src="/favicon.svg" alt="" className="h-7 w-7" />
      <span className={light ? 'text-white' : 'text-ink-900'}>
        Genea<span className={light ? 'text-brand-300' : 'text-brand-600'}>Trace</span>
      </span>
    </span>
  );
}

export function TrustRing({ score, size = 88 }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? '#059673' : score >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#eceef2" strokeWidth="8" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: 'stroke-dashoffset .8s' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-400">trust</span>
      </div>
    </div>
  );
}

export function QrImage({ value, size = 160, className }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    QRCode.toDataURL(value, { width: size * 2, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#11131a' } }).then(setSrc).catch(() => setSrc(null));
  }, [value, size]);
  return src ? <img src={src} width={size} height={size} alt="QR code" className={className} /> : <div style={{ width: size, height: size }} className="animate-pulse rounded bg-ink-100" />;
}

export function JourneyMap({ points, height = 300 }) {
  const pts = points.filter((p) => p.lat != null && p.lng != null);
  if (!pts.length) return <div className="flex items-center justify-center rounded-xl bg-ink-50 text-sm text-ink-400" style={{ height }}>No location data</div>;
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const bounds = [[Math.min(...lats) - 0.05, Math.min(...lngs) - 0.05], [Math.max(...lats) + 0.05, Math.max(...lngs) + 0.05]];
  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-ink-200">
      <MapContainer bounds={bounds} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={pts.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#059673', weight: 3, dashArray: '6 6' }} />
        {pts.map((p, i) => (
          <CircleMarker key={i} center={[p.lat, p.lng]} radius={p.danger ? 9 : 7} pathOptions={{ color: '#fff', weight: 2, fillColor: p.danger ? '#dc2626' : i === pts.length - 1 ? '#059673' : '#535c72', fillOpacity: 1 }}>
            <Tooltip>
              <strong>{p.label}</strong>
              {p.sub && <div>{p.sub}</div>}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export function journeyPoints(journey) {
  const out = [];
  for (const j of journey) {
    const lat = j.facility?.lat ?? j.data?.lat;
    const lng = j.facility?.lng ?? j.data?.lng;
    if (lat == null) continue;
    const last = out[out.length - 1];
    const danger = (j.facility && !j.facility.licensed) || j.data?.excursion;
    if (last && last.lat === lat && last.lng === lng) {
      last.danger ||= danger;
      continue;
    }
    out.push({ lat, lng, label: j.facility?.name || eventMeta(j.type).label, sub: `${eventMeta(j.type).label} · ${fmtDateTime(j.ts)}`, danger });
  }
  return out;
}

const dataLine = (j) => {
  const d = j.data || {};
  const bits = [];
  if (d.process) bits.push(`${d.process} · machine ${d.machine_id}${d.result === 'fail' ? ' · FAIL' : ''}${d.rework ? ' · rework' : ''}`);
  if (d.part) bits.push(`installed ${d.part.name} ${d.part.id}`);
  if (d.carton_id) bits.push(`carton ${d.carton_id}`);
  if (d.bin) bits.push(`bin ${d.bin}`);
  if (d.received_by) bits.push(`received by ${d.received_by}`);
  if (d.finding) bits.push(d.finding);
  if (d.replacement_id) bits.push(`replacement ${d.replacement_id}`);
  if (d.replaces) bits.push(`replaces ${d.replaces}`);
  if (d.ticket_id) bits.push(`case ${d.ticket_id}`);
  if (d.replaced?.length) bits.push(d.replaced.map((r) => `${r.name} → ${r.new_part_id || r.to_batch}`).join(', '));
  if (j.type === 'EXIT' && j.to_actor) bits.push(`to ${j.to_actor.name}`);
  if (d.temperature_c != null) bits.push(`${d.temperature_c}°C`);
  if (d.result) bits.push(`QC ${d.result}`);
  if (d.version) bits.push(d.version);
  if (d.code && d.code !== 'RECALL') bits.push(humanize(d.code));
  if (d.reason) bits.push(d.reason);
  if (d.action && j.type !== 'DIAGNOSED') bits.push(d.action);
  if (j.type === 'DIAGNOSED' && d.action) bits.push(`action: ${d.action}`);
  if (j.type === 'WARRANTY_CLAIM') bits.push(d.eligible ? 'eligible' : 'not eligible');
  if (d.invoice) bits.push(`inv ${d.invoice}`);
  if (d.description) bits.push(d.description);
  return bits.join(' · ');
};

export function Timeline({ journey, internal }) {
  return (
    <ol className="relative space-y-0">
      {[...journey].reverse().map((j, i) => {
        const m = eventMeta(j.type);
        const Icon = m.icon;
        const warn = (j.facility && !j.facility.licensed) || j.data?.excursion || j.data?.unlicensed_facility;
        return (
          <li key={j.tx_id} className="relative flex gap-3 pb-5 last:pb-0">
            {i < journey.length - 1 && <span className="absolute left-[15px] top-8 h-full w-px bg-ink-200" />}
            <span className={cx('relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white', warn ? 'bg-red-50' : toneBg[m.tone])}>
              <Icon className={cx('h-4 w-4', warn ? 'text-red-600' : toneText[m.tone])} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold text-ink-900">{m.label}</span>
                {j.facility && !j.facility.licensed && <Badge tone="red">Unlicensed site</Badge>}
                {j.data?.excursion && <Badge tone="red"><Thermometer className="h-3 w-3" />Excursion</Badge>}
                <span className="text-xs text-ink-400">{fmtDateTime(j.ts)}</span>
              </div>
              <p className="mt-0.5 text-sm text-ink-600">
                {j.actor ? <>{j.actor.name} <span className="text-ink-400">· {ROLE_LABEL[j.actor.role]}</span></> : 'GeneaTrace node'}
                {j.facility && <> · <Building2 className="mb-0.5 inline h-3.5 w-3.5 text-ink-400" /> {j.facility.name}{j.facility.city ? `, ${j.facility.city}` : ''}</>}
              </p>
              {dataLine(j) && <p className="mt-0.5 text-xs text-ink-500">{dataLine(j)}</p>}
              <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-ink-400">
                <span>Block #{j.block_height}</span>
                <Hash value={j.tx_id} len={internal ? 12 : 8} />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ComponentTree({ nodes, depth = 0, linkBatches }) {
  if (!nodes?.length) return depth === 0 ? <p className="text-sm text-ink-500">No tracked components – this is a base material or single-part product.</p> : null;
  return (
    <ul className={cx('space-y-2', depth > 0 && 'ml-5 mt-2 border-l border-dashed border-ink-200 pl-4')}>
      {nodes.map((n) => {
        const inner = (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2">
            <CircuitBoard className="h-4 w-4 text-ink-400" />
            <span className="text-sm font-medium text-ink-800">{n.name}</span>
            <span className="mono text-ink-500">{n.batch_id}</span>
            {n.batch_name && <span className="text-xs text-ink-500">{n.batch_name}</span>}
            {n.manufacturer && <span className="text-xs text-ink-400">by {n.manufacturer.name}</span>}
            {n.replaced && <Badge tone="purple">Replaced at service</Badge>}
            {n.status === 'recalled' && <Badge tone="red">Lot recalled</Badge>}
            {linkBatches && <ChevronRight className="ml-auto h-4 w-4 text-ink-300" />}
          </div>
        );
        return (
          <li key={n.batch_id + n.name}>
            {linkBatches ? <Link to={`/app/batches/${n.batch_id}`}>{inner}</Link> : inner}
            <ComponentTree nodes={n.children} depth={depth + 1} linkBatches={linkBatches} />
          </li>
        );
      })}
    </ul>
  );
}

export function WarrantyPanel({ warranty }) {
  if (!warranty) return null;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-ink-200 p-3 text-sm">
        <span className="font-medium">Standard warranty: </span>
        {warranty.standard ? (
          <span className={warranty.standard.active ? 'text-brand-700' : 'text-ink-500'}>
            {warranty.standard.active ? 'Active' : 'Expired'} until {new Date(warranty.standard.until).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-ink-500">Starts at first sale</span>
        )}
      </div>
      {warranty.programs.length === 0 && <p className="text-sm text-ink-500">No active replacement programs from this manufacturer.</p>}
      {warranty.programs.map((p) => (
        <div key={p.program_id} className={cx('rounded-xl border p-4', p.eligible ? 'border-brand-200 bg-brand-50/40' : 'border-ink-200')}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{p.program}</p>
              {p.coverage && <p className="text-xs text-ink-500">{p.coverage}</p>}
            </div>
            <Badge tone={p.eligible ? 'brand' : 'gray'}>{p.eligible ? 'Eligible' : 'Not eligible'}</Badge>
          </div>
          <ul className="mt-3 space-y-1.5">
            {p.checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-sm">
                {c.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                <span className="text-ink-700">{c.label}{c.detail && <span className="text-ink-400"> – {c.detail}</span>}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function IntegrityPanel({ integrity, trust, onProof }) {
  return (
    <div className="space-y-4">
      <div className={cx('flex items-start gap-3 rounded-xl border p-4', integrity.valid && !integrity.drift.length ? 'border-brand-200 bg-brand-50/50' : 'border-red-200 bg-red-50')}>
        {integrity.valid && !integrity.drift.length ? <CheckCircle2 className="h-5 w-5 text-brand-600" /> : <ShieldAlert className="h-5 w-5 text-red-600" />}
        <div className="text-sm">
          <p className="font-semibold">{integrity.valid ? `${integrity.events} ledger events verified` : 'Ledger verification failed'}</p>
          <p className="text-ink-600">Every event was re-hashed (SHA-256), its Ed25519 signature checked against the signer’s on-chain key, linked to the previous event and matched to its block’s Merkle root.</p>
          {integrity.issues.map((i) => <p key={i} className="mt-1 text-red-700">• {i}</p>)}
          {integrity.drift.map((d) => <p key={d.field} className="mt-1 text-red-700">• Database field “{d.field}” = {String(d.database)} but ledger says {String(d.ledger)}</p>)}
        </div>
      </div>
      {integrity.ethereum && (
        <div className={cx('rounded-lg border px-3 py-2 text-sm', integrity.ethereum.mismatches?.length ? 'border-red-200 bg-red-50 text-red-700' : 'border-ink-200 text-ink-700')}>
          {integrity.ethereum.error ? <>Ethereum check unavailable ({integrity.ethereum.network})</> : (
            <>
              <span className="font-semibold">Ethereum ({integrity.ethereum.network}): </span>
              {integrity.ethereum.anchored} of {integrity.ethereum.of} block(s) holding this unit's events are anchored and match
              {integrity.ethereum.pending.length > 0 && <>, {integrity.ethereum.pending.length} waiting to be anchored</>}
              {integrity.ethereum.mismatches.length > 0 && <>; block(s) {integrity.ethereum.mismatches.join(', ')} DIFFER from Ethereum</>}.
            </>
          )}
        </div>
      )}
      {integrity.signature_valid != null && (
        <div className={cx('flex items-center gap-2 rounded-lg border px-3 py-2 text-sm', integrity.signature_valid ? 'border-brand-200 text-brand-800' : 'border-red-200 bg-red-50 text-red-700')}>
          {integrity.signature_valid ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          QR label signature {integrity.signature_valid ? 'matches the manufacturer key' : 'does NOT match the manufacturer key'}
        </div>
      )}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Trust score breakdown</p>
        {trust.reasons.length === 0 ? <p className="text-sm text-ink-600">No risk factors found.</p> : (
          <ul className="space-y-1">
            {trust.reasons.map((r) => (
              <li key={r.reason} className="flex justify-between gap-3 text-sm">
                <span className="text-ink-700">{r.reason}</span>
                <span className={r.impact ? 'font-semibold text-red-600' : 'text-ink-400'}>{r.impact || '±0'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {integrity.head && onProof && (
        <div className="text-sm">
          <span className="text-ink-500">Latest event: </span><Hash value={integrity.head} len={14} />{' '}
          <button className="ml-2 font-medium text-brand-700 hover:underline" onClick={() => onProof(integrity.head)}>Show Merkle proof</button>
        </div>
      )}
    </div>
  );
}

export function ProofView({ proof }) {
  if (!proof) return null;
  return (
    <div className="space-y-3 text-sm">
      <div className={cx('flex items-center gap-2 font-semibold', proof.verified ? 'text-brand-700' : 'text-red-600')}>
        {proof.verified ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {proof.verified ? 'Inclusion proof verified' : 'Proof failed'}
      </div>
      <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5">
        <dt className="text-ink-500">Transaction</dt><dd><Hash value={proof.tx_id} len={20} /></dd>
        <dt className="text-ink-500">Block</dt><dd>#{proof.block.height} · {fmtDateTime(proof.block.ts)}</dd>
        <dt className="text-ink-500">Block hash</dt><dd><Hash value={proof.block.hash} len={20} /></dd>
        <dt className="text-ink-500">Merkle root</dt><dd><Hash value={proof.block.merkle_root} len={20} /></dd>
        <dt className="text-ink-500">Node key</dt><dd><Hash value={proof.node_public_key} len={20} /></dd>
      </dl>
      {proof.ethereum && (
        <div className="rounded-lg border border-ink-200 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">Ethereum anchor</p>
          <EthAnchorLine eth={proof.ethereum} />
          <p className="mt-1 text-xs text-ink-500">The block hash above is stored in contract <span className="font-mono">{proof.ethereum.contract?.slice(0, 10)}…</span>; anyone can read it from Ethereum and compare.</p>
        </div>
      )}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">Path ({proof.path.length} hops)</p>
        <ol className="space-y-1">
          {proof.path.map((s, i) => <li key={i} className="mono text-ink-600">{i + 1}. {s.position === 'left' ? 'H(sibling ‖ node)' : 'H(node ‖ sibling)'} · {s.hash.slice(0, 24)}…</li>)}
        </ol>
      </div>
    </div>
  );
}

const ETH_STATUS = {
  synced: { tone: 'brand', label: 'Anchored on Ethereum' },
  syncing: { tone: 'blue', label: 'Anchoring to Ethereum' },
  ready: { tone: 'blue', label: 'Ethereum connected' },
  starting: { tone: 'gray', label: 'Connecting to Ethereum' },
  unreachable: { tone: 'amber', label: 'Ethereum node unreachable' },
  no_contract: { tone: 'amber', label: 'Anchor contract not deployed' },
  not_owner: { tone: 'red', label: 'Wallet is not contract owner' },
  ahead: { tone: 'red', label: 'Anchors out of sync' },
};
export const ethStatus = (s) => ETH_STATUS[s] || { tone: 'gray', label: s };

/** One line describing where a block's hash sits on Ethereum. */
export function EthAnchorLine({ eth }) {
  if (!eth) return null;
  const tone = eth.status === 'anchored' ? 'text-brand-700' : eth.status === 'mismatch' ? 'text-red-600' : 'text-ink-500';
  return (
    <div className={cx('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm', tone)}>
      <span className="font-semibold">{eth.status === 'anchored' ? 'Anchored on Ethereum' : eth.status === 'mismatch' ? 'Differs from Ethereum anchor' : eth.status === 'pending' ? 'Waiting to be anchored on Ethereum' : 'Ethereum check unavailable'}</span>
      <span className="text-ink-500">· {eth.network}</span>
      {eth.tx_hash && (eth.tx_url ? <a className="font-mono text-xs text-brand-700 hover:underline" href={eth.tx_url} target="_blank" rel="noreferrer">tx {eth.tx_hash.slice(0, 12)}…</a> : <Hash value={eth.tx_hash} len={12} />)}
      {eth.eth_block != null && <span className="text-xs text-ink-400">Ethereum block {eth.eth_block}</span>}
    </div>
  );
}
