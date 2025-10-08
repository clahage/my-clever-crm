// src/pages/SystemMap.jsx - Fixed version with error handling
import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Database, Search, RefreshCw, ZoomIn, Filter } from 'lucide-react';

// Color scheme by layer
const typeColor = {
  layout: "#3B82F6",      // blue
  page: "#10B981",        // emerald
  component: "#F59E0B",   // amber
  context: "#8B5CF6",     // violet
  service: "#EF4444",     // red
  hook: "#06B6D4",        // cyan
  lib: "#64748B",         // slate
  other: "#94A3B8"        // slate-light
};

const defaultCategories = [
  "layout", "page", "component", "context", "service", "hook", "lib", "other"
];

// Hand-curated system architecture graph
function makeInitialGraph() {
  const nodes = [
    // Layout / Navigation
    { id: "App.jsx", type: "layout" },
    { id: "ProtectedLayout.jsx", type: "layout" },
    { id: "Sidebar.jsx", type: "layout" },
    { id: "Topbar.jsx", type: "layout" },
    { id: "TopNav.jsx", type: "layout" },
    { id: "navConfig.js", type: "layout" },

    // Contexts
    { id: "AuthContext.jsx", type: "context" },
    { id: "NotificationContext.jsx", type: "context" },
    { id: "ThemeContext.jsx", type: "context" },

    // Lib
    { id: "lib/firebase.js", type: "lib" },

    // Pages - communications
    { id: "Communications.jsx", type: "page" },
    { id: "Emails.jsx", type: "page" },
    { id: "Messages.jsx", type: "page" },
    { id: "Notifications.jsx", type: "page" },
    { id: "SMS.jsx", type: "page" },
    { id: "DripCampaigns.jsx", type: "page" },
    { id: "EContracts.jsx", type: "page" },
    { id: "Contacts.jsx", type: "page" },
    { id: "DisputeLetters.jsx", type: "page" },

    // Components
    { id: "ImportContactsModal.jsx", type: "component" },
    { id: "EmailComposer.jsx", type: "component" },
    { id: "MessageThread.jsx", type: "component" },
    { id: "NotificationPanel.jsx", type: "component" },

    // Hooks
    { id: "useFirestore.js", type: "hook" },
    { id: "useRealtimeLeads.js", type: "hook" },
    { id: "useUserManagement.js", type: "hook" },

    // Services
    { id: "emailTrackingService.js", type: "service" },
    { id: "firestoreService.js", type: "service" },
    { id: "openaiService.js", type: "service" },
    { id: "pdfService.js", type: "service" },
    { id: "roleService.js", type: "service" },

    // This page
    { id: "SystemMap.jsx", type: "page" },
  ];

  const L = (source, target) => ({ source, target });

  const links = [
    // App wiring
    L("App.jsx", "ProtectedLayout.jsx"),
    L("App.jsx", "navConfig.js"),
    L("ProtectedLayout.jsx", "Sidebar.jsx"),
    L("ProtectedLayout.jsx", "Topbar.jsx"),

    // Context usage
    L("App.jsx", "AuthContext.jsx"),
    L("App.jsx", "ThemeContext.jsx"),
    L("Communications.jsx", "AuthContext.jsx"),
    L("Emails.jsx", "AuthContext.jsx"),

    // Firebase
    L("AuthContext.jsx", "lib/firebase.js"),
    L("firestoreService.js", "lib/firebase.js"),

    // Communications
    L("Communications.jsx", "Emails.jsx"),
    L("Communications.jsx", "Messages.jsx"),
    L("Emails.jsx", "EmailComposer.jsx"),
    L("Messages.jsx", "MessageThread.jsx"),

    // Services
    L("Emails.jsx", "emailTrackingService.js"),
    L("Contacts.jsx", "useFirestore.js"),
  ];

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

// Fallback component if library not available
const FallbackSystemMap = ({ graphData }) => {
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
          <strong>Note:</strong> Install react-force-graph-2d for interactive graph visualization:
          <code className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 rounded">npm install react-force-graph-2d</code>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(groupedNodes).map(([type, nodes]) => (
          <div key={type} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: typeColor[type] }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColor[type] }}></div>
              {type.charAt(0).toUpperCase() + type.slice(1)} ({nodes.length})
            </h3>
            <ul className="space-y-1 text-sm">
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
            <div className="text-gray-600 dark:text-gray-400">Total Nodes</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{graphData.nodes.length}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Total Links</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{graphData.links.length}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Categories</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Object.keys(groupedNodes).length}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Avg Connections</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(graphData.links.length / graphData.nodes.length).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
