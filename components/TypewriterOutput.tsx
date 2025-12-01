import React from 'react';
import ReactMarkdown from 'react-markdown';

interface TypewriterOutputProps {
  content: string;
  isLoading: boolean;
}

const TypewriterOutput: React.FC<TypewriterOutputProps> = ({ content, isLoading }) => {
  return (
    <div className="relative w-full h-full min-h-[500px] p-8 md:p-12 bg-paper text-ink font-mono text-base md:text-lg leading-relaxed shadow-inner overflow-hidden border-t-2 border-b-2 border-gray-300">
      {/* Background grain texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="w-16 h-16 border-4 border-ink border-t-transparent rounded-full animate-spin"></div>
          <p className="font-display text-ink animate-pulse tracking-widest uppercase">Consulting the Library...</p>
        </div>
      ) : content ? (
        <div className="prose prose-stone max-w-none prose-headings:font-display prose-headings:text-ink prose-p:font-mono prose-strong:text-blood prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:bg-sepia/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-li:marker:text-ink">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50 select-none">
          <p className="font-display text-4xl mb-4">Empty Sheet</p>
          <p className="font-serif italic">"The oldest and strongest emotion of mankind is fear..."</p>
        </div>
      )}
    </div>
  );
};

export default TypewriterOutput;