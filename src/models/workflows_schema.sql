-- Workflow Builder Database Schema
-- Extends existing database with workflow storage capabilities

-- Main workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255), -- Could be user ID or email
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
    is_template BOOLEAN DEFAULT false,
    category VARCHAR(100) DEFAULT 'custom',
    
    -- Workflow configuration as JSON
    workflow_data JSONB NOT NULL,
    
    -- Execution statistics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow executions table for tracking runs
CREATE TABLE IF NOT EXISTS workflow_executions (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
    
    -- Execution details
    status VARCHAR(50) NOT NULL, -- running, completed, failed, cancelled
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Input data and results
    input_data JSONB,
    execution_log JSONB DEFAULT '[]'::jsonb,
    results JSONB,
    error_message TEXT,
    
    -- Statistics
    steps_total INTEGER DEFAULT 0,
    steps_completed INTEGER DEFAULT 0,
    contacts_processed INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    
    -- Performance metrics
    execution_time_ms INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step templates for reusable step configurations
CREATE TABLE IF NOT EXISTS workflow_step_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- data_source, ai_analysis, ai_content, etc.
    description TEXT,
    category VARCHAR(100) DEFAULT 'custom',
    
    -- Step configuration template
    config_template JSONB NOT NULL,
    
    -- Usage statistics
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User API keys (encrypted storage)
CREATE TABLE IF NOT EXISTS user_api_keys (
    id SERIAL PRIMARY KEY,
    user_identifier VARCHAR(255) NOT NULL, -- email, user_id, or session_id
    service_name VARCHAR(100) NOT NULL, -- openai, resend, sendgrid, mailgun
    
    -- Encrypted key storage (store encrypted, never plaintext)
    encrypted_key TEXT NOT NULL,
    key_preview VARCHAR(20), -- First few chars for identification
    
    -- Key status
    is_active BOOLEAN DEFAULT true,
    last_validated_at TIMESTAMP,
    validation_status VARCHAR(50) DEFAULT 'unknown', -- valid, invalid, expired
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_identifier, service_name)
);

-- Workflow sharing and collaboration
CREATE TABLE IF NOT EXISTS workflow_shares (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
    shared_by VARCHAR(255) NOT NULL,
    shared_with VARCHAR(255), -- null means public
    permission_level VARCHAR(50) DEFAULT 'view', -- view, edit, execute
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_is_template ON workflows(is_template);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);

CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_identifier ON user_api_keys(user_identifier);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_service_name ON user_api_keys(service_name);

CREATE INDEX IF NOT EXISTS idx_workflow_shares_workflow_id ON workflow_shares(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_shares_shared_with ON workflow_shares(shared_with);

-- Insert default workflow templates
INSERT INTO workflows (name, description, is_template, category, workflow_data) VALUES
(
    'Professional Email Sequence',
    'Enterprise-grade email automation with AI personalization and follow-up sequences',
    true,
    'Marketing',
    '{
        "steps": [
            {
                "id": "data_import",
                "type": "data_source",
                "name": "Import Contact Data",
                "description": "Load contacts from Google Sheets",
                "position": {"x": 100, "y": 100},
                "config": {"sheet_url": ""}
            },
            {
                "id": "ai_segmentation", 
                "type": "ai_analysis",
                "name": "AI Contact Segmentation",
                "description": "Analyze and segment contacts by priority and industry",
                "position": {"x": 400, "y": 100},
                "config": {
                    "analysis_prompt": "Analyze contacts and segment them into: 1. High Priority (Enterprise/Fortune 500 companies, decision makers) 2. Medium Priority (SMB owners, marketing managers) 3. Low Priority (Individual contributors, students)"
                }
            },
            {
                "id": "high_priority_content",
                "type": "ai_content", 
                "name": "High Priority Email Content",
                "description": "Generate premium content for enterprise prospects",
                "position": {"x": 700, "y": 50},
                "config": {
                    "template": "Create an executive-level email for {{contact_name}} at {{company}}. Focus on ROI and efficiency gains (40+ hours saved weekly), enterprise security and compliance, scalability for large teams, custom implementation support, and early Black Friday discount (limited time). Tone: Professional, consultative, value-focused",
                    "brand_voice": "professional"
                }
            }
        ],
        "connections": [],
        "variables": {
            "company_name": "Your Company Name",
            "product_name": "AI Agent Email Workflow", 
            "offer_type": "Early Black Friday Discount",
            "discount_percentage": "30%"
        }
    }'::jsonb
),
(
    'Simple Email Campaign',
    'Basic email automation for getting started',
    true,
    'Marketing',
    '{
        "steps": [
            {
                "id": "data_import",
                "type": "data_source",
                "name": "Import Contacts",
                "description": "Load contact list",
                "position": {"x": 100, "y": 100},
                "config": {"sheet_url": ""}
            },
            {
                "id": "generate_emails",
                "type": "ai_content",
                "name": "Generate Emails", 
                "description": "Create personalized emails",
                "position": {"x": 400, "y": 100},
                "config": {
                    "template": "Create a friendly email for {{contact_name}}",
                    "brand_voice": "friendly"
                }
            },
            {
                "id": "send_emails",
                "type": "email_send",
                "name": "Send Emails",
                "description": "Send personalized emails",
                "position": {"x": 700, "y": 100},
                "config": {
                    "email_service": "resend",
                    "from_email": "hello@yourcompany.com"
                }
            }
        ],
        "connections": [
            {"from": "data_import", "to": "generate_emails"},
            {"from": "generate_emails", "to": "send_emails"}
        ],
        "variables": {}
    }'::jsonb
);

-- Insert default step templates  
INSERT INTO workflow_step_templates (name, type, description, category, config_template) VALUES
(
    'Google Sheets Data Source',
    'data_source',
    'Import contact data from Google Sheets with automatic column mapping',
    'Data Sources',
    '{
        "sheet_url": "",
        "columns": {
            "name": "A",
            "email": "B", 
            "company": "C",
            "context": "D"
        },
        "skip_header": true
    }'::jsonb
),
(
    'AI Contact Analysis',
    'ai_analysis', 
    'Analyze contacts using GPT-4 for priority scoring and segmentation',
    'AI Processing',
    '{
        "analysis_prompt": "Analyze this contact data and provide priority scoring, industry classification, and recommended approach for each contact.",
        "model": "gpt-4",
        "temperature": 0.3
    }'::jsonb
),
(
    'Personalized Email Generation',
    'ai_content',
    'Generate highly personalized emails using AI with brand voice consistency',
    'AI Processing', 
    '{
        "template": "Create a personalized email for {{contact_name}} at {{company}}. Context: {{context}}",
        "brand_voice": "professional",
        "model": "gpt-4",
        "temperature": 0.7,
        "max_tokens": 1000
    }'::jsonb
),
(
    'Multi-Provider Email Send',
    'email_send',
    'Send emails via Resend, SendGrid, or Mailgun with delivery tracking',
    'Communication',
    '{
        "email_service": "resend",
        "from_email": "noreply@yourcompany.com",
        "from_name": "Your Company",
        "track_opens": true,
        "track_clicks": true
    }'::jsonb
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_step_templates_updated_at BEFORE UPDATE ON workflow_step_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON user_api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();