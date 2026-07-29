import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Compass,
  ThumbsUp,
  Plus,
  Search,
  Sparkles,
  Clock,
  Calendar,
  Layers,
  Tag,
  Send,
  Boxes,
  Cpu,
  ChevronUp,
  Check,
  Filter,
} from 'lucide-react';
import { RoadmapItem, RoadmapStatus, RoadmapCategory } from '../types/marketplace';
import { INITIAL_ROADMAP_ITEMS } from '../data/mockRoadmap';

export const MarketplaceGovernance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compliance' | 'payment' | 'roadmap'>('roadmap');

  // Roadmap State & Local Storage Persistence
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(() => {
    try {
      const saved = localStorage.getItem('open_ocean_roadmap');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ROADMAP_ITEMS;
  });

  const [votedIds, setVotedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('open_ocean_user_roadmap_votes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['rd-1', 'rd-3']; // Default votes for demonstration
  });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoadmapStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RoadmapCategory | 'all'>('all');

  // Modal / Form state for submitting a request
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<RoadmapCategory>('category_request');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('open_ocean_roadmap', JSON.stringify(roadmapItems));
  }, [roadmapItems]);

  useEffect(() => {
    localStorage.setItem('open_ocean_user_roadmap_votes', JSON.stringify(votedIds));
  }, [votedIds]);

  // Handle Toggle Vote
  const handleToggleVote = (id: string) => {
    const hasVoted = votedIds.includes(id);

    if (hasVoted) {
      setVotedIds((prev) => prev.filter((vId) => vId !== id));
      setRoadmapItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, votes: Math.max(0, item.votes - 1) } : item))
      );
    } else {
      setVotedIds((prev) => [...prev, id]);
      setRoadmapItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item))
      );
    }
  };

  // Handle Submit New Proposal
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const newItem: RoadmapItem = {
      id: `rd-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      type: newType,
      status: 'under_review',
      votes: 1, // Auto-upvote creator's request
      estimatedQuarter: 'Q4 2026',
      tags: newTags
        ? newTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : ['Community Request'],
      submittedBy: newAuthor.trim() || 'Community Creator',
    };

    setRoadmapItems((prev) => [newItem, ...prev]);
    setVotedIds((prev) => [...prev, newItem.id]);

    setNewTitle('');
    setNewDescription('');
    setNewTags('');
    setNewAuthor('');
    setSubmitSuccessNotice('Your feature/category request has been submitted to the community roadmap!');
    setTimeout(() => {
      setSubmitSuccessNotice(null);
      setIsSubmitModalOpen(false);
    }, 3000);
  };

  // Filtered List
  const filteredRoadmap = roadmapItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate Metrics
  const totalVotesCast = roadmapItems.reduce((acc, curr) => acc + curr.votes, 0);
  const inProgressCount = roadmapItems.filter((i) => i.status === 'in_progress').length;
  const categoryRequestCount = roadmapItems.filter((i) => i.type === 'category_request').length;
  const completedCount = roadmapItems.filter((i) => i.status === 'completed').length;

  const getStatusBadge = (status: RoadmapStatus) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1.5 shadow-sm shadow-sky-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span>In Progress</span>
          </span>
        );
      case 'planned':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-400" />
            <span>Planned</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Under Review</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Completed</span>
          </span>
        );
    }
  };

  const getTypeBadge = (type: RoadmapCategory) => {
    switch (type) {
      case 'category_request':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Boxes className="w-3 h-3 text-amber-400" />
            <span>Category Request</span>
          </span>
        );
      case 'platform_feature':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/60 text-sky-400 border border-sky-500/30 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-sky-400" />
            <span>Platform Feature</span>
          </span>
        );
      case 'integration':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>Integration</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-100">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Marketplace Governance & Platform Roadmap
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Open Ocean Platform Architecture & Community Vision
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Explore legal licensing parameters, transparent revenue distribution models, and vote on upcoming platform categories and feature releases.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-center border-b border-slate-800 pb-2">
        <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs gap-1">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'roadmap'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Product Roadmap & Category Votes</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-amber-400 text-slate-950 font-black">
              NEW
            </span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'compliance'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>License Terms Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'payment'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Payment & Settlement Engine</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCT ROADMAP & USER VOTING (PRIMARY FOCUS) */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white font-mono">{totalVotesCast}</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Community Upvotes
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <span className="text-xl font-black text-sky-400 font-mono">{inProgressCount}</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  In Active Dev
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {categoryRequestCount}
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Category Requests
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {completedCount}
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Released Features
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar & Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search upcoming features, categories, tags..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Submit Request Button */}
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-sky-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Suggest Feature / Request Category</span>
              </button>
            </div>

            {/* Filter Pills Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span>Status:</span>
                </span>
                {(
                  [
                    { id: 'all', label: 'All Statuses' },
                    { id: 'in_progress', label: 'In Progress' },
                    { id: 'planned', label: 'Planned' },
                    { id: 'under_review', label: 'Under Review' },
                    { id: 'completed', label: 'Completed' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                      statusFilter === st.id
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold mr-1">Type:</span>
                {(
                  [
                    { id: 'all', label: 'All Types' },
                    { id: 'category_request', label: 'Categories' },
                    { id: 'platform_feature', label: 'Features' },
                    { id: 'integration', label: 'Integrations' },
                  ] as const
                ).map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => setTypeFilter(tp.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                      typeFilter === tp.id
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Roadmap Items Grid */}
          {filteredRoadmap.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoadmap.map((item) => {
                const hasVoted = votedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group"
                  >
                    <div className="space-y-2.5">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {getTypeBadge(item.type)}
                          {getStatusBadge(item.status)}
                        </div>

                        {item.estimatedQuarter && (
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-sky-400" />
                            {item.estimatedQuarter}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-slate-950 text-slate-400 rounded text-[10px] font-mono border border-slate-800 flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-500" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer / Vote Action Bar */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs mt-2">
                      <span className="text-[11px] text-slate-500 font-mono">
                        By <span className="text-slate-300 font-bold">{item.submittedBy || 'Community'}</span>
                      </span>

                      <button
                        onClick={() => handleToggleVote(item.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 border ${
                          hasVoted
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50 hover:text-amber-400'
                        }`}
                      >
                        <ChevronUp className={`w-4 h-4 stroke-[3] ${hasVoted ? 'animate-bounce' : ''}`} />
                        <span>Upvote</span>
                        <span className="font-mono px-1.5 py-0.2 bg-slate-900/60 rounded text-[10px]">
                          {item.votes}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-3">
              <Compass className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Roadmap Items Match Search</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try adjusting your search queries or filter pills, or be the first to suggest a new platform feature!
              </p>
            </div>
          )}

          {/* Submit Suggestion Modal */}
          {isSubmitModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-sky-400" />
                    <h3 className="font-bold text-sm text-white">Submit Feature or Category Proposal</h3>
                  </div>
                  <button
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                {submitSuccessNotice ? (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{submitSuccessNotice}</span>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Proposal Type</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as RoadmapCategory)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="category_request">New Marketplace Category Request</option>
                        <option value="platform_feature">Platform Feature / Tool Request</option>
                        <option value="integration">Third-Party Integration</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Unreal Engine 5 Blueprints & C++ Modules"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Detailed Description</label>
                      <textarea
                        required
                        rows={3}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Describe why this category or feature would benefit creators and buyers..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                          placeholder="UE5, GameDev, Blueprints"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Your Name / Creator Handle</label>
                        <input
                          type="text"
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          placeholder="e.g. Studio_Alpha"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSubmitModalOpen(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Proposal</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LICENSE TERMS MATRIX */}
      {activeTab === 'compliance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl animate-in fade-in duration-300">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-sky-400" />
            Standardized License Terms Matrix
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-sky-400 text-sm">Personal License</h3>
              <p className="text-slate-400 text-[11px]">
                For individual use, personal portfolios, and non-monetized projects.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 1 Personal Project
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Non-commercial
                </li>
                <li className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> No SaaS embedding
                </li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-sky-500/30 space-y-2">
              <h3 className="font-bold text-emerald-400 text-sm">Commercial License</h3>
              <p className="text-slate-400 text-[11px]">
                For commercial client projects, games, apps, and marketing up to 250k copies.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Commercial Use
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Client Work Allowed
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Royalty-Free
                </li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-purple-400 text-sm">Extended License</h3>
              <p className="text-slate-400 text-[11px]">
                For broadcasting, national advertising, and products for resale.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unlimited End Copies
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> TV & Film Sync
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Resale Products
                </li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-amber-400 text-sm">Enterprise License</h3>
              <p className="text-slate-400 text-[11px]">
                Unlimited organizational seats, SaaS integration, and custom terms.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unlimited Seats
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> SaaS Integration
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dedicated Legal Support
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT MODEL */}
      {activeTab === 'payment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl animate-in fade-in duration-300">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Marketplace Payment Flow & Fund Settlement
          </h2>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs text-slate-300">
            <p className="leading-relaxed">
              Open Ocean integrates multiple secure payment gateways (Stripe, Razorpay, PayPal) to support buyers worldwide. All credentials and secret API keys are stored securely on the server and never exposed to client-side code.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-bold text-white block mb-1">1. Buyer Checkout</span>
                <span className="text-[11px] text-slate-400">
                  Payment is securely processed via Stripe, Razorpay, or PayPal.
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-bold text-sky-400 block mb-1">2. Platform Allocation</span>
                <span className="text-[11px] text-slate-400">
                  Open Ocean retains a 10% marketplace commission fee for operations.
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">3. Creator Settlement</span>
                <span className="text-[11px] text-slate-400">
                  90% net earnings are distributed to the seller's connected payout account.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
