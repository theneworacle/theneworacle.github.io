import Head from 'next/head';
import { getAllPostIds, getPostData } from '../../lib/posts';
import { Layout, Typography } from 'antd';

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

export default function Post({ postData }: { postData: { title: string; date: string; summary: string; contentHtml: string } }) {
  return (
    <Layout>
      <Head>
        <title>{postData.title} - The Oracle</title>
        <meta name="description" content={postData.summary || postData.title} />
        <meta name="keywords" content={`${postData.title}, ${postData.date}, AI blog, current events, technology, science`} />
        <meta name="author" content="The Oracle" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content" style={{ margin: '16px auto', maxWidth: '960px' }}>
          <article>
            <Title level={1}>{postData.title}</Title>
            <Text type="secondary">{postData.date}</Text>
            <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} style={{ marginTop: '20px' }} />
          </article>
        </div>
      </Content>
    </Layout>
  );
}
