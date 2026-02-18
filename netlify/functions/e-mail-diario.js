import fetch from "node-fetch";

export async function handler() {
  const siteId = process.env.SITE_ID;
  const token = process.env.NETLIFY_TOKEN;

  const forms = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/forms`,
    { headers: { Authorization: `Bearer ${token}` } }
  ).then(res => res.json());

  const form = forms.find(f => f.name === "confirmacao-cha");
  if (!form) {
    return { statusCode: 200, body: "Nenhuma confirmação ainda." };
  }

  const submissions = await fetch(
    `https://api.netlify.com/api/v1/forms/${form.id}/submissions`,
    { headers: { Authorization: `Bearer ${token}` } }
  ).then(res => res.json());

  const nomes = submissions
    .map(s => s.data.nome)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const emailjs = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: "SEU_SERVICE_ID",
      template_id: "SEU_TEMPLATE_ID",
      user_id: "SUA_PUBLIC_KEY",
      template_params: {
        lista: nomes.join("\\n")
      }
    })
  });

  return {
    statusCode: 200,
    body: "E-mail diário enviado com sucesso"
  };
}