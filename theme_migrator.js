import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'src/pages');
const files = ['Dashboard.jsx', 'InputDefect.jsx', 'InputProduction.jsx', 'InputComplaint.jsx'];

const replacements = [
    // Specifics first to avoid partial matches later
    { find: /bg-blue-50\/50/g, replace: 'bg-blue-900/20' },
    { find: /bg-slate-50\/50/g, replace: 'bg-slate-800/50' },
    { find: /from-blue-50\/50 to-white/g, replace: 'from-blue-900/20 to-slate-800/60' },
    { find: /bg-white\/70/g, replace: 'bg-slate-800/70' },
    { find: /hover:bg-slate-50\/50/g, replace: 'hover:bg-slate-700/50' },

    // Backgrounds
    { find: /bg-white/g, replace: 'bg-slate-800/80 backdrop-blur-md' },
    { find: /bg-slate-50/g, replace: 'bg-slate-800' },
    { find: /bg-slate-100/g, replace: 'bg-slate-700' },
    { find: /hover:bg-slate-50/g, replace: 'hover:bg-slate-700' },
    { find: /hover:bg-slate-100/g, replace: 'hover:bg-slate-600' },

    // Light Text primary & secondary -> Dark equivalent
    { find: /text-slate-800/g, replace: 'text-slate-100' },
    { find: /text-slate-700/g, replace: 'text-slate-200' },
    { find: /text-slate-600/g, replace: 'text-slate-300' },
    { find: /text-slate-500/g, replace: 'text-slate-400' },
    { find: /text-slate-400/g, replace: 'text-slate-500' },

    // Invert hover texts if needed (mostly okay)

    // Borders
    { find: /border-slate-100/g, replace: 'border-slate-700' },
    { find: /border-slate-200/g, replace: 'border-slate-600' },
    { find: /border-slate-300/g, replace: 'border-slate-500' },

    // Subtle Brand/Status backgrounds
    { find: /bg-blue-50/g, replace: 'bg-blue-900/30' },
    { find: /bg-rose-50/g, replace: 'bg-rose-900/30' },
    { find: /bg-emerald-50/g, replace: 'bg-emerald-900/30' },
    { find: /bg-amber-50/g, replace: 'bg-amber-900/30' },
    { find: /bg-orange-50/g, replace: 'bg-orange-900/30' },

    // Brand/Status Borders
    { find: /border-blue-100/g, replace: 'border-blue-800/50' },
    { find: /border-rose-100/g, replace: 'border-rose-800/50' },
    { find: /border-emerald-100/g, replace: 'border-emerald-800/50' },
    { find: /border-amber-100/g, replace: 'border-amber-800/50' },

    // Table dividing lines
    { find: /divide-slate-50/g, replace: 'divide-slate-700' },

    // Charts styling overrides for dark mode
    { find: /fill: '#94a3b8'/g, replace: "fill: '#cbd5e1'" },
    { find: /fill: '#64748b'/g, replace: "fill: '#f1f5f9'" },
    { find: /stroke="#e2e8f0"/g, replace: 'stroke="#334155"' },
    { find: /stroke="#f1f5f9"/g, replace: 'stroke="#1e293b"' },
    { find: /fill="#e2e8f0"/g, replace: 'fill="#334155"' }, // Bar Target color

    // Tooltip background charts
    { find: /fill: '#f8fafc'/g, replace: "fill: '#1e293b'" },

    // Rechart Tooltip wrapper
    { find: /contentStyle=\{\{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb\(0 0 0 \/ 0.1\)' \}\}/g, replace: "contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }}" },
];

files.forEach(file => {
    let filePath = path.join(directoryPath, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        replacements.forEach(rep => {
            content = content.replace(rep.find, rep.replace);
        });
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Migrated ' + file);
    }
});
