// This function will be accessible at /api/contact

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Basic validation
    if (!name || !email || !message) {
      return new Response('Please fill out all required fields.', { status: 400 });
    }

    // Construct the email to be sent
    const mailBody = `
      New Contact Form Submission:
      ---
      Name: ${name}
      Email: ${email}
      Message:
      ${message}
      ---
    `;

    // Send the email using the Cloudflare Email Binding (env.MAIL_SERVICE)
    await env.MAIL_SERVICE.send({
      // 🚨 CRITICAL: This 'from' address MUST be an email on your domain 
      // configured with Cloudflare Email Routing.
      from: 'forms@bayoumountain.holdings', 
      
      // The 'to' address is where you want to receive the message.
      to: 'info@bayoumountain.holdings',   
      
      subject: `New Contact from ${name}`,
      content: mailBody,
    });

    return new Response('Success! Your message has been forwarded.', { status: 200 });

  } catch (error) {
    console.error('Email sending error:', error);
    return new Response('Server Error: Failed to process submission.', { status: 500 });
  }
}