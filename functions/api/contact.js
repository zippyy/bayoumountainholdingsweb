// /functions/api/contact.js

export async function onRequest(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // --- 1. INSERT DATA INTO D1 DATABASE ---
        if (env.DB) {
            const timestamp = new Date().toISOString();
            
            // Note: The variable name "DB" comes from the [[d1_databases]] binding in wrangler.toml
            const { error } = await env.DB.prepare(
                "INSERT INTO contacts (name, email, message, timestamp) VALUES (?, ?, ?, ?)"
            ).bind(name, email, message, timestamp).run();

            if (error) {
                console.error("D1 Insert Error:", error);
            }
        }
        // --- END D1 INSERT ---

        // --- 2. SEND EMAIL ---
        if (!env.MAIL_SERVICE) {
            // This should not happen if wrangler.toml is correct
            return new Response("Email service binding missing.", { status: 500 });
        }
        
        const info = await env.MAIL_SERVICE.send({
            to: "your-receiving-email@bayoumountain.holdings", // Use your actual inbox email
            from: "forms@bayoumountain.holdings", // Must be the bound email from wrangler.toml
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `<strong>Name:</strong> ${name}<br><strong>Email:</strong> ${email}<br><br><strong>Message:</strong><p>${message}</p>`
        });
        // --- END EMAIL SEND ---

        // Redirect the user back to the contact page with a success message
        return Response.redirect("https://bayoumountain.holdings/contact/?status=success", 302);

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(`Submission failed: ${error.message}`, { status: 500 });
    }
}