import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { fmtDate } from '../../lib/format';
import { Button, ErrorBox, Loading, useAsync } from '../../components/ui';
import { QrImage } from '../../components/domain';

export default function Labels() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const only = sp.get('ids')?.split(',');
  const { data, loading, error } = useAsync(() => api(`/batches/${id}`), [id]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const units = only ? data.units.filter((u) => only.includes(u.id)) : data.units;
  return (
    <div className="min-h-screen bg-white">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-ink-200 bg-white px-6 py-3">
        <Link to={`/app/batches/${id}`} className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"><ArrowLeft className="h-4 w-4" /> Back to batch</Link>
        <span className="text-sm text-ink-500">{units.length} label(s) · {data.batch.name}</span>
        <Button icon={Printer} onClick={() => window.print()}>Print</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-4 print:gap-2 print:p-2">
        {units.map((u) => (
          <div key={u.id} className="flex break-inside-avoid items-center gap-2 rounded-lg border border-dashed border-ink-300 p-2">
            <QrImage value={u.qr_url} size={84} />
            <div className="min-w-0 text-[10px] leading-tight text-ink-700">
              <p className="font-bold text-ink-900">GeneaTrace</p>
              <p className="truncate">{data.batch.name}</p>
              <p className="mt-1 font-mono text-[10px] font-semibold">{u.id}</p>
              <p>Batch {data.batch.id} · #{u.serial_no}</p>
              {data.batch.expiry_date && <p>EXP {fmtDate(data.batch.expiry_date)}</p>}
              <p className="mt-0.5 text-ink-500">Scan to verify</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
