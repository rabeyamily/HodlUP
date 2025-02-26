import React from "react";
import "../styles/SentimentAnalysis.css";

const SentimentAnalysis = ({ sentimentData }) => {
  const getSentimentColor = (score) => {
    if (score > 0.05) return "#4CAF50";
    if (score < -0.05) return "#f44336";
    return "#FFA726";
  };

  return (
    <div className="sentiment-analysis">
      <h2>Cryptocurrency Sentiment Analysis</h2>
      {sentimentData.map((post, index) => (
        <div key={index} className="sentiment-post">
          <div className="post-header">
            <h3>{post.title}</h3>
            <div className="sentiment-score" 
                 style={{color: getSentimentColor(post.title_sentiment)}}>
              Post Sentiment: {post.title_sentiment.toFixed(2)}
            </div>
          </div>
          
          <div className="comments">
            {post.comments.map((comment, idx) => (
              <div key={idx} className="comment">
                <p>{comment.body}</p>
                <div className="sentiment-details">
                  <span style={{color: getSentimentColor(comment.sentiment_score)}}>
                    {comment.sentiment} ({comment.sentiment_score.toFixed(2)})
                  </span>
                  <div className="sentiment-breakdown">
                    <div>Positive: {(comment.detail.pos * 100).toFixed(1)}%</div>
                    <div>Neutral: {(comment.detail.neu * 100).toFixed(1)}%</div>
                    <div>Negative: {(comment.detail.neg * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SentimentAnalysis;