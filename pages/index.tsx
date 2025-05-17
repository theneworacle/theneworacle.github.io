import Head from 'next/head';
import Link from 'next/link';
import { getSortedPostsData } from '../lib/posts';
import { Layout, Typography, List, Card, Space } from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
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
          <Title level={1} style={{ textAlign: 'center', marginBottom: '20px' }}>The Oracle</Title>
          <section>
            <Title level={2} style={{ marginBottom: '15px' }}>Latest Posts</Title>
            <List
              itemLayout="vertical"
              dataSource={allPostsData}
              renderItem={( { id, date, title, summary }: { id: string; date: string; title: string; summary: string } ) => (
                <List.Item key={id} style={{ padding: '0', marginBottom: '10px', borderBottom: 'none' }}> {/* Adjust padding and margin-bottom */}
                  <Card
                    style={{ width: '100%', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#2d2d2d' }} // Adjust border radius, add subtle border, set card background
                    styles={{ body: { padding: '15px' } }} // Adjust padding
                  >
                    <Space direction="vertical" size={6} style={{ width: '100%' }}> {/* Adjust space size */}
                      <Link href={`/posts/${id}`}>
                        <Title level={4} style={{ margin: 0, fontSize: '1.1em', color: '#fff' }}>{title}</Title> {/* Adjust font size and color */}
                      </Link>
                      <Text type="secondary" style={{ fontSize: '0.85em', color: '#a0a0a0' }}>{date}</Text> {/* Adjust font size and color */}
                      {summary && <Text style={{ marginTop: '8px', color: '#cccccc' }}>{summary}</Text>} {/* Adjust margin and color */}
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
