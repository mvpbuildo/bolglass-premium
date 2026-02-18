'use client';

import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';
import { Card, Button } from '@bolglass/ui';
import { sendMailing } from './actions';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function MailingForm() {
    const quillRef = useRef<any>(null);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('pl');
    const [recipientType, setRecipientType] = useState('all');
    const [isSending, setIsSending] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

    // Custom SMTP Settings
    const [useCustomSmtp, setUseCustomSmtp] = useState(false);
    const [smtpConfig, setSmtpConfig] = useState({
        host: '',
        port: '587',
        user: '',
        password: '',
        from: ''
    });

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const formData = new FormData();
                formData.append('file', file);

                try {
                    // Save current cursor state
                    // Note: We need a ref to the Quill instance to insert properly
                    // But standard approach with modules is tricky without ref.
                    // Let's use a simpler approach: upload then append or insert at cursor if possible.
                    // Actually, with react-quill-new, getting the editor instance via ref is best.

                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await res.json();

                    if (data.success && data.url) {
                        // We need the quill instance content to insert. 
                        // Since we don't have a ref set up easily in this functional component without breaking changes,
                        // we might just append for now or try to use a ref.
                        // Ideally: const quill = quillRef.current.getEditor();
                        // quill.insertEmbed(range.index, 'image', data.url);

                        // Re-implementing with Ref is safer.
                        const fullUrl = `${window.location.origin}${data.url}`;
                        const range = quillRef.current?.getEditor().getSelection();
                        quillRef.current?.getEditor().insertEmbed(range ? range.index : 0, 'image', fullUrl);
                    } else {
                        alert('Błąd przesyłania zdjęcia.');
                    }
                } catch (e) {
                    console.error('Upload failed', e);
                    alert('Błąd przesyłania zdjęcia.');
                }
            }
        };
    };

    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    const handleSubmit = async () => {
        setIsSending(true);
        setResult(null);

        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('content', content);
        formData.append('targetLanguage', targetLanguage);
        formData.append('recipientType', recipientType);

        if (useCustomSmtp) {
            formData.append('smtpConfig', JSON.stringify(smtpConfig));
        }

        const res = await sendMailing(formData);
        setResult(res);
        setIsSending(false);

        if (res.success) {
            alert('Wiadomości zostały wysłane!');
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Treść Wiadomości</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">Temat</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                                    placeholder="Wpisz temat wiadomości..."
                                />
                            </div>
                            <div className="h-96 pb-12 text-gray-900">
                                <label className="block text-sm font-bold mb-1 text-gray-900">Treść</label>
                                <ReactQuill
                                    ref={quillRef}
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={modules}
                                    formats={formats}
                                    className="h-full bg-white text-gray-900"
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Odbiorcy</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">Język Odbiorców</label>
                                <select
                                    value={targetLanguage}
                                    onChange={(e) => setTargetLanguage(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                                >
                                    <option value="pl">Polski (PL)</option>
                                    <option value="en">Angielski (EN)</option>
                                    <option value="de">Niemiecki (DE)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Wiadomość trafi tylko do użytkowników z ustawionym tym językiem.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">Grupa</label>
                                <select
                                    value={recipientType}
                                    onChange={(e) => setRecipientType(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                                >
                                    <option value="all">Wszyscy Użytkownicy</option>
                                    <option value="newsletter">Tylko Newsletter (jeśli dostępny)</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Ustawienia SMTP</h2>
                            <label className="flex items-center gap-2 cursor-pointer text-gray-900">
                                <input
                                    type="checkbox"
                                    checked={useCustomSmtp}
                                    onChange={(e) => setUseCustomSmtp(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-medium">Własne SMTP</span>
                            </label>
                        </div>

                        {useCustomSmtp ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold block text-gray-900">Host</label>
                                    <input
                                        type="text"
                                        value={smtpConfig.host}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 text-sm"
                                        placeholder="smtp.example.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block text-gray-900">Port</label>
                                    <input
                                        type="text"
                                        value={smtpConfig.port}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 text-sm"
                                        placeholder="587"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block text-gray-900">Użytkownik</label>
                                    <input
                                        type="text"
                                        value={smtpConfig.user}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block text-gray-900">Hasło</label>
                                    <input
                                        type="password"
                                        value={smtpConfig.password}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block text-gray-900">Od (Email)</label>
                                    <input
                                        type="text"
                                        value={smtpConfig.from}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 text-sm"
                                        placeholder="newsletter@bolglass.com"
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Używane są domyślne ustawienia systemowe.</p>
                        )}
                    </Card>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-bold"
                    >
                        {isSending ? 'Wysyłanie...' : 'Wyślij Mailing 🚀'}
                    </Button>

                    {result?.error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded text-sm font-bold">
                            Błąd: {result.error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
