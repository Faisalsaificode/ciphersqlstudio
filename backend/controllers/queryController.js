const pool = require('../config/postgres');
const Assignment = require('../models/Assignment');


const BLOCKED_PATTERNS = [
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\b/i,
  /\bCREATE\b/i,
  /\bINSERT\b/i,
  /\bUPDATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bEXECUTE\b/i,
  /\bEXEC\b/i,
  /\bpg_sleep\b/i,
  /\bpg_read_file\b/i,
  /\blo_import\b/i,
  /\bCOPY\b/i,
  /--.*$/m,                     
  /\/\*[\s\S]*?\*\//,           
  /;\s*\w/,                     
];

function validateQuery(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Query must be a non-empty string.');
  }
  const trimmed = query.trim();
  if (trimmed.length === 0) throw new Error('Query cannot be empty.');
  if (trimmed.length > 5000) throw new Error('Query too long (max 5000 chars).');

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new Error('Query contains forbidden operations. Only SELECT queries are allowed.');
    }
  }

  if (!/^\s*SELECT\b/i.test(trimmed)) {
    throw new Error('Only SELECT queries are permitted.');
  }

  return trimmed;
}

async function setupSandbox(client, assignment) {
 
  const schemaName = `sandbox_${assignment._id.toString().slice(-8)}`;
  
  await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
  await client.query(`SET search_path TO ${schemaName}`);

  for (const table of assignment.sampleTables) {
   
    await client.query(`DROP TABLE IF EXISTS ${table.tableName} CASCADE`);
    await client.query(table.schema);
    if (table.sampleData) {
      await client.query(table.sampleData);
    }
  }

  return schemaName;
}

exports.executeQuery = async (req, res) => {
  const { query, assignmentId } = req.body;

  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId is required.' });
  }

  let sanitizedQuery;
  try {
    sanitizedQuery = validateQuery(query);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  let assignment;
  try {
    assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid assignment ID.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const schemaName = await setupSandbox(client, assignment);

  
    const limitedQuery = `SELECT * FROM (${sanitizedQuery}) AS __result LIMIT 500`;
    const result = await client.query(limitedQuery);

  
    await client.query('ROLLBACK');

    res.json({
      columns: result.fields.map(f => f.name),
      rows: result.rows,
      rowCount: result.rowCount,
      truncated: result.rowCount === 500
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    
  
    const safeMessage = err.message
      .replace(/\/[^\s]+/g, '[path]') 
      .substring(0, 300);

    res.status(400).json({ error: safeMessage });
  } finally {
    client.release();
  }
};