export default function SystemMap() {
  const fgRef = useRef();
  const [search, setSearch] = useState("");
  const [visibleTypes, setVisibleTypes] = useState(() => new Set(defaultCategories));
  const [selected, setSelected] = useState(null);
  const [charge, setCharge] = useState(-200);
  const [ForceGraph2D, setForceGraph2D] = useState(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(true);

  // Dynamically load the ForceGraph2D component
  useEffect(() => {
    let mounted = true;
    
    const loadGraph = async () => {
      try {
        const module = await import('react-force-graph-2d');
        if (mounted) {
          setForceGraph2D(() => module.default);
          setIsLoadingGraph(false);
        }
      } catch (e) {
        console.warn('react-force-graph-2d not installed');
        if (mounted) {
          setIsLoadingGraph(false);
        }
      }
    };

    loadGraph();

    return () => {
      mounted = false;
    };
  }, []);

  const graphData = useMemo(() => {
    const raw = (typeof window !== "undefined" && window.__CleverCRMGraph) || makeInitialGraph();
    return normalizeGraph(raw);
  }, []);

  const filtered = useMemo(() => {
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

  // Show loading state
  if (isLoadingGraph) {
    return (
      <div className="w-full h-[calc(100vh-12rem)] flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading System Map...</p>
        </div>
      </div>
    );
  }

  // If library not available, show fallback
  if (!ForceGraph2D) {
    return <FallbackSystemMap graphData={graphData} />;
  }

  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col p-4 gap-3 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Database className="w-6 h-6 text-blue-500" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">System Architecture Map</h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full border rounded-lg px-3 py-2 pl-10 bg-white dark:bg-gray-900 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search nodes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={resetView}
          title="Fit to view"
        >
          <ZoomIn className="w-4 h-4" />
          Fit View
        </button>
        <label className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Force</span>
          <input
            type="range"
            min="-800"
            max="-50"
            step="10"
            value={charge}
            onChange={(e) => setCharge(parseInt(e.target.value, 10))}
            className="w-32"
          />
        </label>
      </div>

      {/* Type toggles */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Filter className="w-5 h-5 text-gray-500" />
        {defaultCategories.map(t => (
          <button
            key={t}
            onClick={() => toggleType(t)}
            className={`px-3 py-1 rounded-lg border text-sm font-medium transition-all ${
              visibleTypes.has(t) 
                ? "shadow-sm" 
                : "opacity-40 grayscale"
            }`}
            style={{ 
              borderColor: typeColor[t], 
              color: typeColor[t],
              backgroundColor: visibleTypes.has(t) ? `${typeColor[t]}15` : 'transparent'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Graph */}
      <div className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
        {ForceGraph2D && (
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
            width={undefined}
            height={undefined}
          />
        )}
      </div>

      {/* Details panel */}
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
              <span className="font-medium text-gray-700 dark:text-gray-300">Connected to:</span>{" "}
              <div className="mt-1 flex flex-wrap gap-1">
                {Array.from(highlightNodes)
                  .filter(id => id !== selected.id)
                  .sort()
                  .map(id => (
                    <span key={id} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {id}
                    </span>
                  ))}
                {Array.from(highlightNodes).filter(id => id !== selected.id).length === 0 && (
                  <span className="text-gray-500">None</span>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button 
                className="px-3 py-1 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                onClick={() => setSelected(null)}
              >
                Clear
              </button>
              <button 
                className="px-3 py-1 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                onClick={resetView}
              >
                Fit to View
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-600 dark:text-gray-400">
            💡 <strong>Tip:</strong> Hover over nodes to highlight connections, click to focus. Use type filters to simplify the view.
          </div>
        )}
      </div>
    </div>
  );
}