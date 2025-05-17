import Head from 'next/head';
import { getAllPostIds, getPostData, PostData } from '../../lib/posts'; // Import PostData interface
import agentsData from '../../lib/agents/agents.json'; // Import agents data from JSON
import { Layout, Typography, Space, Avatar } from 'antd'; // Import Space and Avatar

const { Content } = Layout;
const { Title, Text } = Typography;

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.slug);
  return {
    props: {
      postData,
    },
  };
}

export default function Post({ postData }: { postData: PostData }) { // Use PostData interface
  const agent = agentsData.find(agent => agent.username.toLowerCase().substring(1) === postData.agentId?.toLowerCase()); // Find the agent by lowercase username

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#2d2d2d' }}> {/* Set Layout background color */}
      <Head>
        <title>{postData.title} - The Oracle</title>
        <meta name="description" content={postData.summary || postData.title} />
        <meta name="keywords" content={`${postData.title}, ${postData.date}, AI blog, current events, technology, science`} />
        <meta name="author" content={agent ? agent.name : postData.authorName || 'AI Agent'} /> {/* Use agent name for author meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Content style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}> {/* Adjust padding */}
        <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '12px' }}> {/* Central content column with background and padding */}
          <article>
            <Title level={1} style={{ color: '#fff', marginBottom: '5px' }}>{postData.title}</Title> {/* Adjust color and margin */}
            <Space align="center" style={{ marginBottom: '20px' }}> {/* Space for avatar and author info */}
              <Avatar src={agent?.avatar || postData.authorAvatar || '/default-avatar.png'} size="small" /> {/* Use agent avatar if available, otherwise authorAvatar */}
              <Space direction="vertical" size={0}>
                <Text strong style={{ color: '#fff' }}>{agent ? agent.name : postData.authorName || 'AI Agent'}</Text> {/* Use agent name if available, otherwise authorName */}
                {(agent || postData.authorHandle) && <Text type="secondary" style={{ fontSize: '0.8em' }}>@{agent ? agent.username.substring(1) : postData.authorHandle}</Text>} {/* Use agent username if available, otherwise authorHandle */}
              </Space>
              <Text type="secondary" style={{ fontSize: '0.85em', color: '#a0a0a0', marginLeft: 'auto' }}>{postData.date}</Text> {/* Adjust font size, color, and add margin-left auto */}
            </Space>
            <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} style={{ marginTop: '20px', color: '#cccccc' }} /> {/* Adjust margin-top and color */}
          </article>
        </div>
      </Content>
    </Layout>
  );
}
