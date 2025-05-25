import { apiKeyManager } from './apiKeyManager.js';

export class WorkflowEngine {
  constructor() {
    this.isRunning = false;
    this.workflows = new Map();
    this.executionHistory = [];
  }

  async executeWorkflow(workflowConfig, onProgress) {
    if (this.isRunning) {
      throw new Error('Another workflow is already running');
    }

    this.isRunning = true;
    const workflowId = Date.now();
    
    try {
      onProgress?.(0, 'Initializing workflow...');
      
      const result = await this._runWorkflow(workflowConfig, onProgress, workflowId);
      
      this.executionHistory.push({
        id: workflowId,
        config: { ...workflowConfig, apiKeys: '[REDACTED]' },
        result,
        timestamp: new Date(),
        success: true
      });

      return result;
      
    } catch (error) {
      this.executionHistory.push({
        id: workflowId,
        config: { ...workflowConfig, apiKeys: '[REDACTED]' },
        error: error.message,
        timestamp: new Date(),
        success: false
      });
      
      throw error;
      
    } finally {
      this.isRunning = false;
    }
  }

  async _runWorkflow(config, onProgress, workflowId) {
    const { sheetId, emailService, campaignType, customRules } = config;
    
    // Step 1: Read Google Sheet data
    onProgress?.(10, 'Reading Google Sheets data...');
    const contacts = await this._readGoogleSheet(sheetId);
    
    // Step 2: Analyze each contact with AI
    onProgress?.(30, 'Analyzing contacts with AI...');
    const analyzedContacts = await this._analyzeContacts(contacts, campaignType);
    
    // Step 3: Generate personalized content for each contact
    onProgress?.(50, 'Generating personalized emails...');
    const emailPlans = await this._generateEmailPlans(analyzedContacts, customRules);
    
    // Step 4: Send emails
    onProgress?.(70, 'Sending personalized emails...');
    const sentResults = await this._sendEmails(emailPlans, emailService);
    
    // Step 5: Update Google Sheet with results
    onProgress?.(90, 'Updating Google Sheet...');
    await this._updateGoogleSheet(sheetId, sentResults);
    
    onProgress?.(100, 'Workflow completed successfully');
    
    return {
      workflowId,
      contactsProcessed: contacts.length,
      emailsSent: sentResults.filter(r => r.success).length,
      errors: sentResults.filter(r => !r.success).length,
      results: sentResults,
      timestamp: new Date()
    };
  }

