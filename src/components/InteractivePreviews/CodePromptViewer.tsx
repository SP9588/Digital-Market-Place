import React, { useState } from 'react';
import { Code, Copy, Check, Terminal, Sparkles } from 'lucide-react';

interface CodePromptViewerProps {
  title: string;
  codeSnippet?: string;
  isAiPrompt?: boolean;
}

export const CodePromptViewer: React.FC<CodePromptViewerProps> = ({
  title,
  codeSnippet = '// Sample Code or Prompt Snippet',
  isAiPrompt = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = codeSnippet.split('\n');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-xs font-mono">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAiPrompt ? (
            <Sparkles className="w-4 h-4 text-purple-400" />
          ) : (
            <Terminal className="w-4 h-4 text-emerald-400" />
          )}
          <span className="font-sans font-medium text-slate-200">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans text-xs">Copy Snippet</span>
            </>
          )}
        </button>
      </div>

      {/* Code Block */}
      <div className="p-4 bg-slate-950/90 max-h-60 overflow-y-auto text-slate-300 leading-relaxed">
        <table className="w-full text-left border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-900/60">
                <td className="w-8 select-none text-slate-600 text-right pr-4 font-mono text-[11px]">
                  {idx + 1}
                </td>
                <td className="whitespace-pre-wrap break-all text-slate-200">
                  {line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
