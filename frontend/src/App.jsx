import React, { useState } from 'react';

export default function App() {
  const [inputText, setInputText] = useState("A->B\nA->C\nB->D");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("visualization");
  const [copied, setCopied] = useState(false);

  // Sample data loaders
  const loadSample = (type) => {
    if (type === 'tree') {
      setInputText("A->B\nA->C\nB->D\nB->E\nC->F");
    } else if (type === 'cycle') {
      setInputText("X->Y\nY->Z\nZ->X\nA->B");
    } else if (type === 'multiparent') {
      setInputText("A->B\nC->B\nA->D\nD->E\nF->G\nG->H\nH->F");
    } else if (type === 'complex') {
      setInputText("A->B\nA->C\nB->D\nB->E\nC->F\nC->G\nH->I\nI->J\nJ->K\nK->H\nX->Y\nY->Z\nZ->W\nhello\n1->2\nA->B");
    }
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Automatically convert lines into array
    const edges = inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (edges.length === 0) {
      setError("Please enter at least one edge.");
      setLoading(false);
      return;
    }

    try {
      // Connect to the backend API
      const response = await fetch('http://localhost:5000/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: edges }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect to the backend server. Please make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Recursive Tree Node Renderer
  const TreeNode = ({ nodeName, subtree }) => {
    const children = Object.keys(subtree);
    return (
      <div className="flex flex-col items-center">
        {/* Node Card */}
        <div className="relative px-5 py-2.5 bg-slate-800 border border-violet-500/80 rounded-xl text-white font-semibold shadow-lg hover:shadow-violet-500/20 hover:border-violet-400 transition-all duration-300 flex items-center gap-2 group">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400 group-hover:scale-125 transition-transform duration-200"></span>
          <span className="text-lg tracking-wider font-mono">{nodeName}</span>
        </div>

        {/* Vertical line down to children */}
        {children.length > 0 && (
          <div className="w-px h-6 bg-violet-500/40"></div>
        )}

        {/* Children Row */}
        {children.length > 0 && (
          <div className="flex gap-x-8 relative">
            {children.map((childName, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === children.length - 1;
              const hasSiblings = children.length > 1;

              return (
                <div key={childName} className="flex flex-col items-center relative">
                  {/* Connecting horizontal lines using positioning */}
                  {hasSiblings && (
                    <div 
                      className={`absolute top-0 h-px bg-violet-500/40 ${
                        isFirst ? 'left-1/2 right-0' : isLast ? 'left-0 right-1/2' : 'left-0 right-0'
                      }`}
                    />
                  )}
                  {/* Vertical line from sibling bridge down into child card */}
                  <div className="w-px h-4 bg-violet-500/40 z-10"></div>
                  
                  <TreeNode nodeName={childName} subtree={subtree[childName]} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      {/* Background glowing blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Chitkara Challenge
              </h1>
              <p className="text-xs text-violet-400 font-medium tracking-wide uppercase">Full Stack Engineering</p>
            </div>
          </div>

          {/* Student Profile Info */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="font-mono text-slate-300">
              <div className="font-semibold text-slate-100">Sunny Singh</div>
              <div className="text-[10px] text-slate-400">Roll: 2311981524 | sunny1524.be23@chitkarauniversity.edu.in</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar: Controls & Inputs */}
        <section className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Input Edges
              </h2>
              <button 
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                title="Clear input"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="edges-input" className="sr-only">Directed Edges</label>
                <textarea
                  id="edges-input"
                  rows="8"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="A->B&#10;A->C&#10;B->D"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-sm text-violet-300 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all shadow-inner resize-y"
                />
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold shadow-lg shadow-violet-700/20 text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                  loading ? 'opacity-85 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Parsing Data...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Analyze Hierarchy</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Presets / Loaders */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Load Presets</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => loadSample('tree')}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-950 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900 text-slate-300 hover:text-white transition duration-200 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Standard Tree
              </button>
              <button 
                onClick={() => loadSample('cycle')}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-950 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900 text-slate-300 hover:text-white transition duration-200 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Pure Cycle
              </button>
              <button 
                onClick={() => loadSample('multiparent')}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-950 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900 text-slate-300 hover:text-white transition duration-200 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Multi-Parent
              </button>
              <button 
                onClick={() => loadSample('complex')}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-950 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900 text-slate-300 hover:text-white transition duration-200 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                Complex Mix
              </button>
            </div>
          </div>
        </section>

        {/* Right Area: Results & Visualizer */}
        <section className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-5 py-4 rounded-2xl flex items-start gap-3 shadow-lg shadow-rose-950/20">
              <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-semibold text-rose-200">Execution Error</h4>
                <p className="text-xs mt-1 leading-relaxed text-rose-300/90">{error}</p>
              </div>
            </div>
          )}

          {/* Results Summary Dashboard */}
          {result && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Summary Card 1 */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Trees</span>
                    <h3 className="text-3xl font-bold font-mono text-emerald-400 mt-1">{result.summary.total_trees}</h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">Valid components without cycles</p>
              </div>

              {/* Summary Card 2 */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Cycles</span>
                    <h3 className="text-3xl font-bold font-mono text-amber-400 mt-1">{result.summary.total_cycles}</h3>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                    </svg>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">Invalid cyclic loop components</p>
              </div>

              {/* Summary Card 3 */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Largest Tree Root</span>
                    <h3 className="text-3xl font-bold font-mono text-cyan-400 mt-1">
                      {result.summary.largest_tree_root || "N/A"}
                    </h3>
                  </div>
                  <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">Max nodes (lexicographical tie-breaker)</p>
              </div>
            </div>
          )}

          {/* Results Tab Workspace */}
          {result ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-2xl flex-1 flex flex-col min-h-[480px]">
              
              {/* Tab Header */}
              <div className="border-b border-slate-800 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 bg-slate-900/80 rounded-t-2xl">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab("visualization")}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                      activeTab === "visualization" 
                        ? 'bg-violet-600/15 text-violet-400' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tree Visualization
                  </button>
                  <button
                    onClick={() => setActiveTab("json")}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                      activeTab === "json" 
                        ? 'bg-violet-600/15 text-violet-400' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Raw API Response
                  </button>
                  <button
                    onClick={() => setActiveTab("validations")}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                      activeTab === "validations" 
                        ? 'bg-violet-600/15 text-violet-400' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Logs & Errors ({result.invalid_entries.length + result.duplicate_edges.length})
                  </button>
                </div>

                {/* Extra action like copy json */}
                {activeTab === "json" && (
                  <button
                    onClick={handleCopyJson}
                    className="text-xs text-slate-400 hover:text-white transition duration-200 flex items-center gap-1 px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {copied ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      )}
                    </svg>
                    {copied ? "Copied!" : "Copy JSON"}
                  </button>
                )}
              </div>

              {/* Tab Content Panels */}
              <div className="p-6 flex-1 overflow-auto min-h-0 flex flex-col">
                
                {/* PANEL 1: VISUALIZATION */}
                {activeTab === "visualization" && (
                  <div className="flex-1 flex flex-col gap-8 items-center py-6">
                    {result.hierarchies.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-sm">
                        <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h4 className="font-semibold mt-4 text-slate-300">No Hierarchies to Show</h4>
                        <p className="text-xs text-slate-500 mt-2">All provided edge lines were either invalid format, duplicate entries, or parents of multiple roots.</p>
                      </div>
                    ) : (
                      result.hierarchies.map((hier, index) => {
                        if (hier.has_cycle) {
                          // Render Cycle Component Visual
                          return (
                            <div 
                              key={index} 
                              className="w-full max-w-lg bg-slate-950/60 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 shadow-lg shadow-amber-950/5"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 shrink-0">
                                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-md font-bold text-amber-400 flex items-center gap-2">
                                    Cycle Detected
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    This component contains a directed feedback loop. Nodes are mutually reachable. 
                                  </p>
                                  <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
                                    <span className="text-slate-400">Assigned Root:</span>
                                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 font-mono text-sm">{hier.root}</span>
                                    <span className="text-slate-500 text-[10px] italic">(Lexicographically smallest)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Render valid Tree Component
                        return (
                          <div key={index} className="w-full flex flex-col items-center border-b border-slate-800/40 last:border-0 pb-12 last:pb-2">
                            <div className="flex items-center gap-2.5 mb-8 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950 px-4 py-1.5 border border-slate-850 rounded-full">
                              <span className="text-slate-500">Tree Component Root:</span>
                              <span className="text-emerald-400 font-mono">{hier.root}</span>
                              <span className="text-slate-600">|</span>
                              <span className="text-slate-500">Depth:</span>
                              <span className="text-cyan-400 font-mono">{hier.depth}</span>
                            </div>
                            
                            <div className="overflow-x-auto w-full flex justify-center py-4 px-2">
                              <TreeNode nodeName={hier.root} subtree={hier.tree[hier.root]} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* PANEL 2: RAW JSON */}
                {activeTab === "json" && (
                  <div className="flex-1 flex flex-col">
                    <pre className="flex-1 bg-slate-950 border border-slate-850 rounded-xl p-5 font-mono text-xs text-indigo-300 overflow-auto whitespace-pre-wrap leading-relaxed shadow-inner max-h-[500px]">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}

                {/* PANEL 3: LOGS & VALIDATION DETAILS */}
                {activeTab === "validations" && (
                  <div className="flex-1 flex flex-col gap-6">
                    {/* Invalid Entries */}
                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-5">
                      <h4 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Invalid Edge Entries ({result.invalid_entries.length})
                      </h4>
                      {result.invalid_entries.length === 0 ? (
                        <p className="text-xs text-slate-500">All edge lines followed the correct format (e.g. A-&gt;B).</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {result.invalid_entries.map((item, idx) => (
                            <span 
                              key={idx} 
                              className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono rounded-lg"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Duplicate Edges */}
                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-5">
                      <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Duplicate Edges ({result.duplicate_edges.length})
                      </h4>
                      {result.duplicate_edges.length === 0 ? (
                        <p className="text-xs text-slate-500">No duplicate edge lines detected in the input text.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {result.duplicate_edges.map((item, idx) => (
                            <span 
                              key={idx} 
                              className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono rounded-lg"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Process Info Info Alert */}
                    <div className="bg-blue-500/5 border border-blue-500/15 text-blue-300/90 px-4 py-3.5 rounded-xl text-xs leading-relaxed">
                      <h5 className="font-semibold text-blue-200 mb-1">Process Information</h5>
                      <p>Validation filters out lines that do not match the <code className="font-mono text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded">X-&gt;Y</code> pattern (where X, Y are single uppercase letters) or contain self-loops like <code className="font-mono text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded">A-&gt;A</code>. Duplicates are detected when the same edge is entered multiple times. Multi-parent rules ignore any edge that attempts to assign a second parent to a node (first parent processed wins).</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* Blank state before submission */
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[480px]">
              <div className="p-4 bg-violet-600/10 rounded-2xl text-violet-400 mb-4 animate-pulse">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-200">Awaiting Edge Input</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                Add your directed edge lists in the text area on the left and click "Analyze Hierarchy" to visualize tree directories, trace cycles, and get details.
              </p>
            </div>
          )}

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-auto">
        <p>© 2026 Chitkara Full Stack Engineering Challenge. Designed & Implemented by Sunny Singh.</p>
      </footer>
    </div>
  );
}
