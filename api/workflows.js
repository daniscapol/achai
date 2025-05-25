import db from '../src/utils/db.js';

// Initialize workflow database tables
export async function initializeWorkflowDatabase() {
  const schema = `
    -- Workflow Builder Database Schema
    CREATE TABLE IF NOT EXISTS workflows (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        is_template BOOLEAN DEFAULT false,
        category VARCHAR(100) DEFAULT 'custom',
        workflow_data JSONB NOT NULL,
        total_executions INTEGER DEFAULT 0,
        successful_executions INTEGER DEFAULT 0,
        last_executed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workflow_executions (
        id SERIAL PRIMARY KEY,
        workflow_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        input_data JSONB,
        execution_log JSONB DEFAULT '[]'::jsonb,
        results JSONB,
        error_message TEXT,
        steps_total INTEGER DEFAULT 0,
        steps_completed INTEGER DEFAULT 0,
        contacts_processed INTEGER DEFAULT 0,
        emails_sent INTEGER DEFAULT 0,
        execution_time_ms INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
    CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
    CREATE INDEX IF NOT EXISTS idx_workflows_is_template ON workflows(is_template);
    CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
  `;

  try {
    await db.query(schema);
    console.log('Workflow database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing workflow database:', error);
    throw error;
  }
}

