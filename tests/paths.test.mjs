import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const entry=new URL('https://example.test/repository/');
const localPath=(reference,base=entry)=>{const target=new URL(reference,base);assert.equal(target.origin,entry.origin);assert.ok(target.pathname.startsWith(entry.pathname));return resolve(root,decodeURIComponent(target.pathname.slice(entry.pathname.length)));};
test('the entry page and every runtime module load through repository-relative URLs with no external dependencies',async()=>{
 const html=await readFile(resolve(root,'index.html'),'utf8');
 for(const [,url]of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(url.startsWith('#'))continue;assert.ok(url.startsWith('./'),url);await access(localPath(url));}
 for(const file of await readdir(resolve(root,'js'))){if(!file.endsWith('.js'))continue;const path=resolve(root,'js',file),code=await readFile(path,'utf8');for(const [,url]of code.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){assert.ok(url.startsWith('./')||url.startsWith('../'),`${file}: ${url}`);await access(resolve(dirname(path),url));}assert.doesNotMatch(code,/\beval\s*\(|new\s+Function\s*\(|navigator\.(?:mediaDevices|clipboard)|ethereum\.request|new\s+WebSocket\s*\(/);}
 await access(resolve(root,'.nojekyll'));
});

test('the release import map refreshes every module while preserving the repository subpath',async()=>{
 const html=await readFile(resolve(root,'index.html'),'utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)?.[1]??'null');assert.ok(map?.imports);
 const files=(await readdir(resolve(root,'js'))).filter(name=>name.endsWith('.js'));
 assert.equal(Object.keys(map.imports).length,files.length);
 const versions=new Set();for(const file of files){const key='./js/'+file,target=map.imports[key];assert.ok(target?.startsWith(key+'?v='),file);const url=new URL(target,entry);versions.add(url.searchParams.get('v'));assert.equal(new URL(key,entry).pathname,url.pathname);await access(localPath(target));}
 assert.equal(versions.size,1);assert.ok([...versions][0]);
 const script=html.match(/<script type="module" src="([^"]+)"/)[1];assert.equal(new URL(script,entry).searchParams.get('v'),[...versions][0]);
});
