import { useEffect, useState } from 'react';
import { getQueue, generateComment, approveComment, skipPost } from '../services/api';
import { MessageSquare, ThumbsUp, ThumbsDown, RotateCw, ExternalLink } from 'lucide-react';

function Queue() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [generatedComment, setGeneratedComment] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editedComment, setEditedComment] = useState('');

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await getQueue({ status: 'queued', limit: 50 });
      setPosts(res.data.rows);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const handleGenerate = async (post, isPromotional = null) => {
    setGenerating(true);
    setSelectedPost(post);
    try {
      const res = await generateComment(post.id, { isPromotional });
      setGeneratedComment(res.data);
      setEditedComment(res.data.comment);
    } catch (error) {
      console.error('Error generating comment:', error);
      alert('Error generating comment');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveComment({
        postId: selectedPost.id,
        commentText: editedComment,
        isPromotional: generatedComment.isPromotional
      });
      alert('Comment approved! It will be posted soon.');
      setSelectedPost(null);
      setGeneratedComment(null);
      fetchQueue();
    } catch (error) {
      console.error('Error approving comment:', error);
      alert('Error approving comment');
    }
  };

  const handleSkip = async (postId) => {
    try {
      await skipPost(postId);
      fetchQueue();
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
        setGeneratedComment(null);
      }
    } catch (error) {
      console.error('Error skipping post:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Queue</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Queued Posts ({posts.length})</h2>
          
          <div className="space-y-3 max-h-[800px] overflow-y-auto">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`bg-gray-800 rounded-lg p-4 border cursor-pointer transition-colors ${
                  selectedPost?.id === post.id
                    ? 'border-blue-500 bg-gray-750'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold flex-1 mr-2">
                    {post.title}
                  </h3>
                  <span className="badge badge-info text-xs whitespace-nowrap">
                    {(post.relevanceScore * 100).toFixed(0)}%
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                  {post.body || 'No additional text'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>r/{post.subreddit?.name}</span>
                  <div className="flex items-center gap-3">
                    <span>↑ {post.upvotes}</span>
                    <span>💬 {post.numComments}</span>
                  </div>
                </div>

                {post.matchedKeywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.matchedKeywords.slice(0, 3).map((kw, i) => (
                      <span key={i} className="badge badge-success text-xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {posts.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No posts in queue. Add subreddits and wait for scanning.
              </div>
            )}
          </div>
        </div>

        {/* Comment Generator */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-6">
          {selectedPost ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-white">Generate Comment</h2>
                <a
                  href={selectedPost.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink size={20} />
                </a>
              </div>

              <div className="bg-gray-700 rounded p-3">
                <p className="text-white font-semibold mb-1">{selectedPost.title}</p>
                <p className="text-gray-400 text-sm">
                  {selectedPost.body?.substring(0, 200)}
                  {selectedPost.body?.length > 200 && '...'}
                </p>
              </div>

              {!generatedComment ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleGenerate(selectedPost, true)}
                    disabled={generating}
                    className="btn-primary w-full"
                  >
                    {generating ? 'Generating...' : 'Generate Promotional Comment'}
                  </button>
                  <button
                    onClick={() => handleGenerate(selectedPost, false)}
                    disabled={generating}
                    className="btn-secondary w-full"
                  >
                    Generate Helpful Comment (No Promotion)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedComment.warning && (
                    <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-3 py-2 rounded text-sm">
                      ⚠️ {generatedComment.warning}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Generated Comment {generatedComment.isPromotional && '(Promotional)'}
                    </label>
                    <textarea
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      className="input-field"
                      rows={8}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleApprove} className="btn-primary flex-1">
                      <ThumbsUp size={18} className="inline mr-2" />
                      Approve & Queue
                    </button>
                    <button
                      onClick={() => handleGenerate(selectedPost, generatedComment.isPromotional)}
                      className="btn-secondary"
                    >
                      <RotateCw size={18} />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleSkip(selectedPost.id)}
                className="btn-danger w-full"
              >
                <ThumbsDown size={18} className="inline mr-2" />
                Skip This Post
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a post from the queue to generate a comment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Queue;