// Save workflow to database
export async function saveWorkflow(workflowData, userId = 'anonymous') {
  try {
    const query = `
      INSERT INTO workflows (name, description, created_by, workflow_data, is_template, category)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      workflowData.name || 'Untitled Workflow',
      workflowData.description || '',
      userId,
      JSON.stringify(workflowData),
      workflowData.is_template || false,
      workflowData.category || 'custom'
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error saving workflow:', error);
    throw error;
  }
}

// Load workflow from database
export async function loadWorkflow(workflowId) {
  try {
    const query = 'SELECT * FROM workflows WHERE id = $1';
    const result = await db.query(query, [workflowId]);
    
    if (result.rows.length === 0) {
      throw new Error('Workflow not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error loading workflow:', error);
    throw error;
  }
}

// Get workflow templates
export async function getWorkflowTemplates() {
  try {
    const query = 'SELECT * FROM workflows WHERE is_template = true ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error loading workflow templates:', error);
    throw error;
  }
}

// Initialize default workflow templates
export async function initializeDefaultTemplates() {
  try {
    const defaultTemplates = [
      {
        name: 'Email Automation - Basic',
        description: 'Simple email automation workflow for lead nurturing',
        category: 'email_marketing',
        is_template: true,
        steps: [
          {
            id: 'data-source-1',
            type: 'data_source',
            name: 'Load Contacts',
            position: { x: 100, y: 100 },
            config: {
              source_type: 'csv_upload',
              required_fields: ['email', 'name']
            }
          },
          {
            id: 'ai-content-1',
            type: 'ai_content',
            name: 'Generate Email Content',
            position: { x: 300, y: 100 },
            config: {
              template: 'Generate a professional email for {{contact_name}} at {{company}}',
              brand_voice: 'professional'
            }
          },
          {
            id: 'email-send-1',
            type: 'email_send',
            name: 'Send Emails',
            position: { x: 500, y: 100 },
            config: {
              email_service: 'resend',
              from_email: 'your-email@company.com'
            }
          }
        ]
      },
      {
        name: 'AI Lead Analysis & Scoring',
        description: 'Advanced AI-powered lead analysis and personalized outreach',
        category: 'sales_automation',
        is_template: true,
        steps: [
          {
            id: 'data-source-2',
            type: 'data_source',
            name: 'Import Lead Data',
            position: { x: 100, y: 150 },
            config: {
              source_type: 'google_sheets',
              required_fields: ['email', 'name', 'company', 'context']
            }
          },
          {
            id: 'ai-analysis-1',
            type: 'ai_analysis',
            name: 'AI Lead Analysis',
            position: { x: 300, y: 150 },
            config: {
              analysis_prompt: 'Analyze these leads and segment them by potential value and engagement likelihood'
            }
          },
          {
            id: 'condition-1',
            type: 'condition',
            name: 'High Priority Filter',
            position: { x: 500, y: 150 },
            config: {
              condition_logic: '{{high_priority_count}} > 0'
            }
          },
          {
            id: 'ai-content-2',
            type: 'ai_content',
            name: 'Personalized Content',
            position: { x: 700, y: 150 },
            config: {
              template: 'Create highly personalized email for {{contact_name}} based on {{segment}} analysis',
              brand_voice: 'consultative'
            }
          }
        ]
      },
      {
        name: 'Multi-Step Drip Campaign',
        description: 'Automated drip campaign with AI personalization and timing',
        category: 'email_marketing',
        is_template: true,
        steps: [
          {
            id: 'data-source-3',
            type: 'data_source',
            name: 'Campaign Contacts',
            position: { x: 100, y: 200 },
            config: {
              source_type: 'api_endpoint',
              required_fields: ['email', 'name', 'signup_date']
            }
          },
          {
            id: 'ai-content-3',
            type: 'ai_content',
            name: 'Welcome Email',
            position: { x: 300, y: 200 },
            config: {
              template: 'Welcome {{contact_name}} with personalized onboarding content',
              brand_voice: 'friendly'
            }
          },
          {
            id: 'email-send-2',
            type: 'email_send',
            name: 'Send Welcome',
            position: { x: 500, y: 200 },
            config: {
              email_service: 'resend',
              from_email: 'welcome@company.com'
            }
          },
          {
            id: 'wait-delay-1',
            type: 'wait_delay',
            name: 'Wait 3 Days',
            position: { x: 700, y: 200 },
            config: {
              duration: 259200000
            }
          },
          {
            id: 'ai-content-4',
            type: 'ai_content',
            name: 'Follow-up Email',
            position: { x: 900, y: 200 },
            config: {
              template: 'Follow-up with {{contact_name}} about their experience and next steps',
              brand_voice: 'helpful'
            }
          }
        ]
      }
    ];

    for (const template of defaultTemplates) {
      await saveWorkflow(template, 'system');
    }
    
    console.log('✅ Default workflow templates initialized');
  } catch (error) {
    console.error('❌ Error initializing default templates:', error);
    throw error;
  }
}

// Save workflow execution
export async function saveWorkflowExecution(executionData) {
  try {
    const query = `
      INSERT INTO workflow_executions (
        workflow_id, status, input_data, execution_log, results, 
        steps_total, steps_completed, contacts_processed, emails_sent, 
        execution_time_ms, error_message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      executionData.workflow_id,
      executionData.status,
      JSON.stringify(executionData.input_data || {}),
      JSON.stringify(executionData.execution_log || []),
      JSON.stringify(executionData.results || {}),
      executionData.steps_total || 0,
      executionData.steps_completed || 0,
      executionData.contacts_processed || 0,
      executionData.emails_sent || 0,
      executionData.execution_time_ms || 0,
      executionData.error_message || null
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error saving workflow execution:', error);
    throw error;
  }
}

// Update workflow execution status
export async function updateWorkflowExecution(executionId, updateData) {
  try {
    const query = `
      UPDATE workflow_executions 
      SET status = $2, completed_at = $3, results = $4, execution_log = $5,
          steps_completed = $6, contacts_processed = $7, emails_sent = $8,
          execution_time_ms = $9, error_message = $10
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      executionId,
      updateData.status,
      updateData.completed_at || null,
      JSON.stringify(updateData.results || {}),
      JSON.stringify(updateData.execution_log || []),
      updateData.steps_completed || 0,
      updateData.contacts_processed || 0,
      updateData.emails_sent || 0,
      updateData.execution_time_ms || 0,
      updateData.error_message || null
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating workflow execution:', error);
    throw error;
  }
}

// Get workflow execution history
export async function getWorkflowExecutions(workflowId, limit = 50) {
  try {
    const query = `
      SELECT * FROM workflow_executions 
      WHERE workflow_id = $1 
      ORDER BY started_at DESC 
      LIMIT $2
    `;
    
    const result = await db.query(query, [workflowId, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error loading workflow executions:', error);
    throw error;
  }
}

export default {
  initializeWorkflowDatabase,
  saveWorkflow,
  loadWorkflow,
  getWorkflowTemplates,
  initializeDefaultTemplates,
  saveWorkflowExecution,
  updateWorkflowExecution,
  getWorkflowExecutions
};