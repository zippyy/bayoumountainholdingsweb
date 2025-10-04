// /functions/api/contact.js
// This function only handles D1 Database logging from the contact form.

export async function onRequest(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // --- 1. D1 DATABASE INSERT (Logging the entry) ---
        // Checks if the DB binding (named 'DB') is available in the environment
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
        
        // --- 2. REDIRECT ---
        // Redirects the user back to the contact page after submission
        return Response.redirect("https://bayoumountain.holdings/contact/?status=success", 302);

    } catch (error) {
        console.error("Function Error:", error);
        // If anything fails during parsing or D1 insertion, show an error.
        return new Response(`Submission failed: ${error.message}`, { status: 500 });
    }
}