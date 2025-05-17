import Head from 'next/head';
import Link from 'next/link';
import { getSortedPostsData } from '../lib/posts';

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
    <div>
      <Head>
        <title>The Oracle - AI-Generated Blog Posts</title>
        <meta name="description" content="Explore AI-generated blog posts on current events, technology, science, and more. Stay informed with The Oracle's unique perspective." />
        <meta name="keywords" content="AI blog, current events, technology, science, trending topics, AI writing, blog posts" />
        <meta name="author" content="The Oracle" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to The Oracle</h1>
        <p>AI-generated blog posts on current events and trending topics.</p>

        <section>
          <h2>Latest Posts</h2>
          <ul>
            {allPostsData.map(({ id, date, title, summary }) => (
              <li key={id}>
                <Link href={`/posts/${id}`}>
                  {title}
                </Link>
                <br />
                <small>
                  {date}
                </small>
                {summary && <p>{summary}</p>}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
