import { useEffect, useState } from 'react';
import { getConfig, updateConfig } from '../services/api';
import { Save, AlertCircle } from 'lucide-react';

function Configuration() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await getConfig();
      setConfig(res.data);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateConfig(config);
      setMessage('Configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving configuration: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Configuration</h1>

      {message && (
        <div className={`px-4 py-3 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-500/20 border border-red-500 text-red-200'
            : 'bg-green-500/20 border border-green-500 text-green-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Configuration */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">AI Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Provider
              </label>
              <select
                value={config.aiProvider}
                onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
                className="input-field"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {config.aiProvider === 'openai' ? 'OpenAI API Key' : 'Anthropic API Key'}
              </label>
              <input
                type="password"
                value={config.aiProvider === 'openai' ? (config.openaiApiKey || '') : (config.anthropicApiKey || '')}
                onChange={(e) => setConfig({ 
                  ...config, 
                  [config.aiProvider === 'openai' ? 'openaiApiKey' : 'anthropicApiKey']: e.target.value 
                })}
                className="input-field"
                placeholder="sk-..."
              />
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Product Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={config.productName || ''}
                onChange={(e) => setConfig({ ...config, productName: e.target.value })}
                className="input-field"
                placeholder="MyAwesomeTool"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product URL
              </label>
              <input
                type="url"
                value={config.productUrl || ''}
                onChange={(e) => setConfig({ ...config, productUrl: e.target.value })}
                className="input-field"
                placeholder="https://myproduct.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Description
              </label>
              <textarea
                value={config.productDescription || ''}
                onChange={(e) => setConfig({ ...config, productDescription: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="A brief description of what your product does..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Context (Detailed)
              </label>
              <textarea
                value={config.productContext || ''}
                onChange={(e) => setConfig({ ...config, productContext: e.target.value })}
                className="input-field"
                rows={6}
                placeholder="Detailed information about your product for AI to understand how to promote it naturally..."
              />
            </div>
          </div>
        </div>

        {/* Automation Settings */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Automation Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Comments Per Day
              </label>
              <input
                type="number"
                value={config.maxCommentsPerDay}
                onChange={(e) => setConfig({ ...config, maxCommentsPerDay: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Comments Per Hour
              </label>
              <input
                type="number"
                value={config.maxCommentsPerHour}
                onChange={(e) => setConfig({ ...config, maxCommentsPerHour: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                max="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Delay (minutes)
              </label>
              <input
                type="number"
                value={config.minDelayMinutes}
                onChange={(e) => setConfig({ ...config, minDelayMinutes: parseInt(e.target.value) })}
                className="input-field"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Delay (minutes)
              </label>
              <input
                type="number"
                value={config.maxDelayMinutes}
                onChange={(e) => setConfig({ ...config, maxDelayMinutes: parseInt(e.target.value) })}
                className="input-field"
                min="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Active Hours Start
              </label>
              <input
                type="number"
                value={config.activeHoursStart}
                onChange={(e) => setConfig({ ...config, activeHoursStart: parseInt(e.target.value) })}
                className="input-field"
                min="0"
                max="23"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Active Hours End
              </label>
              <input
                type="number"
                value={config.activeHoursEnd}
                onChange={(e) => setConfig({ ...config, activeHoursEnd: parseInt(e.target.value) })}
                className="input-field"
                min="0"
                max="23"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Promotional Ratio (0-1)
              </label>
              <input
                type="number"
                step="0.1"
                value={config.promotionalRatio}
                onChange={(e) => setConfig({ ...config, promotionalRatio: parseFloat(e.target.value) })}
                className="input-field"
                min="0"
                max="1"
              />
              <p className="text-gray-400 text-xs mt-1">
                0.3 = 30% promotional, 70% pure help
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.dryRunMode}
                onChange={(e) => setConfig({ ...config, dryRunMode: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-300">
                Dry Run Mode (generate but don't post)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.manualApprovalMode}
                onChange={(e) => setConfig({ ...config, manualApprovalMode: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-300">
                Manual Approval Mode (require approval for each comment)
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full md:w-auto"
        >
          <Save size={18} className="inline mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}

export default Configuration;
