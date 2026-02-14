import { useEffect, useState } from 'react';
import { getDashboardStats, getActivityTimeline, getKarmaOverTime } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Analytics() {
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [karmaData, setKarmaData] = useState([]);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes, karmaRes] = await Promise.all([
        getDashboardStats(),
        getActivityTimeline(days),
        getKarmaOverTime(days)
      ]);
      
      setStats(statsRes.data);
      setActivityData(activityRes.data);
      setKarmaData(karmaRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="input-field w-32"
        >
          <option value="7">7 Days</option>
          <option value="14">14 Days</option>
          <option value="30">30 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="text-gray-400 text-sm">Total Comments</p>
          <p className="text-3xl font-bold text-white">{stats?.comments.total || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-400 text-sm">Success Rate</p>
          <p className="text-3xl font-bold text-green-400">{stats?.successRate || 0}%</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-400 text-sm">Total Karma</p>
          <p className="text-3xl font-bold text-blue-400">{stats?.karmaEarned || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-400 text-sm">Avg Karma/Comment</p>
          <p className="text-3xl font-bold text-purple-400">
            {stats?.totalPosted > 0 
              ? (stats.karmaEarned / stats.totalPosted).toFixed(1)
              : 0
            }
          </p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Comment Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" name="Comments" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Karma Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Karma Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={karmaData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Line type="monotone" dataKey="karma" stroke="#10B981" strokeWidth={2} name="Karma" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics;
