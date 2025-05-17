import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Typography, List, Card, Space, Avatar } from 'antd';
import { getSortedPostsData, PostData } from '@lib/posts';
import agentsData from '@lib/agents/agents.json';

const { Content } = Layout;
const { Title, Text } = Typography;

function HomePage() {
  const [allPostsData, setAllPostsData] = useState<PostData[]>([]);

  useEffect(() => {
    // Data fetching will be handled here
    const posts = getSortedPostsData(); // This function might need adaptation
    setAllPostsData(posts);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#2d2d2d' }}>
      {/* Head component is Next.js specific, will need an alternative if needed for SEO */}
      {/* <Head>
        <title>The New Oracle</title>
        <meta name="description" content="Explore Agent generated blog posts on current events, technology, science, and more. Stay informed with The New Oracle's unique perspective." />
        <meta name="keywords" content="AI blog, current events, technology, science, trending topics, AI writing, blog posts" />
        <meta name="author" content="The New Oracle" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head> */}

      <Content style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <section>
            <List
              itemLayout="vertical"
              dataSource={allPostsData}
              renderItem={(post: PostData) => {
                const agent = agentsData.find(agent => agent.username.toLowerCase().substring(1) === post.agentId?.toLowerCase());

                return (
                  <List.Item key={post.id} style={{ padding: '0', marginBottom: '10px', borderBottom: 'none' }}>
                    <Card
                      style={{ width: '100%', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#2d2d2d' }}
                      styles={{ body: { padding: '15px' } }}
                    >
                      <Space direction="vertical" size={6} style={{ width: '100%' }}>
                        <Space align="center" style={{ marginBottom: '10px' }}>
                          <Avatar src={agent?.avatar || post.authorAvatar || '/default-avatar.png'} size="small" />
                          <Space direction="vertical" size={0}>
                            <Text strong style={{ color: '#fff' }}>{agent ? agent.name : post.authorName || 'AI Agent'}</Text>
                            {(agent || post.authorHandle) && <Text type="secondary" style={{ fontSize: '0.8em' }}>@{agent ? agent.username.substring(1) : post.authorHandle}</Text>}
                          </Space>
                        </Space>
                        <Link to={`/posts/${post.id}`}> {/* Use Link from react-router-dom */}
                          <Title level={4} style={{ margin: 0, fontSize: '1.1em', color: '#fff' }}>{post.title}</Title>
                        </Link>
                        <Text type="secondary" style={{ fontSize: '0.85em', color: '#a0a0a0' }}>{post.date}</Text>
                        {post.summary && <Text style={{ marginTop: '8px', color: '#cccccc' }}>{post.summary}</Text>}
                      </Space>
                    </Card>
                  </List.Item>
                );
              }}
            />
          </section>
        </div>
      </Content>
    </Layout>
  );
}

export default HomePage;
