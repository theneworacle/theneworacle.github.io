import Head from 'next/head';
import Link from 'next/link';
import { getSortedPostsData } from '../lib/posts';
import { Layout, Typography, List, Card } from 'antd';

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
    <Layout>
      <Head>
        <title>The Oracle - AI-Generated Blog Posts</title>
        <meta name="description" content="Explore AI-generated blog posts on current events, technology, science, and more. Stay informed with The Oracle's unique perspective." />
        <meta name="keywords" content="AI blog, current events, technology, science, trending topics, AI writing, blog posts" />
        <meta name="author" content="The Oracle" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content" style={{ margin: '16px auto', maxWidth: '960px' }}>
          <Title level={1}>Welcome to The Oracle</Title>
          <Text>AI-generated blog posts on current events and trending topics.</Text>

          <section style={{ marginTop: '40px' }}>
            <Title level={2}>Latest Posts</Title>
            <List
              itemLayout="vertical"
              dataSource={allPostsData}
              renderItem={( { id, date, title, summary }: { id: string; date: string; title: string; summary: string } ) => (
                <List.Item key={id}>
                  <Card style={{ width: '100%' }}>
                    <List.Item.Meta
                      title={
                        <Link href={`/posts/${id}`}>
                          {title}
                        </Link>
                      }
                      description={<Text type="secondary">{date}</Text>}
                    />
                    {summary && <Text>{summary}</Text>}
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
