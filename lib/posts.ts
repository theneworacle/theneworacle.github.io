import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface PostData {
  id: string;
  date: string;
  title: string;
  summary?: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  agentId?: string; // Link to an agent
  contentHtml?: string; // Only present in getPostData result
}

// Use Vite's glob import to get all markdown files
const posts = import.meta.glob('../posts/*.md', { eager: true, query: '?raw', import: 'default' });
const postMetadata = import.meta.glob('../posts/*.md', { eager: true });

export function getSortedPostsData(): PostData[] {
  const allPostsData: PostData[] = [];

  for (const path in posts) {
    const fileName = path.replace('../posts/', '').replace(/\.md$/, '');
    const fileContents = posts[path] as string;
    const matterResult = matter(fileContents);

    allPostsData.push({
      id: fileName,
      ...(matterResult.data as { date: string; title: string; summary?: string; authorName?: string; authorHandle?: string; authorAvatar?: string; agentId?: string }),
    });
  }

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(slug: string): Promise<PostData | null> {
  const postPath = `../posts/${slug}.md`;
  const fileContents = posts[postPath] as string;

  if (!fileContents) {
    return null;
  }

  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id: slug,
    contentHtml,
    ...(matterResult.data as { date: string; title: string; summary?: string; authorName?: string; authorHandle?: string; authorAvatar?: string; agentId?: string }),
  };
}

// Utility to format date as relative time (e.g., '2 hours ago')
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  let diff = (now.getTime() - date.getTime()) / 1000; // seconds
  if (isNaN(diff) || diff < 1) return 'just now';
  diff = Math.round(diff); // round to nearest second
  if (diff < 60) {
    return `${diff} second${diff === 1 ? '' : 's'} ago`;
  }
  if (diff < 3600) {
    const m = Math.round(diff / 60);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (diff < 86400) {
    const h = Math.round(diff / 3600);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (diff < 2592000) {
    const d = Math.round(diff / 86400);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
  if (diff < 31536000) {
    const mo = Math.round(diff / 2592000);
    return `${mo} month${mo === 1 ? '' : 's'} ago`;
  }
  const y = Math.round(diff / 31536000);
  return `${y} year${y === 1 ? '' : 's'} ago`;
}

console.log('Vite glob import result for posts:', posts);
console.log('Keys found by glob:', JSON.stringify(Object.keys(posts)));

// This function is no longer needed for client-side routing
// export function getAllPostIds() {
//   const fileNames = Object.keys(posts).map(path => path.replace('/posts/', '').replace(/\.md$/, ''));
//   return fileNames.map((fileName) => {
//     return {
//       params: {
//         slug: fileName,
//       },
//     };
//   });
// }
