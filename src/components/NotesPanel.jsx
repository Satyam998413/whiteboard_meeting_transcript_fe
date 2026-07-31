import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

const randomColor = () => {
  const palette = ['#0d9488', '#f97316', '#a855f7', '#ef4444', '#3b82f6', '#eab308', '#ec4899'];
  return palette[Math.floor(Math.random() * palette.length)];
};

export default function NotesPanel({ doc, awareness, readOnly, user }) {
  const editor = useEditor(
    {
      editable: !readOnly,
      extensions: [
        // Collaboration's Y.UndoManager replaces StarterKit's default history — running both
        // causes duplicate/conflicting undo stacks per Tiptap's Yjs integration docs.
        StarterKit.configure({ history: false }),
        Collaboration.configure({ document: doc, field: 'notes' }),
        CollaborationCursor.configure({
          provider: { awareness },
          user: { name: user?.email || 'Anonymous', color: randomColor() },
        }),
      ],
    },
    [doc, awareness]
  );

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  return (
    <div className="glass flex h-full flex-col overflow-hidden p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Notes</h2>
      <div className="min-h-0 flex-1 overflow-y-auto rounded border border-border bg-black/10 p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
