import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  PieChart,
  BarChart3,
  Users,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuotaConfigurator = () => {
  const [quotas, setQuotas] = useState({
    general: { target: 40, current: 28, percentage: 70 },
    obc: { target: 27, current: 18, percentage: 67 },
    sc: { target: 15, current: 12, percentage: 80 },
    st: { target: 7.5, current: 4, percentage: 53 },
    ews: { target: 10, current: 6, percentage: 60 },
    women: { target: 30, current: 22, percentage: 73 }
  });
  const [originalQuotas, setOriginalQuotas] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize original quotas for comparison
    setOriginalQuotas(JSON.parse(JSON.stringify(quotas)));
  }, []);

  const handleQuotaChange = (category, field, value) => {
    const newValue = parseFloat(value) || 0;
    setQuotas(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: newValue,
        percentage: field === 'target' ? 
          Math.round((prev[category].current / newValue) * 100) : 
          Math.round((newValue / prev[category].target) * 100)
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setOriginalQuotas(JSON.parse(JSON.stringify(quotas)));
      setHasChanges(false);
      setLoading(false);
      toast.success('Quota configuration saved successfully!');
    }, 1000);
  };

  const handleReset = () => {
    setQuotas(JSON.parse(JSON.stringify(originalQuotas)));
    setHasChanges(false);
    toast.success('Changes reset to last saved state');
  };

  const getQuotaStatus = (percentage) => {
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600 bg-red-100' };
    if (percentage >= 80) return { status: 'good', color: 'text-green-600 bg-green-100' };
    if (percentage >= 60) return { status: 'moderate', color: 'text-yellow-600 bg-yellow-100' };
    return { status: 'low', color: 'text-gray-600 bg-gray-100' };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const totalTarget = Object.values(quotas).reduce((sum, quota) => sum + quota.target, 0);
  const totalCurrent = Object.values(quotas).reduce((sum, quota) => sum + quota.current, 0);
  const overallPercentage = Math.round((totalCurrent / totalTarget) * 100);

  const quotaCategories = [
    { key: 'general', label: 'General', description: 'Open category for all candidates' },
    { key: 'obc', label: 'OBC', description: 'Other Backward Classes' },
    { key: 'sc', label: 'SC', description: 'Scheduled Castes' },
    { key: 'st', label: 'ST', description: 'Scheduled Tribes' },
    { key: 'ews', label: 'EWS', description: 'Economically Weaker Sections' },
    { key: 'women', label: 'Women', description: 'Reservation for women candidates' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quota Configuration</h1>
          <p className="text-gray-600 mt-2">
            Configure and manage reservation quotas for the PM Internship Scheme.
          </p>
        </div>

        {/* Overall Status */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Overall Quota Status</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{totalCurrent}</div>
              <div className="text-gray-600">Total Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">{totalTarget}</div>
              <div className="text-gray-600">Total Target</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                overallPercentage >= 100 ? 'text-red-600' : 
                overallPercentage >= 80 ? 'text-green-600' : 
                overallPercentage >= 60 ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {overallPercentage}%
              </div>
              <div className="text-gray-600">Overall Progress</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(overallPercentage)}`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quota Configuration */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quota Settings</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {quotaCategories.map((category) => {
              const quota = quotas[category.key];
              const status = getQuotaStatus(quota.percentage);
              
              return (
                <div key={category.key} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${status.color.split(' ')[0]}`}>
                        {quota.percentage}%
                      </div>
                      <div className="text-sm text-gray-500">Current Progress</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Percentage
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={quota.target}
                          onChange={(e) => handleQuotaChange(category.key, 'target', e.target.value)}
                          className="input-field pr-8"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Allocated
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={quota.current}
                          onChange={(e) => handleQuotaChange(category.key, 'current', e.target.value)}
                          className="input-field pr-8"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">candidates</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                        {status.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(quota.percentage)}`}
                        style={{ width: `${Math.min(quota.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {quota.percentage > 100 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-700">
                          Quota exceeded by {Math.round(quota.percentage - 100)}%. Consider adjusting target or current allocation.
                        </span>
                      </div>
                    </div>
                  )}

                  {quota.percentage < 60 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-700">
                          Low allocation. Consider increasing target or finding more candidates.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Summary */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuration Validation</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Quota Distribution</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Target:</span>
                  <span className="font-medium">{totalTarget}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Allocated:</span>
                  <span className="font-medium">{totalCurrent} candidates</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Progress:</span>
                  <span className={`font-medium ${
                    overallPercentage >= 100 ? 'text-red-600' : 
                    overallPercentage >= 80 ? 'text-green-600' : 
                    overallPercentage >= 60 ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {overallPercentage}%
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Status Alerts</h3>
              <div className="space-y-2">
                {Object.entries(quotas).map(([key, quota]) => {
                  const status = getQuotaStatus(quota.percentage);
                  if (quota.percentage > 100) {
                    return (
                      <div key={key} className="flex items-center space-x-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{key.toUpperCase()} quota exceeded</span>
                      </div>
                    );
                  }
                  if (quota.percentage < 60) {
                    return (
                      <div key={key} className="flex items-center space-x-2 text-sm text-yellow-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{key.toUpperCase()} quota low</span>
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>{key.toUpperCase()} quota healthy</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotaConfigurator;
