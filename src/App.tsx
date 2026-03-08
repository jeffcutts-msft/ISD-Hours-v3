import { Routes, Route } from 'react-router-dom';
import Shell from '@/components/layout/Shell';
import Dashboard from '@/pages/Dashboard';
import HoursLog from '@/pages/HoursLog';
import Reports from '@/pages/Reports';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hours" element={<HoursLog />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}

export default App;
