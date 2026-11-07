# HORRORVERSE — Patch 2.2 Multiplayer LAN

O menu mantém Contra CPU e Multiplayer no mesmo computador. A terceira opção, Multiplayer LAN, conecta dois navegadores ao servidor local.

## Computador que hospeda

1. Instale Node.js 22 ou superior: https://nodejs.org/
2. Extraia o ZIP inteiro. O servidor depende de cards.js, engine.js e expansion.js da mesma pasta.
3. No Windows, abra Iniciar-LAN.bat. No Linux/macOS: `sh iniciar-lan.sh`.
4. Ao perguntar a URL do site, informe o endereço público exato, por exemplo `https://meu-horrorverse.netlify.app`. O endereço fica salvo para as próximas vezes. Enter mantém o endereço anterior; na primeira execução, Enter libera somente o acesso pelo endereço local.
5. Deixe essa janela aberta. Ela mostra o IP e a porta do servidor, por exemplo `192.168.1.10:3000`. Se o IP não aparecer, consulte `ipconfig` no Windows.
6. Se o Firewall do Windows perguntar, permita o Node.js na rede privada usada pelos jogadores.

Não há `npm install`: o servidor usa apenas componentes incluídos no Node.js.
Para configurar sem o iniciador: variável HV_NETLIFY_ORIGIN com a URL HTTPS e `node lan-server/server.cjs`. Porta padrão 3000, alterável pela variável PORT. Com o iniciador, a configuração está em lan-server/config.json.

## Dois jogadores

1. Ambos abrem a versão 2.2 do site no Netlify, na mesma rede do servidor.
2. Cada um escolhe seu baralho no Deck Builder.
3. Na opção Multiplayer LAN, informe o endereço IP:porta exibido no servidor e seu nome. Use o IP da máquina servidora, não localhost nos outros computadores.
4. O primeiro clica Criar sala e compartilha o código de seis caracteres.
5. O segundo informa o mesmo endereço de servidor, digita o código e clica Entrar na sala.
6. Cada jogador clica Confirmar meu baralho. A partida começa quando ambos confirmarem.
7. Selecione uma carta para ver suas ações. O servidor valida invocações, custos, alvos, ataques e encerramento de turno. Efeitos e reações abrem escolhas somente para o jogador responsável.

Ao desconectar, a partida pausa. A aba tenta reconectar automaticamente. Se recarregar, use Reconectar à minha sessão; o token fica apenas no armazenamento da própria aba. Não compartilhe esse token. Sair da sala durante o duelo conta como abandono. Após duas horas sem atividade, a sala expira; reiniciar o servidor também encerra as salas.

## Netlify e acesso à rede local

O Netlify entrega a interface. As mensagens do duelo vão diretamente ao IP local por WebSocket. O servidor autoriza somente a origem HTTPS configurada e a própria página servida pelo endereço local.

O navegador precisa permitir a conexão do site HTTPS com a rede local. O suporte varia conforme navegador, versão e políticas da escola. Use um navegador atualizado que suporte WebSocket local a partir de HTTPS e conceda a permissão de rede local quando solicitada. Se tiver negado, reveja a permissão nas configurações do site.

Se o navegador bloquear esse acesso, abra nos dois computadores o endereço alternativo mostrado no servidor, por exemplo `http://192.168.1.10:3000`. Ele serve o mesmo jogo completo e funciona sem internet. Esse caminho também permite usar a LAN enquanto a compatibilidade do navegador com o site público é resolvida.

Documentação consultada: https://developer.chrome.com/docs/modern-web-guidance/guides/security/local-network-access
Não é necessário configurar encaminhamento de portas no roteador para uma partida na mesma rede. Redes de convidados ou redes com isolamento entre dispositivos precisam permitir a comunicação entre os dois computadores e o servidor.

## Publicar no GitHub / Netlify

Envie o conteúdo da pasta Horrorverse_Alpha22 para a raiz do repositório. O index.html precisa estar na pasta de publicação. O netlify.toml já configura publish="."; não há compilação ou comando de build necessário. Use a mesma versão 2.2 no site e na pasta do servidor. A configuração particular lan-server/config.json é ignorada pelo Git.

As opções contra CPU e no mesmo computador continuam abrindo normalmente, inclusive sem iniciar o servidor LAN.

## O que foi verificado

- Testes das regras existentes e das decisões dos bots.
- Protocolo WebSocket, criação/entrada, duas vagas por sala, validação de decks, turno e revisão da mesa.
- Mão e monte ocultos, escolhas privadas, desconexão e retomada da sessão.
- Teste real de HTTP e duas conexões TCP/WebSocket, com confirmação dos decks e turnos sincronizados.
- Sintaxe dos scripts e referências dos arquivos da página.

A interface em dois navegadores e a permissão de rede local a partir de um site Netlify publicado ainda precisam ser verificadas nos computadores dos jogadores. O ambiente de desenvolvimento não conseguiu iniciar o navegador de teste. O teste de rede executado aqui foi entre dois clientes no próprio ambiente, não entre dois computadores físicos.
