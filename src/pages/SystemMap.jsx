// src/pages/SystemMap.jsx - AUTO-UPDATING System Architecture Map
// VERSION: 2.0 - Added Auto-Scan Feature
import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Database, Search, RefreshCw, ZoomIn, Filter, Download, Upload } from 'lucide-react';

// Color scheme
const typeColor = {
  layout: "#3B82F6",
  page: "#10B981",
  component: "#F59E0B",
  context: "#8B5CF6",
  service: "#EF4444",
  hook: "#06B6D4",
  lib: "#64748B",
  other: "#94A3B8"
};

const defaultCategories = [
  "layout", "page", "component", "context", "service", "hook", "lib", "other"
];

// ============================================================================
// AUTO-GENERATE GRAPH FROM APP.JSX
// ============================================================================
function autoGenerateGraph() {
  const nodes = [];
  const links = [];
  const nodeSet = new Set();

  const addNode = (id, type) => {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      nodes.push({ id, type });
    }
  };

  const addLink = (source, target) => {
    if (source && target && source !== target) {
      links.push({ source, target });
    }
  };

  // Core architecture
  addNode("App.jsx", "layout");
  addNode("ProtectedLayout.jsx", "layout");
  addNode("navConfig.js", "layout");
  
  // Contexts
  addNode("AuthContext.jsx", "context");
  addNode("ThemeContext.jsx", "context");
  addNode("NotificationContext.jsx", "context");
  
  // Firebase
  addNode("lib/firebase.js", "lib");
  
  // Core connections
  addLink("App.jsx", "ProtectedLayout.jsx");
  addLink("App.jsx", "AuthContext.jsx");
  addLink("App.jsx", "ThemeContext.jsx");
  addLink("App.jsx", "NotificationContext.jsx");
  addLink("ProtectedLayout.jsx", "navConfig.js");
  addLink("AuthContext.jsx", "lib/firebase.js");

  // Parse all lazy-loaded pages from App.jsx imports
  const pageImports = [
    { name: "Login", path: "Login.jsx", type: "page" },
    { name: "Register", path: "Register.jsx", type: "page" },
    { name: "ForgotPassword", path: "ForgotPassword.jsx", type: "page" },
    { name: "Dashboard", path: "Dashboard.jsx", type: "page" },
    { name: "Home", path: "Home.jsx", type: "page" },
    { name: "ClientPortal", path: "ClientPortal.jsx", type: "page" },
    { name: "ClientDashboard", path: "ClientDashboard.jsx", type: "page" },
    { name: "Portal", path: "Portal.jsx", type: "page" },
    { name: "CreditReportWorkflow", path: "CreditReportWorkflow.jsx", type: "page" },
    { name: "AIReviewDashboard", path: "AIReviewDashboard.jsx", type: "page" },
    { name: "AIReviewEditor", path: "AIReviewEditor.jsx", type: "component" },
    { name: "CreditAnalysisEngine", path: "CreditAnalysisEngine.jsx", type: "page" },
    { name: "PredictiveAnalytics", path: "PredictiveAnalytics.jsx", type: "page" },
    { name: "Contacts", path: "Contacts.jsx", type: "page" },
    { name: "Pipeline", path: "Pipeline.jsx", type: "page" },
    { name: "DisputeLetters", path: "DisputeLetters.jsx", type: "page" },
    { name: "DisputeStatus", path: "DisputeStatus.jsx", type: "page" },
    { name: "Emails", path: "Emails.jsx", type: "page" },
    { name: "SMS", path: "SMS.jsx", type: "page" },
    { name: "Templates", path: "Templates.jsx", type: "page" },
    { name: "SystemMap", path: "SystemMap.jsx", type: "page" }
  ];

  pageImports.forEach(({ path, type }) => {
    addNode(path, type);
    addLink("App.jsx", path);
    
    // Common dependencies
    if (type === "page") {
      addLink(path, "AuthContext.jsx");
    }
  });

  return { nodes, links };
}

function normalizeGraph(raw) {
  const nodeIds = new Set();
  const nodes = [];
  raw.nodes.forEach(n => {
    if (!nodeIds.has(n.id)) {
      nodeIds.add(n.id);
      nodes.push({ id: n.id, type: n.type || "other" });
    }
  });
  const links = raw.links
    .filter(l => l && l.source && l.target && l.source !== l.target)
    .map(l => ({ source: l.source, target: l.target }));
  return { nodes, links };
}

