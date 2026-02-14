import { useEffect, useState } from 'react';
import { getRecentActivity } from '../services/api';
import { Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [limit]);

  const fetchLogs = async () => {
    try {
      const res = await getRecentActivity(limit);
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'comment_posted':
        return <CheckCircle className="text-green-400" size={18} />;
      case 'scan_subreddit':
        return <Activity className="text-blue-400" size={18} />;
      case 'error':
        return <XCircle className="text-red-400" size={18} />;
      default:
        return <AlertCircle className="text-gray-400" size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
        <select
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="input-field w-32"
        >
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="max-h-[700px] overflow-y-auto">
          <table className="table">
            <thead className="sticky top-0">
              <tr>
                <th className="w-12"></th>
                <th>Action</th>
                <th>Details</th>
                <th>Account</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className={log.success ? '' : 'bg-red-500/10'}>
                  <td>{getActionIcon(log.actionType)}</td>
                  <td>
                    <span className="text-white font-medium">
                      {log.actionType.replace(/_/g, ' ')}
                    </span>
                    {log.subreddit && (
                      <span className="text-gray-400 text-sm ml-2">
                        r/{log.subreddit}
                      </span>
                    )}
                  </td>
                  <td className="text-gray-400 text-sm">
                    {log.errorMessage || JSON.stringify(log.details).substring(0, 100)}
                  </td>
                  <td className="text-gray-400 text-sm">
                    {log.account?.username || '-'}
                  </td>
                  <td className="text-gray-400 text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              No activity logs yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Logs;
