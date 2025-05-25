import React, { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, Reply, MoreVertical, Flag, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const CommentsSection = ({ articleId, articleSlug }) => {
  const { toast } = useToast();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/news/${articleSlug}/comments`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to post comments',
        variant: 'default'
      });
      return;
    }

    if (!commentText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/news/${articleSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: commentText,
          parent_id: replyingTo
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCommentText('');
        setReplyingTo(null);
        loadComments();
        toast({
          title: 'Success',
          description: 'Comment posted successfully',
          variant: 'default'
        });
      } else {
        throw new Error(data.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to post comment',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to like comments',
        variant: 'default'
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        loadComments();
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const [showReplies, setShowReplies] = useState(true);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${depth > 0 ? 'ml-12 mt-4' : 'mb-6'}`}
      >
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            {comment.user_avatar ? (
              <img
                src={comment.user_avatar}
                alt={comment.user_name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-white">{comment.user_name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-gray-300 mb-3">{comment.content}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center gap-1 transition-colors ${
                    comment.user_liked 
                      ? 'text-purple-400' 
                      : 'text-gray-400 hover:text-purple-400'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {comment.likes_count > 0 && comment.likes_count}
                </button>
                
                {depth < 2 && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-purple-400"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </button>
                )}
                
                <button className="flex items-center gap-1 text-gray-400 hover:text-red-400">
                  <Flag className="h-4 w-4" />
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {hasReplies && showReplies && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
        
        {hasReplies && depth === 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-purple-400 text-sm mt-2 ml-12"
          >
            {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <section className="mt-16 pt-8 border-t border-zinc-800">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="bg-zinc-800 rounded-lg p-4">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Share your thoughts..."}
              className="bg-zinc-900 border-zinc-700 text-white mb-3 min-h-[100px]"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {replyingTo && (
                  <span>
                    Replying to comment •{' '}
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      Cancel
                    </button>
                  </span>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-800 rounded-lg p-6 text-center mb-8">
          <p className="text-gray-400 mb-4">Please login to join the discussion</p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Login to Comment
          </Button>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-700"></div>
                <div className="flex-1">
                  <div className="h-4 bg-zinc-700 rounded w-32 mb-2"></div>
                  <div className="h-20 bg-zinc-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentsSection;