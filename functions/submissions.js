// /functions/submissions.js
// Displays all contact form entries from the D1 database with HTTP Basic Authentication.

export async function onRequest(context) {
    const { request, env } = context;

    // --- SECURITY CHECK: HTTP Basic Authentication ---
    const authHeader = request.headers.get('Authorization');
    
    // Function to prompt for authentication (sends the 401 response)
    const promptAuth = () => {
        return new Response('Authentication Required', {
            status: 401,
            headers: {
                // This header triggers the browser's login dialog
                'WWW-Authenticate': 'Basic realm="Submissions Area"' 
            }
        });
    };

    if (!authHeader) {
        return promptAuth(); // No header, prompt user
    }
    
    // Extract the base64 encoded credentials (format: "Basic [base64_hash]")
    const base64Credentials = authHeader.split(' ')[1];
    if (!base64Credentials) {
        return promptAuth(); // Invalid header format
    }

    // Decode the hash (format: "username:password")
    // Note: atob() is a standard function in the Workers/Pages Functions runtime.
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');

    // Check against the Environment Variables
    if (username !== env.ADMIN_USER || password !== env.ADMIN_PASS) {
        return promptAuth(); // Credentials don't match, prompt again
    }
    // --- END SECURITY CHECK ---


    // --- D1 QUERY AND HTML GENERATION ---

    try {
        // Ensure the D1 binding is present (though it's already working)
        if (!env.DB) {
            return new Response("Error: D1 database binding (env.DB) is missing.", { status: 500 });
        }

        // Query the 'contacts' table, ordered by the newest submission first
        const { results, error } = await env.DB.prepare(
            "SELECT * FROM contacts ORDER BY timestamp DESC"
        ).all();

        if (error) {
            console.error("D1 Query Error:", error);
            return new Response(`Error querying database: ${error.message}`, { status: 500 });
        }

        // --- HTML Generation ---
        
        let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Form Submissions - Bayou Mountain Holdings</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; }
                    .container { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #333; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; margin: 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Contact Form Submissions (${results.length} Total)</h1>
                    <p><a href="/">← Back to Home</a></p>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date/Time</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        // Map D1 results to table rows
        results.forEach(row => {
            // Basic date formatting
            const localTime = new Date(row.timestamp).toLocaleString();
            
            html += `
                <tr>
                    <td>${row.id}</td>
                    <td>${localTime}</td>
                    <td>${row.name}</td>
                    <td>${row.email}</td>
                    <td><pre>${row.message}</pre></td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        // Return the full HTML page
        return new Response(html, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error) {
        return new Response(`An unexpected error occurred: ${error.message}`, { status: 500 });
    }
}