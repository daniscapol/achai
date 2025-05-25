import React from 'react';
import { Mail, Users, Zap, Target, TrendingUp, Clock } from 'lucide-react';

export const workflowTemplates = [
  {
    id: 'professional-email-sequence',
    name: 'Professional Email Sequence',
    description: 'Enterprise-grade email automation with AI personalization and follow-up sequences',
    category: 'Marketing',
    icon: Mail,
    complexity: 'Advanced',
    estimatedTime: '15-20 minutes',
    tags: ['B2B', 'Lead Nurturing', 'Sales'],
    variables: {
      'company_name': 'Your Company Name',
      'product_name': 'AI Agent Email Workflow',
      'offer_type': 'Early Black Friday Discount',
      'discount_percentage': '30%',
      'cta_url': 'https://yourcompany.com/demo'
    },
    workflow: {
      name: 'Professional Email Sequence',
      description: 'AI-powered email sequence that saves 40+ hours weekly',
      steps: [
        {
          id: 'data_import',
          type: 'data_source',
          name: 'Import Contact Data',
          description: 'Load contacts from Google Sheets',
          position: { x: 100, y: 100 },
          config: {
            sheet_url: ''
          }
        },
        {
          id: 'ai_segmentation',
          type: 'ai_analysis',
          name: 'AI Contact Segmentation',
          description: 'Analyze and segment contacts by priority and industry',
          position: { x: 400, y: 100 },
          config: {
            analysis_prompt: `Analyze contacts and segment them into:
            1. High Priority (Enterprise/Fortune 500 companies, decision makers)
            2. Medium Priority (SMB owners, marketing managers) 
            3. Low Priority (Individual contributors, students)
            
            For each contact, identify:
            - Company size and industry
            - Role and decision-making authority
            - Pain points related to email marketing
            - Buying signals and urgency indicators`
          }
        },
        {
          id: 'high_priority_content',
          type: 'ai_content',
          name: 'High Priority Email Content',
          description: 'Generate premium content for enterprise prospects',
          position: { x: 700, y: 50 },
          config: {
            template: `Create an executive-level email for {{contact_name}} at {{company}}. 

Focus on:
- ROI and efficiency gains (40+ hours saved weekly)
- Enterprise security and compliance
- Scalability for large teams
- Custom implementation support
- Early Black Friday discount (limited time)

Tone: Professional, consultative, value-focused`,
            brand_voice: 'professional'
          }
        },
        {
          id: 'medium_priority_content', 
          type: 'ai_content',
          name: 'SMB Email Content',
          description: 'Generate conversion-focused content for SMB prospects',
          position: { x: 700, y: 200 },
          config: {
            template: `Create a persuasive email for {{contact_name}} at {{company}}.

Focus on:
- Time savings and automation benefits
- Easy setup and user-friendly interface  
- Cost-effectiveness and ROI
- Success stories from similar businesses
- Limited-time Black Friday offer

Tone: Friendly, results-oriented, urgent`,
            brand_voice: 'friendly'
          }
        },
        {
          id: 'send_high_priority',
          type: 'email_send', 
          name: 'Send Enterprise Emails',
          description: 'Send to high-priority enterprise contacts',
          position: { x: 1000, y: 50 },
          config: {
            email_service: 'resend',
            from_email: 'sales@yourcompany.com'
          }
        },
        {
          id: 'send_medium_priority',
          type: 'email_send',
          name: 'Send SMB Emails', 
          description: 'Send to medium-priority SMB contacts',
          position: { x: 1000, y: 200 },
          config: {
            email_service: 'resend',
            from_email: 'marketing@yourcompany.com'
          }
        },
        {
          id: 'wait_followup',
          type: 'wait_delay',
          name: 'Wait for Follow-up',
          description: 'Smart delay before follow-up sequence',
          position: { x: 1300, y: 125 },
          config: {
            duration: 259200000 // 3 days
          }
        },
        {
          id: 'followup_content',
          type: 'ai_content',
          name: 'Follow-up Content',
          description: 'Generate follow-up emails based on engagement',
          position: { x: 1600, y: 125 },
          config: {
            template: `Create a follow-up email for {{contact_name}} who received our initial email about AI workflow automation.

Key points:
- Reference the previous email without being pushy
- Share a customer success story or case study
- Address common objections (time to implement, learning curve)
- Create urgency around the Black Friday discount ending
- Offer a quick 15-minute demo

Tone: Helpful, non-pushy, value-adding`,
            brand_voice: 'friendly'
          }
        },
        {
          id: 'send_followup',
          type: 'email_send',
          name: 'Send Follow-up',
          description: 'Send follow-up emails to non-responders',
          position: { x: 1900, y: 125 },
          config: {
            email_service: 'resend',
            from_email: 'support@yourcompany.com'
          }
        }
      ]
    }
  },
  {
    id: 'product-launch-sequence',
    name: 'Product Launch Sequence',
    description: 'Multi-touch campaign for new product announcements with AI-generated content',
    category: 'Product Marketing',
    icon: Zap,
    complexity: 'Advanced',
    estimatedTime: '20-25 minutes',
    tags: ['Product Launch', 'Announcement', 'Multi-touch'],
    variables: {
      'product_name': 'New Product Name',
      'launch_date': 'December 1st',
      'early_access_discount': '25%',
      'demo_url': 'https://yourcompany.com/demo'
    },
    workflow: {
      name: 'Product Launch Sequence',
      description: 'Comprehensive product launch email campaign',
      steps: [
        {
          id: 'teaser_content',
          type: 'ai_content',
          name: 'Teaser Email',
          description: 'Generate excitement and anticipation',
          position: { x: 100, y: 100 },
          config: {
            template: 'Create a teaser email about our upcoming {{product_name}} launch on {{launch_date}}',
            brand_voice: 'excitement'
          }
        },
        {
          id: 'announcement_content',
          type: 'ai_content', 
          name: 'Launch Announcement',
          description: 'Official product launch announcement',
          position: { x: 400, y: 100 },
          config: {
            template: 'Create the official launch announcement for {{product_name}} with {{early_access_discount}} early access discount',
            brand_voice: 'professional'
          }
        },
        {
          id: 'demo_followup',
          type: 'ai_content',
          name: 'Demo Follow-up',
          description: 'Follow-up with demo invitation',
          position: { x: 700, y: 100 },
          config: {
            template: 'Create a follow-up email inviting {{contact_name}} to try {{product_name}} with link to {{demo_url}}',
            brand_voice: 'friendly'
          }
        }
      ]
    }
  },
  {
    id: 'customer-retention',
    name: 'Customer Retention Campaign',
    description: 'Re-engage inactive customers with personalized AI content',
    category: 'Retention',
    icon: Users,
    complexity: 'Intermediate',
    estimatedTime: '10-15 minutes',
    tags: ['Retention', 'Re-engagement', 'Customer Success'],
    variables: {
      'last_active_date': '30 days ago',
      'special_offer': 'Comeback discount',
      'support_email': 'support@yourcompany.com'
    },
    workflow: {
      name: 'Customer Retention Campaign',
      description: 'Win back inactive customers with personalized outreach',
      steps: [
        {
          id: 'retention_analysis',
          type: 'ai_analysis',
          name: 'Analyze Customer Behavior',
          description: 'Identify reasons for inactivity',
          position: { x: 100, y: 100 },
          config: {
            analysis_prompt: 'Analyze customer data to identify inactive customers and potential reasons for churn'
          }
        },
        {
          id: 'winback_content',
          type: 'ai_content',
          name: 'Win-back Email',
          description: 'Personalized re-engagement emails',
          position: { x: 400, y: 100 },
          config: {
            template: 'Create a win-back email for {{contact_name}} who has been inactive since {{last_active_date}}',
            brand_voice: 'caring'
          }
        }
      ]
    }
  }
];

const WorkflowTemplates = ({ onSelectTemplate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Choose a Workflow Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workflowTemplates.map(template => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Icon size={24} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{template.estimatedTime}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Target size={14} />
                          <span>{template.complexity}</span>
                        </span>
                      </div>
                      <span className="text-purple-600 font-medium">Use Template</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Custom Workflow</h4>
          <p className="text-gray-600 text-sm mb-3">
            Start with a blank canvas and build your own workflow from scratch
          </p>
          <button
            onClick={() => onSelectTemplate(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Start Blank Workflow
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTemplates;