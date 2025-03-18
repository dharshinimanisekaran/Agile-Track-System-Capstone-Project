import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const SignUp = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string()
                .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format') // Email validation
                .required('Email is required'),
            password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
                .matches(/[a-z]/, 'Must contain at least one lowercase letter')
                .matches(/[0-9]/, 'Must contain at least one number')
                .matches(/[!@#$%^&*]/, 'Must contain at least one special character (!@#$%^&*)')
                .required('Password is required'),
        }),
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: async (values) => {
            try {
               
                const response = await axios.get(`http://localhost:4000/users?email=${values.email}`);

                if (response.data.length > 0) {
                    alert('Email already exists. Please use a different email.');
                    return;
                }

                
                await axios.post('http://localhost:4000/users', {
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    role: 'employee',
                });

                alert('Signed up successfully!');
                navigate('/login');
            } catch (error) {
                console.error('Error signing up:', error);
                alert('An error occurred. Please try again.');
            }
        },
    });

    const handleChange = (e) => {
        formik.setFieldValue(e.target.name, e.target.value);
        formik.setErrors({ ...formik.errors, [e.target.name]: undefined });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Sign Up</h2>
            <form onSubmit={(e) => {
                setSubmitted(true);
                formik.handleSubmit(e);
            }} style={{ width: '300px' }}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={handleChange}
                        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {submitted && formik.errors.name && (
                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px', textAlign: 'left' }}>
                            {formik.errors.name}
                        </div>
                    )}
                </div>

                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={handleChange}
                        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {submitted && formik.errors.email && (
                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px', textAlign: 'left' }}>
                            {formik.errors.email}
                        </div>
                    )}
                </div>

                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formik.values.password}
                        onChange={handleChange}
                        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {submitted && formik.errors.password && (
                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px', textAlign: 'left' }}>
                            {formik.errors.password}
                        </div>
                    )}
                </div>

                <button type="submit" style={{ marginTop: '15px', padding: '10px 15px', cursor: 'pointer' }}>
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default SignUp;
