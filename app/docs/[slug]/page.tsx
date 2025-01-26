import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import fs from 'fs';
import path from 'path';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'content', 'docs', `${slug}.md`);
  
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    notFound();
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="prose prose-sm dark:prose-invert max-w-none p-0">
        <ReactMarkdown
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              if (inline) {
                return <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm" {...props}>{children}</code>;
              }
              return (
                <div className="relative">
                  <div className="absolute top-0 right-0 bg-muted px-3 py-1 rounded-bl text-xs font-mono text-muted-foreground">
                    {language}
                  </div>
                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      padding: '2.5rem 1.5rem 1.5rem 1.5rem',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            },
            h1: ({children}) => <h1 className="text-4xl font-bold mb-4 mt-0">{children}</h1>,
            h2: ({children}) => <h2 className="text-3xl font-semibold mt-8 mb-4">{children}</h2>,
            h3: ({children}) => <h3 className="text-2xl font-semibold mt-6 mb-3">{children}</h3>,
            p: ({children}) => <p className="text-base leading-7 mb-4">{children}</p>,
            ul: ({children}) => <ul className="list-disc list-inside mb-4">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
            li: ({children}) => <li className="mb-1">{children}</li>,
            a: ({children, href}) => (
              <a href={href} className="text-primary hover:underline">
                {children}
              </a>
            ),
            blockquote: ({children}) => (
              <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
} 