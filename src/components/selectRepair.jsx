import React from 'react'

export default function SelectRepair() {
    const handleChange = () => {

    }
    const handleSubmit = () => {
        
    }
    return (
        <div className="w-full flex">
            <form className='flex w-1/4 p-5 flex-col' onSubmit={handleSubmit}>
                <div className='flex w-full flex-col'>
                    <p className='font-semibold text-lg m-2 text-zinc-300'>Виборка ремонтів:</p>
                    <select onChange={handleChange} name='select_by' class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        {/* <option selected>Choose a country</option> */}
                        <option value="all_sc">З всіх сервісів</option>
                        <option value="sc_1">Сервіс 1</option>
                        <option value="sc_2">Сервіс 2</option>
                        <option value="all_sc_done">Усі сервіси заверш.</option>
                        <option value="sc_1_done">Сервіс 1 заверш.</option>
                        <option value="sc_2_done">Сервіс 2 заверш.</option>
                        <option value="all_sc_inprogress">Усі сервіси незаверш.</option>
                        <option value="sc_1_inprogress">Сервіс 1 незаверш.</option>
                        <option value="sc_2_inprogress">Сервіс 2 незаверш.</option>
                    </select>
                </div>
                <button type='submit' className='m-5 p-2 bg-[#779cc1] rounded-md text-lg font-semibold hover:bg-[#3c556e] transition ease-in delay-150'>Видалити</button>
            </form>
            <div className="w-1/2 flex p-5">
                fafaf
            </div>
        </div>
    )
}
