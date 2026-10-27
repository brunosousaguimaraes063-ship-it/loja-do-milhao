
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  const isPreview = process.env.VERCEL_ENV === "preview";

const secretKey = isPreview
  ? process.env.PAGARME_TEST_SECRET_KEY
  : process.env.PAGARME_SECRET_KEY;

if (!secretKey) {
    return res.status(500).json({
      error: "Configuração de pagamento ausente"
    });
  }

  try {
    const {
      amount,
      name,
      email,
      document,
      phoneAreaCode,
      phoneNumber,
      description
    } = req.body || {};

    const amountNumber = Number(amount);
    const documentDigits = String(document || "").replace(/\D/g, "");
    const areaCode = String(phoneAreaCode || "").replace(/\D/g, "");
    const phone = String(phoneNumber || "").replace(/\D/g, "");

    if (
      !Number.isFinite(amountNumber) ||
      amountNumber < 1 ||
      amountNumber > 100000 ||
      !name?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "") ||
      ![11, 14].includes(documentDigits.length) ||
      areaCode.length !== 2 ||
      phone.length < 8 ||
      phone.length > 9
    ) {
      return res.status(400).json({
        error: "Confira o valor e os dados do comprador."
      });
    }

    const amountInCents = Math.round(amountNumber * 100);

    const payload = {
      items: [
        {
          amount: amountInCents,
          description:
            String(description || "Não informada").trim().slice(0, 250),
          quantity: 1
        }
      ],
      customer: {
        name: name.trim().slice(0, 64),
        email: email.trim().toLowerCase(),
        document: documentDigits,
        type: documentDigits.length === 11
          ? "individual"
          : "company",
        phones: {
          mobile_phone: {
            country_code: "55",
            area_code: areaCode,
            number: phone
          }
        }
      },
      payments: [
        {
          payment_method: "pix",
          pix: {
            expires_in: 3600
          }
        }
      ]
    };

    const auth = Buffer.from(`${secretKey}:`).toString("base64");

    const response = await fetch(
      "https://api.pagar.me/core/v5/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "Falha ao criar pedido Pagar.me:",
        response.status
      );

      return res.status(502).json({
        error: "A Pagar.me não conseguiu criar a cobrança. Confira os dados e a configuração da conta."
      });
    }

    const charge = result.charges?.[0];
    const transaction = charge?.last_transaction;

    return res.status(200).json({
      order_id: result.id,
      charge_id: charge?.id,
      status: charge?.status || result.status,
      qr_code: transaction?.qr_code || null,
      qr_code_url: transaction?.qr_code_url || null,
      expires_at: transaction?.expires_at || null
    });
  } catch (error) {
    console.error("Erro interno ao preparar cobrança Pix.");

    return res.status(500).json({
      error: "Erro interno ao processar a solicitação."
    });
  }
}
