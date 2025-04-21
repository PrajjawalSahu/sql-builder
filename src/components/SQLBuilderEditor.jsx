import React, { useState, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { autocompletion, startCompletion } from '@codemirror/autocomplete';
import { keymap } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';

export default function SQLBuilderEditor() {
    const [code, setCode] = useState('');
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const debounceRef = useRef(null);

    const columnCompletion = async (context) => {
        const word = context.matchBefore(/@[\w\s]*/);
        console.log("word = ", word)
        if (!word || (word.from === word.to) && !context.explicit) return null;

        const query = word.text.slice(1).trim();

        return new Promise((resolve) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(async () => {
                try {
                    const response = await fetch('https://fc02-34-169-187-204.ngrok-free.app/match_column', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query }),
                    });

                    const result = await response.json();
                    console.log('API Response:', result);

                    if (!result || !Array.isArray(result.top_matches)) {
                        console.warn('Invalid autocomplete response shape');
                        resolve(null);
                        return;
                    }
                    const options = result.top_matches.map((match) => ({
                        label: '@' + match.column,         // So it matches what user typed
                        type: 'variable',
                        apply: match.column,               // What gets inserted (without @)
                    }));
                    // Store in state (if needed elsewhere)
                    // setDynamicOptions(options);
                    resolve({
                        from: word.from,
                        // to: word.to,
                        options,
                        // validFor: /^@[\w\s]*$/,
                        filter: false,        // 🚨 disables frontend lexical matching
                    });
                } catch (err) {
                    console.error('Autocomplete error:', err);
                    resolve(null);
                }
            }, 500);
        });
    };

    const customKeymap = keymap.of([
        {
            key: '@',
            run: (view) => {
                const { from } = view.state.selection.main;
                view.dispatch({
                    changes: { from, insert: '@' },
                    selection: { anchor: from + 1 },
                });
                setTimeout(() => {
                    startCompletion(view);
                }, 0);
                return true;
            },
        },
    ]);

    return (
        <div className="editor-container">
            <CodeMirror
                value={code}
                height="300px"
                onChange={setCode}
                // theme={oneDark}
                extensions={[
                    sql(),
                    autocompletion({
                        override: [columnCompletion],
                    }),
                    customKeymap,
                ]}
            />
        </div>
    );
}
