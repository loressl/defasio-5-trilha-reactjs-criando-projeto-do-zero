import { GetStaticProps } from 'next';
import Head from 'next/head'
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          <Link href="#">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div className={styles.info}>
                <FiCalendar />
                <time>10 abr 2022</time>
                <FiUser />
                <p>Joseph Oliveira</p>
              </div>
            </a>
          </Link>
        </div>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
