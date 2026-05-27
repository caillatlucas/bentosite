const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\32\\Downloads\\Peloille';

const replacements = [
  { file: 'src/components/Socials.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/components/Projects.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/app/project/page.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/app/page.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/app/page.tsx', search: /#ff3131/g, replace: '#606c38' },
  { file: 'src/app/page.tsx', search: /"CAILLAT"/g, replace: '"Peloille"' },
  { file: 'src/app/page.tsx', search: /"Lucas"/g, replace: '"Galerie"' },
  { file: 'src/app/admin/page.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/app/admin/page.tsx', search: /#ff3131/g, replace: '#606c38' },
  { file: 'src/app/admin/login/page.tsx', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'src/app/globals.css', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'tailwind.config.ts', search: /primary-red/g, replace: 'primary-sage' },
  { file: 'tailwind.config.ts', search: /#ff3131/g, replace: '#606c38' },
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
