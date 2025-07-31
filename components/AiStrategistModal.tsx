
import React, { useState, useEffect, useCallback } from 'react';
import { Match } from '../types';
import { getStrategy } from '../services/geminiService';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface AiStrategistModalProps {
  match: Match;
  onClose: () => void;
}

const AiStrategistModal: React.FC<AiStrategistModalProps> = ({ match, onClose }) => {
  const [strategy, setStrategy] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchStrategy = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);
      const result = await getStrategy(match);
      setStrategy(result);
    } catch (err) {
      console.error(err);
      setError('Failed to get a strategy from the AI. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [match]);

  useEffect(() => {
    fetchStrategy();
  }, [fetchStrategy]);

  const renderContent = () => {
    if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              <p className="mt-4 text-gray-300">AI is thinking...</p>
          </div>
      );
    }
    if (error) {
      return <p className="text-red-400 text-center">{error}</p>;
    }
    return <p className="text-gray-300 whitespace-pre-wrap">{strategy}</p>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 border border-cyan-500/50 rounded-xl shadow-2xl shadow-cyan-500/20 w-full max-w-2xl transform transition-all">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-cyan-400">AI Match Strategist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-2">Strategy for: <span className="text-white">{match.title} ({match.gameMode} / {match.subMode} on {match.map})</span></h3>
          <div className="bg-gray-900 p-4 rounded-lg max-h-96 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-b-xl flex justify-end">
            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default AiStrategistModal;