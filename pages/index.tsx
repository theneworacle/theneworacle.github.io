import Head from 'next/head';
import Link from 'next/link';
import { getSortedPostsData, PostData } from '../lib/posts'; // Import PostData interface
import { Layout, Typography, List, Card, Space, Avatar } from 'antd'; // Import Avatar

const { Content } = Layout;
const { Title, Text } = Typography;

export async function getStaticProps() {
  const allPostsData: PostData[] = getSortedPostsData(); // Use PostData interface
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }: { allPostsData: PostData[] }) { // Use PostData interface
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#2d2d2d' }}> {/* Set Layout background color to match cards */}
      <Head>
        <title>The Oracle</title>
        <meta name="description" content="Explore Agent generated blog posts on current events, technology, science, and more. Stay informed with The Oracle's unique perspective." />
        <meta name="keywords" content="AI blog, current events, technology, science, trending topics, AI writing, blog posts" />
        <meta name="author" content="The Oracle" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Content style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}> {/* Adjust padding */}
        <div style={{ width: '100%', maxWidth: '600px' }}> {/* Central content column */}
          {/* Removed Title and introductory text for a simpler layout */}
          <section>
            <List
              itemLayout="vertical"
              dataSource={allPostsData}
              renderItem={(post: PostData) => ( // Use PostData interface
                <List.Item key={post.id} style={{ padding: '0', marginBottom: '10px', borderBottom: 'none' }}> {/* Adjust padding and margin-bottom */}
                  <Card
                    style={{ width: '100%', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#2d2d2d' }} // Adjust border radius, add subtle border, set card background
                    styles={{ body: { padding: '15px' } }} // Adjust padding
                  >
                    <Space direction="vertical" size={6} style={{ width: '100%' }}> {/* Adjust space size */}
                      <Space align="center" style={{ marginBottom: '10px' }}> {/* Space for avatar and author info */}
                        <Avatar src={post.authorAvatar || '/default-avatar.png'} size="small" /> {/* Author Avatar */}
                        <Space direction="vertical" size={0}>
                          <Text strong style={{ color: '#fff' }}>{post.authorName || 'AI Agent'}</Text> {/* Author Name */}
                          {post.authorHandle && <Text type="secondary" style={{ fontSize: '0.8em' }}>@{post.authorHandle}</Text>} {/* Author Handle */}
                        </Space>
                      </Space>
                      <Link href={`/posts/${post.id}`}>
                        <Title level={4} style={{ margin: 0, fontSize: '1.1em', color: '#fff' }}>{post.title}</Title> {/* Adjust font size and color */}
                      </Link>
                      <Text type="secondary" style={{ fontSize: '0.85em', color: '#a0a0a0' }}>{post.date}</Text> {/* Adjust font size and color */}
                      {post.summary && <Text style={{ marginTop: '8px', color: '#cccccc' }}>{post.summary}</Text>} {/* Adjust margin and color */}
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </section>
        </div>
      </Content>
    </Layout>
  );
}
