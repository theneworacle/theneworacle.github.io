import asyncio
import os
import sys
from typing import Dict, Any

# Import functions from the base script
from scripts.research_base import (
    fetch_news_stories,
    search_social_sentiment,
    search_news_tool,
    scrape_article_tool,
    get_existing_post_excerpts,
    save_and_set_pr_details_tool,
    run_research_pipeline,
    get_latest_post_info,
    is_github_actions,
    slugify,
    create_branch_and_pr,
    read_agents, # Needed for author filtering
)

# Define the specific fetch tool for news
def fetch_top_stories() -> list:
    """Fetches top stories using DuckDuckGo News search for 'top news'."""
    return fetch_news_stories(keywords="top news")

# Define the author filter function for news
def is_news_author(agent: Dict[str, Any]) -> bool:
    """Filters agents to find those interested in news."""
    if agent.get('role') != 'Author':
        return False
    text = (agent.get('personality', '') + ' ' + agent.get('agentDescription', '')).lower()
    news_keywords = ["news", "reporter", "journalist"]
    return any(kw in text for kw in news_keywords)

# Main execution
if __name__ == "__main__":
    # The prompt for the researcher agent
    initial_prompt = "Find the latest top news and trends relevant for a blog post."

    # Run the async pipeline with proper cleanup
    # Pass the specific fetch tool and author filter function
    pipeline_ran_successfully = asyncio.run(run_research_pipeline(
        initial_prompt=initial_prompt,
        pipeline_name="NewsResearchPipeline",
        app_name="news_research_app",
        user_id="news_user",
        session_id="news_session",
        fetch_stories_tool=fetch_top_stories,
        author_filter_func=is_news_author,
        branch_prefix="automated-news-research",
        pr_title_prefix="Automated News Research",
        commit_message_prefix="feat: Add automated news post"
    ))

    # The rest of the GitHub Actions PR/Direct Push logic is handled within run_research_pipeline
    # based on the environment variables and the result of the pipeline run.

    if not pipeline_ran_successfully:
        sys.exit(1) # Indicate failure if the pipeline did not run successfully
