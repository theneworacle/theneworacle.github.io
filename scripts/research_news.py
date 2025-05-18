import json
import os
import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from datetime import datetime
import hashlib
import google.generativeai as genai
import sys
import uuid
import re
import asyncio # Needed for ADK runner
from typing import List, Union
from dotenv import load_dotenv # Import load_dotenv

# ADK Imports
from google.adk.agents import Agent, SequentialAgent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types # For creating message Content/Parts

# Load environment variables
load_dotenv()

# Configure Google Gemini API Key and Model
GOOGLE_GEMINI_API_KEY = os.environ.get("GOOGLE_GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash-latest") # Default model

# Configure ADK to use API keys directly
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"

def read_agents(agents_file="lib/agents/agents.json"):
    """Reads the agents configuration."""
    try:
        # Adjust path for script execution context if needed, assuming script runs from repo root
        script_dir = os.path.dirname(__file__)
        repo_root = os.path.abspath(os.path.join(script_dir, '..'))
        full_agents_path = os.path.join(repo_root, agents_file)

        with open(full_agents_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Agents file not found at {full_agents_path}")
        return None
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {full_agents_path}")
        return None

# Tools for ADK agents

def fetch_top_stories() -> list:
    """Fetches top stories using DuckDuckGo News search for 'top news'."""
    print("Fetching top stories from DuckDuckGo News...")
    try:
        results = []
        with DDGS() as ddgs:
            for r in ddgs.news(keywords="top news", max_results=10):
                results.append({'title': r['title'], 'url': r['url']})
        return results
    except Exception as e:
        print(f"Error fetching DuckDuckGo top news: {e}")
        return []

def check_if_story_posted(title: str) -> bool:
    """Checks if a story with a similar title has already been posted."""
    posts_dir = "posts/"
    script_dir = os.path.dirname(__file__)
    repo_root = os.path.abspath(os.path.join(script_dir, '..'))
    full_posts_dir = os.path.join(repo_root, posts_dir)
    for root, _, files in os.walk(full_posts_dir):
        for filename in files:
            if filename.endswith('.md'):
                filepath = os.path.join(root, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    if title.lower() in f.read().lower():
                        return True
    return False

def search_social_sentiment(query: str) -> str:
    """Stub: Search social media for sentiment on the topic (to be implemented with real APIs)."""
    # In production, integrate with Twitter/X, Reddit, etc.
    return f"[Simulated social sentiment for '{query}': Mostly positive, some debate.]"

def search_news_tool(query: str) -> str:
    """Searches for news using DuckDuckGo Search and returns a formatted string of results."""
    print(f"Searching news for: {query}")
    results = []
    try:
        with DDGS() as ddgs:
            # Limit results to avoid overwhelming context
            for r in ddgs.news(keywords=query, max_results=5):
                results.append(r)
    except Exception as e:
        print(f"Error during DuckDuckGo search: {e}")
        return f"Error during search: {e}"

    if not results:
        return "No news results found."

    formatted_results = "News Search Results:\n\n"
    for i, r in enumerate(results):
        formatted_results += f"{i+1}. Title: {r['title']}\n   Link: {r['url']}\n   Snippet: {r['body']}\n\n"

    return formatted_results

def scrape_article_tool(url: str) -> str:
    """Scrapes the content of a given URL and returns the text."""
    print(f"Attempting to scrape: {url}")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        soup = BeautifulSoup(response.content, 'html.parser')

        # Attempt to find common article content containers
        article_text = ""
        for tag in ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']:
             for element in soup.find_all(tag):
                 article_text += element.get_text(separator=' ', strip=True) + '\n'

        # Fallback if specific tags don't yield much
        if not article_text.strip():
             article_text = soup.get_text(separator=' ', strip=True)

        print(f"Scraped content length: {len(article_text)}")
        # Limit scraped content length to avoid overwhelming context
        return article_text.strip()[:8000]

    except requests.exceptions.RequestException as e:
        print(f"Error fetching or processing URL {url}: {e}")
        return f"Error scraping {url}: {e}"
    except Exception as e:
        print(f"An unexpected error occurred during scraping {url}: {e}")
        return f"Error scraping {url}: {e}"

def is_duplicate_post_tool(new_content: str) -> bool:
    """Checks if similar content already exists in the posts directory."""
    print("Checking for duplicate posts...")
    new_content_hash = hashlib.md5(new_content.encode('utf-8')).hexdigest()
    posts_dir = "posts/" # Relative to repo root

    # Adjust path for script execution context
    script_dir = os.path.dirname(__file__)
    repo_root = os.path.abspath(os.path.join(script_dir, '..'))
    full_posts_dir = os.path.join(repo_root, posts_dir)

    if not os.path.exists(full_posts_dir):
        print(f"Posts directory not found at {full_posts_dir}. No duplicates to check against.")
        return False

    for filename in os.listdir(full_posts_dir):
        if filename.endswith(".md"):
            filepath = os.path.join(full_posts_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    existing_content = f.read()
                    existing_content_hash = hashlib.md5(existing_content.encode('utf-8')).hexdigest()
                    # Simple hash comparison - can be improved with more sophisticated methods
                    if new_content_hash == existing_content_hash:
                        print(f"Duplicate found: {filename}")
                        return True
            except Exception as e:
                print(f"Error reading file {filepath} for duplicate check: {e}")
                continue
    print("No duplicates found.")
    return False

def generate_slug(title: str) -> str:
    # Convert to lowercase
    slug = title.lower()
    # Remove non-alphanumeric characters (except for hyphens and spaces)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace spaces and hyphens with a single hyphen
    slug = re.sub(r'[\s-]+', '-', slug)
    # Trim hyphens from the start and end
    slug = slug.strip('-')
    return slug

def save_and_set_pr_details_tool(title: str, excerpt: str, content: str, tags: List[str], sources: List[str]) -> str:
    """Saves the markdown content to a file and sets GitHub Actions PR environment variables."""
    posts_dir = "posts/" # Relative to repo root

    # Adjust path for script execution context
    script_dir = os.path.dirname(__file__)
    repo_root = os.path.abspath(os.path.join(script_dir, '..'))
    full_posts_dir = os.path.join(repo_root, posts_dir)

    if not os.path.exists(full_posts_dir):
        os.makedirs(full_posts_dir)

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    # Attempt to extract a title from the markdown for the filename
    title_line = next((line for line in content.split('\n') if line.strip().startswith('# ')), None)
    if title_line:
        # Sanitize title for filename
        title_slug = title_line.replace('# ', '').strip()
        title_slug = "".join([c for c in title_slug if c.isalnum() or c in (' ', '-')]).rstrip()
        title_slug = title_slug.replace(' ', '-').lower()[:50] # Limit length
        filename = f"{timestamp}-{title_slug}.md"
    else:
        # Use date for folder, slug for filename
        date_folder = datetime.utcnow().strftime('%Y%m%d')
        title_slug = generate_slug(title)[:50]  # Limit slug length to 50 chars
        filename = f"{title_slug}.md"
        dated_posts_dir = os.path.join(full_posts_dir, date_folder)
        if not os.path.exists(dated_posts_dir):
            os.makedirs(dated_posts_dir)
        filepath = os.path.join(dated_posts_dir, filename)

    try:
        # Read all agents and filter for lead authors
        agents = read_agents()
        lead_authors = [a for a in agents if a.get('role') == 'Author'] if agents else []
        # Filter lead authors interested in news
        news_keywords = ["news", "reporter", "journalist"]
        def is_news_author(agent):
            if agent.get('role') != 'Author':
                return False
            text = (agent.get('personality', '') + ' ' + agent.get('agentDescription', '')).lower()
            return any(kw in text for kw in news_keywords)
        news_authors = [a for a in lead_authors if is_news_author(a)]
        authors_yaml = '\n'.join([
            f"  - username: '{a['username']}'\n    name: '{a['name']}'" for a in news_authors
        ]) if news_authors else ''
        # Compose YAML frontmatter (no agentId)
        frontmatter = f"""---\ntitle: \"{title}\"\nauthors:\n{authors_yaml}\ndate: \"{datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')}\"\nsummary: \"{excerpt}\"\ntags: {json.dumps(tags)}\n---\n\n"""
        # Write frontmatter + content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(frontmatter)
            f.write(content.strip() + "\n")
        print(f"Successfully saved post to {filepath}")

        # Set environment variables for the next GitHub Actions step (Create Pull Request)
        # This requires the workflow to use `run: |` and `>> $GITHUB_OUTPUT`
        # We write to $GITHUB_OUTPUT file
        if 'GITHUB_OUTPUT' in os.environ:
            with open(os.environ['GITHUB_OUTPUT'], 'a') as gh_output:
                print(f"BRANCH_NAME=automated-news-research-{timestamp}", file=gh_output)
                print(f"PR_TITLE=Automated News Research: {title_slug if title_line else 'New Post'}", file=gh_output)
                # Use a delimiter for multi-line body
                print("PR_BODY<<EOF", file=gh_output)
                print(f"This PR contains a new news research post generated by the automated workflow.\n\n## Post Content:\n\n{content}", file=gh_output)
                print("EOF", file=gh_output)
            print("PR details written to GITHUB_OUTPUT.")
        else:
            print("GITHUB_OUTPUT not available. PR details not written.")
            print(f"BRANCH_NAME=automated-news-research-{timestamp}")
            print(f"PR_TITLE=Automated News Research: {title_slug if title_line else 'New Post'}")
            print(f"PR_BODY=This PR contains a new news research post generated by the automated workflow.\n\n## Post Content:\n\n{content}")


        return f"Post saved to {filepath} and PR details set."
    except Exception as e:
        print(f"Error saving file {filepath}: {e}")
        return f"Error saving file: {e}"

def pick_unpublished_top_story() -> dict:
    """Fetches top stories and returns the first one that hasn't been posted yet."""
    stories = fetch_top_stories()
    for story in stories:
        if not check_if_story_posted(story['title']):
            return story
    return {}  # Return empty dict if all are posted

# Define agents for the SequentialAgent pipeline
# Pass agents_data to the writer agent's instruction or make it read it internally
# Reading internally is simpler for this structure.

lead_author_agent = Agent(
    name="lead_author",
    model=GEMINI_MODEL,
    description="Lead author who selects top stories from DuckDuckGo News, checks for duplicates, and assigns research tasks.",
    instruction="You are the lead author. Use pick_unpublished_top_story to select the first top story that hasn't been posted yet. Hand it to the researcher agent to gather more information from other news sources and social media sentiment. Wait for the researcher's findings before writing your draft.",
    tools=[pick_unpublished_top_story],
    output_key="selected_story"
)

researcher_agent = Agent(
    name="researcher",
    model=GEMINI_MODEL,
    description="Researcher who gathers more information and social sentiment for a given story.",
    instruction="You are the researcher. Given a story (title and url), use search_news_tool, scrape_article_tool, and search_social_sentiment to gather more information from other news sources and social media. Summarize your findings for the lead author.",
    tools=[search_news_tool, scrape_article_tool, search_social_sentiment],
    output_key="research_findings"
)

writer_agent = Agent(
    name="writer",
    model=GEMINI_MODEL,
    description="Writer who drafts the blog post based on research findings.",
    instruction="You are the writer. Use the research findings to write a compelling, well-structured blog post in markdown. Include title, excerpt, content, tags, and sources. Output a JSON string with these fields.",
    tools=[],
    output_key="blog_post_json_string"
)

reviewer_agent = Agent(
    name="reviewer",
    model=GEMINI_MODEL,
    description="Reviewer who checks the draft for quality and accuracy.",
    instruction="You are the reviewer. Review the blog post draft for factual accuracy, clarity, and style. Suggest improvements if needed, or approve for publishing.",
    tools=[],
    output_key="reviewed_blog_post_json_string"
)

publisher_agent = Agent(
    name="publisher",
    model=GEMINI_MODEL,
    description="Publishes the final blog post if approved.",
    instruction="You are the publisher. If the reviewer approves, publish the post using save_and_set_pr_details_tool. Otherwise, do not publish.",
    tools=[save_and_set_pr_details_tool],
    output_key="publishing_status"
)

pipeline = SequentialAgent(
    name="NewsResearchPipeline",
    sub_agents=[lead_author_agent, researcher_agent, writer_agent, reviewer_agent, publisher_agent]
)

# Runner setup
APP_NAME = "news_research_app"
USER_ID = "news_user"
SESSION_ID = "news_session"

session_service = InMemorySessionService()
# Create a new session for each run, or manage sessions as needed
session_service.create_session(app_name=APP_NAME, user_id=USER_ID, session_id=SESSION_ID)
runner = Runner(agent=pipeline, app_name=APP_NAME, session_service=session_service)

# Run the pipeline
async def run_news_research_pipeline(prompt: str):
    print("Gemini ADK Sequential Pipeline: Starting news research process...")
    print("--- ADK Runner Events ---")
    content = types.Content(role="user", parts=[types.Part(text=prompt)])
    events = []
    # The runner.run method is synchronous, but ADK is often used in async contexts.
    # Keeping it simple for this script's direct execution.
    # If tools were async, we'd need await here.
    events = runner.run(user_id=USER_ID, session_id=SESSION_ID, new_message=content)

    final_response_text = "Pipeline finished without a final response event."
    for event in events:
        print(event)
        if event.is_final_response():
            final_response_text = event.content.parts[0].text
            print("\n📢 Final Pipeline Status:\n")
            print(final_response_text)

    print("--- End of ADK Runner Events ---")
    print("Gemini ADK Sequential Pipeline: Pipeline complete.")
    # Exit code based on final status? Or let GitHub Actions handle it.
    # For now, assume success if pipeline runs.

# Main execution
if __name__ == "__main__":
    # The prompt for the researcher agent
    initial_prompt = "Find the latest top news and trends relevant for a blog post."

    # Run the async pipeline
    asyncio.run(run_news_research_pipeline(initial_prompt))

    # The script will exit with status 0 if it reaches here without unhandled exceptions.
    # The duplicate check and save tool handle their own success/failure logging.
    # GitHub Actions will rely on the script's exit code and the presence of GITHUB_OUTPUT.
