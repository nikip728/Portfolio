import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateProjectDescription } from '../../services/gemini';

interface GeminiGeneratorProps {
  currentTitle: string;
  currentTags: string;
  onGenerate: (description: string) => void;
}

export const GeminiGenerator: React.FC<GeminiGeneratorProps> = ({ currentTitle, currentTags, onGenerate }) => {
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!currentTitle) {
      setError("Please add a Project Title first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const tagsArray = currentTags.split(',').map(t => t.trim()).filter(Boolean);
      const desc = await generateProjectDescription(currentTitle, tagsArray, features);
      onGenerate(desc);
      setIsOpen(false);
      setFeatures("");
    } catch (err) {
      setError("Failed to generate. Ensure API Key is valid.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <Sparkles size={14} />
        Generate with AI
      </button>
    );
  }

  return (
    <div className="mt-2 p-4 bg-slate-800 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
          <Sparkles size={14} /> AI Description Assistant
        </h4>
        <button 
          onClick={() => setIsOpen(false)} 
          className="text-slate-500 hover:text-slate-300 text-xs"
        >
          Cancel
        </button>
      </div>
      
      <p className="text-xs text-slate-400 mb-3">
        Enter some key features or bullet points, and Gemini will write a polished paragraph for you.
      </p>

      <textarea
        className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
        rows={3}
        placeholder="e.g. Real-time updates, Redux for state management, 99 Lighthouse score..."
        value={features}
        onChange={(e) => setFeatures(e.target.value)}
      />

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium rounded-md shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Description
          </>
        )}
      </button>
    </div>
  );
};