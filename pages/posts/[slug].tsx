import Head from 'next/head';
import { getAllPostIds, getPostData } from '../../lib/posts';

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

export default function Post({ postData }) {
  return (
    <div>
      <Head>
        <title>{postData.title} - The Oracle</title>
        <meta name="description" content={postData.summary || postData.title} />
        <meta name="keywords" content={`${postData.title}, ${postData.date}, AI blog, current events, technology, science`} />
        <meta name="author" content="The Oracle" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <article>
        <h1>{postData.title}</h1>
        <div>
          {postData.date}
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </div>
  );
}
