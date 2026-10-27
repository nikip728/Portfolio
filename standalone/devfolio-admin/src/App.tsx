import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Admin/Dashboard';
import { getAppData } from './services/storage';
import { AppData } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      const appData = await getAppData();
      setData(appData);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDataUpdate = (newData: AppData) => {
    setData(newData);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Layout profile={data.profile} isAdmin>
      <Dashboard data={data} onUpdate={handleDataUpdate} />
    </Layout>
  );
};

export default App;