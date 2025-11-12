import { useState } from 'react';
import { api } from './api';
import type { OnboardingResponse } from './types';

interface OnboardingProps {
  onComplete: (response: OnboardingResponse) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [goal, setGoal] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal.trim()) {
      setError('请输入您的目标');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.completeOnboarding({
        username: username.trim() || undefined,
        goal: goal.trim(),
      });
      onComplete(response);
    } catch (err) {
      setError('生成计划失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🥬</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            欢迎来到 Cabbage
          </h1>
          <p className="text-lg text-gray-600">
            您的 AI 智能日程规划助手
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              您的昵称（可选）
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入您的昵称"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              您的目标是什么？
            </label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="例如：考公、学习编程、准备考研、提升英语..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
              disabled={loading}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              告诉我们您的目标，AI 将为您生成个性化的待办清单
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !goal.trim()}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-[1.02]"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI 正在生成您的专属计划...
              </span>
            ) : (
              '开始规划我的目标'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">示例目标：</h3>
          <div className="grid grid-cols-2 gap-2">
            {['考公', '学习编程', '准备考研', '提升英语', '减肥健身', '学习日语'].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setGoal(example)}
                disabled={loading}
                className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
