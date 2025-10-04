// /functions/api/contact.js
// This function logs to D1 and then redirects the user back to the home page (/).

export async function onRequest(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // --- D1 DATABASE INSERT (Logging the entry) ---
        if (env.DB) {
            const timestamp = new Date().toISOString();
            
            // Inserts form data into the 'contacts' table
            const { error } = await env.DB.prepare(
                "INSERT INTO contacts (name, email, message, timestamp) VALUES (?, ?, ?, ?)"
            ).bind(name, email, message, timestamp).run();

            if (error) {
                console.error("D1 Insert Error:", error);
            }
        } else {
            console.error("D1 binding (env.DB) is missing!");
        }
        
        // --- REDIRECT TO HOME PAGE ---
        // Redirects the user back to the root of the site (/)
        return Response.redirect("https://bayoumountain.holdings/", 302);

    } catch (error) {
        console.error("Function Error:", error);
        // If anything fails during parsing or D1 insertion, redirect to the home page with an error status
        return Response.redirect("https://bayoumountain.holdings/?status=error", 302);
    }
}