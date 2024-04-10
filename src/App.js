import AddRepair from './components/addRepair';
import DeleteRepair from './components/deleteRepair';
import EditRepair from './components/editRepair';
import MoveRepair from './components/moveRepair';
import SearchByProductID from './components/searchByProductId';
import SearchByTalon from './components/searchByTalon';
import SearchDetail from './components/searchDetail';
import SelectActiveRepairsFromServices from './components/selectActiveRepairsFromServices';
import SelectAllRepairs from './components/selectAllRepairs';
// import SelectRepair from "./components/selectRepair";

function App() {
  return (
    <div className="w-full h-full flex flex-col bg-[#243342] p-3">
      <p className="border-y-2 p-3 text-center font-semibold text-zinc-300 text-2xl">
        Вибірка усіх ремонтів
      </p>
      <SelectAllRepairs />
      <p className="border-y-2 p-3 text-center font-semibold text-zinc-300 text-2xl">
        Пошук деталі по назві в сервісах
      </p>
      <SearchDetail />
      <p className="border-y-2 p-3 text-center font-semibold text-zinc-300 text-2xl">
        Пошук ремонтів по гарантійному талону
      </p>
      <SearchByTalon />
      <p className="border-y-2 p-3 text-center font-semibold text-zinc-300 text-2xl">
        Вибірка усіх ремонтів за продуктом з всіх сервісів
      </p>
      <SearchByProductID />
      <p className="border-y-2 p-3 text-center font-semibold text-zinc-300 text-2xl">
        Вибірка усіх активних ремонтів з всіх сервісів
      </p>
      <SelectActiveRepairsFromServices />
      <p className="border-y-2 p-3 text-center font-semibold text-zinc-300 text-2xl">
        Створення нового ремонту в сервісі
      </p>
      <AddRepair />
      <p className="border-y-2 p-3 text-center font-semibold text-zinc-300 text-2xl">
        Редагування ремонту
      </p>
      <EditRepair />
      <p className="border-y-2 p-3 text-center font-semibold text-zinc-300 text-2xl">
        Видалення ремонту
      </p>
      <DeleteRepair />
      <p className="border-y-2 p-3 text-center font-semibold text-zinc-300 text-2xl">
        Перенос ремонту в інш. сервіс
      </p>
      <MoveRepair />
    </div>
  );
}

export default App;
