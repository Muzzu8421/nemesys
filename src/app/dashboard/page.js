"use client"
import React, { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { MessageSquare, Plus, Upload, LogOut, Search, ChevronLeft, Menu, Shield, ShieldAlert, ChevronDown, ChevronRight, RotateCcw, AlertTriangle, CheckCircle, FileCode, ArrowRight, Loader2, Sparkles, RotateCw } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { KineticTextLoader } from "@/components/ui/kinetic-text-loader";
import AttackSimulationView from "@/components/AttackSimulationView";
import { useConversations } from "@/hooks/useConversations";

const IGNORED_PATTERNS = [
  "node_modules/",
  ".git/",
  ".next/",
  "dist/",
  "build/",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

const SUPPORTED_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".py"];
const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500KB

function isIgnored(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return IGNORED_PATTERNS.some((pattern) => normalizedPath.includes(pattern));
}

function isSupportedExtension(filePath) {
  return SUPPORTED_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

// --- Findings display components ---

const severityColors = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function FindingDetail({ finding }) {
  const [explanation, setExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState(null);
  const fetchedRef = React.useRef(false);

  React.useEffect(() => {
    if (!explanation && !isExplaining && !explainError && !fetchedRef.current) {
      fetchedRef.current = true;
      setIsExplaining(true);
      fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finding),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setExplainError(data.error);
          } else {
            setExplanation(data.explanation);
          }
        })
        .catch(err => {
          setExplainError('Failed to connect to AI service: ' + err.message);
        })
        .finally(() => {
          setIsExplaining(false);
        });
    }
  }, [explanation, isExplaining, explainError, finding]);

  const retry = () => {
    setExplainError(null);
    fetchedRef.current = false;
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-white" />
          <h4 className="text-xs font-semibold text-[#888] uppercase tracking-wider">AI Explanation</h4>
        </div>
        {isExplaining ? (
          <div className="flex items-center gap-2.5 py-3 px-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
            <Loader2 size={14} className="animate-spin text-white" />
            <span className="text-sm text-[#888]">Analyzing with AI…</span>
          </div>
        ) : explainError ? (
          <div className="flex items-center gap-2 py-3 px-3 rounded-lg bg-red-500/5 border border-red-500/10">
            <span className="text-sm text-red-400 flex-1">{explainError}</span>
            <button
              onClick={retry}
              className="flex items-center gap-1 text-xs text-[#888] hover:text-white transition-colors"
            >
              <RotateCw size={12} />
              Retry
            </button>
          </div>
        ) : explanation ? (
          <p className="text-sm text-[#aaa] mt-1 leading-relaxed whitespace-pre-wrap">
            {explanation}
          </p>
        ) : null}
      </div>
      
      {finding.attacker_payload && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-[#666] mb-1">Example attacker input</div>
            <code className="block bg-black/40 rounded px-2 py-1 text-red-300 break-all whitespace-pre-wrap">
              {finding.attacker_payload}
            </code>
          </div>
          <div>
            <div className="text-[#666] mb-1">Suggested fix</div>
            <div className="text-green-300">{finding.fix_suggestion}</div>
          </div>
        </div>
      )}

      <AttackSimulationView finding={finding} />
    </div>
  );
}

