# reddit_scraper.py
import os
import praw
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

# Download required NLTK data
nltk.download('vader_lexicon', quiet=True)

def fetch_reddit_comments_with_sentiment(subreddit_name="cryptocurrency", limit_posts=5, limit_comments=5):
    """
    Fetches Reddit posts and comments with sentiment analysis from a specified subreddit.
    Returns processed data with sentiment scores and labels.
    """
    try:
        sia = SentimentIntensityAnalyzer()
        
        reddit = praw.Reddit(
            client_id=os.getenv("REDDIT_CLIENT_ID"),
            client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
            user_agent=os.getenv("REDDIT_USER_AGENT")
        )

        subreddit = reddit.subreddit(subreddit_name)
        posts_data = []

        for post in subreddit.hot(limit=limit_posts):
            title_sentiment = sia.polarity_scores(post.title)
            
            post_data = {
                "title": post.title,
                "score": post.score,
                "title_sentiment": title_sentiment["compound"],
                "comments": []
            }

            post.comments.replace_more(limit=0)
            for comment in post.comments.list()[:limit_comments]:
                comment_sentiment = sia.polarity_scores(comment.body)
                sentiment_label = "Positive" if comment_sentiment["compound"] > 0.05 \
                                else "Negative" if comment_sentiment["compound"] < -0.05 \
                                else "Neutral"
                
                post_data["comments"].append({
                    "body": comment.body,
                    "sentiment_score": comment_sentiment["compound"],
                    "sentiment": sentiment_label,
                    "detail": {
                        "pos": comment_sentiment["pos"],
                        "neg": comment_sentiment["neg"],
                        "neu": comment_sentiment["neu"]
                    }
                })
            
            posts_data.append(post_data)

        return posts_data
    except Exception as e:
        print(f"Error in fetch_reddit_comments_with_sentiment: {str(e)}")
        return []

# For backward compatibility
fetch_reddit_comments = fetch_reddit_comments_with_sentiment