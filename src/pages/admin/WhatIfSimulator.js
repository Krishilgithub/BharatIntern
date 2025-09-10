import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Download, 
  BarChart3, 
  PieChart,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const WhatIfSimulator = () => {
  const [currentQuotas, setCurrentQuotas] = useState({});
  const [simulatedQuotas, setSimulatedQuotas] = useState({});
  const [simulationResults, setSimulationResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  useEffect(() => {
    // Mock current quotas
    const mockQuotas = {
      general: { target: 40, current: 28, percentage: 70 },
      obc: { target: 27, current: 18, percentage: 67 },
      sc: { target: 15, current: 12, percentage: 80 },
      st: { target: 7.5, current: 4, percentage: 53 },
      ews: { target: 10, current: 6, percentage: 60 },
      women: { target: 30, current: 22, percentage: 73 }
    };
    
    setCurrentQuotas(mockQuotas);
    setSimulatedQuotas(JSON.parse(JSON.stringify(mockQuotas)));
  }, []);

  const handleQuotaChange = (category, field, value) => {
    const newValue = parseFloat(value) || 0;
    setSimulatedQuotas(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: newValue,
        percentage: field === 'target' ? 
          Math.round((prev[category].current / newValue) * 100) : 
          Math.round((newValue / prev[category].target) * 100)
      }
    }));
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    
    // Simulate API call
    setTimeout(() => {
      const results = {
        totalCandidates: 1250,
        totalAllocated: Object.values(simulatedQuotas).reduce((sum, quota) => sum + quota.current, 0),
        totalTarget: Object.values(simulatedQuotas).reduce((sum, quota) => sum + quota.target, 0),
        overallProgress: Math.round((Object.values(simulatedQuotas).reduce((sum, quota) => sum + quota.current, 0) / Object.values(simulatedQuotas).reduce((sum, quota) => sum + quota.target, 0)) * 100),
        impactAnalysis: {
          newAllocations: 45,
          reallocations: 12,
          affectedCandidates: 67,
          companiesAffected: 8
        },
        recommendations: [
          "Consider increasing ST quota target to improve representation",
          "EWS quota shows good progress, maintain current allocation",
          "General category may need more candidates to meet target",
          "Women representation is healthy across all categories"
        ],
        risks: [
          "ST quota significantly below target may require special outreach",
          "High OBC allocation may impact other categories",
          "General category reduction may affect overall diversity"
        ],
        opportunities: [
          "Strong women representation provides good foundation",
          "SC quota performing well, can be used as model",
          "EWS quota shows steady progress"
        ]
      };
      
      setSimulationResults(results);
      setIsSimulating(false);
    }, 2000);
  };

  const resetSimulation = () => {
    setSimulatedQuotas(JSON.parse(JSON.stringify(currentQuotas)));
    setSimulationResults(null);
    setScenarioName('');
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
          <h1 className="text-3xl font-bold text-gray-900">What-If Simulator</h1>
          <p className="text-gray-600 mt-2">
            Test different quota scenarios and analyze their impact on the allocation process.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scenario Setup */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scenario Configuration</h2>
              <div className="flex items-center space-x-4 mb-6">
                <input
                  type="text"
                  placeholder="Enter scenario name (e.g., 'Increased ST Quota')"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSimulating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Simulating...
                    </div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </button>
                <button
                  onClick={resetSimulation}
                  className="btn-secondary"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>

              {/* Quota Configuration */}
              <div className="space-y-4">
                {quotaCategories.map((category) => {
                  const current = currentQuotas[category.key];
                  const simulated = simulatedQuotas[category.key];
                  const status = getQuotaStatus(simulated.percentage);
                  
                  return (
                    <div key={category.key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{category.label}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${status.color.split(' ')[0]}`}>
                            {simulated.percentage}%
                          </div>
                          <div className="text-xs text-gray-500">Simulated Progress</div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Percentage
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={simulated.target}
                              onChange={(e) => handleQuotaChange(category.key, 'target', e.target.value)}
                              className="input-field flex-1"
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Current: {current.target}%
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Allocated Candidates
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              value={simulated.current}
                              onChange={(e) => handleQuotaChange(category.key, 'current', e.target.value)}
                              className="input-field flex-1"
                            />
                            <span className="text-gray-500">candidates</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Current: {current.current}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(simulated.percentage)}`}
                            style={{ width: `${Math.min(simulated.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current vs Simulated Comparison */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current vs Simulated Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Current Target</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Simulated Target</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Current Allocated</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Simulated Allocated</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotaCategories.map((category) => {
                      const current = currentQuotas[category.key];
                      const simulated = simulatedQuotas[category.key];
                      const targetChange = simulated.target - current.target;
                      const allocatedChange = simulated.current - current.current;
                      
                      return (
                        <tr key={category.key} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{category.label}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{current.target}%</td>
                          <td className="py-3 px-4 text-center text-gray-600">{simulated.target}%</td>
                          <td className="py-3 px-4 text-center text-gray-600">{current.current}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{simulated.current}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col space-y-1">
                              <span className={`text-sm ${targetChange > 0 ? 'text-green-600' : targetChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {targetChange > 0 ? '+' : ''}{targetChange}%
                              </span>
                              <span className={`text-sm ${allocatedChange > 0 ? 'text-green-600' : allocatedChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {allocatedChange > 0 ? '+' : ''}{allocatedChange}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Simulation Results */}
            {simulationResults && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Simulation Results</h2>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {simulationResults.overallProgress}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Progress</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{simulationResults.totalAllocated}</div>
                      <div className="text-xs text-gray-600">Total Allocated</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{simulationResults.totalTarget}</div>
                      <div className="text-xs text-gray-600">Total Target</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Impact Analysis</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>New Allocations: {simulationResults.impactAnalysis.newAllocations}</div>
                      <div>Reallocations: {simulationResults.impactAnalysis.reallocations}</div>
                      <div>Affected Candidates: {simulationResults.impactAnalysis.affectedCandidates}</div>
                      <div>Companies Affected: {simulationResults.impactAnalysis.companiesAffected}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {simulationResults && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
                <div className="space-y-3">
                  {simulationResults.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {simulationResults && simulationResults.risks.length > 0 && (
              <div className="card bg-red-50 border border-red-200">
                <h2 className="text-xl font-semibold text-red-900 mb-4">Potential Risks</h2>
                <div className="space-y-3">
                  {simulationResults.risks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                      <span className="text-sm text-red-700">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunities */}
            {simulationResults && simulationResults.opportunities.length > 0 && (
              <div className="card bg-green-50 border border-green-200">
                <h2 className="text-xl font-semibold text-green-900 mb-4">Opportunities</h2>
                <div className="space-y-3">
                  {simulationResults.opportunities.map((opp, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-sm text-green-700">{opp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Options */}
            {simulationResults && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Results</h2>
                <div className="space-y-2">
                  <button className="btn-secondary w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </button>
                  <button className="btn-secondary w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
