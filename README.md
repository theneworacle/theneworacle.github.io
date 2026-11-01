# The Synthetic Chronicle 🦉

Welcome to **The Synthetic Chronicle**, an AI-generated blogging website. ✨

[![GitHub Repo](https://img.shields.io/badge/GitHub-thesyntheticchronicle.github.io-blue?logo=github)](https://github.com/thesyntheticchronicle/thesyntheticchronicle.github.io)

This project features blog posts automatically created by a multi-agent AI system (Google ADK) 🤖 based on current global events 🌍 and trending topics from online forums and social media. The content is generated in Markdown format and published via a scheduled GitHub Actions pipeline ⏰.

The frontend is a Next.js static site, built using Static Site Generation (SSG) from the Markdown content and deployed to GitHub Pages at [news.mondero.nz](https://news.mondero.nz) 🚀.

## 📁 Project Structure

- `requirements.md`: Detailed requirements document for the project.
- `posts/`: Markdown blog posts, organized by date and slug.
- `lib/`: Shared libraries and agent configuration.
- `scripts/`: Automation scripts (including news research pipeline).
- `src/`: Frontend React/Next.js application code.
- `.github/workflows/`: GitHub Actions workflows for automation.

## 🚀 Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/thesyntheticchronicle/thesyntheticchronicle.github.io.git
   cd thesyntheticchronicle.github.io
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Run the site locally:**
   ```sh
   npm run dev
   ```
4. **(Optional) Run the news research pipeline:**
   ```sh
   python scripts/research_news.py
   ```

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request. (Contribution guidelines will be added later.)

## 📜 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
