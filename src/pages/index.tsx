import { GetStaticProps } from 'next';
import Head from 'next/head'
import Link from 'next/link'

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

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

export default function Home({postsPagination}:HomeProps) {
  const postsFormated = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {
        locale: ptBR,
      })
    }
  })
  const [posts, setPosts] = useState(postsFormated)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  const handleNextPost = async () => {
    if(!nextPage) {
      return
    }
    const newPostResponse = await fetch(nextPage).then(response => response.json())
    setNextPage(newPostResponse?.next_page)

    const newPost = newPostResponse?.results.map((post) => {
      return {
        uid: post?.uid,
        first_publication_date: format(new Date(post?.first_publication_date), 'dd MMM yyyy', {
          locale: ptBR,
        }),
        data: {
          title: post?.data?.title,
          subtitle: post?.data?.subtitle,
          author: post?.data?.author
        }
      }
    })
    setPosts((prePosts) => [...prePosts, ...newPost])
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={commonStyles.info}>
                  <FiCalendar />
                  <time>{post.first_publication_date}</time>
                  <FiUser />
                  <p className={commonStyles.author}>{post.data.author}</p>
                </div>
              </a>
            </Link>
           ))}
          {nextPage && 
            <button onClick={handleNextPost}>
              Carregar mais posts
            </button>
          }
        </div>
      </main>
    </>
  )
}

export const getStaticProps:GetStaticProps = async () => {
  const prismic = getPrismicClient();
  
  const postsResponse = await prismic.query<any>(
    [Prismic.Predicates.at("document.type", "post")],
    {
      fetch: ["post.title", "post.subtitle", "post.author"],
      pageSize: 1
    }
  );

  const posts = postsResponse.results.map((post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }
};
