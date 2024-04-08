import React, { useState } from 'react'
import sendRequest from '../functions/sendRequest';

export default function DeleteRepair() {
    const [data, setData] = useState({});
    const [result, setResult] = useState();
    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
        setResult(null);
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data);
        sendRequest('post', data, '8')
            .then(data => {
                setResult(data);
            })
    }
    return (
        <div className="w-full flex">
            <form className='flex w-1/3 p-5 flex-col' onSubmit={handleSubmit}>
                <div className='flex w-full flex-col'>
                    <p className='font-semibold text-lg m-2 text-zinc-300'>ID ремонту:</p>
                    <input
                        type='number'
                        name="repair_id"
                        // value='1'
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        autoComplete='off'
                    />
                </div>
                <div className='flex w-full flex-col'>
                    <p className='font-semibold text-lg m-2 text-zinc-300'>ID сервісного центра:</p>
                    <input
                        type='number'
                        name="sc_id"
                        // value='1'
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        autoComplete='off'
                    />
                </div>
                <button type='submit' className='m-5 p-2 bg-[#779cc1] rounded-md text-lg font-semibold hover:bg-[#3c556e] transition ease-in delay-150'>Видалити</button>
            </form>
            {
                result &&
                <div className="w-2/3 flex p-5 justify-center items-center">
                    {result?.message === 'Запис видалено' ? <p className='text-green-500 font-semibold text-2xl text-center'>Запис видалено</p> : <p className='text-rose-600 font-semibold text-2xl text-center'>ПомилОЧКА?</p>}
                </div>
            }

        </div>
    )
}
