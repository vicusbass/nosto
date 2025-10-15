import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// This is necessary for the API route to be server-rendered
export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { prenume, nume, telefon, email, mesaj, informari, intereseaza, modalitate, contact_method } = data;

    // Basic validation
    if (!prenume || !nume || !telefon || !email || !mesaj) {
      return new Response(JSON.stringify({ message: 'Toate câmpurile sunt obligatorii.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Format checkbox arrays
    const formatCheckboxValues = (values: string | string[] | undefined) => {
      if (!values) return 'Nu a fost specificat';
      if (Array.isArray(values)) {
        return values.length > 0 ? values.join(', ') : 'Nu a fost specificat';
      }
      return values;
    };

    // Send email using Resend
    await resend.emails.send({
      from: 'request@nosto.ro',
      to: 'info@nosto.ro',
      replyTo: email,
      subject: `Mesaj nou de contact de la ${prenume} ${nume}`,
      html: `
        <h3>Mesaj nou de contact</h3>
        <p><strong>Prenume:</strong> ${prenume}</p>
        <p><strong>Nume:</strong> ${nume}</p>
        <p><strong>Telefon:</strong> ${telefon}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mă interesează:</strong> ${formatCheckboxValues(intereseaza)}</p>
        <p><strong>Modalitate de achiziție:</strong> ${formatCheckboxValues(modalitate)}</p>
        <p><strong>Cum dorește să fie contactat:</strong> ${formatCheckboxValues(contact_method)}</p>
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
