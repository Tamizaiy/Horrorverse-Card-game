(function(root){
'use strict';
const packs=[
 {id:'medo', name:'Moedas do Terror', description:'Acumule Contadores de Medo e use-os para enfraquecer seus inimigos.',
  cards:['zumbi','boneca','portador','testemunha','noiva','oraculo','executor','cobrador','vigario','eco','devorador_pavor',
   'fita','correntes_condenacao','ampulheta_colapso','amaldicoar','drenagem_pavor','veu_lucidez','circulo_colapso']},
 {id:'resistencia', name:'Última Resistência', description:'Proteja seus Humanos e recupere cartas do descarte.',
  cards:['reporter_inexplicavel','arquivista_proibido','medica_vigilia','engenheira_refugio','investigadora_nevoa','sobrevivente_desesperado',
   'veterano_noite','lider_remanescentes','ultimo_comandante','distintivo_sobrevivente','cofre_reconstituicao','arquivador_restos',
   'relicario_retomada','refugio','cobertura_defensiva','bandagens_campanha','equipamentos_basicos','forca_resistencia']},
 {id:'aberracoes', name:'Laboratório de Aberrações', description:'Evolua os Gek e os Lobisomens, e fortaleça suas Aberrações.',
  cards:['xenomorfo','fera','carcaca','morcego','rastejante','lobisomem_jovem','lobisomem_adulto','organismo_primordial',
   'gek_felliax','gek_pulliax','gek_omelliax','impeto_besta','afiar_garras','poco','metamorfose_corrupta']},
 {id:'feiticos', name:'Chama de Portão de Feitiços', description:'Feitiços de Campo, Contínuos, Reações e outras magias para o seu deck.',
  cards:['rlyeh','exorcismo','pesadelo','selo','interdicao','reviver','cripta','frenesi','beco','fenda','santuario','matadouro','trono','limiar',
   'leitura_tatica','destruicao_mutua','protecao_emergencia','desvio_alvo','recalibrar_postura','refugio_panico',
   'sistema_cambio_oculto','queda_continua_desesperada','campo_drenagem','fila_espera_submundo','parasita_vertiginoso',
   'drenagem_almas','selo_enfraquecimento','escorregao']},
 {id:'itens', name:'Itens do Profano', description:'Relíquias para comprar cartas, proteger seus Seres e manipular Contadores de Medo.',
  cards:['necro','moeda','grilhoes','manuscrito','balanca_pavor','calice_serenidade','bolsa_triagem',
   'prisma_possuido','dardos_quebra_dedos','cutelo_enferrujado','amuleto_praga']}
];
const released=new Set([...root.HV_DATA.DEFAULT_DECK,...packs.flatMap(pack=>pack.cards)]);
const legacyPacks=new Map();
for(const c of root.HV_DATA.CARD_LIBRARY){
 if(c.kind!=='ser'||!released.has(c.id))continue;
 if(!legacyPacks.has(c.affinity))legacyPacks.set(c.affinity,{id:c.affinity,name:c.affinity+' · coleção anterior',size:3,cards:[]});
 legacyPacks.get(c.affinity).cards.push(c.id);
}
const byId=new Map(packs.map(pack=>[pack.id,{...pack,size:5,art:'assets/progression/pack-'+pack.id+'.webp'}]));
function get(id){return byId.get(id)||legacyPacks.get(id)||null;}
root.HV_BOOSTERS={
 packs:[...byId.values()],get,
 isReleased:id=>released.has(id),
 opponentDeck:()=>root.HV_DATA.randomDeck(Object.fromEntries([...released].map(id=>[id,root.HV_DATA.DEFAULT_CONFIG.maxCopies])))
};
})(typeof window!=='undefined'?window:globalThis);
