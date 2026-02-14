import { useEffect, useState } from 'react';
import { getAccounts, createAccount, deleteAccount } from '../services/api';
import { Plus, Trash2, Activity } from 'lucide-react';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    username: '',
    clientId: '',
    clientSecret: '',
    password: '',
    userAgent: 'RedditAutomation/1.0.0'
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await getAccounts();
      setAccounts(res.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAccount(newAccount);
      setShowModal(false);
      setNewAccount({
        username: '',
        clientId: '',
        clientSecret: '',
        password: '',
        userAgent: 'RedditAutomation/1.0.0'
      });
      fetchAccounts();
      alert('Account added successfully!');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Failed to add account'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this account?')) {
      try {
        await deleteAccount(id);
        fetchAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Reddit Accounts</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} className="inline mr-2" />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Activity className={getHealthColor(account.healthScore)} size={24} />
                <div className="ml-3">
                  <h3 className="text-white font-bold">u/{account.username}</h3>
                  <span className={`badge ${
                    account.status === 'active' ? 'badge-success' :
                    account.status === 'paused' ? 'badge-warning' : 'badge-danger'
                  } text-xs`}>
                    {account.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(account.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Health Score</p>
                <p className={`text-2xl font-bold ${getHealthColor(account.healthScore)}`}>
                  {account.healthScore}/100
                </p>
              </div>
              <div>
                <p className="text-gray-400">Karma</p>
                <p className="text-2xl font-bold text-white">{account.karma || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Comments</p>
                <p className="text-xl font-bold text-white">{account.totalComments || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Removed</p>
                <p className="text-xl font-bold text-red-400">{account.removedComments || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-lg border border-gray-700">
          No accounts configured. Add a Reddit account to get started.
        </div>
      )}

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Add Reddit Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reddit Username
                </label>
                <input
                  type="text"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={newAccount.clientId}
                  onChange={(e) => setNewAccount({ ...newAccount, clientId: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={newAccount.clientSecret}
                  onChange={(e) => setNewAccount({ ...newAccount, clientSecret: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  Add Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-400 mt-4">
              Get your Client ID and Secret from{' '}
              <a
                href="https://www.reddit.com/prefs/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                reddit.com/prefs/apps
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;
