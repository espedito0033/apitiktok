# TikTok Perfil API (JavaScript, sem Python)

API sem servidor (serverless) que recebe um `@usuario` do TikTok e retorna
seguidores, seguindo, curtidas, vídeos, bio etc. Roda 100% em JavaScript,
hospedada de graça na Vercel — sem precisar manter nenhum processo ligado.

## Estrutura

```
tiktok_api_js/
├── api/
│   ├── index.js            → GET /api            (mensagem de status)
│   └── perfil/
│       └── [usuario].js    → GET /api/perfil/xxx  (dados do perfil)
├── package.json
└── .gitignore
```

Na Vercel, qualquer arquivo dentro de `api/` vira automaticamente uma rota.
`[usuario].js` é um "parâmetro dinâmico" — o nome entre colchetes vira
`req.query.usuario`.

## Como usar

```
GET /api/perfil/<usuario>
```

Exemplo (depois de publicado):
```
https://seu-projeto.vercel.app/api/perfil/tiktok
```

Resposta:
```json
{
  "sucesso": true,
  "dados": {
    "nickname": "TikTok",
    "usuario": "tiktok",
    "bio": "...",
    "verificado": true,
    "avatar": "https://...",
    "seguidores": 12345678,
    "seguindo": 123,
    "curtidas": 987654321,
    "videos": 456
  }
}
```

## Testando localmente (opcional)

Se quiser testar antes de publicar, instale a CLI da Vercel:

```bash
npm install -g vercel
vercel dev
```

Isso sobe a API em `http://localhost:3000/api/perfil/tiktok`.

## Publicando de verdade (sem Python, sem servidor pra gerenciar)

**1. Suba o código no GitHub:**
```bash
cd tiktok_api_js
git init
git add .
git commit -m "primeira versão da api tiktok em js"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git push -u origin main
```

**2. Conecte na Vercel:**
1. Entre em https://vercel.com com sua conta do GitHub
2. Clique em **Add New** → **Project**
3. Selecione o repositório
4. Deixe as configurações padrão (a Vercel detecta sozinha que é um
   projeto com pasta `api/`) e clique em **Deploy**

Em menos de um minuto você recebe um link fixo tipo:
```
https://tiktok-perfil-api.vercel.app/api/perfil/tiktok
```

Esse link já funciona pra qualquer pessoa, na hora, sem "acordar" like o
plano free de outros serviços — funções serverless da Vercel não dormem.
Toda vez que você der `git push`, a Vercel republica sozinha.

## Observação importante

O TikTok tem proteção anti-bot. Se a API voltar com erro 502 dizendo que
não achou os dados, pode ser bloqueio temporário por muitas requisições
seguidas, ou mudança no formato interno da página deles. Pra uso pessoal
esporádico costuma funcionar bem.
