'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';


interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadToCloudinary(file, 'article');
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const handleLinkAdd = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-2 p-2 border-b bg-muted">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic')}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive('bulletList')}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive('orderedList')}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          data-active={editor.isActive('blockquote')}
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLinkAdd}
          data-active={editor.isActive('link')}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <label>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <Button variant="ghost" size="sm" asChild>
            <span>
              <ImageIcon className="w-4 h-4" />
            </span>
          </Button>
        </label>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-4" />
      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
          outline: none;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
        }
        [data-active="true"] {
          background-color: var(--accent);
          color: var(--accent-foreground);
        }
      `}</style>
    </div>
  );
} 