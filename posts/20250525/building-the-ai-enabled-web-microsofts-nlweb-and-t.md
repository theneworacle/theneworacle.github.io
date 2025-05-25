---
title: "Building the AI-Enabled Web: Microsoft's NLWeb and the Future of Online Interaction"
authors:
  - username: '@alanaturner'
    name: 'Alana Turner'
date: "2025-05-25T05:18:40Z"
summary: "As AI agents become more sophisticated, the web needs to evolve to speak their language. Microsoft's new open-source NLWeb protocol aims to do that, enabling websites to become AI-powered conversational interfaces using existing data standards."
tags:
  - "AI"
  - "Protocols"
  - "Microsoft"
  - "NLWeb"
  - "Agentic AI"
  - "Web Development"
  - "Technology"
---

Remember the early days of the web? Finding information wasn't always easy. That challenge led to the creation of standards like RSS and Atom, making it simpler for humans to find and syndicate content.

Now, with the rise of sophisticated AI models and agents, we face a similar challenge: making the vast amount of information on the web easily accessible and understandable for artificial intelligence. This is sparking a new wave of protocol development, and Microsoft is jumping into the fray with its open-source **NLWeb (natural language web)** effort.

Announced at the Build 2025 conference, NLWeb has a notable connection to web history – it was conceived by RV Guha, a key figure behind foundational standards like RSS, RDF, and schema.org.

### What is NLWeb and Why Does it Matter?

The core idea behind NLWeb is simple yet powerful: enable websites to easily add AI-powered conversational interfaces. Think of it as turning any website into an "AI app" where users (both human and AI agents) can query content using natural language instead of just clicking through menus.

Microsoft CTO Kevin Scott described it as potentially the "HTML for the agentic web," suggesting its fundamental role in how AI interacts with online information.

### How NLWeb Works

NLWeb is designed to build upon the web's existing infrastructure rather than demanding a complete overhaul. It works by:

1.  **Leveraging Existing Data:** It starts with structured data already present on websites, such as schema.org markup, RSS feeds, and other formats commonly embedded in pages.
2.  **Processing and Storing Data:** Tools within the NLWeb system help add this structured data to vector databases, enabling efficient semantic search and retrieval.
3.  **AI Enhancement:** Large Language Models (LLMs) are then used to enhance this stored data with external knowledge and context, providing richer, more intelligent responses than simple data retrieval.
4.  **Creating a Universal Interface:** The output is a natural language interface, allowing users to ask questions and receive conversational answers, while AI systems can access and query the data programmatically.

This approach allows websites to become participants in the emerging agentic web without requiring massive technical investments.

### NLWeb's Place in the AI Protocol Landscape

The article highlights that NLWeb isn't necessarily competing with other emerging protocols like Google's Agent2Agent (focused on agent-to-agent communication) or LLMs.txt (designed to help LLM crawlers ingest content). Instead, it builds upon them. Notably, each NLWeb instance can function as a **Model Control Protocol (MCP)** server, an open standard for connecting AI systems with data sources that is gaining traction as a foundational layer.

### Advantages for Enterprises

For businesses, NLWeb presents several potential benefits:

*   **Better AI Interpretation:** Gives AI systems more precise control and understanding of website components, reducing errors.
*   **Reduced Rework:** Could minimize the need to constantly adapt website interfaces for AI.
*   **Leveraging Existing Investments:** Capitalizes on the structured data websites are often already creating for SEO and other purposes.
*   **Enhanced Internal AI:** Makes internal company information more accessible to internal LLMs and AI agents.
*   **Improved External Engagement:** Transforms public-facing websites into dynamic, conversational resources.

### Early Adoption and Outlook

Microsoft has already engaged several prominent organizations as early adopters, including Allrecipes, Eventbrite, O’Reilly Media, Tripadvisor, and Shopify. This demonstrates real-world interest and application across different sectors.

Early feedback suggests NLWeb is valuable for both consuming public information and publishing private information internally. The implementation is described as potentially not a heavy lift, especially for organizations already using relevant standards.

While still early days, the general sentiment around NLWeb appears mostly positive, reflecting the growing recognition of the need for the web to become truly AI-friendly.

NLWeb represents a significant step in the evolution of the web, aiming to bridge the gap between human-centric design and the needs of the burgeoning AI agent ecosystem. As the battle to AI-enable the web continues, initiatives like NLWeb will be crucial in shaping how we, and our AI assistants, interact with online information in the future.
