const fs = require('fs');
const text = fs.readFileSync('core_diff.txt', 'utf8');

let currentFile = '';
let currentLine = 0;
let results = [];

const lines = text.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.startsWith('+++ b/')) {
    currentFile = line.substring(6);
  } else if (line.startsWith('@@')) {
    const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (match) {
      currentLine = parseInt(match[1], 10) - 1;
    }
  } else if (line.startsWith('+') && !line.startsWith('+++')) {
    currentLine++;
    const content = line.substring(1);
    
    // 1. Redundant state (e.g. useState for something that could be derived)
    // 2. Parameter sprawl (functions with many parameters)
    // 3. Copy-paste with slight variation (hard to detect purely by line)
    // 4. Leaky abstractions
    // 5. Stringly-typed code
    // 6. Unnecessary JSX nesting (e.g. <div><div><Component/></div></div>)
    // 7. Unnecessary comments (e.g. // This function does X)

    if (content.match(/useState\([^)]+\)/) || content.match(/useEffect/)) {
        if(content.includes('useState') && (content.includes('Filtered') || content.includes('Sorted') || content.includes('IsLoading') && content.includes('Error'))) {
           results.push(`[Redundant State] ${currentFile}:${currentLine} : ${content}`);
        }
    }
    
    if (content.match(/function\s+\w+\s*\([^)]{40,}\)/) || content.match(/\w+\s*=\s*\([^)]{50,}\)\s*=>/)) {
        if (content.includes(',')) {
            let params = content.split(',').length;
            if (params > 4) {
               results.push(`[Parameter sprawl] ${currentFile}:${currentLine} : ${content}`);
            }
        }
    }

    if (content.match(/<Box[^>]*>\s*<Box/)) {
        results.push(`[Unnecessary JSX nesting] ${currentFile}:${currentLine} : ${content}`);
    }

    if (content.match(/\/\/.*(This function|Added by|Task:|Returns|Gets|Sets|What this does)/i)) {
        results.push(`[Unnecessary comment] ${currentFile}:${currentLine} : ${content}`);
    }
    
    // Stringly typed
    if (content.match(/(status|type|role|action|mode)\s*===?\s*['"][a-zA-Z_]+['"]/)) {
        results.push(`[Stringly-typed code] ${currentFile}:${currentLine} : ${content}`);
    }
  } else if (!line.startsWith('-')) {
    currentLine++;
  }
}

fs.writeFileSync('diff_results.txt', results.join('\n'));
