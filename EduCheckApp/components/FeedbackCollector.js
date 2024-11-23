import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from '../utils/axiosConfig';
import ErrorMessage from './ErrorMessage';

function FeedbackCollector({ contextType, contextId }) {
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    category: contextType
  });
  const [submissionStatus, setSubmissionStatus] = useState({
    success: false,
    error: null
  });

  const handleRatingChange = (value) => {
    setFeedback(prev => ({ ...prev, rating: value }));
  };

  const handleCommentChange = (e) => {
    setFeedback(prev => ({ ...prev, comment: e.target.value }));
  };

  const submitFeedback = async () => {
    try {
      const payload = {
        ...feedback,
        contextId,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post('/feedback/submit', payload);
      
      setSubmissionStatus({
        success: true,
        error: null
      });

      // 重置表单
      setFeedback({
        rating: 0,
        comment: '',
        category: contextType
      });
    } catch (error) {
      setSubmissionStatus({
        success: false,
        error: '反馈提交失败，请稍后重试'
      });
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map(star => (
      <motion.span
        key={star}
        onClick={() => handleRatingChange(star)}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        style={{ 
          color: star <= feedback.rating ? '#FFD700' : '#E0E0E0',
          cursor: 'pointer',
          fontSize: '24px',
          margin: '0 2px'
        }}
      >
        ★
      </motion.span>
    ));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="feedback-collector"
    >
      <h3>您的反馈很重要</h3>
      
      <div className="rating-section">
        <label>评分：</label>
        {renderStars()}
      </div>

      <div className="comment-section">
        <label>详细评价：</label>
        <textarea
          value={feedback.comment}
          onChange={handleCommentChange}
          placeholder="请分享您的详细体验和建议"
          rows={4}
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={submitFeedback}
        disabled={feedback.rating === 0}
        className={`submit-btn ${feedback.rating === 0 ? 'disabled' : ''}`}
      >
        提交反馈
      </motion.button>

      {submissionStatus.success && (
        <div className="success-message">
          感谢您的反馈！我们会认真听取并持续改进
        </div>
      )}

      {submissionStatus.error && (
        <ErrorMessage message={submissionStatus.error} />
      )}
    </motion.div>
  );
}

export default FeedbackCollector;
