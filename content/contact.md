---
title: "Get In Touch"
slug: "contact"
date: 2025-10-03T12:00:00Z
draft: false
layout: "single" 
---



## We'd love to hear from you.



Whether you have a general inquiry, a partnership proposal, or just want to say hello, we are always open to connecting with our community.



---



### 📧 Send us an Email



The most direct way to reach us is by email. We do our best to respond to all messages within 48 hours.



**General Inquiries:** [info@bayoumountain.holdings](mailto:info@bayoumountain.holdings)



---


### 📧 Contact Form

<form id="contactForm" class="contact-form">
    <p id="responseMessage" style="padding: 10px; border-radius: 4px; display: none;"></p>

    <label for="name">Your Name</label>
    <input type="text" id="name" name="name" required>

    <label for="email">Your Email</label>
    <input type="email" id="email" name="email" required>

    <label for="message">Your Message</label>
    <textarea id="message" name="message" rows="5" required></textarea>

    <button type="submit" id="submitButton">Send Message</button>
</form>

<script>
    document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const submitBtn = document.getElementById('submitButton');
    const messageBox = document.getElementById('responseMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Prevent accidental multiple submissions
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        messageBox.style.display = 'none';

        try {
            // Send the form data to the Cloudflare Pages Function endpoint
            const response = await fetch('/api/contact', {
                method: 'POST',
                body: new FormData(form),
            });
            
            const responseText = await response.text();
            
            if (response.ok) {
                messageBox.style.display = 'block';
                messageBox.style.backgroundColor = '#d4edda'; // Light green
                messageBox.style.color = '#155724'; // Dark green
                messageBox.textContent = 'Thank you! Your message has been sent successfully.';
                form.reset(); // Clear the form on success
            } else {
                messageBox.style.display = 'block';
                messageBox.style.backgroundColor = '#f8d7da'; // Light red
                messageBox.style.color = '#721c24'; // Dark red
                messageBox.textContent = responseText || 'Submission failed. Please try again.';
            }
        } catch (error) {
            messageBox.style.display = 'block';
            messageBox.style.backgroundColor = '#f8d7da';
            messageBox.style.color = '#721c24';
            messageBox.textContent = 'An unexpected error occurred.';
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
});
</script>


<!-- ### 📍 Other Details -->





