const fs = require('fs');
const path = require('path');
const dir = process.cwd();

const files = [
  'index.html', 'menu.html', 'gallery.html', 
  'contact.html', 'about-us.html', 'login.html', 
  'admin.html', 'dashboard.html'
];

files.forEach(f => {
  const filePath = path.join(dir, f);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('assets/js/scripts.js')) {
      content = content.replace('</body>', '<script src="assets/js/scripts.js"></script>\n</body>');
      fs.writeFileSync(filePath, content);
      console.log(`Injected scripts.js into ${f}`);
    } else {
      console.log(`${f} already has scripts.js`);
    }
  }
});
