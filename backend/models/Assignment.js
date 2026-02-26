const mongoose = require('mongoose');

const sampleTableSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  schema: { type: String, required: true },     
  sampleData: { type: String, required: true },
  description: String
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['SELECT', 'JOIN', 'GROUP BY', 'Subqueries', 'Window Functions', 'Aggregates', 'DML'],
    required: true 
  },
  question: { type: String, required: true },
  requirements: [{ type: String }],
  sampleTables: [sampleTableSchema],
  expectedOutputDescription: String,
  hints: [{ type: String }],  
  isActive: { type: Boolean, default: true },
  orderIndex: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
