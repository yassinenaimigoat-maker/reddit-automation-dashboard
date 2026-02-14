import { useEffect, useState } from 'react';
import { getDashboardStats, toggleAutomation, getConfig } from '../services/api';
import { Play, Pause, TrendingUp, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, configRes] = await Promise.all([
        getDashboardStats(),
        getConfig()
      ]);
      setStats(statsRes.data);
      setConfig(configRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggleAutomation = async () => {
    try {
      await toggleAutomation();
      fetchData();
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <button
          onClick={handleToggleAutomation}
          className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
            config?.isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {config?.isActive ? (
            <>
              <Pause size={20} className="mr-2" />
              Pause Automation
            </>
          ) : (
            <>
              <Play size={20} className="mr-2" />
              Start Automation
            </>
          )}
        </button>
      </div>

      {/* Status Alert */}
      {config?.dryRunMode && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="mr-3" size={20} />
          <span>
            <strong>Dry Run Mode:</strong> Comments will be generated but not posted to Reddit.
            Turn it off in Configuration to start posting.
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Comments Today */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Comments Today</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.comments.today || 0}</p>
            </div>
            <MessageSquare className="text-blue-500" size={32} />
          </div>
        </div>

        {/* Comments This Week */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Comments This Week</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.comments.week || 0}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        {/* Queue Size */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Posts in Queue</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.queue.queued || 0}</p>
            </div>
            <AlertCircle className="text-orange-500" size={32} />
          </div>
        </div>

        {/* Success Rate */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.successRate || 0}%</p>
            </div>
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
        </div>
      </div>

      {/* Account Health */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Account Health</h2>
        {stats?.accounts && stats.accounts.length > 0 ? (
          <div className="space-y-3">
            {stats.accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    account.healthScore >= 80 ? 'bg-green-500' :
                    account.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-white font-semibold">u/{account.username}</p>
                    <p className="text-gray-400 text-sm">
                      {account.totalComments} comments • {account.karma} karma
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{account.healthScore}/100</p>
                  <span className={`badge ${
                    account.status === 'active' ? 'badge-success' :
                    account.status === 'paused' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {account.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No accounts configured. Add one in the Accounts page.</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Total Karma Earned</p>
          <p className="text-2xl font-bold text-white">{stats?.karmaEarned || 0}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Pending Approval</p>
          <p className="text-2xl font-bold text-white">{stats?.queue.pending || 0}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Removed Comments</p>
          <p className="text-2xl font-bold text-white">{stats?.totalRemoved || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
