const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function build() {
  const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
  const docsDir = 'documents';
  const outDir = 'public/data';
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.existsSync(docsDir)
    ? fs.readdirSync(docsDir)
        .filter(f => f.toLowerCase().endsWith('.docx') && !f.startsWith('~$'))
        .sort((a, b) => a.localeCompare(b, 'vi'))
    : [];

  const exercises = [];
  for (const file of files) {
    const id = file.replace(/\.docx$/i, '');
    const { value: html } = await mammoth.convertToHtml(
      { path: path.join(docsDir, file) },
      {
        convertImage: mammoth.images.imgElement(img =>
          img.read('base64').then(buf => ({
            src: `data:${img.contentType};base64,${buf}`
          }))
        )
      }
    );

    exercises.push({
      id,
      filename: file,
      title: settings.exerciseNames?.[file] || id,
      order: exercises.length + 1,
      html
    });
    console.log(`  ✓ ${file} → ${exercises[exercises.length - 1].title}`);
  }

  const config = {
    site: settings.site || {},
    members: settings.members || [],
    exercises
  };

  fs.writeFileSync(path.join(outDir, 'config.json'), JSON.stringify(config, null, 2));

  const configJs = `window.__SITE_CONFIG__ = ${JSON.stringify(config, null, 2)};`;
  fs.writeFileSync(path.join(outDir, 'config.js'), configJs);

  console.log(`\n✓ Build xong: ${exercises.length} bài tập → public/data/config.json\n`);
}

build().catch(err => { console.error(err); process.exit(1); });