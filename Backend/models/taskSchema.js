import mongoose from 'mongoose';
import { getRequiredHeader } from 'openai/core';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    max: 100
  },
  description: {
    type: String,
    required: true,
    max: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
    required: true,
  }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
