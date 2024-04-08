import React from 'react';
import { useState } from 'react';
import sendRequest from '../functions/sendRequest';

const SelectActiveRepairsFromServices = () => {
    // const [data, setData] = useState({});
    const [result, setResult] = useState([]);
    // const handleChange = (e) => {
    //     setData({
    //         ...data,
    //         [e.target.name]: e.target.value
    //     })
    // }
    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log(data);
        sendRequest('get', {} , '4')
            .then(data => {
                setResult(data);
            })
    }
    const drawTableBody = (rows = []) => {
        let result_jsx = [];
        rows.map(row => {
            result_jsx.push(
                <tr>
                    <td className="border border-slate-600 p-2 text-center">{row?.repair_id}</td>
                    <td className="border border-slate-600 p-2 text-center">{row?.sc_id}</td>
                </tr>
            )
        })
        return result_jsx;
    }
      return (
          <div className="w-full flex">
          <form className='flex w-1/3 p-5 flex-col' onSubmit={handleSubmit}>
            <div className='flex w-full flex-col'>
              <p className='font-semibold text-lg m-2 text-zinc-300'>Вибрати всі активні ремонти з усіх сервісів:</p>
              {/* <input
                type='number'
                name="product_id"
                // value='1'
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                autoComplete='off'
              /> */}
            </div>
            <button type='submit' className='m-5 p-2 bg-[#779cc1] rounded-md text-lg font-semibold hover:bg-[#3c556e] transition ease-in delay-150'>Виконати запит</button>
          </form>
          <div className="w-2/3 flex justify-center p-5">
            <table class="border-collapse border border-slate-500 w-1/2 h-fit">
              <thead>
                <tr>
                    <th className='border border-slate-600 p-2 text-center'>Repair ID</th>
                    <th className='border border-slate-600 p-2 text-center'>SC ID</th>
                </tr>
              </thead>
              <tbody>
                {drawTableBody(result)}
              </tbody>
            </table>
          </div>
        </div>
      );
}

export default SelectActiveRepairsFromServices;
