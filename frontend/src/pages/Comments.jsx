import { useEffect, useState } from 'react';
import { getComments, postComment, deleteComment } from '../services/api';
import { Send, Trash2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

function Comments() {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await getComments(params);
      setComments(res.data.rows);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePost = async (id) => {
    if (window.confirm('Post this comment to Reddit?')) {
      try {
        await postComment(id);
        alert('Comment posted successfully!');
        fetchComments();
      } catch (error) {
        console.error('Error posting comment:', error);
        alert('Error posting comment');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await deleteComment(id);
        fetchComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-info',
      posted: 'badge-success',
      failed: 'badge-danger',
      skipped: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Comments</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="posted">Posted</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${getStatusBadge(comment.status)}`}>
                    {comment.status}
                  </span>
                  {comment.isPromotional && (
                    <span className="badge badge-warning text-xs">Promotional</span>
                  )}
                  <span className="text-gray-500 text-sm">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-1">
                  {comment.post?.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  r/{comment.post?.subreddit?.name} • u/{comment.account?.username}
                </p>
              </div>
              <div className="flex gap-2">
                {comment.status === 'approved' && (
                  <button
                    onClick={() => handlePost(comment.id)}
                    className="text-green-400 hover:text-green-300"
                    title="Post now"
                  >
                    <Send size={20} />
                  </button>
                )}
                {comment.permalink && (
                  <a
                    href={comment.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                    title="View on Reddit"
                  >
                    <ExternalLink size={20} />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-400 hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="bg-gray-700 rounded p-4 mb-3">
              <p className="text-white whitespace-pre-wrap">{comment.commentText}</p>
            </div>

            {comment.status === 'posted' && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-400 flex items-center">
                  <CheckCircle size={16} className="mr-1" />
                  ↑ {comment.upvotes || 0}
                </span>
                {comment.isRemoved && (
                  <span className="text-red-400 flex items-center">
                    <XCircle size={16} className="mr-1" />
                    Removed
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No comments found
          </div>
        )}
      </div>
    </div>
  );
}

export default Comments;
