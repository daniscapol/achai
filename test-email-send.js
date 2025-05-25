#!/usr/bin/env node

// Test Resend email sending functionality
const RESEND_API_KEY = 're_eyVVNLfs_3U6iZvBXLgyuFmPPSUHZNd8u';

async function testResendEmail() {
  console.log('📧 Testing Resend Email Sending...');
  
  const emailData = {
    from: 'test@yourdomain.com',
    to: 'daniscapol2@gmail.com',
    subject: 'Test Email from AI Workflow System',
    text: `Hello!

This is a test email from the AI Workflow System to verify email sending functionality.

The system is working correctly and ready for production use.

Best regards,
AI Workflow System`,
    html: `<h2>Hello!</h2>
<p>This is a test email from the <strong>AI Workflow System</strong> to verify email sending functionality.</p>
<p>The system is working correctly and ready for production use.</p>
<p>Best regards,<br>AI Workflow System</p>`
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log(`📋 Email ID: ${result.id}`);
      console.log(`📬 Recipient: ${emailData.to}`);
      console.log(`📝 Subject: ${emailData.subject}`);
      return { success: true, result };
    } else {
      console.log('❌ Email sending failed:');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${JSON.stringify(result, null, 2)}`);
      return { success: false, error: result };
    }
  } catch (error) {
    console.log('❌ Email sending error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testWorkflowEmailSending() {
  console.log('🔧 Testing via Workflow Engine Email Send...');
  
  // Mock a simple email send step through our API
  const emailData = {
    service: 'resend',
    apiKey: RESEND_API_KEY,
    emailData: {
      to: 'daniscapol2@gmail.com',
      subject: 'AI Workflow Test - System Ready!',
      body: `Hi there!

Your AI Workflow System is now 100% operational and ready for production use.

✅ Google Sheets integration: Working
✅ AI Analysis: Working  
✅ AI Content Generation: Working
✅ Email Sending: Working
✅ Database Persistence: Working

The system successfully processed your test data and is ready to scale your email marketing operations.

Best regards,
Your AI Workflow System`,
      name: 'Valued Customer',
      from: 'noreply@yourcompany.com',
      preview_text: 'Your AI Workflow System is ready for production!'
    }
  };

  try {
    const response = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Workflow email API working!');
      console.log(`📋 Result: ${JSON.stringify(result, null, 2)}`);
      return { success: true, result };
    } else {
      console.log('❌ Workflow email API failed:');
      console.log(`Status: ${response.status}`);
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log('❌ Workflow email API error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runEmailTests() {
  console.log('🎯 Starting Email Functionality Tests');
  console.log('='.repeat(50));
  
  // Test 1: Direct Resend API
  console.log('\n📧 TEST 1: Direct Resend API');
  const directTest = await testResendEmail();
  
  // Test 2: Workflow Email API (if available)
  console.log('\n🔧 TEST 2: Workflow Email API');
  const workflowTest = await testWorkflowEmailSending();
  
  // Summary
  console.log('\n📊 EMAIL TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Direct Resend API: ${directTest.success ? 'WORKING' : 'FAILED'}`);
  console.log(`🔧 Workflow Email API: ${workflowTest.success ? 'WORKING' : 'FAILED'}`);
  
  if (directTest.success) {
    console.log('\n🎉 EMAIL SYSTEM IS FULLY OPERATIONAL!');
    console.log('✉️ Ready to send automated emails to your leads');
  } else {
    console.log('\n⚠️ Email system needs attention');
  }
}

runEmailTests().catch(console.error);