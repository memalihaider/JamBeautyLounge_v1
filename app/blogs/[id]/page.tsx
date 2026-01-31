'use client';

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Calendar, Clock, User, ArrowLeft, Tag, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { blogPosts } from "../data";
import { useState } from "react";

export default function BlogArticlePage() {
  const params = useParams();
  const articleId = parseInt(params.id as string);
  const [liked, setLiked] = useState(false);

  const article = blogPosts.find(post => post.id === articleId);
  const relatedPosts = blogPosts.filter(post => 
    post.category === article?.category && post.id !== article?.id
  ).slice(0, 3);

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">Sorry, we couldn't find the article you're looking for.</p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl">
            <Link href="/blogs">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 pt-32">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] w-full overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <Link
          href="/blogs"
          className="absolute top-8 left-8 z-20 inline-flex items-center gap-2 text-white hover:text-gray-200 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
          <div className="max-w-4xl mx-auto text-white space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white px-4 py-2 rounded-full">
                {article.category}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article Meta */}
      <section className="py-8 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                {article.author.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{article.author}</div>
                {article.authorBio && <div className="text-sm text-gray-600">{article.authorBio}</div>}
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(article.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Sticky Share and Like */}
          <div className="sticky top-8 float-right ml-8 mb-8 hidden lg:block">
            <div className="space-y-4 w-16">
              <button
                onClick={() => setLiked(!liked)}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-secondary hover:text-white flex items-center justify-center transition-all duration-300 group"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            {article.fullContent.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('##')) {
                return (
                  <h2 key={index} className="text-3xl font-serif font-bold text-primary mt-12 mb-6">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('###')) {
                return (
                  <h3 key={index} className="text-2xl font-serif font-bold text-primary mt-8 mb-4">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('-') && paragraph.includes(':')) {
                return (
                  <div key={index} className="pl-6 my-4 border-l-4 border-primary/20">
                    <p className="text-gray-700 leading-relaxed">{paragraph.replace('- ', '')}</p>
                  </div>
                );
              }
              if (paragraph.startsWith('- ') || paragraph.match(/^\d+\./)) {
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 my-4 text-gray-700">
                    {paragraph.split('\n').map((item, i) => (
                      <li key={i} className="text-gray-700">{item.replace(/^[-\d.]\s/, '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="text-gray-700 leading-relaxed my-4">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-4 py-2 rounded-full text-sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Share this article</h4>
                <p className="text-sm text-gray-600">Help others discover this beauty insight</p>
              </div>
              <div className="flex gap-3">
                {[
                  { name: 'Twitter', icon: '𝕏' },
                  { name: 'Facebook', icon: 'f' },
                  { name: 'LinkedIn', icon: 'in' }
                ].map((social) => (
                  <button
                    key={social.name}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 text-sm font-bold"
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Related Articles</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((post) => (
                <Link key={post.id} href={`/blogs/${post.id}`}>
                  <article className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                        <span className="text-gray-300">•</span>
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                      <h3 className="text-lg font-serif font-bold text-primary line-clamp-2 group-hover:text-secondary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="space-y-6">
            <h2 className="text-4xl font-serif font-bold">Ready for Your Transformation?</h2>
            <p className="text-xl opacity-90">
              Apply these beauty insights and book your personalized treatment with our expert team.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-2xl font-medium">
                <Link href="/booking">Book Now</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-2xl font-medium">
                <Link href="/blogs">More Articles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
