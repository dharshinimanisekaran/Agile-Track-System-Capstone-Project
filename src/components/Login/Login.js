import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../../context/UserContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(UserContext);
    const [submitted, setSubmitted] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .matches(
                    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    'Enter a valid email address (e.g., user@example.com)'
                )
                .required('Email is required'),
            password: Yup.string().required('Password is required'),
        }),
        validateOnChange: false, 
        validateOnBlur: false,
        onSubmit: async (values) => {
            setSubmitted(true);
            try {
                const response = await axios.get(`http://localhost:4000/users?email=${values.email}`);

                if (response.data.length === 0) {
                    formik.setErrors({ email: 'Email ID does not exist. Please sign up.' });
                } else {
                    const user = response.data[0];
                    if (user.password !== values.password) {
                        formik.setErrors({ password: 'Incorrect password. Please try again.' });
                    } else {
                        login(user);
                        alert('Login successful!');
                        navigate('/');
                    }
                }
            } catch (error) {
                console.error('Error logging in:', error);
                alert('An error occurred. Please try again.');
            }
        },
    });

   
    const handleChange = (field, value) => {
        formik.setFieldValue(field, value);
        formik.setErrors({ ...formik.errors, [field]: '' }); 
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Login</h2>
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                    formik.handleSubmit();
                }} 
                style={{ width: '300px' }}
            >
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        {...formik.getFieldProps('email')} 
                        onChange={(e) => handleChange('email', e.target.value)}
                        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {formik.errors.email && submitted && (
                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px', textAlign: 'left' }}>
                            {formik.errors.email}
                        </div>
                    )}
                </div>

                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        {...formik.getFieldProps('password')} 
                        onChange={(e) => handleChange('password', e.target.value)}
                        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {formik.errors.password && submitted && (
                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px', textAlign: 'left' }}>
                            {formik.errors.password}
                        </div>
                    )}
                </div>

                <button type="submit" style={{ marginTop: '15px', padding: '10px 15px', cursor: 'pointer' }}>
                    Login
                </button>
            </form>

            <button onClick={() => navigate('/signup')} style={{ marginTop: '10px', padding: '10px 15px', cursor: 'pointer' }}>
                Sign Up
            </button>
        </div>
    );
};

export default Login;
