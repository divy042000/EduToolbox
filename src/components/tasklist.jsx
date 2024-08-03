import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:4000/getTasks');
      setTasks(response.data.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/createTask', newTask);
      setTasks([...tasks, response.data.data]);
      setNewTask({ title: '', description: '', dueDate: '' });
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/deleteTask/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Task Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex justify-between items-center mb-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            placeholder="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="border-2 border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="border-2 border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="border-2 border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200">Add Task</button>
        </form>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task._id} className="border-b border-gray-200 py-2 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{task.title}</h2>
              <p className="text-sm text-gray-500">{task.description}</p>
              <p className="text-sm text-gray-500">Due Date: {task.dueDate}</p>
            </div>
            <button onClick={() => handleDelete(task._id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;