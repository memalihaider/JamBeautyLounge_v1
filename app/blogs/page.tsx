'use client';

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, ArrowRight, Tag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { blogPosts } from "./data";

const categories = [
  { name: "All", count: blogPosts.length },
  { name: "Skincare", count: blogPosts.filter(p => p.category === "Skincare").length },
  { name: "Makeup", count: blogPosts.filter(p => p.category === "Makeup").length },
  { name: "Spa Treatments", count: blogPosts.filter(p => p.category === "Spa Treatments").length },
  { name: "Anti-Aging", count: blogPosts.filter(p => p.category === "Anti-Aging").length },
  { name: "Sustainable Beauty", count: blogPosts.filter(p => p.category === "Sustainable Beauty").length }
];

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 pt-32">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.02]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-medium">
              <Tag className="w-4 h-4" />
              Beauty Insights & Tips
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Beauty Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Discover expert beauty advice, trending tips, and insider knowledge from JAM Beauty Lounge's
              professional team. Your journey to radiant beauty starts here.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-16 px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search articles..."
                className="pl-12 pr-4 py-3 border-gray-200 rounded-2xl focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={category.name === "All" ? "default" : "outline"}
                  className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
                    category.name === "All"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                  }`}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {blogPosts.find(post => post.featured) && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Featured Article</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </div>

            {(() => {
              const featuredPost = blogPosts.find(post => post.featured)!;
              return (
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-500 group">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-96 md:h-auto overflow-hidden">
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                          {featuredPost.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-12 flex flex-col justify-center">
                      <div className="space-y-6">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {featuredPost.author}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(featuredPost.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {featuredPost.readTime}
                          </div>
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-primary leading-tight">
                          {featuredPost.title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {featuredPost.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <Button asChild className="w-fit bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-medium group/btn">
                          <Link href={`/blogs/${featuredPost.id}`}>
                            Read Full Article
                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Latest Articles</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(post => !post.featured).map((post) => (
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
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-primary leading-tight line-clamp-2 group-hover:text-secondary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-gray-200">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full justify-between text-primary hover:text-secondary hover:bg-secondary/5 p-0 h-auto font-medium group/btn">
                      Read More
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-16">
            <Button className="bg-primary hover:bg-primary/90 text-white px-12 py-4 rounded-2xl font-medium text-lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="space-y-8">
            <h2 className="text-4xl font-serif font-bold">Stay Beautiful</h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Subscribe to our newsletter for exclusive beauty tips, early access to new treatments,
              and special offers delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email address"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl px-6 py-4"
              />
              <Button className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-2xl font-medium whitespace-nowrap">
                Subscribe Now
              </Button>
            </div>
            <p className="text-sm opacity-75">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}