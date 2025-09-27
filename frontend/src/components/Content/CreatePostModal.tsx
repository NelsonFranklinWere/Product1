import React, { useState } from 'react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { content: string; platforms: string[]; scheduledFor: Date }) => Promise<void> | void;
}

const PLATFORMS = ['facebook', 'instagram', 'linkedin'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook']);
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const date = scheduledFor ? new Date(scheduledFor) : new Date();
      await onCreate({ content, platforms: selectedPlatforms, scheduledFor: date });
      onClose();
      setContent('');
      setSelectedPlatforms(['facebook']);
      setScheduledFor('');
    } catch (err: any) {
      setError(err?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h3>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              className="w-full border rounded-md p-2 h-28"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
            <div className="flex gap-3 flex-wrap">
              {PLATFORMS.map(p => (
                <label key={p} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(p)}
                    onChange={() => togglePlatform(p)}
                  />
                  <span className="capitalize">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Time</label>
            <input
              type="datetime-local"
              className="border rounded-md p-2 w-full"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="px-4 py-2 rounded-md border" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


