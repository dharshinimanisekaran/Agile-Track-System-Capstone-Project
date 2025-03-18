import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const ScrumDetails = ({ scrum }) => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();


    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchTasksAndUsers = async () => {
            try {
                const tasksResponse = await axios.get(`http://localhost:4000/tasks?scrumId=${scrum.id}`);
                setTasks(tasksResponse.data);

                const usersResponse = await axios.get('http://localhost:4000/users');

             
                const assignedUserIds = tasksResponse.data
                    .filter(task => task.assignedTo) 
                    .map(task => String(task.assignedTo)); 
               
                const scrumUsers = usersResponse.data.filter(user => 
                    assignedUserIds.includes(String(user.id))
                );

                setUsers(scrumUsers);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (scrum.id) {
            fetchTasksAndUsers();
        }
    }, [scrum.id]);

    const formik = useFormik({
        initialValues: {
            status: '',
            taskId: '',
        },
        validationSchema: Yup.object({
            status: Yup.string().required('Status is required'),
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                const updatedTask = tasks.find(task => task.id === values.taskId);

                if (!updatedTask) {
                    console.error('Task not found');
                    return;
                }

                const updatedTasks = tasks.map(task =>
                    task.id === values.taskId ? { ...task, status: values.status } : task
                );

                setTasks(updatedTasks);

                await axios.patch(`http://localhost:4000/tasks/${values.taskId}`, {
                    status: values.status,
                    history: [
                        ...updatedTask.history,
                        {
                            status: values.status,
                            date: new Date().toISOString().split('T')[0],
                        },
                    ],
                });

                alert('Task status updated successfully!');
                resetForm();
            } catch (error) {
                console.error('Error updating task status:', error);
            }
        },
    });

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>Scrum Details for {scrum.name}</h3>

            <h4>Tasks</h4>
            <ul>
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <li key={task.id} style={{ marginLeft: '40px' }}>
                            <strong>{task.title}:</strong> {task.description} - <em>{task.status}</em>
                            {user?.role === 'admin' && (
                                <form onSubmit={formik.handleSubmit}>
                                    <select
                                        name="status"
                                        value={formik.values.taskId === task.id ? formik.values.status : task.status}
                                        onChange={(e) => {
                                            formik.setFieldValue('status', e.target.value);
                                            formik.setFieldValue('taskId', task.id);
                                        }}
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                    <button type="submit">Update</button>
                                </form>
                            )}
                        </li>
                    ))
                ) : (
                    <p>No tasks available for this Scrum team.</p>
                )}
            </ul>

            <h4>Users</h4>
            <ul>
                {users.length > 0 ? (
                    users.map(user => (
                        <li key={user.id} style={{ marginLeft: '40px' }}>
                            {user.name} ({user.email})
                        </li>
                    ))
                ) : (
                    <p>No users assigned to this Scrum team.</p>
                )}
            </ul>
        </div>
    );
};

export default ScrumDetails;

