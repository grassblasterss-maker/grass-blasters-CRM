export const toolRegistry = [
  tool('search_clients', 'green', 'read', 'Find Jobber clients by name, phone, or email.'),
  tool('get_client', 'green', 'read', 'Get one Jobber client by external ID.'),
  tool('get_client_timeline', 'green', 'read', 'Get recent Jobber, email, and internal activity for a client.'),
  tool('get_open_opportunities', 'green', 'read', 'Derive active opportunities from Jobber requests and quotes.'),
  tool('get_open_quotes', 'green', 'read', 'List open Jobber quotes.'),
  tool('get_jobs', 'green', 'read', 'List Jobber jobs matching filters.'),
  tool('get_schedule', 'green', 'read', 'Get the Jobber schedule for a date range.'),
  tool('get_overdue_invoices', 'green', 'read', 'List overdue Jobber invoices.'),
  tool('get_work_queue', 'green', 'read', 'List prioritized records from the Work Queue table.'),
  tool('create_internal_task', 'green', 'write', 'Create a non-customer-facing Work Queue task.'),
  tool('add_internal_note', 'green', 'write', 'Add a private internal note.'),
  tool('draft_email', 'green', 'write', 'Prepare an email draft without sending it.'),
  tool('draft_sms', 'green', 'write', 'Prepare an SMS draft without sending it.'),
  tool('create_jobber_request', 'yellow', 'write', 'Create a request for an existing or deduplicated Jobber client.'),
  tool('send_customer_email', 'yellow', 'write', 'Send an approved customer email.'),
  tool('send_customer_text', 'yellow', 'write', 'Send an approved customer text.'),
  tool('reschedule_visit', 'yellow', 'write', 'Change a Jobber visit time after approval.'),
  tool('update_customer_record', 'yellow', 'write', 'Change customer data after approval.'),
  tool('send_invoice', 'red', 'write', 'Send an invoice after explicit high-risk approval.'),
  tool('issue_refund', 'red', 'write', 'Issue a refund after explicit high-risk approval.'),
  tool('change_pricing', 'red', 'write', 'Change customer pricing after explicit high-risk approval.'),
  tool('cancel_job', 'red', 'write', 'Cancel a Jobber job after explicit high-risk approval.'),
  tool('delete_record', 'red', 'write', 'Delete a business record after explicit high-risk approval.'),
  tool('bulk_message', 'red', 'write', 'Send a message to multiple recipients after explicit high-risk approval.')
];

function tool(name, risk, mode, description) { return { name, risk, mode, description }; }
export function findTool(name) { return toolRegistry.find((entry) => entry.name === name); }
