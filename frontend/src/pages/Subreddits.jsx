import { useEffect, useState } from 'react';
import { getSubreddits, createSubreddit, deleteSubreddit, scanSubreddit } from '../services/api';
import { Plus, Trash2, Search as SearchIcon, RefreshCw } from 'lucide-react';

function Subreddits() {
  const [subreddits, setSubreddits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSub, setNewSub] = useState({
    name: '',
    keywords: [],
    priority: 'medium',
    maxCommentsPerDay: 3,
    toneNotes: '',
    allowPosts: false
  });
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    fetchSubreddits();
  }, []);

  const fetchSubreddits = async () => {
    try {
      const res = await getSubreddits();
      setSubreddits(res.data);
    } catch (error) {
      console.error('Error fetching subreddits:', error);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      setNewSub({
        ...newSub,
        keywords: [...newSub.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (index) => {
    setNewSub({
      ...newSub,
      keywords: newSub.keywords.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSubreddit(newSub);
      setShowModal(false);
      setNewSub({
        name: '',
        keywords: [],
        priority: 'medium',
        maxCommentsPerDay: 3,
        toneNotes: '',
        allowPosts: false
      });
      fetchSubreddits();
    } catch (error) {
      console.error('Error creating subreddit:', error);
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this subreddit?')) {
      try {
        await deleteSubreddit(id);
        fetchSubreddits();
      } catch (error) {
        console.error('Error deleting subreddit:', error);
      }
    }
  };

  const handleScan = async (id) => {
    try {
      const res = await scanSubreddit(id);
      alert(`Scanned ${res.data.scanned} posts, ${res.data.queued} queued`);
      fetchSubreddits();
    } catch (error) {
      console.error('Error scanning subreddit:', error);
      alert('Error scanning subreddit');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Subreddits</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} className="inline mr-2" />
          Add Subreddit
        </button>
      </div>

      {/* Subreddits Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Subreddit</th>
              <th>Keywords</th>
              <th>Priority</th>
              <th>Max/Day</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subreddits.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-700">
                <td>
                  <a
                    href={`https://reddit.com/r/${sub.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    r/{sub.name}
                  </a>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {sub.keywords?.slice(0, 3).map((kw, i) => (
                      <span key={i} className="badge badge-info text-xs">
                        {kw}
                      </span>
                    ))}
                    {sub.keywords?.length > 3 && (
                      <span className="text-gray-400 text-xs">
                        +{sub.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`badge ${
                    sub.priority === 'high' ? 'badge-danger' :
                    sub.priority === 'medium' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {sub.priority}
                  </span>
                </td>
                <td>{sub.maxCommentsPerDay}</td>
                <td>
                  <span className={`badge ${sub.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {sub.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleScan(sub.id)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Scan now"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {subreddits.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No subreddits configured. Click "Add Subreddit" to get started.
          </div>
        )}
      </div>

      {/* Add Subreddit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Add Subreddit</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subreddit Name (without r/)
                </label>
                <input
                  type="text"
                  value={newSub.name}
                  onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                  className="input-field"
                  placeholder="webdev"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    className="input-field flex-1"
                    placeholder="Add keyword..."
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newSub.keywords.map((kw, i) => (
                    <span key={i} className="badge badge-info flex items-center gap-2">
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(i)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newSub.priority}
                    onChange={(e) => setNewSub({ ...newSub, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Comments Per Day
                  </label>
                  <input
                    type="number"
                    value={newSub.maxCommentsPerDay}
                    onChange={(e) => setNewSub({ ...newSub, maxCommentsPerDay: parseInt(e.target.value) })}
                    className="input-field"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tone Notes (Optional)
                </label>
                <textarea
                  value={newSub.toneNotes}
                  onChange={(e) => setNewSub({ ...newSub, toneNotes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="e.g., This sub is very technical, be formal..."
                />
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newSub.allowPosts}
                  onChange={(e) => setNewSub({ ...newSub, allowPosts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <span className="ml-2 text-gray-300">Allow creating posts (not just comments)</span>
              </label>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  Add Subreddit
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Subreddits;