  async _readGoogleSheet(sheetId) {
    try {
      // Try public access first (much simpler for browser environment)
      const publicUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
      
      let response = await fetch(publicUrl);
      
      if (!response.ok) {
        // Fallback: Try with Google Sheets API if we have an API key
        const googleApiKey = apiKeyManager.getKey('google_api_key');
        if (googleApiKey) {
          response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${googleApiKey}`
          );
          
          if (!response.ok) {
            throw new Error(`Google Sheets API error: ${response.status} - Make sure your sheet is publicly viewable`);
          }
          
          const data = await response.json();
          const rows = data.values || [];
          
          if (rows.length === 0) {
            throw new Error('No data found in Google Sheet');
          }
          
          // Convert rows to objects using first row as headers
          const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
          const contacts = rows.slice(1).map((row, index) => {
            const contact = { row_index: index + 2 };
            headers.forEach((header, i) => {
              contact[header] = row[i] || '';
            });
            return contact;
          });
          
          return contacts;
        } else {
          throw new Error('Google Sheet is not publicly accessible. Please make it public or provide a Google API key.');
        }
      }
      
      // Parse CSV data from public sheet
      const csvText = await response.text();
      const rows = this._parseCSV(csvText);
      
      if (rows.length === 0) {
        throw new Error('No data found in Google Sheet');
      }
      
      // Convert rows to objects using first row as headers
      const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
      const contacts = rows.slice(1).map((row, index) => {
        const contact = { row_index: index + 2 };
        headers.forEach((header, i) => {
          contact[header] = row[i] || '';
        });
        return contact;
      });
      
      return contacts;
      
    } catch (error) {
      throw new Error(`Failed to read Google Sheet: ${error.message}`);
    }
  }

  _parseCSV(csvText) {
    const rows = [];
    const lines = csvText.split('\n');
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      // Simple CSV parsing (handles basic cases)
      const row = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      // Add the last field
      row.push(current.trim());
      rows.push(row);
    }
    
    return rows;
  }

  async _getServiceAccountToken(serviceAccount) {
    // Create JWT for Google OAuth
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // For browser environment, we'll use a simpler approach
    // In production, this should be done server-side for security
    try {
      // Import crypto functions for JWT signing
      const encoder = new TextEncoder();
      const keyData = this._parsePrivateKey(serviceAccount.private_key);
      
      // Create JWT manually (simplified for browser)
      const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      
      // For browser compatibility, we'll make a request to Google's token endpoint
      // with a pre-signed assertion (this is a simplified version)
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: `${headerB64}.${payloadB64}.signature_placeholder`
        })
      });

      if (!response.ok) {
        // Fallback: Try using the service account email as a simple auth method
        // This won't work in production but helps with testing
        throw new Error('Service account authentication failed - using fallback method');
      }

      const tokenData = await response.json();
      return tokenData.access_token;
      
    } catch (error) {
      // Simplified fallback for browser testing
      // In production, this should be handled server-side
      throw new Error(`Service account authentication not fully supported in browser. Please ensure your Google Sheet is shared with: ${serviceAccount.client_email}`);
    }
  }

  _parsePrivateKey(privateKeyPem) {
    // This is a placeholder - proper JWT signing requires cryptographic libraries
    // In a real implementation, you'd use a proper JWT library
    return privateKeyPem;
  }

  async _analyzeContacts(contacts, campaignType) {
    const openaiKey = apiKeyManager.getKey('openai');
    if (!openaiKey) {
      throw new Error('OpenAI API key is required');
    }

    const analyzedContacts = [];
    
    for (const contact of contacts) {
      try {
        const analysisPrompt = `
Analyze this contact for a ${campaignType} email campaign:

Contact Data:
${Object.entries(contact)
  .filter(([key]) => key !== 'row_index')
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

Based on this data, determine:
1. Priority level (High/Medium/Low)
2. Best approach (Educational/Sales/Nurture/Re-engagement)
3. Key pain points to address
4. Personalization opportunities
5. Recommended tone (Professional/Casual/Technical)
6. Best call-to-action

Respond in JSON format:
{
  "priority": "High|Medium|Low",
  "approach": "Educational|Sales|Nurture|Re-engagement",
  "pain_points": ["pain1", "pain2"],
  "personalization": ["opportunity1", "opportunity2"],
  "tone": "Professional|Casual|Technical",
  "cta": "recommended call to action",
  "reasoning": "brief explanation of strategy"
}
`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: analysisPrompt }],
            temperature: 0.3,
            max_tokens: 500
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI analysis error:', response.status, errorText);
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let analysis;
        
        try {
          analysis = JSON.parse(data.choices[0].message.content);
        } catch (parseError) {
          // Fallback if AI doesn't return valid JSON
          analysis = {
            priority: 'Medium',
            approach: 'Nurture',
            pain_points: ['General business challenges'],
            personalization: ['Use name'],
            tone: 'Professional',
            cta: 'Schedule a call',
            reasoning: 'AI analysis parsing failed, using defaults'
          };
        }
        
        analyzedContacts.push({
          ...contact,
          analysis
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error analyzing contact ${contact.email}:`, error);
        // Continue with other contacts even if one fails
        analyzedContacts.push({
          ...contact,
          analysis: {
            priority: 'Low',
            approach: 'Nurture',
            pain_points: ['Unknown'],
            personalization: ['Use name'],
            tone: 'Professional',
            cta: 'Learn more',
            reasoning: `Analysis failed: ${error.message}`
          }
        });
      }
    }
    
    return analyzedContacts;
  }

  async _generateEmailPlans(analyzedContacts, customRules) {
    const openaiKey = apiKeyManager.getKey('openai');
    const emailPlans = [];
    
    for (const contact of analyzedContacts) {
      try {
        const emailPrompt = `
Generate a personalized sales email for this contact about our AI Agent Email Workflow system:

Contact: ${contact.name || 'Friend'}
Email: ${contact.email}
Company: ${contact.company || ''}
Industry: ${contact.industry || ''}
Status: ${contact.status || ''}
Context: ${contact.context || ''}

AI Analysis:
- Priority: ${contact.analysis.priority}
- Approach: ${contact.analysis.approach}
- Pain Points: ${contact.analysis.pain_points.join(', ')}
- Tone: ${contact.analysis.tone}
- Recommended CTA: ${contact.analysis.cta}

Custom Rules: ${customRules || 'None'}

PRODUCT DETAILS:
- AI Agent Email Workflow system that saves 40+ hours per week
- Automates email campaigns with AI personalization
- Currently running early Black Friday discount
- Perfect for businesses looking to scale their outreach

Create a compelling sales email that:
1. Opens with a personalized greeting using their name
2. Mentions how our AI email workflow saves 40+ hours weekly
3. Addresses their specific pain points with email marketing/outreach
4. Highlights the early Black Friday discount opportunity
5. Uses an urgent but friendly tone
6. Includes a clear call-to-action to learn more or book a demo
7. Feels personal and valuable, not spammy

Format as JSON:
{
  "subject": "compelling subject line about saving 40+ hours with AI email workflow",
  "body": "full professional email body with greeting, value proposition, Black Friday offer, and signature",
  "priority": "send priority (high/medium/low)"
}
`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: emailPrompt }],
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI email generation error:', response.status, errorText);
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let emailPlan;
        
        try {
          emailPlan = JSON.parse(data.choices[0].message.content);
        } catch (parseError) {
          emailPlan = {
            subject: `Hello ${contact.name || 'there'}`,
            body: `Hi ${contact.name || 'there'},\n\nI hope this email finds you well.\n\nBest regards`,
            priority: 'medium'
          };
        }
        
        emailPlans.push({
          contact,
          email: emailPlan,
          shouldSend: contact.analysis.priority !== 'Low' // Don't send to low priority
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error generating email for ${contact.email}:`, error);
        emailPlans.push({
          contact,
          email: null,
          shouldSend: false,
          error: error.message
        });
      }
    }
    
    return emailPlans;
  }

  async _sendEmails(emailPlans, emailService) {
    const results = [];
    
    for (const plan of emailPlans) {
      if (!plan.shouldSend || !plan.email) {
        results.push({
          contact: plan.contact,
          success: false,
          reason: plan.error || 'Skipped due to low priority',
          timestamp: new Date()
        });
        continue;
      }
      
      try {
        let result;
        
        switch (emailService) {
          case 'sendgrid':
            result = await this._sendWithSendGrid(plan);
            break;
          case 'mailgun':
            result = await this._sendWithMailgun(plan);
            break;
          case 'resend':
            result = await this._sendWithResend(plan);
            break;
          case 'gmail':
            result = await this._sendWithGmail(plan);
            break;
          case 'outlook':
            result = await this._sendWithOutlook(plan);
            break;
          case 'simulate':
          default:
            result = await this._simulateEmailSend(plan, emailService);
            break;
        }
        
        results.push({
          contact: plan.contact,
          success: true,
          subject: plan.email.subject,
          timestamp: new Date(),
          service: emailService
        });
        
      } catch (error) {
        results.push({
          contact: plan.contact,
          success: false,
          error: error.message,
          timestamp: new Date()
        });
      }
    }
    
    return results;
  }

  async _sendWithSendGrid(plan) {
    const apiKey = apiKeyManager.getKey('sendgrid');
    if (!apiKey) {
      throw new Error('SendGrid API key not found');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: plan.contact.email, name: plan.contact.name }]
        }],
        from: { email: 'noreply@yourdomain.com', name: 'Your Name' },
        subject: plan.email.subject,
        content: [{
          type: 'text/plain',
          value: plan.email.body
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }
  }

  async _sendWithMailgun(plan) {
    const apiKey = apiKeyManager.getKey('mailgun');
    const domain = apiKeyManager.getKey('mailgun_domain') || 'sandboxXXX.mailgun.org';
    
    if (!apiKey) {
      throw new Error('Mailgun API key not found');
    }

    const formData = new FormData();
    formData.append('from', 'Your Name <noreply@' + domain + '>');
    formData.append('to', plan.contact.email);
    formData.append('subject', plan.email.subject);
    formData.append('text', plan.email.body);

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa('api:' + apiKey)
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mailgun error: ${error}`);
    }
  }

  async _sendWithResend(plan) {
    const apiKey = apiKeyManager.getKey('resend');
    if (!apiKey) {
      throw new Error('Resend API key not found');
    }

    // Use our backend proxy to bypass CORS
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const emailUrl = `${API_BASE_URL}/send-email`;
    
    console.log('Sending email via:', emailUrl);
    
    const response = await fetch(emailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service: 'resend',
        apiKey: apiKey,
        emailData: {
          to: plan.contact.email,
          subject: plan.email.subject,
          body: plan.email.body,
          name: plan.contact.name
        }
      })
    });

    console.log('Email response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Email proxy error:', error);
      throw new Error(`Email proxy error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  }

  async _sendWithGmail(plan) {
    // Gmail API requires OAuth2 setup
    const accessToken = apiKeyManager.getKey('gmail_token');
    if (!accessToken) {
      throw new Error('Gmail OAuth token not found. Please authenticate with Gmail first.');
    }

    const email = [
      `To: ${plan.contact.email}`,
      `Subject: ${plan.email.subject}`,
      '',
      plan.email.body
    ].join('\r\n');

    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail error: ${error}`);
    }
  }

  async _sendWithOutlook(plan) {
    // Microsoft Graph API for Outlook
    const accessToken = apiKeyManager.getKey('outlook_token');
    if (!accessToken) {
      throw new Error('Outlook OAuth token not found. Please authenticate with Microsoft first.');
    }

    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          subject: plan.email.subject,
          body: {
            contentType: 'Text',
            content: plan.email.body
          },
          toRecipients: [{
            emailAddress: {
              address: plan.contact.email,
              name: plan.contact.name
            }
          }]
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Outlook error: ${error}`);
    }
  }

  async _simulateEmailSend(plan, emailService) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Log what would be sent
    console.log('EMAIL WOULD BE SENT:', {
      to: plan.contact.email,
      subject: plan.email.subject,
      body: plan.email.body,
      service: emailService
    });
    
    // 95% success rate simulation
    if (Math.random() < 0.05) {
      throw new Error('Simulated email send failure');
    }
  }

  async _updateGoogleSheet(sheetId, results) {
    // For now, just log what would be updated
    console.log('GOOGLE SHEET WOULD BE UPDATED:', {
      sheetId,
      updates: results.map(r => ({
        row: r.contact.row_index,
        status: r.success ? 'Email sent' : 'Email failed',
        timestamp: r.timestamp
      }))
    });
  }

  getExecutionHistory() {
    return this.executionHistory.slice(-10);
  }

  isCurrentlyRunning() {
    return this.isRunning;
  }
}

export const workflowEngine = new WorkflowEngine();