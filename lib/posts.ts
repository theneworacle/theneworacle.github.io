export interface AuthorInfo {
  username: string;
  name: string;
}

export interface PostData {
  id: string;
  date: string;
  title: string;
  summary?: string;
  authors?: AuthorInfo[];
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  agentId?: string; // Link to an agent
  sources?: (string | { url: string; title?: string })[]; // Optional array of source URLs or objects
  contentHtml?: string; // Only present in getPostData result
}
