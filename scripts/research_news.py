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
import time
import yaml # Import yaml for validation

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
    """Fetches top stories using DuckDuckGo News search for 'top news'. Includes exponential backoff on rate limit."""
    print("Fetching top stories from DuckDuckGo News...")
    max_retries = 5
    delay = 2
    for attempt in range(max_retries):
        try:
            results = []
            with DDGS() as ddgs:
                for r in ddgs.news(keywords="top news", max_results=10):
                    results.append({'title': r['title'], 'url': r['url']})
            return results
        except Exception as e:
            print(f"Error fetching DuckDuckGo top news (attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(delay)
                delay *= 2
            else:
                print("Max retries reached. Returning empty list.")
                return []

def search_social_sentiment(query: str) -> str:
    """Stub: Search social media for sentiment on the topic (to be implemented with real APIs)."""
    # In production, integrate with Twitter/X, Reddit, etc.
    return f"[Simulated social sentiment for '{query}': Mostly positive, some debate.]"

def search_news_tool(query: str) -> str:
    """Searches for news using DuckDuckGo Search and returns a formatted string of results. Includes exponential backoff on rate limit."""
    print(f"Searching news for: {query}")
    max_retries = 5
    delay = 2
    for attempt in range(max_retries):
        results = []
        try:
            with DDGS() as ddgs:
                # Limit results to avoid overwhelming context
                for r in ddgs.news(keywords=query, max_results=5):
                    results.append(r)
            break
        except Exception as e:
            print(f"Error during DuckDuckGo search (attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(delay)
                delay *= 2
            else:
                return f"Error during search after {max_retries} attempts: {e}"
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

def get_existing_post_excerpts() -> List[str]:
    """Reads existing markdown files and returns a list of their excerpts."""
    print("Fetching existing post excerpts...")
    posts_dir = "posts/" # Relative to repo root
    excerpts = []

    # Adjust path for script execution context
    script_dir = os.path.dirname(__file__)
    repo_root = os.path.abspath(os.path.join(script_dir, '..'))
    full_posts_dir = os.path.join(repo_root, posts_dir)

    if not os.path.exists(full_posts_dir):
        print(f"Posts directory not found at {full_posts_dir}. No existing posts found.")
        return []

    for root, _, files in os.walk(full_posts_dir):
        for filename in files:
            if filename.endswith(".md"):
                filepath = os.path.join(root, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Extract excerpt from YAML frontmatter
                        m = re.search(r'^---.*?^summary:\s*\"?(.*?)\"?$', content, re.DOTALL | re.MULTILINE)
                        if m:
                            excerpts.append(m.group(1).strip())
                except Exception as e:
                    print(f"Error reading file {filepath} for excerpt extraction: {e}")
                    continue
    print(f"Found {len(excerpts)} existing post excerpts.")
    return excerpts

def generate_slug(title: str) -> str:
    # Convert to lowercase
    slug = title.lower()
    # Remove non-alphanumeric characters (except for hyphens and spaces)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace spaces and hyphens with a single hyphen
    slug = re.sub(r'[\s-]+', '-', slug)
    # Trim hyphens from the start and end
    slug = slug.strip('-')
    return slug[:50] # Limit slug length

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
    filepath = None  # Ensure filepath is always defined
    # Attempt to extract a title from the markdown for the filename
    title_line = next((line for line in content.split('\n') if line.strip().startswith('# ')), None)
    if title_line:
        # Sanitize title for filename
        title_slug = title_line.replace('# ', '').strip()
        title_slug = "".join([c for c in title_slug if c.isalnum() or c in (' ', '-')]).rstrip()
        title_slug = title_slug.replace(' ', '-').lower()[:50] # Limit length
        filename = f"{timestamp}-{title_slug}.md"
        filepath = os.path.join(full_posts_dir, filename)
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

        # Compose YAML frontmatter
        # Handle quotes in title and excerpt
        escaped_title = title.replace('"', '\\"')
        escaped_excerpt = excerpt.replace('"', '\\"')

        # Format tags as a YAML list
        tags_yaml_list = ""
        if tags:
            tags_yaml_list = "\n" + "\n".join(["  - \"{}\"".format(tag.replace('"', '\\"')) for tag in tags])

        frontmatter_str = f"""---\ntitle: \"{escaped_title}\"\nauthors:\n{authors_yaml}\ndate: \"{datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')}\"\nsummary: \"{escaped_excerpt}\"\ntags:{tags_yaml_list}\n---\n\n"""

        # --- YAML Validation ---
        try:
            # Attempt to parse the frontmatter string as YAML
            # We only validate the frontmatter part, not the whole file content
            # Find the content between the first and second '---'
            frontmatter_parts = frontmatter_str.split('---')
            if len(frontmatter_parts) < 3:
                 raise ValueError("Could not find YAML frontmatter delimiters (---).")
            yaml_content_to_validate = frontmatter_parts[1]
            yaml.safe_load(yaml_content_to_validate)
            print("YAML frontmatter validated successfully.")
        except (yaml.YAMLError, ValueError) as e:
            print(f"Error: YAML frontmatter validation failed: {e}")
            # Return a failure message
            return f"Error: Generated YAML frontmatter is invalid: {e}"
        # --- End YAML Validation ---

        # Write frontmatter + content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(frontmatter_str)
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

# Define agents for the SequentialAgent pipeline
# Pass agents_data to the writer agent's instruction or make it read it internally
# Reading internally is simpler for this structure.

lead_author_agent = Agent(
    name="lead_author",
    model=GEMINI_MODEL,
    description="Lead author who selects top stories from DuckDuckGo News, checks for duplicates against existing post excerpts, and assigns research tasks.",
    instruction="You are the lead author. Fetch top stories using fetch_top_stories. Get existing post excerpts using get_existing_post_excerpts. Iterate through the fetched top stories and compare their titles/summaries against the existing post excerpts to find the first story that is NOT a duplicate. Output the title and url of the selected story as a JSON string.",
    tools=[fetch_top_stories, get_existing_post_excerpts],
    output_key="selected_story"
)

researcher_agent = Agent(
    name="researcher",
    model=GEMINI_MODEL,
    description="Researcher who gathers more information and social sentiment for a given story.",
    instruction="You are the researcher. Given a story (title and url) from the lead author, use search_news_tool, scrape_article_tool, and search_social_sentiment to gather more information from other news sources and social media. Summarize your findings for the writer agent.",
    tools=[search_news_tool, scrape_article_tool, search_social_sentiment],
    output_key="research_findings"
)

writer_agent = Agent(
    name="writer",
    model=GEMINI_MODEL,
    description="Writer who drafts the blog post based on selected story details and research findings.",
    instruction="You are the writer. Given the selected story details (title, url) and research findings, write a compelling, well-structured blog post in markdown. Include title, excerpt, content, tags, and sources. Output a JSON string with these fields.",
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
    try:
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
        # If the pipeline completes without exception, assume success for the pipeline run itself
        return True
    except Exception as e:
        print(f"Error running pipeline: {e}")
        return False

# --- GitHub PR Automation ---
import base64
import subprocess

def ensure_pygithub():
    try:
        import github
        return github
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "PyGithub"])
        import github
        return github

def get_latest_post_info(posts_dir="posts"):
    """Finds the most recently created post file and returns its path, title, and content."""
    script_dir = os.path.dirname(__file__)
    repo_root = os.path.abspath(os.path.join(script_dir, '..'))
    full_posts_dir = os.path.join(repo_root, posts_dir)
    latest_file = None
    latest_mtime = 0
    for root, _, files in os.walk(full_posts_dir):
        for f in files:
            if f.endswith('.md'):
                fp = os.path.join(root, f)
                mtime = os.path.getmtime(fp)
                if mtime > latest_mtime:
                    latest_mtime = mtime
                    latest_file = fp
    if not latest_file:
        return None, None, None
    with open(latest_file, 'r', encoding='utf-8') as f:
        content = f.read()
    # Extract title from YAML frontmatter
    m = re.search(r'^---.*?^title:\s*\"?(.*?)\"?$', content, re.DOTALL | re.MULTILINE)
    title = m.group(1).strip() if m else os.path.splitext(os.path.basename(latest_file))[0]
    return latest_file, title, content

def slugify(text, maxlen=50):
    slug = text.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    slug = slug.strip('-')
    return slug[:maxlen]

def is_github_actions() -> bool:
    """Detect if running in GitHub Actions."""
    # Check for the standard GITHUB_ACTIONS variable
    is_ga = os.environ.get("GITHUB_ACTIONS", "false").lower() == "true"
    # Also check for another common GA variable for robustness
    has_run_id = bool(os.environ.get("GITHUB_RUN_ID"))
    return is_ga and has_run_id

def get_github_token() -> str:
    """Get GitHub token from env."""
    return os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")


def create_branch_and_pr(
    repo_name: str,
    base_branch: str,
    new_branch: str,
    rel_file_path: str,
    file_content: str,
    pr_title: str,
    pr_body: str,
    github_token: str
):
    """Create a branch, commit the file, push, and open a PR using the GitHub API."""
    from github import Github
    g = Github(github_token)
    repo_obj = g.get_repo(repo_name)

    # Get base branch ref
    try:
        base = repo_obj.get_branch(base_branch)
    except Exception as e:
        return f"Error getting base branch '{base_branch}': {e}"

    # Create new branch from base
    ref_name = f"refs/heads/{new_branch}"
    try:
        repo_obj.create_git_ref(ref_name, base.commit.sha)
        print(f"Branch '{new_branch}' created.")
    except Exception as e:
        print(f"Error creating branch '{new_branch}': {e}")
        # If branch creation fails, it might already exist. Try to proceed.

    # Try to create or update the file in the new branch
    try:
        try:
            # Check if file exists to decide between create and update
            contents = repo_obj.get_contents(rel_file_path, ref=new_branch)
            # File exists, update it
            repo_obj.update_file(
                contents.path,
                pr_title, # Use PR title as commit message
                file_content, # Use provided file_content
                contents.sha,
                branch=new_branch
            )
            print(f"File '{rel_file_path}' updated in branch '{new_branch}'.")
        except Exception as e:
             # File does not exist, create it
             print(f"File '{rel_file_path}' not found in branch '{new_branch}', attempting to create.")
             repo_obj.create_file(
                path=rel_file_path,
                message=pr_title, # Use PR title as commit message
                content=file_content, # Use provided file_content
                branch=new_branch
            )
             print(f"File '{rel_file_path}' created in branch '{new_branch}'.")

    except Exception as e:
        print(f"Error creating or updating file '{rel_file_path}' in branch '{new_branch}': {e}")
        # If file operation fails, clean up the branch if it was created
        try:
            ref_to_delete = repo_obj.get_git_ref(f"heads/{new_branch}")
            ref_to_delete.delete()
            print(f"Cleaned up branch {new_branch} after file operation failure.")
        except Exception as delete_e:
            print(f"Could not clean up branch {new_branch}: {delete_e}")
        return f"Error creating or updating file: {e}"

    # Create PR
    try:
        pr = repo_obj.create_pull(
            title=pr_title,
            body=pr_body,
            head=new_branch,
            base=base_branch
        )
        print(f"Pull request created: {pr.html_url}")
        # Enable auto-merge (if repo allows)
        try:
            pr.enable_auto_merge(merge_method='squash')
            print("Auto-merge enabled for PR.")
        except Exception as e:
            print(f"Could not enable auto-merge: {e}")
        return f"Pull request created: {pr.html_url}"
    except Exception as e:
        print(f"Error creating PR: {e}")
        # If PR creation fails, clean up the branch
        try:
            ref_to_delete = repo_obj.get_git_ref(f"heads/{new_branch}")
            ref_to_delete.delete()
            print(f"Cleaned up branch {new_branch} after PR creation failure.")
        except Exception as delete_e:
            print(f"Could not clean up branch {new_branch}: {delete_e}")
        return f"Error creating PR: {e}"

# Main execution
if __name__ == "__main__":
    # The prompt for the researcher agent
    initial_prompt = "Find the latest top news and trends relevant for a blog post."

    # Run the async pipeline
    pipeline_ran_successfully = asyncio.run(run_news_research_pipeline(initial_prompt))

    # Check if a new post file was created
    post_path, post_title, post_content = get_latest_post_info()
    post_was_saved = post_path is not None

    # --- GitHub Actions PR/Direct Push Logic ---
    # Only run this logic in GitHub Actions (not locally) AND if a new post was saved
    print(f"{'Running in GitHub Actions: ' + str(is_github_actions())}")
    print(f"{'Post was saved: ' + str(post_was_saved)}")
    if post_was_saved and is_github_actions(): # Use the function here
        print("Detected GitHub Actions environment and new post file found. Proceeding with Git operations...")

        # Check for direct push environment variable
        direct_push_to_main = os.environ.get('DIRECT_PUSH_TO_MAIN', 'false').lower() == 'true'

        # Get repo info from env
        repo_name = os.environ.get('GITHUB_REPOSITORY')
        github_token = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')

        if not repo_name or not github_token:
            print("GITHUB_REPOSITORY or GITHUB_TOKEN not set. Skipping Git operations.")
        else:
            # Define the default branch
            default_branch = "main"
            print(f"Using default branch: {default_branch}")

            # Get latest post info again to ensure we have the most recent content
            post_path, post_title, post_content = get_latest_post_info()
            if not post_path or not post_title or not post_content:
                print("Could not find latest post for Git operations after pipeline run.")
            else:
                # Compute relative path for the post file
                script_dir = os.path.dirname(__file__)
                repo_root = os.path.abspath(os.path.join(script_dir, '..'))
                rel_post_path = os.path.relpath(post_path, repo_root).replace('\\', '/')

                if direct_push_to_main:
                    print("DIRECT_PUSH_TO_MAIN is true. Committing and pushing directly to main.")
                    try:
                        # Configure git user
                        subprocess.run(['git', 'config', '--global', 'user.name', 'github-actions[bot]'], check=True, cwd=repo_root)
                        subprocess.run(['git', 'config', '--global', 'user.email', 'github-actions[bot]@users.noreply.github.com'], check=True, cwd=repo_root)

                        # Add the file
                        subprocess.run(['git', 'add', rel_post_path], check=True, cwd=repo_root)

                        # Commit the changes
                        commit_message = f"feat: Add automated news post: {post_title}"
                        subprocess.run(['git', 'commit', '-m', commit_message], check=True, cwd=repo_root)

                        # Push to main
                        # Use the GITHUB_TOKEN for authentication
                        remote_url = f"https://x-access-token:{github_token}@github.com/{repo_name}.git"
                        subprocess.run(['git', 'push', remote_url, 'HEAD:main'], check=True, cwd=repo_root)

                        print(f"Successfully committed and pushed {rel_post_path} to main.")

                    except subprocess.CalledProcessError as e:
                        print(f"Error during direct push Git operations: {e}")
                    except Exception as e:
                        print(f"An unexpected error occurred during direct push: {e}")

                else:
                    print("DIRECT_PUSH_TO_MAIN is false or not set. Attempting to create PR...")
                    # Compute branch and PR title
                    branch_slug = slugify(post_title)
                    branch_name = f"new-post-{branch_slug}" # Use timestamp in branch name for uniqueness
                    pr_title = f"{post_title}"
                    pr_body = f"{post_content}"

                    # Call the create_branch_and_pr function
                    pr_result = create_branch_and_pr(
                        repo_name=repo_name,
                        base_branch=default_branch,
                        new_branch=branch_name,
                        rel_file_path=rel_post_path,
                        file_content=post_content,
                        pr_title=pr_title,
                        pr_body=post_content, # Use post_content for PR body
                        github_token=github_token
                    )
                    print(pr_result) # Print the result of the PR creation attempt


    else:
        print("Not running in GitHub Actions or no new post saved. Skipping Git operations.")