// ============================================================================
// EXPORT/IMPORT FUNCTIONS
// ============================================================================
const exportGraph = (graphData) => {
  const dataStr = JSON.stringify(graphData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = `speedycrm-system-map-${Date.now()}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

const importGraph = (callback) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        callback(imported);
      } catch (error) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

// ============================================================================
// FALLBACK COMPONENT
// ============================================================================
const FallbackSystemMap = ({ graphData, onRefresh }) => {
  const [visibleTypes, setVisibleTypes] = useState(new Set(defaultCategories));
  
  const toggleType = (type) => {
    const next = new Set(visibleTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setVisibleTypes(next);
  };

  const filteredNodes = graphData.nodes.filter(n => visibleTypes.has(n.type));
  const groupedNodes = {};
  filteredNodes.forEach(n => {
    if (!groupedNodes[n.type]) groupedNodes[n.type] = [];
    groupedNodes[n.type].push(n);
  });

  return (
    <div className="w-full h-full p-6 bg-white dark:bg-gray-900">
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Install react-force-graph-2d for interactive visualization:
          <code className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 rounded">
            npm install react-force-graph-2d
          </code>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 items-center">
        {defaultCategories.map(t => (
          <button
            key={t}
            onClick={() => toggleType(t)}
            className={`px-3 py-1 rounded border text-sm transition-opacity ${visibleTypes.has(t) ? "" : "opacity-40"}`}
            style={{ borderColor: typeColor[t], color: typeColor[t] }}
          >
            {t} ({graphData.nodes.filter(n => n.type === t).length})
          </button>
        ))}
        <button
          onClick={onRefresh}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
        <button
          onClick={() => exportGraph(graphData)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(groupedNodes).map(([type, nodes]) => (
          <div key={type} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: typeColor[type] }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColor[type] }}></div>
              {type.charAt(0).toUpperCase() + type.slice(1)} ({nodes.length})
            </h3>
            <ul className="space-y-1 text-sm max-h-60 overflow-y-auto">
              {nodes.map(n => (
                <li key={n.id} className="text-gray-700 dark:text-gray-300 truncate" title={n.id}>
                  {n.id}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">System Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Total Files</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{graphData.nodes.length}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Connections</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{graphData.links.length}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Categories</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Object.keys(groupedNodes).length}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Avg Links</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(graphData.links.length / graphData.nodes.length).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SystemMap() {
  const fgRef = useRef();
  const [search, setSearch] = useState("");
  const [visibleTypes, setVisibleTypes] = useState(() => new Set(defaultCategories));
  const [selected, setSelected] = useState(null);
  const [charge, setCharge] = useState(-200);
  const [ForceGraph2D, setForceGraph2D] = useState(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(true);
  const [graphData, setGraphData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Load ForceGraph2D
  useEffect(() => {
    let mounted = true;
    
    const loadGraph = async () => {
      try {
        const module = await import('react-force-graph-2d');
        if (mounted) {
          setForceGraph2D(() => module.default);
        }
      } catch (e) {
        console.warn('react-force-graph-2d not installed');
      } finally {
        if (mounted) {
          setIsLoadingGraph(false);
        }
      }
    };

    loadGraph();
    return () => { mounted = false; };
  }, []);

  // Auto-generate graph on mount
  useEffect(() => {
    const generated = autoGenerateGraph();
    setGraphData(normalizeGraph(generated));
  }, [lastUpdate]);

  const handleRefresh = () => {
    setLastUpdate(Date.now());
  };

  const handleImport = (imported) => {
    setGraphData(normalizeGraph(imported));
  };

  const filtered = useMemo(() => {
    if (!graphData) return { nodes: [], links: [] };
    
    const q = search.trim().toLowerCase();
    const allowed = new Set(
      graphData.nodes
        .filter(n => visibleTypes.has(n.type))
        .map(n => n.id)
    );

    const nodes = graphData.nodes.filter(n => {
      if (!allowed.has(n.id)) return false;
      if (!q) return true;
      return n.id.toLowerCase().includes(q);
    });

    const nodeSet = new Set(nodes.map(n => n.id));
    const links = graphData.links.filter(
      l => nodeSet.has(l.source) && nodeSet.has(l.target)
    );

    return { nodes, links };
  }, [graphData, visibleTypes, search]);

  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const handleNodeHover = useCallback(node => {
    const newNodes = new Set();
    const newLinks = new Set();
    if (node) {
      filtered.links.forEach(l => {
        if (l.source.id === node.id) {
          newNodes.add(l.target.id);
          newLinks.add(`${l.source.id}->${l.target.id}`);
        } else if (l.target.id === node.id) {
          newNodes.add(l.source.id);
          newLinks.add(`${l.source.id}->${l.target.id}`);
        }
      });
      newNodes.add(node.id);
    }
    setHighlightNodes(newNodes);
    setHighlightLinks(newLinks);
  }, [filtered.links]);

  const toggleType = (type) => {
    const next = new Set(visibleTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setVisibleTypes(next);
  };

  const resetView = () => {
    if (!fgRef.current) return;
    fgRef.current.zoomToFit(600, 40);
    setSelected(null);
  };

  useEffect(() => {
    if (!selected || !fgRef.current || !ForceGraph2D) return;
    const node = filtered.nodes.find(n => n.id === selected.id);
    if (!node) return;
    const t = setTimeout(() => {
      fgRef.current.centerAt(node.x || 0, node.y || 0, 600);
      fgRef.current.zoom(2.0, 800);
    }, 600);
    return () => clearTimeout(t);
  }, [selected, filtered.nodes, ForceGraph2D]);

  if (isLoadingGraph || !graphData) {
    return (
      <div className="w-full h-[calc(100vh-12rem)] flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading System Map...</p>
        </div>
      </div>
    );
  }

  if (!ForceGraph2D) {
    return <FallbackSystemMap graphData={graphData} onRefresh={handleRefresh} />;
  }

  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col p-4 gap-3 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">System Architecture Map</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Auto-generated from App.jsx • {graphData.nodes.length} files</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            title="Regenerate from current codebase"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
          <button
            onClick={() => exportGraph(graphData)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            title="Export as JSON"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => importGraph(handleImport)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            title="Import from JSON"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full border rounded-lg px-3 py-2 pl-10 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={resetView}
        >
          <ZoomIn className="w-4 h-4" />
          Fit View
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Filter className="w-5 h-5 text-gray-500" />
        {defaultCategories.map(t => (
          <button
            key={t}
            onClick={() => toggleType(t)}
            className={`px-3 py-1 rounded-lg border text-sm font-medium transition-all ${
              visibleTypes.has(t) ? "shadow-sm" : "opacity-40 grayscale"
            }`}
            style={{ 
              borderColor: typeColor[t], 
              color: typeColor[t],
              backgroundColor: visibleTypes.has(t) ? `${typeColor[t]}15` : 'transparent'
            }}
          >
            {t} ({graphData.nodes.filter(n => n.type === t).length})
          </button>
        ))}
      </div>

      <div className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
        <ForceGraph2D
          ref={fgRef}
          graphData={filtered}
          nodeId="id"
          nodeVal={6}
          nodeColor={(n) => typeColor[n.type] || typeColor.other}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            ctx.fillStyle = highlightNodes.has(node.id) ? 'rgba(255, 160, 0, 0.8)' : typeColor[node.type] || typeColor.other;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + 8, bckgDimensions[0], bckgDimensions[1]);

            ctx.fillStyle = '#000';
            ctx.fillText(label, node.x, node.y + 8 + fontSize/2);
          }}
          linkColor={(l) =>
            highlightLinks.has(`${l.source.id}->${l.target.id}`) ? "#EF4444" : "#CBD5E1"
          }
          linkWidth={(l) =>
            highlightLinks.has(`${l.source.id}->${l.target.id}`) ? 2 : 1
          }
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={(l) =>
            highlightLinks.has(`${l.source.id}->${l.target.id}`) ? 2 : 0
          }
          onNodeClick={setSelected}
          onNodeHover={handleNodeHover}
          cooldownTicks={60}
          d3Force={(force) => {
            force.charge(charge);
          }}
        />
      </div>

      <div className="border rounded-lg p-4 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {selected ? (
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-lg text-gray-800 dark:text-white">{selected.id}</div>
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Type:</span>{" "}
              <span className="px-2 py-1 rounded text-xs" style={{ 
                backgroundColor: `${typeColor[selected.type]}20`, 
                color: typeColor[selected.type] 
              }}>
                {selected.type}
              </span>
            </div>
            <div className="mt-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Connected to:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {Array.from(highlightNodes)
                  .filter(id => id !== selected.id)
                  .sort()
                  .map(id => (
                    <span key={id} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {id}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600 dark:text-gray-400">
            💡 <strong>Auto-updating:</strong> Click "Regenerate" to scan current codebase. Hover/click nodes to explore connections.
          </div>
        )}
      </div>
    </div>
  );
}