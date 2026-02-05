const fs = require('fs');
const filePath = process.argv[2] || 'c:/Users/PUSLATLUH 1/Documents/APLIKASI/elaut/components/auth/FormRegistrasi.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
const lines = cleanContent.split('\n');
let stack = [];
const tagRegex = /<(div|motion\.div|section|section|Link|form|Image|AlertDialog|AlertDialogContent|AlertDialogHeader|AlertDialogTitle|AlertDialogDescription|AlertDialogFooter|AlertDialogCancel|AlertDialogAction|Select|SelectTrigger|SelectContent|SelectGroup|SelectLabel|SelectItem|button|p|span|h1|h2|h3|a|ReCAPTCHA)(?![^>]*\/>)|<\/(div|motion\.div|section|Link|form|Image|AlertDialog|AlertDialogContent|AlertDialogHeader|AlertDialogTitle|AlertDialogDescription|AlertDialogFooter|AlertDialogCancel|AlertDialogAction|Select|SelectTrigger|SelectContent|SelectGroup|SelectLabel|SelectItem|button|p|span|h1|h2|h3|a|ReCAPTCHA)>/g;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    while ((match = tagRegex.exec(line)) !== null) {
        const fullMatch = match[0];
        const tagName = match[1] || match[2];
        if (fullMatch.startsWith('</')) {
            if (stack.length > 0) {
                const last = stack.pop();
                if (last.tag !== tagName) {
                    console.log(`Mismatch at line ${i + 1}: expected </${last.tag}> but found </${tagName}> (opened at line ${last.line})`);
                }
            } else {
                console.log(`Extra closing tag ${tagName} at line ${i + 1}`);
            }
        } else {
            stack.push({ tag: tagName, line: i + 1 });
        }
    }
}
console.log('--- Final Stack ---');
stack.forEach(s => console.log(`<${s.tag}> at line ${s.line}`));
