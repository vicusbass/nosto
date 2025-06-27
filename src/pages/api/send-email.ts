import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// This is necessary for the API route to be server-rendered
export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { nume, email, mesaj, informari } = data;

    // Basic validation
    if (!nume || !email || !mesaj) {
      return new Response(JSON.stringify({ message: 'Toate câmpurile sunt obligatorii.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send email using Resend
    await resend.emails.send({
      from: 'request@nosto.ro',
      to: 'info@nosto.ro',
      replyTo: email,
      subject: `Mesaj nou de contact de la ${nume}`,
      html: `
        <h3>Mesaj nou de contact</h3>
        <p><strong>Nume:</strong> ${nume}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${mesaj.replace(/\n/g, '<br>')}</p>
        <p><strong>Acceptă informări comerciale:</strong> ${informari ? 'Da' : 'Nu'}</p>
      `,
    });

    return new Response(JSON.stringify({ message: 'Mesaj trimis cu succes!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'A apărut o eroare la trimiterea mesajului.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
