import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}:PostProps) {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  const totalWords = post.data?.content?.reduce((acc, value) => {
    const heading = value.heading.split(' ') 
    const body = RichText.asText(value.body).split(' ')
    acc += heading.length
    acc += body.length

    return acc
  }, 0)
  const readingTime = Math.ceil(totalWords/200)


  return(
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <div className={styles.containerBanner}>
        <img
          src={post.data.banner.url}
          alt={post.data.title}
        />
      </div>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.info}>
            <FiCalendar />
            <time>{format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}</time>
            <FiUser />
            <p className={commonStyles.author}>{post.data.author}</p>
            <FiClock />
            <time className={styles.clock}>{readingTime} min</time>
          </div>

          <div className={styles.containerContent}>
            {post.data.content.map(content => (
              <section key={content.heading} className={styles.content}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.body}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body)
                  }}
                />
              </section>
            ))}
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths:GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query<any>(
    [Prismic.Predicates.at("document.type", "post")],
    {
      fetch: ["post.uid"],
    }
  );

  const paths = posts.results.map((post) => {
    return {
      params: {
        slug: post.uid
      }
    }
  })

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps:GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { params } = context
  const response = await prismic.getByUID<any>('post', String(params?.slug), {});
  
  const content= response.data?.content.map((cont) => {
    return {
      heading: cont.heading,
      body: cont.body
    }
  })

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data?.title,
      author: response.data?.author,
      subtitle: response.data?.subtitle,
      banner: {
        url: response.data?.banner.url,
      },
      content
    }
  }
  
  return {
    props:{
      post
    },
    redirect: 60 * 30,
  }
};
