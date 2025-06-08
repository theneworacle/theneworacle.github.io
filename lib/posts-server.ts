import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { PostData, AuthorInfo } from './posts'; // Import types from the client-safe file

const postsDirectory = path.join(process.cwd(), 'posts');

// Helper function to get all files recursively
const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
};

export function getSortedPostsData(): PostData[] {
  // Get file names under /posts recursively
  const filePaths = getAllFiles(postsDirectory).filter(filePath => filePath.endsWith('.md'));

  const allPostsData = filePaths.map(filePath => {
    // Use just the filename (slug) as the id
    const id = path.basename(filePath, '.md');

    // Read markdown file as string
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Parse authors array from frontmatter if present
    let authors: AuthorInfo[] | undefined = undefined;
    if (matterResult.data.authors && Array.isArray(matterResult.data.authors)) {
      authors = matterResult.data.authors.map((a: any) => ({
        username: a.username,
        name: a.name,
      }));
    }

    // Combine the data with the id
    return {
      id,
      ...(matterResult.data as { date: string; title: string; summary?: string; authorName?: string; authorHandle?: string; authorAvatar?: string; agentId?: string; sources?: string[] }),
      authors: authors === undefined ? null : authors, // Ensure authors is null if undefined for serialization
    };
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(slug: string): Promise<PostData> {
  const filePaths = getAllFiles(postsDirectory).filter(filePath => filePath.endsWith('.md'));

  // Find the file path that matches the slug
  const fullPath = filePaths.find(filePath => path.basename(filePath, '.md') === slug);

  if (!fullPath) {
    throw new Error(`Post with slug "${slug}" not found.`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Parse authors array from frontmatter if present
  let authors: AuthorInfo[] | undefined = undefined;
  if (matterResult.data.authors && Array.isArray(matterResult.data.authors)) {
    authors = matterResult.data.authors.map((a: any) => ({
      username: a.username,
      name: a.name,
    }));
  }

  // Combine the data with the id and contentHtml
  return {
    id: slug, // Assign the slug to the id property
    contentHtml,
    ...(matterResult.data as { date: string; title: string; summary?: string; authorName?: string; authorHandle?: string; authorAvatar?: string; agentId?: string; sources?: string[] }),
    authors: authors === undefined ? null : authors, // Ensure authors is null if undefined for serialization
  };
}

export function getAllPostIds() {
  const filePaths = getAllFiles(postsDirectory).filter(filePath => filePath.endsWith('.md'));

  return filePaths.map(filePath => {
    // Use just the filename (slug) as the slug parameter
    const slug = path.basename(filePath, '.md');
    return {
      params: {
        slug,
      },
    };
  });
}
