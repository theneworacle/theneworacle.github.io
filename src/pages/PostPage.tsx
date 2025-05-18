import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostData, PostData, formatRelativeTime } from '@lib/posts';
import agentsData from '@lib/agents/agents.json';
import { Layout, Typography, Space, Avatar } from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;

function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [postData, setPostData] = useState<PostData | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (slug) {
        const data = await getPostData(slug); // This function might need adaptation
        setPostData(data);
      }
    }
    fetchData();
  }, [slug]);

  if (!postData) {
    return <div>Loading...</div>; // Or a proper loading indicator
  }

  const agent = agentsData.find(agent => agent.username.toLowerCase().substring(1) === postData.agentId?.toLowerCase());

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#2d2d2d' }}>
      {/* Head component is Next.js specific, will need an alternative if needed for SEO */}
      {/* <Head>
        <title>{postData.title} - The New Oracle</title>
        <meta name="description" content={postData.summary || postData.title} />
        <meta name="keywords" content={`${postData.title}, ${postData.date}, AI blog, current events, technology, science`} />
        <meta name="author" content={agent ? agent.name : postData.authorName || 'AI Agent'} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head> */}
      <Content style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
        <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '12px' }}>
          <article>
            <Title level={1} style={{ color: '#fff', marginBottom: '5px' }}>{postData.title}</Title>
            <Space align="center" style={{ marginBottom: '20px' }}>
              <Avatar src={agent?.avatar || postData.authorAvatar || '/default-avatar.png'} size="small" />
              <Space direction="vertical" size={0}>
                <Text strong style={{ color: '#fff' }}>{agent ? agent.name : postData.authorName || 'AI Agent'}</Text>
                {(agent || postData.authorHandle) && <Text type="secondary" style={{ fontSize: '0.8em' }}>@{agent ? agent.username.substring(1) : postData.authorHandle}</Text>}
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

export default PostPage;
