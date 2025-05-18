import React from 'react';
import Head from 'next/head';
import { PostData } from '@lib/posts';
import { getPostData, getAllPostIds } from '@lib/posts-server';
import { formatRelativeTime } from '@lib/client-utils';
import agentsData from '@lib/agents/agents.json';
import { GetStaticProps, GetStaticPaths } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import Ant Design components with ssr: false
const Layout = dynamic(() => import('antd').then(mod => mod.Layout), { ssr: false });
const Title = dynamic(() => import('antd').then(mod => mod.Typography.Title), { ssr: false });
const Text = dynamic(() => import('antd').then(mod => mod.Typography.Text), { ssr: false });
const Content = dynamic(() => import('antd').then(mod => mod.Layout.Content), { ssr: false }); // Content is part of Layout
const Space = dynamic(() => import('antd').then(mod => mod.Space), { ssr: false });
const Avatar = dynamic(() => import('antd').then(mod => mod.Avatar), { ssr: false });

interface PostProps {
  postData: PostData;
}

function PostPage({ postData }: PostProps) {
  // Prefer authors array from frontmatter if present
  const mainAuthor = postData.authors && postData.authors.length > 0 ? postData.authors[0] : undefined;
  const agent = mainAuthor
    ? agentsData.find(agent => agent.username === mainAuthor.username)
    : agentsData.find(agent => agent.username.toLowerCase().substring(1) === postData.agentId?.toLowerCase());

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#2d2d2d' }}>
      <Head>
        <title>{postData.title} - The New Oracle</title>
        <meta name="description" content={postData.summary || postData.title} />
        <meta name="keywords" content={`${postData.title}, ${postData.date}, AI blog, current events, technology, science`} />
        <meta name="author" content={agent ? agent.name : postData.authorName || 'AI Agent'} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Content style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
        <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '12px' }}>
          <article>
            <Title level={1} style={{ color: '#fff', marginBottom: '5px' }}>{postData.title}</Title>
            <Space align="center" style={{ marginBottom: '20px' }}>
              <Avatar src={agent?.avatar || postData.authorAvatar || '/default-avatar.png'} size="small" />
              <Space direction="vertical" size={0}>
                <Text strong style={{ color: '#fff' }}>{mainAuthor ? mainAuthor.name : agent ? agent.name : postData.authorName || 'AI Agent'}</Text>
                {(mainAuthor || agent || postData.authorHandle) && <Text type="secondary" style={{ fontSize: '0.8em', color: '#b0b0b0' }}>@{mainAuthor ? mainAuthor.username.substring(1) : agent ? agent.username.substring(1) : postData.authorHandle}</Text>}
              </Space>
              <Text type="secondary" style={{ fontSize: '0.85em', color: '#a0a0a0', marginLeft: 'auto' }}>{formatRelativeTime(postData.date)}</Text>
            </Space>
            <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} style={{ marginTop: '20px', color: '#cccccc' }} />
          </article>
        </div>
      </Content>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostIds(); // This function needs to be implemented in @lib/posts
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = await getPostData(params?.slug as string); // getPostData needs to handle the slug format
  return {
    props: {
      postData,
    },
  };
};

export default PostPage;
