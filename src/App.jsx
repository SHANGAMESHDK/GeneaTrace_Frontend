import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Loading } from './components/ui';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Verify from './pages/Verify';
import Scan from './pages/Scan';
import NfcTap from './pages/NfcTap';
import Login from './pages/Login';
import Dashboard from './pages/app/Dashboard';
import Products from './pages/app/Products';
import ProductDetail from './pages/app/ProductDetail';
import Batches from './pages/app/Batches';
import BatchDetail from './pages/app/BatchDetail';
import Labels from './pages/app/Labels';
import Checkpoint from './pages/app/Checkpoint';
import Alerts from './pages/app/Alerts';
import Insights from './pages/app/Insights';
import Explorer from './pages/app/Explorer';
import Network from './pages/app/Network';
import ScannerStation from './pages/ScannerStation';
import Retail from './pages/app/Retail';
import Cases from './pages/app/Cases';

// A GS1 Digital Link on a label opens the same passport page.
function DigitalLink() {
  const { serial } = useParams();
  const { search } = useLocation();
  return <Navigate to={`/v/${serial}${search}`} replace />;
}

function Protected({ children }) {
  const { actor, loading } = useAuth();
  if (loading) return <Loading text="Connecting to the ledger…" />;
  return actor ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/v/:id" element={<Verify />} />
      <Route path="/01/:gtin/10/:lot/21/:serial" element={<DigitalLink />} />
      <Route path="/01/:gtin/21/:serial" element={<DigitalLink />} />
      <Route path="/n" element={<NfcTap />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/login" element={<Login />} />
      <Route path="/scanner" element={<Protected><ScannerStation /></Protected>} />
      <Route path="/app/batches/:id/labels" element={<Protected><Labels /></Protected>} />
      <Route path="/app" element={<Protected><AppLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="batches" element={<Batches />} />
        <Route path="batches/:id" element={<BatchDetail />} />
        <Route path="checkpoint" element={<Checkpoint />} />
        <Route path="retail" element={<Retail />} />
        <Route path="cases" element={<Cases />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="insights" element={<Insights />} />
        <Route path="explorer" element={<Explorer />} />
        <Route path="network" element={<Network />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
