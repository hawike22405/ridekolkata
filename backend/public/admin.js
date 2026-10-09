const $=id=>document.getElementById(id);
let token='',resource='routes',selected=null,page=1;
let visualMode=false,visualRevision=null,actionPending=false;
const fields={routes:['name','description','start','end','waypoints','enabled'],pricing:['name','currency','baseFareMinor','perMinuteMinor','surgeMultiplier','enabled']};
function status(text){$('status').textContent=text;}
async function api(path,options={}){const res=await fetch(`/api/admin/${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} :{}),...options.headers}});if(res.status===204)return null;const data=await res.json();if(!res.ok){if(res.status===401){token='';$('console').hidden=true;$('login').hidden=false;}throw Object.assign(new Error(data.error+(data.issues?'\n'+data.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('\n'):'')),{status:res.status});}return data;}
function clear(){selected=null;$('json').value='';$('save').textContent='Create';$('delete').hidden=true;$('editorHeading').textContent='Create record';}
async function list(){const snapshot=resource;const data=await api(`${snapshot}?page=${page}&limit=25`);if(snapshot!==resource)return;$('heading').textContent=resource==='routes'?'Routes':'Pricing';$('fields').textContent='Required fields: '+fields[resource].join(', ');$('pageLabel').textContent=`Page ${page}`;$('previous').disabled=page===1;$('next').disabled=data.data.length<25;$('records').replaceChildren();if(!data.data.length)$('records').textContent='No records on this page.';for(const doc of data.data){const row=document.createElement('div');row.className='record';const label=document.createElement('span');label.textContent=doc.name+(doc.enabled?' • Enabled':' • Disabled');const button=document.createElement('button');button.textContent='Edit';button.onclick=()=>{selected=doc;$('json').value=JSON.stringify(Object.fromEntries(fields[resource].map(k=>[k,doc[k]])),null,2);$('save').textContent='Save changes';$('delete').hidden=false;$('editorHeading').textContent='Edit record';};row.append(label,button);$('records').append(row);}}
async function run(fn){if(actionPending)return;actionPending=true;$('console').inert=true;$('login').inert=true;try{status('');await fn();}catch(e){status(e.message);}finally{actionPending=false;$('console').inert=false;$('login').inert=false;}}
$('loginForm').onsubmit=e=>{e.preventDefault();run(async()=>{const data=await api('auth/login',{method:'POST',body:JSON.stringify({email:$('email').value,password:$('password').value})});token=data.accessToken;$('password').value='';$('login').hidden=true;$('console').hidden=false;visualMode=false;visualRevision=null;$('visualJson').value='';$('visualPanel').hidden=true;$('recordPanel').hidden=false;await list();});};
for(const name of ['routes','pricing'])$(name).onclick=()=>run(async()=>{visualMode=false;$('visualPanel').hidden=true;$('recordPanel').hidden=false;resource=name;page=1;clear();await list();});
$('refresh').onclick=()=>run(()=>visualMode?loadVisual():list());$('previous').onclick=()=>run(async()=>{page=Math.max(1,page-1);clear();await list();});$('next').onclick=()=>run(async()=>{page++;clear();await list();});$('new').onclick=clear;
$('editForm').onsubmit=e=>{e.preventDefault();run(async()=>{const payload=JSON.parse($('json').value);await api(resource+(selected?`/${selected._id}`:''),{method:selected?'PUT':'POST',headers:selected?{'If-Match':`"${selected.__v}"`}:{},body:JSON.stringify(payload)});clear();await list();status('Saved.');});};
$('delete').onclick=()=>run(async()=>{if(!selected||!confirm('Permanently delete this record?'))return;await api(`${resource}/${selected._id}`,{method:'DELETE',headers:{'If-Match':`"${selected.__v}"`}});clear();await list();status('Deleted.');});
$('logout').onclick=()=>run(async()=>{await api('auth/logout',{method:'POST'});token='';visualRevision=null;$('visualJson').value='';clear();$('records').replaceChildren();$('console').hidden=true;$('login').hidden=false;status('Signed out.');});

async function loadVisual(){
  $('visualSave').disabled=true;$('visualDelete').hidden=true;visualRevision=null;$('visualJson').value='';
  $('visualState').textContent='Loading saved settings…';
  try{
    const result=await api('visual-config');
    visualRevision=result.revision;$('visualJson').value=JSON.stringify(result.data,null,2);
    $('visualState').textContent=`Saved ${new Date(result.updatedAt).toLocaleString()}`;
    $('visualDelete').hidden=false;$('visualSave').textContent='Save changes';$('visualSave').disabled=false;
  }catch(e){
    if(e.status!==404){$('visualState').textContent='Settings unavailable. Refresh to retry.';throw e;}
    $('visualState').textContent='No 3D configuration exists. Enter your settings to create one.';
    $('visualSave').textContent='Create configuration';$('visualSave').disabled=false;
  }
}
$('visuals').onclick=()=>run(async()=>{visualMode=true;$('recordPanel').hidden=true;$('visualPanel').hidden=false;await loadVisual();});
$('visualForm').onsubmit=e=>{e.preventDefault();run(async()=>{
  const payload=JSON.parse($('visualJson').value);$('visualSave').disabled=true;
  try{
    const result=await api('visual-config',{method:visualRevision?'PUT':'POST',headers:visualRevision?{'If-Match':`"${visualRevision}"`}:{},body:JSON.stringify(payload)});
    visualRevision=result.revision;$('visualDelete').hidden=false;$('visualSave').textContent='Save changes';
    $('visualState').textContent=`Saved ${new Date(result.updatedAt).toLocaleString()}`;status('3D configuration saved.');
  }finally{$('visualSave').disabled=false;}
});};
$('visualDelete').onclick=()=>run(async()=>{
  if(!visualRevision||!confirm('Delete the 3D configuration? The public endpoint will return 404 until you create a new one.'))return;
  await api('visual-config',{method:'DELETE',headers:{'If-Match':`"${visualRevision}"`}});
  await loadVisual();status('3D configuration deleted.');
});
