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
  contentHtml?: string; // Only present in getPostData result
}
