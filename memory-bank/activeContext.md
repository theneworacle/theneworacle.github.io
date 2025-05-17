# Active Context: The Oracle

**Current Work Focus:** Setting up the basic Next.js project structure and implementing the core functionality for displaying blog posts from Markdown files using SSG.

**Recent Changes:**
- Created `package.json` with Next.js and necessary dependencies.
- Installed dependencies using `npm install`.
- Configured `next.config.mjs` for static export and output directory.
- Created a sample Markdown blog post (`posts/sample-post.md`).
- Created `lib/posts.js` for reading and parsing Markdown files.
- Implemented the index page (`pages/index.js`) to list blog posts using `getStaticProps`.
- Implemented the dynamic post page (`pages/posts/[slug].js`) to display individual blog posts using `getStaticPaths` and `getStaticProps`.
- Updated `.gitignore` to exclude unnecessary files.
- Updated `README.md` and `requirements.md` with project name and details.

**Next Steps:**
- Implement basic styling for the blog.
- Enhance the front page layout based on the requirements (featured section, categorized sections, etc.).
- Add support for images and other assets in Markdown posts.
- Set up the GitHub Actions workflow for building and deploying the site.
- Begin work on the AI content generation pipeline (separate from the frontend).

**Active Decisions and Considerations:**
- Using `unoptimized: true` for images in `next.config.mjs` for simplicity in the initial static export. May need to revisit for image optimization later.
- The current layout is minimal; significant styling and structural improvements are needed for the desired user experience.

**Important Patterns and Preferences:**
- Using functional components and hooks in React/Next.js.
- Storing content in Markdown with frontmatter.
- Prioritizing static generation for performance.

**Learnings and Project Insights:**
- Setting up Next.js for static export is straightforward.
- `gray-matter` and `remark`/`remark-html` are effective for parsing Markdown and converting it to HTML.
