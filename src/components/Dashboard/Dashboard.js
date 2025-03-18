import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ScrumDetails from '../Scrum Details/ScrumDetails';
import { UserContext } from '../../context/UserContext';

const Dashboard = () => {
    const [scrums, setScrums] = useState([]);
    const [selectedScrum, setSelectedScrum] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [users, setUsers] = useState([]);
    const { user } = useContext(UserContext);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchScrums = async () => {
            try {
                const response = await axios.get('http://localhost:4000/scrums');
                setScrums(response.data);
            } catch (error) {
                console.error('Error fetching scrums:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchScrums();
        fetchUsers();
    }, []);

    const formik = useFormik({
        initialValues: {
            scrumName: '',
            taskTitle: '',
            taskDescription: '',
            taskStatus: 'To Do',
            taskAssignedTo: '',
        },
        validationSchema: Yup.object({
            scrumName: Yup.string()
                .required('Scrum name is required')
                .test('uniqueScrum', 'Scrum team already exists!', (value) => {
                    if (!submitted) return true; 
                    return !scrums.some(scrum => scrum.name.toLowerCase() === value.toLowerCase());
                }),
            taskTitle: Yup.string().required('Task title is required'),
            taskDescription: Yup.string().required('Task description is required'),
            taskAssignedTo: Yup.string().required('Please assign a user'),
        }),
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: async (values, { resetForm }) => {
            setSubmitted(true);

            const scrumExists = scrums.some(scrum => scrum.name.toLowerCase() === values.scrumName.toLowerCase());
            if (scrumExists) {
                formik.setErrors({ scrumName: 'Scrum team already exists!' });
                return;
            }

            try {
                const newScrumResponse = await axios.post('http://localhost:4000/scrums', {
                    name: values.scrumName,
                });
                const newScrum = newScrumResponse.data;

                await axios.post('http://localhost:4000/tasks', {
                    title: values.taskTitle,
                    description: values.taskDescription,
                    status: values.taskStatus,
                    scrumId: newScrum.id,
                    assignedTo: values.taskAssignedTo,
                    history: [
                        {
                            status: values.taskStatus,
                            date: new Date().toISOString().split('T')[0],
                        },
                    ],
                });

                const updatedScrums = await axios.get('http://localhost:4000/scrums');
                setScrums(updatedScrums.data);
                setShowForm(false);
                alert('New Scrum created successfully.');
                resetForm();
                setSubmitted(false);
            } catch (error) {
                console.error('Error adding scrum:', error);
            }
        },
    });

   
    const handleChange = (e) => {
        formik.setFieldValue(e.target.name, e.target.value);
        formik.setErrors({ ...formik.errors, [e.target.name]: '' });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '15px' }}>Scrum Teams</h2>

            {user?.role === 'admin' && (
                <div>
                    <button 
                        onClick={() => setShowForm(!showForm)} 
                        style={{ height: '30px', width: '120px', marginBottom: '15px' }} 
                    >
                        {showForm ? 'Cancel' : 'Add Scrum'}
                    </button>
                    
                    {showForm && (
                        <div style={{ marginBottom: '20px' }}>
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setSubmitted(true);
                                    formik.handleSubmit();
                                }} 
                                style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                            >
                                <label>Scrum Name:</label>
                                <input 
                                    type="text" 
                                    name="scrumName"
                                    value={formik.values.scrumName}
                                    onChange={handleChange} 
                                    style={{ height: '35px', width: '100%' }}
                                />
                                {formik.errors.scrumName && submitted && (
                                    <div style={{ color: 'red', fontSize: '12px' }}>{formik.errors.scrumName}</div>
                                )}

                                <label>Task Title:</label>
                                <input 
                                    type="text" 
                                    name="taskTitle"
                                    value={formik.values.taskTitle}
                                    onChange={handleChange}
                                    style={{ height: '35px', width: '100%' }}
                                />
                                {formik.errors.taskTitle && submitted && (
                                    <div style={{ color: 'red', fontSize: '12px' }}>{formik.errors.taskTitle}</div>
                                )}

                                <label>Task Description:</label>
                                <input 
                                    type="text" 
                                    name="taskDescription"
                                    value={formik.values.taskDescription}
                                    onChange={handleChange}
                                    style={{ height: '35px', width: '100%' }}
                                />
                                {formik.errors.taskDescription && submitted && (
                                    <div style={{ color: 'red', fontSize: '12px' }}>{formik.errors.taskDescription}</div>
                                )}

                                <label>Task Status:</label>
                                <select 
                                    name="taskStatus"
                                    value={formik.values.taskStatus}
                                    onChange={handleChange}
                                    style={{ height: '35px', width: '100%' }}
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>

                                <label>Assign To:</label>
                                <select 
                                    name="taskAssignedTo"
                                    value={formik.values.taskAssignedTo}
                                    onChange={handleChange}
                                    style={{ height: '35px', width: '100%' }}
                                >
                                    <option value="">Select a user</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                                    ))}
                                </select>
                                {formik.errors.taskAssignedTo && submitted && (
                                    <div style={{ color: 'red', fontSize: '12px' }}>{formik.errors.taskAssignedTo}</div>
                                )}

                                <button 
                                    type="submit" 
                                    style={{ height: '30px', width: '100px', marginTop: '10px' }} 
                                >
                                    Create
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginTop: '30px' }}>  
                <ul>
                    {scrums.map((scrum) => (
                        <li key={scrum.id} style={{ marginBottom: '5px' }}>
                            {scrum.name}
                            &nbsp;&nbsp;&nbsp;
                            <button 
                                onClick={() => setSelectedScrum(scrum)} 
                                style={{ height: '30px', width: '100px' }} 
                            >
                                Get Details
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedScrum && <div style={{ marginTop: '20px' }}><ScrumDetails scrum={selectedScrum} /></div>}
        </div>
    );
};

export default Dashboard;
