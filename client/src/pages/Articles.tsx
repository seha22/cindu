import { useState } from "react";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useArticles } from "@/hooks/use-articles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@shared/schema";

function ArticleDetail({ article, onBack }: { article: Article; onBack: () => void }) {
  return (
    <article className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-8 text-muted-foreground rounded-full px-6"
        data-testid="button-back-articles"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Artikel
      </Button>

      <div className="rounded-3xl border border-border/50 bg-white shadow-xl shadow-primary/5">
        <div className="relative h-64 md:h-96">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover rounded-t-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-3xl" />
          <div className="absolute bottom-6 left-6 right-6">
            <Badge variant="secondary" className="mb-3 bg-white/20 text-white backdrop-blur-md border-white/10">
              {article.category}
            </Badge>
            <h1 className="font-bold text-3xl md:text-4xl text-white leading-tight" data-testid="text-article-title">
              {article.title}
            </h1>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-10 pb-8 border-b border-border/50">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span data-testid="text-article-author">{article.author}</span>
            </div>
            {article.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{new Date(article.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              <span>{article.category}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed" data-testid="text-article-content">
            {article.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="mb-6">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Articles() {
  const { data: articles, isLoading } = useArticles();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {selectedArticle ? (
            <ArticleDetail
              article={selectedArticle}
              onBack={() => setSelectedArticle(null)}
            />
          ) : (
            <>
              <div className="max-w-2xl mb-16">
                <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="text-articles-heading">
                  Artikel & <span className="text-primary">Berita</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Ikuti kabar terbaru seputar kegiatan yayasan, kisah inspiratif penerima manfaat, dan informasi seputar zakat dan sedekah.
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-3xl h-[400px] animate-pulse border border-border/50" />
                  ))}
                </div>
              ) : articles && articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {articles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="text-left group bg-white rounded-3xl border border-border/50 shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                      data-testid={`card-article-${article.id}`}
                    >
                      <div className="relative h-52">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover rounded-t-3xl"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-primary border-0 shadow-sm">
                            {article.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-6">
                        <h2 className="font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground/70 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>{article.author}</span>
                          </div>
                          {article.createdAt && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {new Date(article.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
                  <p className="text-lg font-medium text-muted-foreground">Belum ada artikel yang tersedia saat ini.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
