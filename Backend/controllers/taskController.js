import Task from '../models/taskSchema.js';

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json({
      message: 'Tasks fetched successfully',
      data: tasks,
      success: true
    });
  }
  catch (err) {
    res.status(500).json({ 
      error: err.message,
      success: false
    });
  }
};

export const getTaskById = async (req,res) => {
  try {
    const task = await Task.findById(req.params.id);
    if(!task) {
      return res.status(404).json({
        message: 'Task not found',
        success: false
      });
    }
    res.status(200).json({
      message: 'Task fetched successfully',
      data: task,
      success: true
    })
  }
  catch (err) {
    res.status(500).json({ 
      error: err.message,
      success: false
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newTask = await Task.create({ title, description });
    res.status(201).json({
      message: 'Task created successfully',
      data: newTask,
      success: true
    });
  } catch (err) {
    res.status(500).json({ 
      error: err.message,
      success: false 
    });
  }
};

export const updateTask = async(req,res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const task = await Task.findByIdAndUpdate(id, { title, description, updatedAt: Date.now() });
    res.status(200).json({ 
      message: 'Task updated successfully',
      data: task,
      success: true
    });
  }
  catch (err) {
    res.status(500).json({ 
      error: err.message,
      success: false
    });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  res.json({ 
    message: 'Task deleted',
    success: true,
    id: id 
  });
};
