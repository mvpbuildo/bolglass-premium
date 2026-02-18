declare module 'react-quill-new' {
    import React from 'react';
    export interface ReactQuillProps {
        theme?: string;
        modules?: any;
        formats?: string[];
        value?: string;
        onChange?: (content: string) => void;
        className?: string;
        children?: React.ReactNode;
        // add other props as needed
    }
    export default class ReactQuill extends React.Component<ReactQuillProps> { }
}
