import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'..');
test('the entry page and every runtime module load through repository-relative URLs with no external dependencies',async()=>{
 const html=await readFile(resolve(root,'index.html'),'utf8');
 for(const [,url]of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(url.startsWith('#'))continue;assert.ok(url.startsWith('./'),url);await access(resolve(root,url));}
 for(const file of await readdir(resolve(root,'js'))){if(!file.endsWith('.js'))continue;const path=resolve(root,'js',file),code=await readFile(path,'utf8');for(const [,url]of code.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){assert.ok(url.startsWith('./')||url.startsWith('../'),`${file}: ${url}`);await access(resolve(dirname(path),url));}assert.doesNotMatch(code,/\beval\s*\(|new\s+Function\s*\(|navigator\.(?:mediaDevices|clipboard)|ethereum\.request|new\s+WebSocket\s*\(/);}
 await access(resolve(root,'.nojekyll'));
});
