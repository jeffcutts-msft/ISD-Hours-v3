import { Routes, Route } from 'react-router-dom';
import Shell from '@/components/layout/Shell';
import Dashboard from '@/pages/Dashboard';
import Reports from '@/pages/Reports';
import Actuals from '@/pages/Actuals';
import ActualsVsForecast from '@/pages/ActualsVsForecast';
import ActualsDrilldown from '@/pages/ActualsDrilldown';
import ActualsPeopleByDay from '@/pages/ActualsPeopleByDay';
import ActualsPeopleByWeek from '@/pages/ActualsPeopleByWeek';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/actuals" element={<Actuals />} />
        <Route path="/actuals-vs-forecast" element={<ActualsVsForecast />} />
        <Route path="/actuals-drilldown" element={<ActualsDrilldown />} />
        <Route path="/actuals-people-by-day" element={<ActualsPeopleByDay />} />
        <Route path="/actuals-people-by-week" element={<ActualsPeopleByWeek />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}

export default App;
