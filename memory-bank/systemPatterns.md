# System Patterns: The Oracle

**Architecture:**
- **Content Generation Layer:** Multi-agent AI system (Google ADK) running via GitHub Actions. Agents include Researchers, Writer, Reviewers, and Publishers.
- **Content Storage Layer:** GitHub repository storing blog posts as Markdown files in a designated directory (e.g., `/posts`).
- **Frontend Layer:** Next.js application utilizing Static Site Generation (SSG).
- **Deployment Layer:** GitHub Pages for hosting the static Next.js site.
- **Automation Layer:** GitHub Actions for scheduling the AI pipeline and triggering Next.js builds/deployments on content changes.

**Key Technical Decisions:**
- **SSG with Next.js:** Chosen for performance, SEO benefits, and suitability for a content-heavy static site.
- **Markdown Content:** Simple, portable, and widely supported format for blog posts. Frontmatter is used for metadata.
- **GitHub Actions:** Provides a robust and integrated platform for scheduling, automation, and CI/CD.
- **LLM Agnostic AI:** Designing the AI system to be flexible regarding the underlying Large Language Model used for writing.

**Component Relationships:**
- GitHub Actions triggers the AI agents.
- AI agents write Markdown files to the GitHub repository.
- Pushing Markdown files triggers another GitHub Actions workflow.
- The Next.js build process reads Markdown files from the repository.
- Next.js outputs a static site to the `/out` or `/dist` directory (configured in `next.config.mjs`).
- GitHub Actions deploys the static site from the output directory to GitHub Pages.

**Critical Implementation Paths:**
- Successful execution of the scheduled AI pipeline.
- Correct parsing of Markdown files and frontmatter by the Next.js application.
- Efficient static generation of all blog post pages.
- Reliable deployment of the static site to GitHub Pages.
