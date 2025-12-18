'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, AlignCenter, AlignRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TiptapEditorProps {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}

const TiptapEditor = ({ value, onChange, disabled }: TiptapEditorProps) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                bulletList: false,
                orderedList: false,
            }),
            TextStyle,
            Color,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['right', 'center', 'left', 'justify'],
                defaultAlignment: 'right', // Default to right for Arabic
            }),
        ],
        content: value,
        editable: !disabled,
        editorProps: {
            attributes: {
                class: 'min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-2xl font-arabic leading-loose ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rtl text-right',
                style: 'font-family: var(--font-arabic);'
            },
            // Better paste handling
            transformPastedHTML(html) {
                return html;
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    // Update editor content if external value changes (and isn't the same)
    // This is tricky with Tiptap to avoid cursor jumps, but simple check helps
    React.useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Only set if completely empty or significantly different to avoid loops
            // For simple forms, this might be okay, but ideally we check if focused.
            if (editor.getText() === '' && value === '') return;
            // If the diff is just formatting, we might want to keep it, but efficient syncing is hard.
            // For now, assume value is source of truth only on initial load or reset.
            if (editor.isEmpty && value) {
                editor.commands.setContent(value)
            }
        }
    }, [value, editor])

    // Force update when initially loading if value exists
    React.useEffect(() => {
        if (editor && value && editor.isEmpty) {
            editor.commands.setContent(value);
        }
    }, [editor])


    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-col gap-2 border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <div className="bg-muted p-2 flex flex-wrap gap-1 items-center border-b">
                {/* Standard Formatting */}
                <Button
                    type="button"
                    variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="h-8 w-8 p-0"
                    title="Tebal (Bold)"
                    disabled={disabled}
                >
                    <BoldIcon className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="h-8 w-8 p-0"
                    title="Miring (Italic)"
                    disabled={disabled}
                >
                    <ItalicIcon className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className="h-8 w-8 p-0"
                    title="Garis Bawah (Underline)"
                    disabled={disabled}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Alignment */}
                <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className="h-8 w-8 p-0"
                    title="Rata Tengah"
                    disabled={disabled}
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className="h-8 w-8 p-0"
                    title="Rata Kanan (Default Arabic)"
                    disabled={disabled}
                >
                    <AlignRight className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Custom Reference Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        editor.chain().focus().setColor('#DC2626').toggleBold().run()
                    }}
                    className="h-8 text-xs font-bold text-red-600 bg-white"
                    title="Referensi Kitab (Merah & Tebal)"
                    disabled={disabled}
                >
                    [ Ref ]
                </Button>

                {/* Separator Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        editor.chain().focus().insertContent('<p style="text-align: center">***</p>').run()
                    }}
                    className="h-8 px-2 text-xs bg-white font-mono"
                    title="Separator Tengah"
                    disabled={disabled}
                >
                    ***
                </Button>

            </div>
            <EditorContent editor={editor} className="p-2 min-h-[200px] outline-none" />
        </div>
    )
}

export default TiptapEditor
