import axios from "axios"

const apiPath = 'http://localhost:3002/api/select'

export default async function sendRequest (method = 'get', req_data = {}, request_num = '1') {
    switch (method) {
        case 'get':
            let {data_get} = await axios.get(apiPath + request_num);
            return data_get;
        case 'post':
            try {
                let {data_post} = await axios.post(apiPath + request_num, {...req_data});
                return data_post;
            } catch (error) {
                console.log(error);
            }
            // let data_post = [{'repair_id': 1, 'sc_id': 2}]
        case 'delete':
            let {data_delete} = await axios.delete(apiPath + request_num);
            return data_delete;
        case 'update':
            let {data_update} = await axios.put(apiPath + request_num, {...req_data});
            return data_update
    }
}