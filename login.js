(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const screen=$('loginScreen'), menu=$('menuRoot'), panel=$('accountMenu'), form=$('loginForm');
 const email=$('loginEmail'), password=$('loginPassword'), nickname=$('loginNickname'), feedback=$('loginFeedback');
 const project='https://wprsebctrripqbsqxqmn.supabase.co';
 const publicKey='sb_publishable_dfCkN_T9gRUyTbaxDn6Cdg_NkvrCJr9';
 const redirect='https://horrorverse.netlify.app/';
 const ref='wprsebctrripqbsqxqmn';
 let sdk, session=null, mode='login', busy=false, closeTimer, profileRequest=0;
 const initialHash=new URLSearchParams(location.hash.slice(1));
 let recovering=initialHash.get('type')==='recovery';
 function client(){
  if(sdk)return sdk;
  sdk=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4';
   script.onload=()=>{
    try{
     const db=window.supabase.createClient(project,publicKey);
     db.auth.onAuthStateChange((event,current)=>{
      session=current;
      if(event==='PASSWORD_RECOVERY'){recovering=true;openLogin('reset');}
      if(event==='SIGNED_OUT'){recovering=false;window.hvMenu.loadAccountDeck(HV_CLOUD.disconnect());showAccount(null);openLogin();}
     });
     resolve(db);
    }catch(error){reject(error);}
   };
   script.onerror=()=>reject(Error('Não foi possível conectar ao serviço de contas. Confira sua conexão e tente de novo.'));
   document.head.append(script);
  }).catch(error=>{sdk=null;throw error;});
  return sdk;
 }
 function showMode(next){
  const previousEmail=email.value;
  mode=next;form.reset();email.value=previousEmail;feedback.textContent='';
  const titles={login:'Entre no ritual.',register:'Crie sua conta.',recover:'Recupere sua senha.',reset:'Escolha uma nova senha.'};
  const buttons={login:'Entrar',register:'Criar conta',recover:'Enviar link por e-mail',reset:'Salvar nova senha'};
  $('loginHeading').textContent=titles[next];form.querySelector('[type=submit]').textContent=buttons[next];
  for(const [input,visible] of [[email,next!=='reset'],[nickname,next==='register'],[password,next!=='recover']]){
   input.closest('label').hidden=!visible;input.disabled=!visible;
  }
  password.type='password';password.minLength=['reset','register'].includes(next)?6:1;
  password.autocomplete=next==='login'?'current-password':'new-password';
  $('passwordToggle').textContent='Mostrar';$('passwordToggle').setAttribute('aria-label','Mostrar senha');$('passwordToggle').setAttribute('aria-pressed','false');
  $('loginRecover').hidden=next!=='login';$('loginRegister').hidden=next==='reset';
  $('loginRegister').textContent=next==='login'?'Criar conta':'Voltar ao login';
  $('loginGuest').hidden=next==='reset';
 }
 function openLogin(next='login'){
  clearTimeout(closeTimer);screen.hidden=false;screen.classList.add('reopen');screen.classList.remove('is-leaving');
  menu.inert=true;panel.hidden=true;$('accountButton').setAttribute('aria-expanded','false');showMode(next);
  (next==='reset'?password:next==='register'?nickname:email).focus();
 }
 function enterMenu(){
  screen.classList.add('is-leaving');menu.inert=false;
  closeTimer=setTimeout(()=>{screen.hidden=true;$('accountButton').focus();},650);
 }
 function showAccount(user,name){
  panel.querySelector('p').textContent=user?'Progresso vinculado à sua conta.':'Progresso salvo neste navegador.';
  panel.querySelector('strong').textContent=user?(name||user.user_metadata?.nickname||'Jogador'):'Visitante';
  $('accountRefresh').hidden=!user;
  $('accountLogin').textContent=user?'Sair da conta':'Entrar ou criar conta';
 }
 async function enterAccount(db,current){
  const request=++profileRequest,user=current.user;
  const name=String(user.user_metadata?.nickname||'Jogador').trim().slice(0,30)||'Jogador';
  let {data,error}=await db.from('hv_profiles').select('nickname').eq('id',user.id).maybeSingle();
  if(error)throw error;
  if(!data){
   const created=await db.from('hv_profiles').upsert({id:user.id,nickname:name},{onConflict:'id',ignoreDuplicates:true});
   if(created.error)throw created.error;
   ({data,error}=await db.from('hv_profiles').select('nickname').eq('id',user.id).single());
   if(error)throw error;
  }
  if(request!==profileRequest||session?.user.id!==user.id||recovering)return;
  const deck=await HV_CLOUD.connect(db,user.id);
  if(request!==profileRequest||session?.user.id!==user.id)return;
  window.hvMenu.loadAccountDeck(deck);
  showAccount(user,data.nickname);enterMenu();
 }
 function report(error){
  const messages={invalid_credentials:'E-mail ou senha incorretos.',email_not_confirmed:'Confirme seu e-mail antes de entrar.',weak_password:'Escolha uma senha mais forte.',over_email_send_rate_limit:'Aguarde um pouco antes de pedir outro e-mail.'};
  feedback.textContent=messages[error.code]||error.message||'Não foi possível concluir. Tente novamente.';
 }
 function lock(value){
  busy=value;form.setAttribute('aria-busy',String(value));for(const button of screen.querySelectorAll('button'))button.disabled=value;
 }
 form.onsubmit=async event=>{
  event.preventDefault();if(busy)return;lock(true);feedback.textContent='Conectando…';
  try{
   const db=await client(),address=email.value.trim();
   if(mode==='recover'){
    const {error}=await db.auth.resetPasswordForEmail(address,{redirectTo:redirect});if(error)throw error;
    showMode('login');feedback.textContent='Se a conta existir, você receberá o link por e-mail.';
   }else if(mode==='reset'){
    const {error}=await db.auth.updateUser({password:password.value});if(error)throw error;
    recovering=false;await enterAccount(db,session);
   }else if(mode==='register'){
    const name=nickname.value.trim();if(!name)throw Error('Digite um apelido.');
    const {data,error}=await db.auth.signUp({email:address,password:password.value,options:{data:{nickname:name},emailRedirectTo:redirect}});
    if(error)throw error;
    if(data.session){session=data.session;await enterAccount(db,session);}
    else{showMode('login');email.value=address;feedback.textContent='Confira seu e-mail para confirmar o cadastro.';}
   }else{
    const {data,error}=await db.auth.signInWithPassword({email:address,password:password.value});if(error)throw error;
    session=data.session;await enterAccount(db,session);
   }
  }catch(error){report(error);}finally{lock(false);}
 };
 $('loginGuest').onclick=async()=>{
  if(busy)return;
  ++profileRequest;
  if(session){
   lock(true);
   try{const db=await client();const {error}=await db.auth.signOut({scope:'local'});if(error)throw error;session=null;}
   catch(error){report(error);return;}finally{lock(false);}
  }
  window.hvMenu.loadAccountDeck(HV_CLOUD.disconnect());showAccount(null);enterMenu();
 };
 $('loginRecover').onclick=()=>{showMode('recover');email.focus();};
 $('loginRegister').onclick=()=>{showMode(mode==='login'?'register':'login');(mode==='register'?nickname:email).focus();};
 $('passwordToggle').onclick=e=>{const show=password.type==='password';password.type=show?'text':'password';e.currentTarget.textContent=show?'Ocultar':'Mostrar';e.currentTarget.setAttribute('aria-label',show?'Ocultar senha':'Mostrar senha');e.currentTarget.setAttribute('aria-pressed',String(show));};
 const toggle=open=>{panel.hidden=!open;$('accountButton').setAttribute('aria-expanded',String(open));};
 $('accountButton').onclick=()=>toggle(panel.hidden);
 $('accountRefresh').onclick=async()=>{
  $('accountRefresh').disabled=true;
  try{await HV_CLOUD.refresh();HV_PROGRESSION_UI.wallet();panel.querySelector('p').textContent='Progresso atualizado.';}
  catch(error){panel.querySelector('p').textContent=error.message;}
  finally{$('accountRefresh').disabled=false;}
 };
 $('accountLogin').onclick=async()=>{
  if(!session)return openLogin();
  $('accountLogin').disabled=true;
  try{const db=await client();const {error}=await db.auth.signOut({scope:'local'});if(error)throw error;session=null;showAccount(null);openLogin();}
  catch(error){panel.querySelector('p').textContent='Falha ao sair. Tente novamente.';}
  finally{$('accountLogin').disabled=false;}
 };
 document.addEventListener('click',e=>{if(!e.target.closest('.account-control'))toggle(false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){toggle(false);$('accountButton').focus();}});
 menu.inert=true;showMode('login');
 let saved=false;try{saved=!!localStorage.getItem('sb-'+ref+'-auth-token');}catch{}
 if(initialHash.has('error_description'))feedback.textContent=initialHash.get('error_description');
 if(saved||initialHash.has('access_token')||location.search.includes('code=')){
  lock(true);
  (async()=>{const db=await client(),{data,error}=await db.auth.getSession();if(error)throw error;
   session=data.session;if(session){if(recovering)openLogin('reset');else await enterAccount(db,session);}
  })().catch(report).finally(()=>lock(false));
 }
})();
