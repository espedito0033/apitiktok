export default function handler(req, res) {
  res.status(200).json({
    mensagem: "API de perfil do TikTok no ar.",
    como_usar: "GET /api/perfil/<usuario>  (ex: /api/perfil/tiktok)",
  });
}
