
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  return res.status(501).json({
    error: "Integração Pagar.me ainda não configurada",
    message: "Nenhuma cobrança foi criada."
  });
}