function FindingGroup({ typeName, groupFindings }) {
  const [expanded, setExpanded] = useState(true);
  const [activeFindingIndex, setActiveFindingIndex] = useState(null);

  const count = groupFindings.length;
  
  const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
  const worstSeverity = groupFindings.reduce((worst, f) => {
    return SEVERITY_ORDER[f.severity] < SEVERITY_ORDER[worst] ? f.severity : worst;
  }, groupFindings[0].severity);

  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden mb-3 transition-all duration-300 hover:border-amber-500/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <ShieldAlert size={20} className="text-amber-400 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">{typeName} ({count})</span>
            <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${severityColors[worstSeverity] || "bg-amber-500/15 text-amber-400 border-amber-500/20"}`}>
              {worstSeverity}
            </span>
          </div>
        </div>
        <div className="text-[#555] flex-shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/5">
          {groupFindings.map((finding, idx) => {
            const isSelected = activeFindingIndex === idx;
            
            let locationText = finding.id;
            const sinkNode = (finding.path || []).find(p => p.type === 'sink') || (finding.path || [])[0];
            if (sinkNode) {
              locationText = `${sinkNode.file}:${sinkNode.line}`;
            }

            return (
              <div key={idx} className="border-b border-white/5 last:border-b-0">
                <button
                  onClick={() => setActiveFindingIndex(isSelected ? null : idx)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-xs transition-colors ${isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                >
                  <FileCode size={14} className={isSelected ? "text-violet-400 flex-shrink-0" : "text-[#555] flex-shrink-0"} />
                  <span className={`truncate ${isSelected ? "text-white" : "text-[#aaa]"}`}>{locationText}</span>
                </button>
                
                {isSelected && (
                  <div className="px-5 pb-5 pt-3 bg-black/20 border-t border-white/5">
                     <FindingDetail finding={finding} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AnalyticsDashboard({ findings, activeFilter, onFilterChange }) {
  const [isMounted, setIsMounted] = useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (findings.length === 0) return null;
  if (!isMounted) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"><div className="h-[200px]" /><div className="h-[220px]" /></div>;

  // Aggregate by severity
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  findings.forEach(f => {
    if (severityCounts[f.severity] !== undefined) {
      severityCounts[f.severity]++;
    }
  });

  const pieData = Object.keys(severityCounts)
    .filter(k => severityCounts[k] > 0)
    .map(k => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: severityCounts[k], severity: k }));

  const COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#3b82f6'
  };

  // Aggregate by type
  const typeMap = {};
  findings.forEach(f => {
    const t = f.vulnerability_type || f.vulnerabilityType || "Unknown";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const barData = Object.keys(typeMap).map(k => ({ name: k, count: typeMap[k] }))
    .sort((a, b) => b.count - a.count);

  const handlePieClick = (entry, index, e) => {
    if (!entry) return;
    const severity = entry.severity || entry.payload?.severity;
    if (activeFilter?.type === 'severity' && activeFilter.value === severity) {
      onFilterChange(null);
    } else {
      onFilterChange({ type: 'severity', value: severity });
    }
  };

  const handleBarClick = (entry, index, e) => {
    if (!entry) return;
    const name = entry.name || entry.payload?.name || entry.activeLabel;
    if (!name) return;
    if (activeFilter?.type === 'vulnerability_type' && activeFilter.value === name) {
      onFilterChange(null);
    } else {
      onFilterChange({ type: 'vulnerability_type', value: name });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 min-w-0 min-h-0">
      {/* Severity Breakdown */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-4 flex flex-col min-w-0">
        <h3 className="text-sm font-medium text-[#888] mb-4">Severity Breakdown</h3>
        <div className="flex flex-col gap-3">
          {pieData.map((entry) => {
            const isDimmed =
              activeFilter &&
              (activeFilter.type !== 'severity' ||
                activeFilter.value !== entry.severity);
            const maxCount = Math.max(...pieData.map(d => d.value), 1);
            const widthPct = Math.max((entry.value / maxCount) * 100, 6);

            return (
              <button
                key={entry.name}
                onClick={() => handlePieClick(entry)}
                className="group text-left transition-opacity"
                style={{ opacity: isDimmed ? 0.35 : 1 }}
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs text-[#aaa] group-hover:text-white transition-colors truncate">
                    {entry.name}
                  </span>
                  <span className="text-xs text-[#666] flex-shrink-0">
                    {entry.value}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${widthPct}%`,
                      backgroundColor: COLORS[entry.severity]
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vulnerability Types — plain CSS bars instead of Recharts.
          Recharts' ResponsiveContainer measures its parent via
          ResizeObserver and silently renders 0×0 inside CSS grid/flex
          layouts unless every ancestor has min-width/min-height: 0.
          Plain divs sidestep that class of bug entirely and are
          trivially responsive with just a width percentage. */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-4 flex flex-col min-w-0">
        <h3 className="text-sm font-medium text-[#888] mb-4">Vulnerability Types</h3>
        <div className="flex flex-col gap-3">
          {barData.map((entry) => {
            const isDimmed =
              activeFilter &&
              (activeFilter.type !== 'vulnerability_type' ||
                activeFilter.value !== entry.name);
            const maxCount = barData[0]?.count || 1; // barData is pre-sorted desc
            const widthPct = Math.max((entry.count / maxCount) * 100, 6); // floor so low-count bars stay visible/clickable

            return (
              <button
                key={entry.name}
                onClick={() => handleBarClick(entry)}
                className="group text-left transition-opacity"
                style={{ opacity: isDimmed ? 0.35 : 1 }}
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs text-[#aaa] group-hover:text-white transition-colors truncate">
                    {entry.name}
                  </span>
                  <span className="text-xs text-[#666] flex-shrink-0">
                    {entry.count}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white group-hover:bg-white/80 rounded-full transition-all duration-300"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FindingsView({ scanState, onNewScan }) {
  const allFindings = scanState.findings || [];
  const [activeFilter, setActiveFilter] = useState(null);

  const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

  let filteredFindings = allFindings;
  if (activeFilter) {
    if (activeFilter.type === 'severity') {
      filteredFindings = allFindings.filter(f => f.severity === activeFilter.value);
    } else if (activeFilter.type === 'vulnerability_type') {
      filteredFindings = allFindings.filter(f => (f.vulnerability_type || f.vulnerabilityType || "Unknown") === activeFilter.value);
    }
  }

  const groups = {};
  filteredFindings.forEach(f => {
    const type = f.vulnerability_type || f.vulnerabilityType || "Unknown";
    if (!groups[type]) groups[type] = [];
    groups[type].push(f);
  });

  const sortedGroups = Object.entries(groups).map(([type, findingsList]) => {
    const worstSeverity = findingsList.reduce((worst, f) => {
      return SEVERITY_ORDER[f.severity] < SEVERITY_ORDER[worst] ? f.severity : worst;
    }, findingsList[0].severity);
    return { type, findingsList, worstSeverity };
  }).sort((a, b) => {
    if (SEVERITY_ORDER[a.worstSeverity] !== SEVERITY_ORDER[b.worstSeverity]) {
      return SEVERITY_ORDER[a.worstSeverity] - SEVERITY_ORDER[b.worstSeverity];
    }
    return b.findingsList.length - a.findingsList.length;
  });

  return (
    <div className="w-full max-w-3xl text-left px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            {allFindings.length > 0 ? (
              <>
                <AlertTriangle size={20} className="text-amber-400" />
                Scan Results
              </>
            ) : (
              <>
                <Shield size={20} className="text-green-400" />
                Scan Results
              </>
            )}
          </h2>
          <p className="text-sm text-[#888] mt-1">{scanState.message}</p>
        </div>
        <button
          onClick={onNewScan}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
        >
          <RotateCcw size={14} />
          New Scan
        </button>
      </div>

      <AnalyticsDashboard 
        findings={allFindings} 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {activeFilter && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-[#888]">Filtering by {activeFilter.type === 'severity' ? 'severity' : 'type'}:</span>
          <span className="text-xs text-white bg-white/10 px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
            {activeFilter.value}
            <button onClick={() => setActiveFilter(null)} className="hover:text-red-400 ml-1 transition-colors">×</button>
          </span>
        </div>
      )}

      {/* Findings list or clean message */}
      {allFindings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#0d0d0d] border border-white/10 rounded-2xl">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">All Clear</h3>
          <p className="text-sm text-[#888] max-w-md text-center">
            No vulnerabilities found in the patterns currently checked for.
          </p>
        </div>
      ) : filteredFindings.length === 0 ? (
        <div className="text-center py-12 text-[#666] text-sm bg-[#0d0d0d] border border-white/10 rounded-xl">
          No findings match the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedGroups.map((group) => (
            <FindingGroup key={group.type} typeName={group.type} groupFindings={group.findingsList} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = React.useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');

  // ONE state value that can only ever be one thing at a time:
  // { status: 'idle' } | { status: 'loading' } |
  // { status: 'success', message } | { status: 'error', message }
  //
  // Using separate `uploading` + `statusMessage` state previously caused
  // a bug: an early return in one code path skipped resetting `uploading`,
  // leaving the loader stuck on screen underneath an error message.
  // Collapsing both into one value makes that class of bug impossible —
  // there is only ever one true state to render.
  const [scanState, setScanState] = useState({ status: "idle" });

  React.useEffect(() => {
    if (conversationId) {
      setScanState({ status: "loading" });
      fetch(`/api/conversations/${conversationId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setScanState({ status: "error", message: data.error });
          } else if (data.conversation?.type === "scan") {
            setScanState({
              status: "success",
              message: `Scan complete. Found ${data.findings?.length || 0} potential issue(s).`,
              findings: data.findings || [],
            });
          } else {
            // For future chat implementation
            setScanState({ status: "idle" });
          }
        })
        .catch(err => {
          setScanState({ status: "error", message: "Failed to load conversation." });
        });
    } else {
      setScanState({ status: "idle" });
    }
  }, [conversationId]);

  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const isLoading = ["loading", "filtering", "loading-ai", "enriching"].includes(scanState.status);

  const handleGithubImport = async () => {
    if (!repoUrl.trim()) return;

    // Basic sanity check before hitting the backend — catches obvious
    // typos without needing a network round trip.
    const isValidGithubUrl = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(
      repoUrl.trim()
    );
    if (!isValidGithubUrl) {
      setScanState({
        status: "error",
        message: "Please enter a valid public GitHub repo URL, e.g. https://github.com/owner/repo",
      });
      return;
    }

    setGithubModalOpen(false);
    setScanState({ status: "loading" });
    await waitForPaint();

    try {
      const MIN_LOADING_MS = 600;
      const [response] = await Promise.all([
        fetch("/api/scan/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl: repoUrl.trim() }),
        }),
        new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS)),
      ]);
      const data = await response.json();

      if (!response.ok) {
        setScanState({ status: "error", message: data.error || "GitHub import failed" });
      } else {
        if (data.conversationId) {
          refresh();
          router.push(`/dashboard?id=${data.conversationId}`);
        } else {
          const rawFindings = data.findings || [];
          setScanState({
            status: "success",
            message: `Scan complete. Found ${rawFindings.length} potential issue(s) in ${data.fileCount} files.`,
            findings: rawFindings,
          });
        }
      }
    } catch (error) {
      console.error(error);
      setScanState({
        status: "error",
        message: "GitHub import failed due to network error",
      });
    } finally {
      setRepoUrl("");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const waitForPaint = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

  // Processes the file list in small chunks, one chunk per animation
  // frame, instead of one long synchronous loop. requestAnimationFrame
  // callbacks run right before the browser paints — so scheduling the
  // next chunk from inside the previous frame's callback guarantees a
  // real paint happens in between chunks. setTimeout(0) does NOT give
  // this guarantee, which is why the loading state was getting skipped
  // entirely for large folders: the whole filtering loop ran as one
  // uninterrupted burst, and the browser only painted once, after
  // everything (filtering AND the fetch) had already finished.
  const filterFilesInChunks = (files) => {
    return new Promise((resolve) => {
      const CHUNK_SIZE = 200;
      const formData = new FormData();
      let validFilesCount = 0;
      let i = 0;

      function processChunk() {
        const end = Math.min(i + CHUNK_SIZE, files.length);
        for (; i < end; i++) {
          const file = files[i];
          const filePath = file.webkitRelativePath || file.name || "";

          if (isIgnored(filePath)) continue;
          if (!isSupportedExtension(filePath)) continue;
          if (file.size > MAX_FILE_SIZE_BYTES) continue;

          formData.append("files", file, filePath);
          validFilesCount++;
        }

        // Update progress every chunk — this both proves to the browser
        // there's new work to paint, and gives the user real feedback
        // instead of a generic unmoving spinner.
        setScanState({
          status: "filtering",
          processed: i,
          total: files.length,
        });

        if (i < files.length) {
          requestAnimationFrame(processChunk);
        } else {
          resolve({ formData, validFilesCount });
        }
      }

      requestAnimationFrame(processChunk);
    });
  };

  const handleFileChange = async (e) => {
    // NOTE: for large folders (e.g. containing node_modules), the browser
    // shows its own native "Upload X files?" confirmation BEFORE this
    // handler ever runs — the change event only fires after the browser
    // has already traversed the whole directory and the user has
    // confirmed. There's no way to show a loader before that point; it's
    // a platform limitation of <input webkitdirectory>, not a bug in this
    // code. Everything from here onward is what we actually control.
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setScanState({ status: "loading" });
    await waitForPaint();

    const { formData, validFilesCount } = await filterFilesInChunks(files);

    if (validFilesCount === 0) {
      setScanState({
        status: "error",
        message: "No valid supported files found in the selected folder.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      // Run the actual request and a minimum-delay timer in parallel.
      // Promise.all waits for BOTH to finish — so a fast local response
      // (like 18 files finishing in a few ms) still keeps the loader
      // visible for at least MIN_LOADING_MS, instead of flashing past
      // too fast to notice. A genuinely slow request is unaffected,
      // since it already takes longer than the minimum on its own.
      const MIN_LOADING_MS = 600;
      const [response] = await Promise.all([
        fetch("/api/scan/upload", { method: "POST", body: formData }),
        new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS)),
      ]);
      const data = await response.json();

      if (!response.ok) {
        setScanState({ status: "error", message: data.error || "Upload failed" });
      } else {
        if (data.conversationId) {
          refresh();
          router.push(`/dashboard?id=${data.conversationId}`);
        } else {
          const rawFindings = data.findings || [];
          setScanState({
            status: "success",
            message: `Scan complete. Found ${rawFindings.length} potential issue(s) in ${data.fileCount} files.`,
            findings: rawFindings,
          });
        }
      }
    } catch (error) {
      console.error(error);
      setScanState({
        status: "error",
        message: "Upload failed due to network error",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    // No separate "finally setUploading(false)" needed — every branch
    // above already sets a final status, so there's no dangling flag.
  };

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const { conversations, refresh } = useConversations();

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-[#e0e0e0] font-sans overflow-hidden relative">

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${sidebarOpen ? 'w-[280px] translate-x-0' : 'w-[280px] -translate-x-full md:w-0 md:translate-x-0'} fixed md:relative z-40 h-full flex-shrink-0 flex flex-col bg-[#111111] border-r border-white/10 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="">
            <Image src="/logo.png" alt="Nemesys" width={200} height={50} className="h-13 w-auto rounded-full" />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-[#666] hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="p-4">
          <button onClick={() => { setScanState({ status: "idle" }); router.push('/dashboard'); }} className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-all shadow-sm group">
            <Plus size={16} className="text-[#aaa] group-hover:text-white transition-colors" />
            <span>New Conversation</span>
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#0d0d0d] border border-white/5 rounded-md py-1.5 pl-8 pr-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-[2px]">
          <div className="px-3 pb-2 pt-1 text-[10px] font-bold text-[#555] uppercase tracking-widest">Recent</div>
          {conversations.map(chat => (
            <div key={chat._id} onClick={() => router.push(`/dashboard?id=${chat._id}`)} className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors">
              <MessageSquare size={14} className="text-[#666] group-hover:text-white transition-colors" />
              <div className="flex-1 min-w-0 flex justify-between items-center">
                <div className="text-sm text-[#aaa] group-hover:text-white truncate transition-colors">{chat.title}</div>
                <div className="text-[10px] text-[#555] whitespace-nowrap ml-2">{getRelativeTime(chat.lastMessageAt || chat.updatedAt)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#141414]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {session?.user?.image ? (
                <img src={session?.user?.image} alt="User" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-white/10 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#262626] border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                  {session?.user?.name?.[0] || 'U'}
                </div>
              )}
              <div className="truncate">
                <div className="text-sm text-white font-medium truncate leading-tight">{session?.user?.name || 'Developer'}</div>
                <div className="text-xs text-[#666] truncate">{session?.user?.email || 'user@nemesys.io'}</div>
              </div>
            </div>
            <button onClick={() => signOut()} className="p-2 text-[#666] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-md transition-all" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative bg-[#050505]">
        {!sidebarOpen && (
          <div className="absolute top-5 left-5 z-20">
            <button onClick={() => setSidebarOpen(true)} className="p-2 bg-[#111] border border-white/10 rounded-md text-[#888] hover:text-white transition-all shadow-lg hover:bg-white/5">
              <Menu size={18} />
            </button>
          </div>
        )}

        <div className={`flex-1 flex flex-col items-center ${scanState.status === 'success' ? 'justify-start overflow-y-auto' : 'justify-center overflow-hidden'} p-4 md:p-8 relative`}>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan rounded-full blur-[120px]" />
          </div>

          <div className="max-w-4xl w-full flex flex-col items-center text-center z-10">

            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <KineticTextLoader />
                {scanState.status === "filtering" && (
                  <>
                    <KineticTextLoader />
                    <p className="text-sm text-[#666]">
                      Processing {scanState.processed.toLocaleString()} / {scanState.total.toLocaleString()} files…
                    </p>
                  </>
                )}

              </div>
            ) : scanState.status === "success" ? (
              <FindingsView scanState={scanState} onNewScan={() => setScanState({ status: "idle" })} />
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-light text-white mb-4 tracking-wide px-4">What would you like to build today?</h1>
                <p className="text-[#fffefe] text-sm md:text-base mb-2 max-w-2xl font-light px-4">
                  Start a new session by importing your existing project from GitHub or uploading a folder directly to the Antigravity console.
                </p>
                <p className="text-[#fefefe] text-xs mb-8 max-w-2xl px-4">
                  For large projects, your browser may ask you to confirm the upload before scanning begins — this is normal.
                </p>

                {scanState.status === "error" && (
                  <div className="mb-6 px-4 py-2 rounded-lg text-sm w-full max-w-2xl text-center bg-red-500/10 text-red-400 border border-red-500/20">
                    {scanState.message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl px-4">
                  <button
                    onClick={() => setGithubModalOpen(true)}
                    className="group relative flex flex-col items-center p-8 md:p-10 bg-[#0d0d0d] border border-white/10 hover:border-neon-purple/50 rounded-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] text-left overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-16 h-16 bg-[#161616] rounded-xl flex items-center justify-center border border-white/5 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <svg className="text-[#aaa] group-hover:text-neon-purple transition-colors duration-300" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2 text-center">Import from GitHub</h3>
                    <p className="text-[#666] text-sm text-center leading-relaxed">
                      Connect your GitHub account and instantly import repositories for deep analysis.
                    </p>
                  </button>

                  <button
                    onClick={handleUploadClick}
                    className="group relative flex flex-col items-center justify-center p-8 md:p-10 bg-[#0d0d0d] border border-white/10 hover:border-neon-cyan/50 rounded-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] text-left overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-16 h-16 bg-[#161616] rounded-xl flex items-center justify-center border border-white/5 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Upload size={32} className="text-[#aaa] group-hover:text-neon-cyan transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2 text-center">Upload Folder</h3>
                    <p className="text-[#666] text-sm text-center leading-relaxed">
                      Select a local folder on your machine to begin local inspection and code review.
                    </p>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* GitHub import modal */}
      {githubModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setGithubModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-white mb-1">Import from GitHub</h3>
            <p className="text-sm text-[#888] mb-4">
              Paste a link to a public repository to begin analysis.
            </p>
            <input
              type="text"
              autoFocus
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGithubImport();
              }}
              placeholder="https://github.com/owner/repo"
              className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-all mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setGithubModalOpen(false)}
                className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGithubImport}
                disabled={!repoUrl.trim()}
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-lg text-white transition-all"
              >
                Scan Repository
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moved outside the button — an <input> nested inside a <button> is
          invalid HTML (interactive content can't contain interactive
          content). Same ref-based click trigger, just structurally correct. */}
      <input
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}