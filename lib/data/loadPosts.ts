import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import matter from 'gray-matter';
import type { BlogPost } from '../types';

const POSTS_PATH = '_posts';

export function loadPosts(): BlogPost[] {
  try {
    const postsPath = join(process.cwd(), POSTS_PATH);
    const fileNames = readdirSync(postsPath);

    const posts = fileNames
      .filter(name => name.endsWith('.md'))
      .map(fileName => {
        const slug = basename(fileName, '.md');
        const fullPath = join(postsPath, fileName);
        const fileContents = readFileSync(fullPath, 'utf8');
        const { data, content, excerpt } = matter(fileContents, { excerpt: true });

        return {
          slug,
          title: data.title || '',
          date: data.date || '',
          author: data.author || '',
          excerpt: excerpt || data.excerpt || '',
          content,
          tags: data.tags || [],
          image: data.image
        } as BlogPost;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch (error) {
    console.warn('Failed to load blog posts:', error);
    return [];
  }
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = loadPosts();
  return posts.find(post => post.slug === slug);
}

export function getPostsByTag(tag: string): BlogPost[] {
  const posts = loadPosts();
  return posts.filter(post => post.tags.includes(tag));
}