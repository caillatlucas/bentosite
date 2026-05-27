const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\32\\Downloads\\bentosite';

const replacements = [
  { file: 'package.json', search: /bentosite/g, replace: 'peloille' },
  { file: 'next.config.mjs', search: /bentosite/g, replace: 'peloille' },
  { file: 'public/manifest.json', search: /bentosite/g, replace: 'peloille' },
  { file: 'public/manifest.json', search: /CAILLAT\./g, replace: 'Peloille' },
  { file: 'public/sw.js', search: /bentosite/g, replace: 'peloille' },
  { file: 'src/app/layout.tsx', search: /bentosite/g, replace: 'peloille' },
  { file: 'src/app/layout.tsx', search: /CAILLAT\./g, replace: 'Peloille' },
  { file: 'tailwind.config.ts', search: /#ff3131/g, replace: '#606c38' },
  { file: 'tailwind.config.ts', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/components/Socials.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/components/Projects.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/app/project/page.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/app/page.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/app/page.tsx', search: /#ff3131/g, replace: '#606c38' },
  { file: 'src/app/page.tsx', search: /CAILLAT/g, replace: 'Peloille' },
  { file: 'src/app/page.tsx', search: /Lucas/g, replace: 'Galerie' },
  { file: 'src/app/globals.css', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/app/admin/page.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/app/admin/login/page.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: '.env.local', search: /NEXT_PUBLIC_SUPABASE_URL=.*/g, replace: 'NEXT_PUBLIC_SUPABASE_URL=' },
  { file: '.env.local', search: /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/g, replace: 'NEXT_PUBLIC_SUPABASE_ANON_KEY=' },
];

for (const rep of replacements) {
  const filePath = path.join(dir, rep.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(rep.search, rep.replace);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Replaced in ${rep.file}`);
  } else {
    console.log(`File not found: ${rep.file}`);
  }
}
