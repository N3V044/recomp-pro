import { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoadAnalysis from './views/LoadAnalysis';
import BodyMetrics from './views/BodyMetrics';
import Top25 from './views/Top25';
import Home from './views/Home';
import Goals from './views/Goals';
import Compare from './views/Compare';
import EditData from './views/EditData'; // New View
import MonthCarousel from './components/MonthCarousel';

// Data & Domain
import { workoutsRaw, weighInsRaw, goalsRaw } from './data/data';
import { PERIODS, PERIOD_LABELS } from './domain/constants';
import { filterWorkoutsByPeriod, filterMetricsByPeriod } from './domain/selectors/period';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.ALL);
  const isExpertMode = false; // Static, toggle removed

  // -- GLOBAL MUTABLE STATE (For Edit/Data requirements) --
  const [workouts, setWorkouts] = useState(workoutsRaw);
  const [weighIns, setWeighIns] = useState(weighInsRaw);
  const [goals, setGoals] = useState(goalsRaw);
  const [currentProgress, setCurrentProgress] = useState([]);

  // -- DYNAMIC PERIODS STATE --
  const [periods, setPeriods] = useState(PERIOD_LABELS);

  const handleAddPeriod = (newKey, newLabel) => {
    if (periods[newKey]) return;
    setPeriods(prev => {
      const next = { ...prev, [newKey]: newLabel };
      // Sort keys to ensure chronological order in dropdowns/carousel
      // "all" should be first. Then YYYY-MM.
      const sortedKeys = Object.keys(next).sort((a, b) => {
        if (a === 'all') return -1;
        if (b === 'all') return 1;
        return a.localeCompare(b);
      });
      const sortedObj = {};
      sortedKeys.forEach(k => sortedObj[k] = next[k]);
      return sortedObj;
    });
  };

  // -- GLOBAL SELECTORS --
  // We calculate the filtered data ONCE here, and pass it down.
  // This ensures all views see exactly the same subset of data.
  const filteredWorkouts = useMemo(() =>
    filterWorkoutsByPeriod(workouts, selectedPeriod),
    [workouts, selectedPeriod]);

  const filteredMetrics = useMemo(() =>
    filterMetricsByPeriod(weighIns, selectedPeriod),
    [weighIns, selectedPeriod]);

  // -- HANDLERS FOR EDIT/DATA VIEW --
  const handleResetData = () => {
    setWorkouts(workoutsRaw);
    setWeighIns(weighInsRaw);
    setGoals(goalsRaw);
    setCurrentProgress([]);
    setPeriods(PERIOD_LABELS); // Reset periods too
    alert('Data reset to seed values.');
  };

  const handleImportData = (jsonData) => {
    if (jsonData.workouts) setWorkouts(jsonData.workouts);
    if (jsonData.weighIns) setWeighIns(jsonData.weighIns);
    if (jsonData.goals) setGoals(jsonData.goals);
    if (jsonData.currentProgress) setCurrentProgress(jsonData.currentProgress);
    if (jsonData.periods) setPeriods(jsonData.periods);
    alert('Data imported successfully.');
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ workouts, weighIns, goals, currentProgress, periods }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'recomp-pro-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <h1 className="logo">RECOMP PRO</h1>

        <div className="filter-controls" style={{ background: 'transparent', border: 'none', padding: 0 }}>
          {/* MANDATORY INFINITE CAROUSEL */}
          <MonthCarousel
            selectedPeriod={selectedPeriod}
            onSelect={setSelectedPeriod}
          />


        </div>
      </header>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={`content-area ${activeTab}-view`}>
        {activeTab === 'home' && (
          <Home
            workouts={filteredWorkouts}
            metrics={filteredMetrics}
            period={selectedPeriod}
            isExpert={isExpertMode}
            goals={goals}
            allWorkouts={workouts}
            allMetrics={weighIns}
          />
        )}

        {activeTab === 'load' && (
          <LoadAnalysis
            logs={filteredWorkouts}
            month={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            periods={periods}
            isExpert={isExpertMode}
          />
        )}

        {activeTab === 'compare' && (
          <Compare
            allWorkouts={workouts} // Pass all data for internal filtering
            allMetrics={weighIns}
            isExpert={isExpertMode}
          />
        )}

        {activeTab === 'body' && (
          <BodyMetrics
            metrics={filteredMetrics}
            period={selectedPeriod}
            isExpert={isExpertMode}
            weighIns={weighIns}
            setWeighIns={setWeighIns}
          />
        )}

        {activeTab === 'goals' && (
          <Goals
            goals={goals}
            currentProgress={currentProgress}
            setCurrentProgress={setCurrentProgress}
            period={selectedPeriod}
            workouts={filteredWorkouts}
          />
        )}

        {activeTab === 'top25' && (
          <Top25
            goals={goals}
            currentProgress={currentProgress}
          />
        )}

        {activeTab === 'edit' && (
          <EditData
            onReset={handleResetData}
            onImport={handleImportData}
            onExport={handleExportData}
            currentProgress={currentProgress}
            setCurrentProgress={setCurrentProgress}
            weighIns={weighIns}
            setWeighIns={setWeighIns}
          />
        )}
      </main>
    </div>
  );
}

export default App;
