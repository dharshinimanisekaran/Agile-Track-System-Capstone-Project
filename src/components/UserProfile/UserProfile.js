import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { UserContext } from "../../context/UserContext";

const UserProfile = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { user } = useContext(UserContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:4000/users");
        if (user?.role === "admin") {
          setUsers(response.data.filter((u) => u?.role !== "admin"));
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (user?.role === "employee") {
      handleGetHistory(user.id);
    }
  }, [user]);

  const handleGetHistory = async (userId) => {
    setSelectedUser(users.find((u) => u?.id === userId) || user);
    try {
      const response = await axios.get(`http://localhost:4000/tasks?assignedTo=${userId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email")
        .matches(/\.com$/, "Email must end with .com")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain at least one uppercase letter")
        .matches(/[a-z]/, "Must contain at least one lowercase letter")
        .matches(/[0-9]/, "Must contain at least one number")
        .matches(/[!@#$%^&*]/, "Must contain at least one special character (!@#$%^&*)")
        .required("Password is required"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const response = await axios.get(`http://localhost:4000/users?email=${values.email}`);
        if (response.data.length > 0) {
          setErrors({ email: "Email already exists!" });
          return;
        }

        await axios.post("http://localhost:4000/users", values);
        const updatedUsers = await axios.get("http://localhost:4000/users");
        setUsers(updatedUsers.data.filter((u) => u?.role !== "admin"));
        setShowForm(false);
        resetForm();
        alert("User has been successfully created!");
      } catch (error) {
        console.error("Error adding user:", error);
      }
    },
  });

  const handleChange = (e) => {
    formik.setFieldValue(e.target.name, e.target.value);
    formik.setErrors({ ...formik.errors, [e.target.name]: undefined });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <h2 style={{ marginBottom: "15px" }}>User Profiles</h2>

      {user?.role === "admin" && (
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ height: "30px", width: "120px", marginBottom: "15px" }}
          >
            {showForm ? "Cancel" : "Add New User"}
          </button>

          {showForm && (
            <div style={{ marginBottom: "20px" }}>
              <form
                onSubmit={(e) => {
                  setSubmitted(true);
                  formik.handleSubmit(e);
                }}
                style={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={handleChange}
                  style={{ height: "35px", width: "100%" }}
                />
                {submitted && formik.errors.name && (
                  <div style={{ color: "red", fontSize: "12px" }}>{formik.errors.name}</div>
                )}

                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={handleChange}
                  style={{ height: "35px", width: "100%" }}
                />
                {submitted && formik.errors.email && (
                  <div style={{ color: "red", fontSize: "12px" }}>{formik.errors.email}</div>
                )}

                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formik.values.password}
                  onChange={handleChange}
                  style={{ height: "35px", width: "100%" }}
                />
                {submitted && formik.errors.password && (
                  <div style={{ color: "red", fontSize: "12px" }}>{formik.errors.password}</div>
                )}

                <label>Role:</label>
                <select
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  style={{ height: "35px", width: "100%" }}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>

                <button type="submit" style={{ height: "30px", width: "100px", marginTop: "10px" }}>
                  Create User
                </button>
              </form>
            </div>
          )}

          <ul>
            {users.map((user) => (
              <li key={user?.id} style={{ marginBottom: "10px" }}>
                <strong>Name:</strong> {user?.name} <br />
                <strong>Email:</strong> {user?.email} <br />
                <button
                  onClick={() => handleGetHistory(user?.id)}
                  style={{ height: "30px", width: "120px", marginTop: "5px" }}
                >
                  Get History
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedUser && (
        <div style={{ marginTop: "20px" }}>
          <h3>Tasks Worked By {selectedUser.name}</h3>
          {tasks.length > 0 ? (
            <ul>
              {tasks.map((task) => (
                <li key={task.id} style={{ marginBottom: "10px" }}>
                  <strong>Title:</strong> {task.title} <br />
                  <strong>Description:</strong> {task.description} <br />
                  <strong>Status:</strong> {task.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks assigned.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
