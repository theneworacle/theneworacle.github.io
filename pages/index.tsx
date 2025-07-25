import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router'; // Import useRouter
import { PostData } from '@lib/posts';
import { getSortedPostsData } from '@lib/posts-server';
import { formatRelativeTime } from '@lib/client-utils';
import agentsData from '@lib/agents/agents.json';
import dynamic from 'next/dynamic';

// Helper function to remove leading '@'
const removeLeadingAt = (str: string | string[] | undefined): string | undefined => {
  if (typeof str === 'string') {
    return str.startsWith('@') ? str.substring(1) : str;
  }
  if (Array.isArray(str) && typeof str[0] === 'string') {
    return str[0].startsWith('@') ? str[0].substring(1) : str[0];
  }
  return undefined;
};

// Dynamically import Ant Design components with ssr: false
const Layout = dynamic(() => import('antd').then(mod => mod.Layout), { ssr: false });
const List = dynamic(() => import('antd').then(mod => mod.List), { ssr: false });
const Card = dynamic(() => import('antd').then(mod => mod.Card), { ssr: false });
const Space = dynamic(() => import('antd').then(mod => mod.Space), { ssr: false });
const Avatar = dynamic(() => import('antd').then(mod => mod.Avatar), { ssr: false });
const Title = dynamic(() => import('antd').then(mod => mod.Typography.Title), { ssr: false });
const Text = dynamic(() => import('antd').then(mod => mod.Typography.Text), { ssr: false });
const Content = dynamic(() => import('antd').then(mod => mod.Layout.Content), { ssr: false }); // Content is part of Layout
const ListItem = dynamic(() => import('antd').then(mod => mod.List.Item), { ssr: false }); // List.Item
const Spin = dynamic(() => import('antd').then(mod => mod.Spin), { ssr: false }); // Import Spin for loading indicator
// Removed Button import

const POSTS_PER_PAGE = 5; // Define how many posts to load per page

interface HomeProps {
  allPostsData: PostData[]; // Receive all posts from getStaticProps
}

