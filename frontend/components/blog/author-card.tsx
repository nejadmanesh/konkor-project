import { Author } from '@/lib/api'
import Image from 'next/image'
import { Twitter, Linkedin, Instagram, Award, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthorCardProps {
  author: Author
}

export function AuthorCard({ author }: AuthorCardProps) {
  if (!author || !author.display_name) {
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-primary/5 border border-border/50 p-8 md:p-10 hover:border-primary/30 transition-all">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {author.profile_image ? (
          <div className="relative w-[7.5rem] h-[7.5rem] md:w-[8.75rem] md:h-[8.75rem] rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg flex-shrink-0 group-hover:shadow-xl transition-shadow">
            <Image
              src={author.profile_image}
              alt={author.display_name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="relative w-[7.5rem] h-[7.5rem] md:w-[8.75rem] md:h-[8.75rem] rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="w-[3.75rem] h-[3.75rem] md:w-[4.375rem] md:h-[4.375rem] text-primary" />
          </div>
        )}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-3xl font-bold text-foreground">{author.display_name}</h3>
              {author.expertise && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                  <Award className="w-4 h-4" />
                  <span>{author.expertise}</span>
                </div>
              )}
            </div>
            {author.bio && (
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                {author.bio}
              </p>
            )}
          </div>
          {(author.twitter_url || author.linkedin_url || author.instagram_url) && (
            <div className="flex items-center gap-4 pt-3">
              {author.twitter_url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/20"
                >
                  <a href={author.twitter_url} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-5 h-5 ml-3" />
                    توییتر
                  </a>
                </Button>
              )}
              {author.linkedin_url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/20"
                >
                  <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-5 h-5 ml-3" />
                    لینکدین
                  </a>
                </Button>
              )}
              {author.instagram_url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hover:bg-pink-50 hover:border-pink-300 dark:hover:bg-pink-950/20"
                >
                  <a href={author.instagram_url} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-5 h-5 ml-3" />
                    اینستاگرام
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

