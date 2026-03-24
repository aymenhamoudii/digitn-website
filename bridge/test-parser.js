const files = {
    'index.html': `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="./styles/main.css">
</head>
<body>
  <script src="script.js"></script>
  <script src="/js/game.js"></script>
</body>
</html>`,
    'style.css': 'body { color: red; }',
    'css/style.css': 'body { color: blue; }',
    'styles/main.css': 'body { color: green; }',
    'script.js': 'console.log(1);',
    'js/game.js': 'console.log(2);'
};

let html = files['index.html'];

const newBlobUrls = {};
Object.entries(files).forEach(([path, content]) => {
    if (path === 'index.html') return;
    newBlobUrls[path] = `blob:http://localhost/${Math.random()}`;
});

console.log("OLD HTML:");
console.log(html);

Object.entries(newBlobUrls).forEach(([path, url]) => {
    // matches
    html = html.split(`"${path}"`).join(`"${url}"`);
    html = html.split(`'${path}'`).join(`'${url}'`);
    html = html.split(`"./${path}"`).join(`"${url}"`);
    html = html.split(`'./${path}'`).join(`'${url}'`);
    html = html.split(`"/${path}"`).join(`"${url}"`);
    html = html.split(`'/${path}'`).join(`'${url}'`);
});

console.log("\nNEW HTML:");
console.log(html);
