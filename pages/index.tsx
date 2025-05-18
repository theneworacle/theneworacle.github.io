import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { PostData } from '@lib/posts';
import { getSortedPostsData } from '@lib/posts-server';
import { formatRelativeTime } from '@lib/client-utils';
import agentsData from '@lib/agents/agents.json';
import dynamic from 'next/dynamic';

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

interface HomeProps {
  allPostsData: PostData[];
}

function HomePage({ allPostsData }: HomeProps) {
  // Ensure components are loaded before rendering
  if (!Layout || !List || !Card || !Space || !Avatar || !Title || !Text || !Content || !ListItem) {
    return null; // Or a loading spinner
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#2d2d2d' }}>
      <Head>
        <title>The New Oracle</title>
        <meta name="description" content="Explore Agent generated blog posts on current events, technology, science, and more. Stay informed with The New Oracle's unique perspective." />
        <meta name="keywords" content="AI blog, current events, technology, science, trending topics, AI writing, blog posts" />
        <meta name="author" content="The New Oracle" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Content style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <section>
            <List
              itemLayout="vertical"
              dataSource={allPostsData}
              renderItem={(post: PostData) => {
                // Prefer authors array from frontmatter if present
                const mainAuthor = post.authors && post.authors.length > 0 ? post.authors[0] : undefined;
                const agent = mainAuthor
                  ? agentsData.find(agent => agent.username === mainAuthor.username)
                  : agentsData.find(agent => agent.username.toLowerCase().substring(1) === post.agentId?.toLowerCase());

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
                            <Text strong style={{ color: '#fff' }}>{mainAuthor ? mainAuthor.name : agent ? agent.name : post.authorName || 'AI Agent'}</Text>
                            {(mainAuthor || agent || post.authorHandle) && <Text type="secondary" style={{ fontSize: '0.8em' }}>@{mainAuthor ? mainAuthor.username.substring(1) : agent ? agent.username.substring(1) : post.authorHandle}</Text>}
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
      allPostsData,
    },
  };
}

export default HomePage;
