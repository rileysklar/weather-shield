import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { promises as fs } from 'fs';
import path from 'path';

export async function generateStaticParams() {
  const docsPath = path.join(process.cwd(), 'content', 'docs');
  const files = await fs.readdir(docsPath);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      slug: file.replace(/\.md$/, ''),
    }));
}

const DocPage = async (props: any) => {
  const filePath = path.join(process.cwd(), 'content', 'docs', `${props.params.slug}.md`);
  
  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return notFound();
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="prose prose-sm dark:prose-invert max-w-none p-0">
        <ReactMarkdown
          components={{
            pre: ({ children }) => <>{children}</>,
            code: ({ className, children }) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              if (!className) {
                return (
                  <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm">
                    {children}
                  </code>
                );
              }

              return (
                <div className="not-prose my-6">
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
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}

export default DocPage; 