// API endpoint to send emails via various services (bypasses CORS)
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { service, apiKey, emailData } = req.body;

    if (!service || !apiKey || !emailData) {
      return res.status(400).json({ error: 'Missing required fields: service, apiKey, emailData' });
    }

    let result;

    switch (service) {
      case 'resend':
        result = await sendWithResend(apiKey, emailData);
        break;
      case 'sendgrid':
        result = await sendWithSendGrid(apiKey, emailData);
        break;
      case 'mailgun':
        result = await sendWithMailgun(apiKey, emailData);
        break;
      default:
        return res.status(400).json({ error: `Unsupported email service: ${service}` });
    }

    res.status(200).json({ success: true, result });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send email' 
    });
  }
}

async function sendWithResend(apiKey, emailData) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: [emailData.to],
      subject: emailData.subject,
      text: emailData.body
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error: ${error}`);
  }

  return await response.json();
}

async function sendWithSendGrid(apiKey, emailData) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: emailData.to, name: emailData.name }]
      }],
      from: { email: 'noreply@yourdomain.com', name: 'Your Name' },
      subject: emailData.subject,
      content: [{
        type: 'text/plain',
        value: emailData.body
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }

  return { message: 'Email sent successfully' };
}

async function sendWithMailgun(apiKey, emailData) {
  const domain = emailData.domain || 'sandboxXXX.mailgun.org';
  
  const formData = new URLSearchParams();
  formData.append('from', `Your Name <noreply@${domain}>`);
  formData.append('to', emailData.to);
  formData.append('subject', emailData.subject);
  formData.append('text', emailData.body);

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('api:' + apiKey).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mailgun error: ${error}`);
  }

  return await response.json();
}