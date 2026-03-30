const API = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:5000/api`;


import axios from 'axios';
const instance = axios.create({
    baseURL: API,
    timeout: 100000000, // Timeout in milliseconds
    signal: AbortSignal.timeout(300000000),	
});
// export const addUser = async (user) => {
//     try {
//         console.log(user);
//         // const data = await instance.post("https://wellnessmonitor.iiita.ac.in/api/addUser", user);
//         axios.post("http://127.0.0.1:5000/addUser", data)
//         console.log(data);
//         return data;
//     } catch (error) {
//         return error;
//     }
// }
export const addUser = async (user) => {
    try {
        console.log(user);

        const response = await instance.post("/addUser", user);

        console.log(response.data);

        return response.data;   // return only the JSON
    } catch (error) {
        console.error(error);
        return { code: 500, error: error };
    }
};

export const getUser = async (email, password) => {
    try {
        // const data = await instance.get(`https://wellnessmonitor.iiita.ac.in/api/getUser/${email}/${password}`);
        const data = await instance.get(`/getUser/${email}/${password}`);//becouse of runnig in local host
        console.log(data);
        console.log(data.data);
        if(data?.data.code === 200) {
            return {data: data.data.data[0], msg: "user exists"};
        } else {
            return {msg: "invalid credentials"}
        }
    } catch (error) {
        return {msg: 'invalid credentials' , error: error}
        
        // if(error.response.data)
        //     return {data: error.response.data, msg: "invalid credentials"}
        // else
        //     return {error: error, msg: "bad_request"}
    }
}

export const getUserData = async (email) => {
    try {
        const data = await instance.get(`/getuserdata/${email}`);
        console.log(data);
    } catch (error) {
        return error;
    }
}

export const uploadVideo = async (email) => {
    try {
        const formData = new FormData();
        // formData.append('video', blob);
        formData.append('email', email);
        formData.forEach((item) => {
            console.log(item);
        }) 
        console.log(formData);
        const data = await instance.post(`/uploadVideo`, formData);
        console.log(data);
        return data;
    } catch (error) {
        return error;
    }
}


// video -- chunk
export const convertVideo = async (chunk, totalChunks, chunkIndex, email) => {
    try {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('totalChunks', totalChunks);
        formData.append('chunkIndex', chunkIndex);
        formData.append('email', email);

        const data = await instance.post(`/convertVideo`, formData);
        return data;
    } catch (error) {
        console.error('Error while converting video:', error.message);
        return error;
    }
}

export const assembleVideo = async (email) => {
    try {
        const formData = new FormData();
        formData.append('email', email);
        const data = await instance.post(`/assembleVideo`, formData);
        console.log(data);
        return data;
    } catch (error) {
        return error;
    }
}



export const getPrediction = async (email) => {
    try {
        const prediction = await instance.get(`/getPrediction/${email}`);
        return prediction;
    } catch (error) {
        return error;
    }
}

///////
export const getResponse = async (message, history = []) => {
    try {
        const response = await instance.post(`/getResponse/`, { message, history });
        return response.data;
    } catch (error) {
        console.error('Error while fetching chatbot response:', error);
        return error?.response?.data || {
            response: 'I am having trouble responding right now. Please try again in a moment.',
            error: error?.message || 'Request failed',
        };
    }
};

export const getAllUsers = async () => {
    try {
        const users = await instance.get(`/getAllUsers/`);
        console.log(users);
	return users;
    } catch (error) {
        return error;
    }
};

export const getAllTesters = async () => {
    try {
        const testers = await instance.get(`/getAllTesters/`);
        return testers;
    } catch (error) {
        return error;
    }
};
