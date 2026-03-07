import axios from 'axios';
// Create an Axios instance with the base URL and credentials configuration
const api = axios.create({
    baseURL: 'http://localhost:3000/api/auth',
    withCredentials: true
})

// Function to register a new user
export async function registerUser({ username, email, password }) {
    try {
        const response = await api.post('/register', {
            username,
            email,
            password
        })
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}
// Function to login a user with email and password
export async function loginUser({ email, password }) {
    try {
        const response = await api.post('/login', {
            email,
            password
        })
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}
// Function to logout a user by blacklisting the token
export async function logoutUser() {
    try {
        const response = await api.get('/logout')
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}
// Function to get the details of the logged in user
export async function getMe() {
    try {
        const response = await api.get('/get-me')
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}

