// api/perfil/[usuario].js
//
// Função serverless (roda na Vercel, sem servidor fixo e sem Python).
// Recebe um @usuario do TikTok e devolve seguidores, seguindo, curtidas etc.
//
// Como funciona: o TikTok injeta um bloco de JSON escondido dentro de uma
// tag <script> na própria página do perfil (usado por eles pra "hidratar"
// os dados no React). A gente busca esse HTML e extrai esse JSON — é bem
// mais estável do que tentar ler texto de elementos como
// <strong data-e2e="following-count">, que mudam de classe com frequência.

const TAGS_JSON = [
  "__UNIVERSAL_DATA_FOR_REHYDRATION__", // formato atual (2024+)
  "SIGI_STATE",                          // formato antigo (fallback)
];

async function buscarHtmlPerfil(usuario) {
  const url = `https://www.tiktok.com/@${usuario}`;
  const resposta = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
  });

  if (resposta.status === 404) {
    throw new Error("Perfil não encontrado.");
  }
  if (!resposta.ok) {
    throw new Error(`TikTok recusou a requisição (status ${resposta.status}).`);
  }
  return resposta.text();
}

function extrairJsonDoHtml(html) {
  for (const tagId of TAGS_JSON) {
    const padrao = new RegExp(`<script id="${tagId}"[^>]*>(.*?)</script>`, "s");
    const encontrado = html.match(padrao);
    if (encontrado) {
      try {
        return JSON.parse(encontrado[1]);
      } catch {
        continue;
      }
    }
  }
  throw new Error(
    "Não consegui achar os dados do perfil no HTML. O TikTok pode ter " +
      "bloqueado a requisição (anti-bot) ou mudado o formato da página."
  );
}

function extrairDadosUsuario(dadosJson) {
  // formato novo: __UNIVERSAL_DATA_FOR_REHYDRATION__
  try {
    const escopo = dadosJson.__DEFAULT_SCOPE__["webapp.user-detail"];
    const info = escopo.userInfo;
    const usuario = info.user;
    const stats = info.stats;
    return {
      nickname: usuario.nickname,
      usuario: usuario.uniqueId,
      bio: usuario.signature,
      verificado: usuario.verified,
      avatar: usuario.avatarLarger,
      seguidores: stats.followerCount,
      seguindo: stats.followingCount,
      curtidas: stats.heartCount,
      videos: stats.videoCount,
    };
  } catch {
    // formato antigo: SIGI_STATE
    try {
      const moduloUsuario = dadosJson.UserModule.users;
      const moduloStats = dadosJson.UserModule.stats;
      const chave = Object.keys(moduloUsuario)[0];
      const usuario = moduloUsuario[chave];
      const stats = moduloStats[chave];
      return {
        nickname: usuario.nickname,
        usuario: usuario.uniqueId,
        bio: usuario.signature,
        verificado: usuario.verified,
        avatar: usuario.avatarLarger,
        seguidores: stats.followerCount,
        seguindo: stats.followingCount,
        curtidas: stats.heartCount || stats.heart,
        videos: stats.videoCount,
      };
    } catch {
      throw new Error("Formato de dados do perfil não reconhecido.");
    }
  }
}

export default async function handler(req, res) {
  let { usuario } = req.query;
  usuario = (usuario || "").replace(/^@/, "").trim();

  if (!usuario) {
    res.status(400).json({ erro: "Informe um usuário. Ex: /api/perfil/nomedapessoa" });
    return;
  }

  try {
    const html = await buscarHtmlPerfil(usuario);
    const dadosJson = extrairJsonDoHtml(html);
    const dados = extrairDadosUsuario(dadosJson);
    res.status(200).json({ sucesso: true, dados });
  } catch (erro) {
    res.status(502).json({ sucesso: false, erro: erro.message });
  }
}
