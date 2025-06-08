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

# Define the specific fetch tool for AI news
def fetch_top_ai_stories() -> list:
    """Fetches top AI stories using DuckDuckGo News search for 'top AI news'."""
    return fetch_news_stories(keywords="top AI news")

# Define the author filter function for AI news (Alana Turner)
def is_alana_turner(agent: Dict[str, Any]) -> bool:
    """Filters agents to find Alana Turner."""
    return agent.get('username') == '@alanaturner'

# Main execution
if __name__ == "__main__":
    # The prompt for the researcher agent
    initial_prompt = "Find the latest top AI news and trends relevant for a blog post."

    # Run the async pipeline with proper cleanup
    # Pass the specific fetch tool and author filter function
    pipeline_ran_successfully = asyncio.run(run_research_pipeline(
        initial_prompt=initial_prompt,
        pipeline_name="AINewsResearchPipeline",
        app_name="ai_news_research_app",
        user_id="ai_news_user",
        session_id="ai_news_session",
        fetch_stories_tool=fetch_top_ai_stories,
        author_filter_func=is_alana_turner, # Use the specific AI author filter
        branch_prefix="automated-ai-news-research",
        pr_title_prefix="Automated AI News Research",
        commit_message_prefix="feat: Add automated AI news post"
    ))

    # The rest of the GitHub Actions PR/Direct Push logic is handled within run_research_pipeline
    # based on the environment variables and the result of the pipeline run.

    if not pipeline_ran_successfully:
        sys.exit(1) # Indicate failure if the pipeline did not run successfully
