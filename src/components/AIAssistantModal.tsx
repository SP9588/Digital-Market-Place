import React, { useState } from 'react';
import { Sparkles, X, Send, Compass, ArrowRight, Bot } from 'lucide-react';
import { CategoryId } from '../types/marketplace';

interface AIAssistantModalProps {
  onClose: () => void;
  onSelectCategory: (catId: CategoryId) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  onClose,
  onSelectCategory,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<CategoryId[]>([]);

  const handleAskAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setAiResponse(data.response || 'I recommend checking out our template and asset categories.');
      setSuggestedCategories(data.suggestedCategories || ['templates', 'software', 'ai_products']);
    } catch (err) {
      setAiResponse('Open Ocean AI Assistant is ready. Browse our 24 marketplace categories for your project needs!');
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'I need a complete brand launch kit: logo, Lightroom presets, and Next.js website template.',
    'I am creating a cyberpunk indie video game. Recommend 3D models, audio loops, and UI packs.',
    'I want Notion templates for client CRM and automated Gemini AI prompt libraries.',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm text-white">Open Ocean Gemini AI Asset Finder</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Describe what you are building, creating, or marketing. Open Ocean AI will analyze your project needs and curate matching digital assets from our 24 taxonomy categories.
          </p>

          {/* Quick Prompts */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
              Sample Project Queries:
            </p>
            <div className="space-y-1">
              {samplePrompts.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(sp)}
                  className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-purple-900/20 text-slate-300 hover:text-purple-300 border border-slate-800/80 text-xs transition-colors cursor-pointer line-clamp-1"
                >
                  "{sp}"
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleAskAssistant} className="space-y-3">
            <div className="relative">
              <textarea
                rows={3}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What digital products are you looking for today? (e.g. 3D game models, eBooks, audio sample packs, Figma UI kits...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-3 bottom-3 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Find Assets</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Output Response */}
          {aiResponse && (
            <div className="p-4 bg-slate-950 rounded-xl border border-purple-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                <span>Open Ocean AI Asset Recommendations</span>
              </div>
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {aiResponse}
              </div>

              {suggestedCategories.length > 0 && (
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Suggested Categories:
                  </span>
                  {suggestedCategories.map((catId) => (
                    <button
                      key={catId}
                      onClick={() => {
                        onSelectCategory(catId);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold border border-purple-500/40 cursor-pointer flex items-center gap-1"
                    >
                      <Compass className="w-3 h-3" />
                      <span>{catId}</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
