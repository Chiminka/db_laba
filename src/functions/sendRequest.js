import axios from "axios"

const apiPath = 'http://localhost:3002/api/select'

export default async function sendRequest (method = 'get', req_data = {}, request_num = '1') {
    switch (method) {
        case 'get':
            let response_1 = await axios.get(apiPath + request_num);
            return response_1.data;
        case 'post':
            try {
                let response_2 = await axios.post(apiPath + request_num, {...req_data});
                return response_2.data;
            } catch (error) {
                console.log(error);
            }
        case 'delete':
            let response_3 = await axios.delete(apiPath + request_num);
            return response_3.data;
        case 'patch':
            let response_4 = await axios.patch(apiPath + request_num, {...req_data});
            return response_4.data
    }
}