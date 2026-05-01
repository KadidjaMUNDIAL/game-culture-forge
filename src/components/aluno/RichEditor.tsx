import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

export const RichEditor = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div data-color-mode="light">
    <MDEditor
      value={value}
      onChange={(v) => onChange(v || "")}
      height={320}
      preview="edit"
      textareaProps={{ placeholder: "Escreva seu post... use **negrito**, *itálico*, # títulos, listas, links..." }}
    />
  </div>
);

export const RichRenderer = ({ source }: { source: string }) => (
  <div data-color-mode="light" className="prose prose-sm sm:prose-base max-w-none">
    <MDEditor.Markdown source={source} style={{ background: "transparent" }} />
  </div>
);
