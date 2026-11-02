import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldX, Blocks, RefreshCw, Lock, FlaskConical, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { eventMeta, fmtDateTime, humanize } from '../../lib/format';
import { Badge, Button, Card, cx, ErrorBox, Hash, Loading, Modal, PageHeader, useAsync, useToast } from '../../components/ui';
import { ProofView, EthAnchorLine, ethStatus } from '../../components/domain';

export default function Explorer() {
  const { actor } = useAuth();
  const toast = useToast();
  const [before, setBefore] = useState(null);
  const [history, setHistory] = useState([]);
  const blocks = useAsync(() => api(`/chain/blocks?limit=20${before != null ? `&before=${before}` : ''}`), [before]);
  const [verify, setVerify] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [block, setBlock] = useState(null);
  const [tx, setTx] = useState(null);
  const [tamper, setTamper] = useState(null);

  const runVerify = async () => {
    setVerifying(true);
    try {
      setVerify(await api('/chain/verify'));
    } finally {
      setVerifying(false);
    }
  };
  const openBlock = async (h) => setBlock(await api(`/chain/blocks/${h}`));
  const openTx = async (id) => setTx(await api(`/chain/tx/${id}`));
  const doTamper = async (id) => {
    if (!window.confirm('Attempt to edit this sealed transaction directly in the database? This demonstrates tamper evidence.')) return;
    const r = await api('/chain/tamper-demo', { method: 'POST', body: { tx_id: id } });
    setTamper(r);
    if (r.verify) setVerify(r.verify);
    toast(r.blocked ? 'Database rejected the edit' : 'Row edited – verification now fails', r.blocked ? 'success' : 'error');
  };

  return (
    <>
      <PageHeader title="Ledger explorer" subtitle="Every block and signed transaction, independently verifiable" actions={<Button icon={ShieldCheck} loading={verifying} onClick={runVerify}>Verify entire chain</Button>} />
      {verify && (
        <div className={cx('mb-6 rounded-2xl border p-5', verify.valid ? 'border-brand-200 bg-brand-50' : 'border-red-200 bg-red-50')}>
          <div className="flex flex-wrap items-center gap-3">
            {verify.valid ? <ShieldCheck className="h-6 w-6 text-brand-600" /> : <ShieldX className="h-6 w-6 text-red-600" />}
            <p className="text-lg font-semibold">{verify.valid ? 'Chain intact' : `${verify.issues.length} integrity issue(s) detected`}</p>
            <span className="text-sm text-ink-600">{verify.blocks} blocks · {verify.transactions.toLocaleString()} transactions re-hashed and signature-checked in {verify.duration_ms} ms</span>
          </div>
          {verify.issues.length > 0 && (
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm text-red-800">
              {verify.issues.slice(0, 50).map((i, k) => <li key={k}>• {i.height != null && <>Block #{i.height}: </>}{i.problem}{i.tx && <> (<span className="font-mono text-xs">{i.tx.slice(0, 12)}…</span>)</>}</li>)}
            </ul>
          )}
          {verify.ethereum?.enabled && (
            <p className="mt-2 text-sm text-ink-700">
              <span className="font-semibold">Ethereum ({verify.ethereum.network}): </span>
              {verify.ethereum.error ? `check failed – ${verify.ethereum.error}` : `${verify.ethereum.anchored} of ${verify.ethereum.total} block hashes anchored and compared${verify.ethereum.pending ? `, ${verify.ethereum.pending} waiting` : ''}.`}{' '}
              {verify.ethereum.contract_url ? <a className="text-brand-700 hover:underline" href={verify.ethereum.contract_url} target="_blank" rel="noreferrer">View contract</a> : <span className="font-mono text-xs">contract {verify.ethereum.contract}</span>}
            </p>
          )}
          {verify.ethereum && !verify.ethereum.enabled && <p className="mt-2 text-xs text-ink-500">Ethereum anchoring is not configured on this node.</p>}
          <p className="mt-2 text-xs text-ink-500">Validator public key: <Hash value={verify.node_public_key} len={24} /></p>
        </div>
      )}

      <Card title="Blocks" icon={Blocks} bodyClass="p-0" action={<Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => { setBefore(null); setHistory([]); }}>Latest</Button>}>
        {blocks.loading && !blocks.data ? <Loading /> : blocks.error ? <div className="p-4"><ErrorBox error={blocks.error} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50/60"><tr><th className="table-head">Height</th><th className="table-head">Block hash</th><th className="table-head">Prev hash</th><th className="table-head">Merkle root</th><th className="table-head">Txs</th><th className="table-head">Nonce</th><th className="table-head">Sealed</th><th className="table-head">Ethereum</th></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {blocks.data.blocks.map((b) => (
                  <tr key={b.id} className="cursor-pointer hover:bg-ink-50/70" onClick={() => openBlock(b.id)}>
                    <td className="table-cell font-semibold text-brand-700">#{b.id}</td>
                    <td className="table-cell"><Hash value={b.hash} len={12} /></td>
                    <td className="table-cell"><Hash value={b.prev_hash} len={8} /></td>
                    <td className="table-cell"><Hash value={b.merkle_root} len={8} /></td>
                    <td className="table-cell">{b.tx_count}</td>
                    <td className="table-cell mono">{b.nonce}</td>
                    <td className="table-cell whitespace-nowrap text-ink-500">{fmtDateTime(b.ts)}</td>
                    <td className="table-cell whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {!b.anchor ? <span className="text-ink-300">—</span> : b.anchor.anchored ? (
                        b.anchor.tx_url ? <a href={b.anchor.tx_url} target="_blank" rel="noreferrer"><Badge tone="brand">◆ anchored</Badge></a> : <Badge tone="brand">◆ anchored</Badge>
                      ) : <Badge tone="gray">pending</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-sm">
              <span className="text-ink-500">Chain height #{blocks.data.height}{blocks.data.ethereum?.enabled && <> · {ethStatus(blocks.data.ethereum.status).label} ({blocks.data.ethereum.network}, {blocks.data.ethereum.anchored} anchored)</>}</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={!history.length} onClick={() => { const h = [...history]; const prev = h.pop(); setHistory(h); setBefore(prev ?? null); }}>Newer</Button>
                <Button variant="secondary" size="sm" disabled={!blocks.data.blocks.length || blocks.data.blocks.at(-1).id === 0} onClick={() => { setHistory((h) => [...h, before]); setBefore(blocks.data.blocks.at(-1).id); }}>Older <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Modal wide open={!!block} onClose={() => setBlock(null)} title={block ? `Block #${block.block.id}` : ''} subtitle={block && fmtDateTime(block.block.ts)}>
        {block && (
          <div className="space-y-4">
            <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1.5 text-sm">
              {['hash', 'prev_hash', 'merkle_root', 'signature'].flatMap((k) => [<dt key={k} className="text-ink-500">{humanize(k)}</dt>, <dd key={`${k}v`}><Hash value={block.block[k]} len={28} /></dd>])}
              <dt className="text-ink-500">Validator</dt><dd>{block.block.validator}</dd>
              <dt className="text-ink-500">PoW</dt><dd>difficulty {block.block.difficulty} · nonce {block.block.nonce}</dd>
            </dl>
            {block.ethereum && <EthAnchorLine eth={block.ethereum} />}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{block.txs.length} transaction(s)</p>
              <div className="max-h-80 divide-y divide-ink-100 overflow-y-auto rounded-lg border border-ink-200">
                {block.txs.map((t) => (
                  <button key={t.id} onClick={() => openTx(t.id)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-ink-50">
                    <Badge tone={eventMeta(t.type).tone}>{eventMeta(t.type).label}</Badge>
                    <span className="truncate font-mono text-xs text-ink-600">{t.product_id || t.batch_id || t.data?.actor_id || t.facility_id || '—'}</span>
                    <span className="ml-auto font-mono text-xs text-ink-400">{t.id.slice(0, 10)}…</span>
                  </button>
                ))}
                {block.txs.length === 0 && <p className="p-3 text-sm text-ink-500">Genesis block – no transactions.</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal wide open={!!tx} onClose={() => { setTx(null); setTamper(null); }} title="Transaction" subtitle={tx && eventMeta(tx.tx.type).label}
        footer={actor.role === 'admin' && tx && <Button variant="danger" size="sm" icon={FlaskConical} onClick={() => doTamper(tx.tx.id)}>Tamper demo</Button>}>
        {tx && (
          <div className="space-y-4">
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-ink-500">Tx hash</dt><dd><Hash value={tx.tx.id} len={28} /></dd>
              <dt className="text-ink-500">Product</dt><dd>{tx.tx.product_id ? <Link className="font-mono text-brand-700 hover:underline" to={`/app/products/${tx.tx.product_id}`}>{tx.tx.product_id}</Link> : '—'}</dd>
              <dt className="text-ink-500">Signer</dt><dd className="font-mono">{tx.tx.actor_id || 'node'}</dd>
              <dt className="text-ink-500">Signature</dt><dd><Hash value={tx.tx.signature} len={28} /></dd>
              <dt className="text-ink-500">Prev event</dt><dd><Hash value={tx.tx.prev_tx} len={28} /></dd>
              <dt className="text-ink-500">Timestamp</dt><dd>{fmtDateTime(tx.tx.ts)}</dd>
            </dl>
            <pre className="max-h-48 overflow-auto rounded-lg bg-ink-950 p-3 text-xs text-brand-200">{JSON.stringify(tx.tx.data, null, 2)}</pre>
            <div className="rounded-lg border border-ink-200 p-3"><p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Lock className="h-4 w-4" />Merkle proof</p><ProofView proof={tx.proof} /></div>
            {tamper && (
              <div className={cx('rounded-lg border p-3 text-sm', tamper.blocked ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-red-200 bg-red-50 text-red-800')}>
                <p className="font-semibold">{tamper.blocked ? 'Edit blocked by the database' : 'Edit went through – and was detected'}</p>
                <p>{tamper.message}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