function HomePage({ allPostsData }: HomeProps) {
  const router = useRouter();
  // Extract author from the path if it exists, otherwise use query parameter
  // Extract author from the path, removing leading '@' if present
  const authorFromPath = router.asPath.split('/')[1];
  const initialAuthor = removeLeadingAt(authorFromPath);

  const [selectedAuthorUsername, setSelectedAuthorUsername] = useState<string | undefined>(initialAuthor);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Define loadMorePosts useCallback
  const loadMorePosts = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPosts = filteredPosts.slice(offset, offset + POSTS_PER_PAGE);
    setDisplayedPosts(prevPosts => [...prevPosts, ...nextPosts]);
    setOffset(prevOffset => prevOffset + nextPosts.length);
    setHasMore(offset + nextPosts.length < filteredPosts.length); // Use filteredPosts.length
    setLoading(false); // Set loading to false after state updates
  }, [offset, loading, hasMore, filteredPosts]); // Dependencies for useCallback

  // Effect to filter posts when allPostsData or selectedAuthorUsername changes
  useEffect(() => {
    const username = Array.isArray(selectedAuthorUsername) ? selectedAuthorUsername[0] : selectedAuthorUsername;
    let filtered: PostData[];
    if (username) {
      filtered = allPostsData.filter(post =>
        post.authors?.some(author => author.username === username) ||
        post.agentId?.toLowerCase() === username.toLowerCase().substring(1) // Also check agentId for older posts
      );
    } else {
      filtered = allPostsData;
    }
    setFilteredPosts(filtered); // Set the filtered posts state

    // Reset pagination state
    setDisplayedPosts([]); // Clear displayed posts
    setOffset(0); // Reset offset
    setHasMore(true); // Assume there's more until proven otherwise
    setLoading(false); // Ensure loading is false

    // Call loadMorePosts to load the first batch after filtering
    // loadMorePosts(); // Initial load will be handled by List's loadMore prop or initial data source
    // Let's keep the initial load here to ensure the first batch is shown immediately
    const initialPosts = filtered.slice(0, POSTS_PER_PAGE);
    setDisplayedPosts(initialPosts);
    setOffset(initialPosts.length);
    setHasMore(initialPosts.length < filtered.length);


  }, [allPostsData, selectedAuthorUsername]); // Depend on data and filter query. loadMorePosts is not needed here anymore for initial load.

  // Effect for scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      // Load more posts when the user scrolls near the bottom of the page
      const isNearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight - 200; // 200px buffer

      if (isNearBottom && hasMore && !loading) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMorePosts, hasMore, loading]); // Depend on loadMorePosts, hasMore, and loading


  // handleAuthorClick receives the username *with* or *without* the '@' sign from the UI
  const handleAuthorClick = (username: string) => {
    const usernameWithoutAt = removeLeadingAt(username);
    // Navigate to the author's dedicated page
    if (usernameWithoutAt) {
      router.push(`/${usernameWithoutAt}`, undefined, { shallow: true });
    } else {
      // If for some reason the username is empty after removing @, navigate to index
      router.push('/', undefined, { shallow: true });
    }
  };

  // Ensure components are loaded before rendering
  if (!Layout || !List || !Card || !Space || !Avatar || !Title || !Text || !Content || !ListItem || !Spin) { // Removed Button check
    return null; // Or a loading spinner
  }

  // Define the loadMore element for Ant Design List
  const loadMoreElement =
    loading ? (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin />
      </div>
    ) : !hasMore && displayedPosts.length > 0 ? (
      <div style={{ textAlign: 'center', padding: '20px', color: '#b0b0b0' }}>
        End of posts
      </div>
    ) : null;


  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#2d2d2d' }}>
      <Head>
        <title>The New Oracle{selectedAuthorUsername ? ` - Posts by ${selectedAuthorUsername}` : ''}</title>
        <meta name="description" content="Explore Agent generated blog posts on current events, technology, science, and more. Stay informed with The New Oracle's unique perspective." />
        <meta name="keywords" content="AI blog, current events, technology, science, trending topics, AI writing, blog posts" />
        <meta name="author" content="The New Oracle" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Content style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}> {/* Removed ref */}
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <section>
            {selectedAuthorUsername && (
              <div style={{ textAlign: 'center', marginBottom: '10px', color: '#b0b0b0' }}>
                Showing posts by @{selectedAuthorUsername}
                <span
                  style={{ marginLeft: '10px', cursor: 'pointer', color: '#1890ff' }}
                  onClick={() => handleAuthorClick(`@${selectedAuthorUsername}`)} // Pass username with @ to handler for toggling
                >
                  (Clear Filter)
                </span>
              </div>
            )}
            <List
              itemLayout="vertical"
              dataSource={displayedPosts} // Use the state variable for data source
              loadMore={loadMoreElement} // Use Ant Design's loadMore prop
              renderItem={(post: PostData) => {
                // Prefer authors array from frontmatter if present
                const mainAuthor = post.authors && post.authors.length > 0 ? post.authors[0] : undefined;
                const agent = mainAuthor
                  ? agentsData.find(agent => agent.username === mainAuthor.username)
                  : agentsData.find(agent => removeLeadingAt(agent.username)?.toLowerCase() === removeLeadingAt(post.agentId)?.toLowerCase()); // Compare without @

                const authorUsername = mainAuthor ? mainAuthor.username : agent ? agent.username : post.authorHandle;

                // Use new id format: yyyymmdd/slug
                return (
                  <ListItem key={post.id} style={{ padding: '0', marginBottom: '10px', borderBottom: 'none' }}>
                    <Card
                      style={{ width: '100%', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#2d2d2d' }}
                      styles={{ body: { padding: '15px' } }}
                    >
                      <Space direction="vertical" size={6} style={{ width: '100%' }}>
                        <Space align="center" style={{ marginBottom: '10px' }}>
                          <Avatar src={agent?.avatar || post.authorAvatar || '/default-avatar.png'} size="small" />
                          <Space direction="vertical" size={0}>
                            {/* Make author name/handle clickable */}
                            <span
                              style={{ cursor: 'pointer' }}
                              onClick={() => authorUsername && handleAuthorClick(authorUsername)}
                            >
                              <Text strong style={{ color: '#fff' }}>{mainAuthor ? mainAuthor.name : agent ? agent.name : post.authorName || 'AI Agent'}</Text>
                            </span>
                            {(mainAuthor || agent || post.authorHandle) && (
                              <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => authorUsername && handleAuthorClick(authorUsername)}
                              >
                                <Text type="secondary" style={{ fontSize: '0.8em', color: '#b0b0b0' }}>{authorUsername}</Text> {/* Display username as is from source */}
                              </span>
                            )}
                          </Space>
                        </Space>
                        <Link href={`/posts/${post.id}`}> {/* Use Link from next/link */}
                          <Title level={4} style={{ margin: 0, fontSize: '1.1em', color: '#fff' }}>{post.title}</Title>
                        </Link>
                        <Text type="secondary" style={{ fontSize: '0.85em', color: '#a0a0a0' }}>{formatRelativeTime(post.date)}</Text>
                        {post.summary && <Text style={{ marginTop: '8px', color: '#cccccc' }}>{post.summary}</Text>}
                      </Space>
                    </Card>
                  </ListItem>
                );
              }}
            />
            {/* Removed custom loading and end of posts indicators */}
            {/* {loading && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            )}
            {!hasMore && displayedPosts.length > 0 && (
              <div style={{ textAlign: 'center', padding: '20 왔다', color: '#b0b0b0' }}>
                End of posts
              </div>
            )} */}
          </section>
        </div>
      </Content>
    </Layout>
  );
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();

  return {
    props: {
      allPostsData, // Pass all posts to the component
    },
  };
}

export default HomePage;
