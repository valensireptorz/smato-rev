export const loginAPI = async (username, password) => {
    try {
        const response = await fetch('http://192.168.1.14:3000/api/loginFE', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include', // To send cookies with the request
        });

        const data = await response.json();
        return data; // Return the response data
    } catch (error) {
        console.error('Login error:', error);
        throw error; // Throw the error to be handled by the calling function
    }
};
