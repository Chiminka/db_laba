import React, { useState } from 'react';
import sendRequest from '../functions/sendRequest';

export default function SearchByTalon() {
  const [data, setData] = useState({});
  const [result, setResult] = useState([]);
  const handleSubmit = (e) => {
    setData({
      ...data,
      ['sc_id']: 1,
    });
    e.preventDefault();
    console.log(data);
    sendRequest('post', data, '9').then((data) => {
      setResult(data);
    });
  };
  const drawTableBody = (rows = [], i) => {
    let result_jsx = [];
    switch (i) {
      case 1:
        rows.details?.map((row) => {
          result_jsx.push(
            <tr>
              <td className="border border-slate-600 p-2 text-center">{row?.detail_id}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.detail_name}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.detail_price}</td>
            </tr>,
          );
        });
        break;
      case 2:
        rows.products?.map((row) => {
          result_jsx.push(
            <tr>
              <td className="border border-slate-600 p-2 text-center">{row?.product_id}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.product_name}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.model}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.price}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.g_term}</td>
            </tr>,
          );
        });
        break;
      case 3:
        rows.talons?.map((row) => {
          result_jsx.push(
            <tr>
              <td className="border border-slate-600 p-2 text-center">{row?.talon_id}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.product_id}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.termin_start}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.termin_end}</td>
            </tr>,
          );
        });
        break;
      case 4:
        rows.repairs?.map((row) => {
          result_jsx.push(
            <tr>
              <td className="border border-slate-600 p-2 text-center">{row?.repair_id}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.talon_id}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.sc_id}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.start_date}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.isended}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.summary}</td>
              <td className="border border-slate-600 p-2 text-center">{row?.cur_sc_id}</td>
            </tr>,
          );
        });
        break;
    }
    return result_jsx;
  };

  return (
    <div className="w-full flex">
      <form className="flex w-1/3 p-5 flex-col" onSubmit={handleSubmit}>
        <div className="flex w-full flex-col">
          <p className="font-semibold text-lg m-2 text-zinc-300">Повна вибірка :</p>
        </div>
        <button
          type="submit"
          className="m-5 p-2 bg-[#779cc1] rounded-md text-lg font-semibold hover:bg-[#3c556e] transition ease-in delay-150">
          Шукати
        </button>
      </form>
      <div>
        <div className="justify-center flex p-5 w-2/3">
          <p className="font-semibold text-lg m-2 text-zinc-300">Ремонти:</p>
          <table class="border-collapse border border-slate-500 w-1/2 h-fit">
            <thead>
              <tr>
                <th className="border border-slate-600 p-2 text-center">Repair ID</th>
                <th className="border border-slate-600 p-2 text-center">Talon ID</th>
                <th className="border border-slate-600 p-2 text-center">SC ID</th>
                <th className="border border-slate-600 p-2 text-center">Start date</th>
                <th className="border border-slate-600 p-2 text-center">Is ended?</th>
                <th className="border border-slate-600 p-2 text-center">Summary</th>
                <th className="border border-slate-600 p-2 text-center">Cur SC ID</th>
              </tr>
            </thead>
            <tbody>{drawTableBody(result, 4)}</tbody>
          </table>
        </div>
        <div className="justify-center flex p-5 w-2/3">
          <p className="font-semibold text-lg m-2 text-zinc-300">Деталі:</p>
          <table class="border-collapse border border-slate-500 w-1/2 h-fit">
            <thead>
              <tr>
                <th className="border border-slate-600 p-2 text-center">Detail ID</th>
                <th className="border border-slate-600 p-2 text-center">Name</th>
                <th className="border border-slate-600 p-2 text-center">Price</th>
              </tr>
            </thead>
            <tbody>{drawTableBody(result, 1)}</tbody>
          </table>
        </div>
        <div className="w-2/3 justify-center flex p-5">
          <p className="font-semibold text-lg m-2 text-zinc-300">Продукти:</p>
          <table class="border-collapse border border-slate-500 w-1/2 h-fit">
            <thead>
              <tr>
                <th className="border border-slate-600 p-2 text-center">Product ID</th>
                <th className="border border-slate-600 p-2 text-center">Name</th>
                <th className="border border-slate-600 p-2 text-center">Model</th>
                <th className="border border-slate-600 p-2 text-center">Price</th>
                <th className="border border-slate-600 p-2 text-center">Garant Term</th>
              </tr>
            </thead>
            <tbody>{drawTableBody(result, 2)}</tbody>
          </table>
        </div>
        <div className="w-2/3 justify-center flex p-5">
          <p className="font-semibold text-lg m-2 text-zinc-300">Талони:</p>
          <table class="border-collapse border border-slate-500 w-1/2 h-fit">
            <thead>
              <tr>
                <th className="border border-slate-600 p-2 text-center">Talon ID</th>
                <th className="border border-slate-600 p-2 text-center">Product ID</th>
                <th className="border border-slate-600 p-2 text-center">Start Term</th>
                <th className="border border-slate-600 p-2 text-center">End Term</th>
              </tr>
            </thead>
            <tbody>{drawTableBody(result, 3)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
