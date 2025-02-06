import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, doc, getDocs, updateDoc, setDoc } from "firebase/firestore";

const Home = () => {
  const [weekData, setWeekData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    liters: "",
    timeOfDay: "Morning",
  });

  useEffect(() => {
    fetchCurrentWeekData();
  }, []);

  const fetchCurrentWeekData = async () => {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    const startDate = firstDay.toISOString().split("T")[0];
    const endDate = lastDay.toISOString().split("T")[0];
    setCurrentWeek(`${startDate} - ${endDate}`);

    const docRef = doc(db, "customer-data", `${startDate}_${endDate}`);
    const querySnapshot = await getDocs(collection(db, "customer-data"));

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs.find(doc => doc.id === `${startDate}_${endDate}`);
      if (docData) {
        setWeekData(docData.data().entries || []);
      }
    }
  };

  const handleAddEntry = async () => {
    if (!formData.customerName || !formData.liters) {
      alert("Please fill all fields.");
      return;
    }

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    const startDate = firstDay.toISOString().split("T")[0];
    const endDate = lastDay.toISOString().split("T")[0];

    const docRef = doc(db, "customer-data", `${startDate}_${endDate}`);

    let newData = [...weekData];
    let existingEntry = newData.find(entry => entry.customerName === formData.customerName && entry.date === dateStr);

    if (existingEntry) {
      existingEntry[formData.timeOfDay.toLowerCase()] = Number(formData.liters);
    } else {
      newData.push({
        customerName: formData.customerName,
        date: dateStr,
        morning: formData.timeOfDay === "Morning" ? Number(formData.liters) : 0,
        evening: formData.timeOfDay === "Evening" ? Number(formData.liters) : 0,
      });
    }

    try {
      await setDoc(docRef, { startDate, endDate, entries: newData }, { merge: true });
      setWeekData(newData);
      setModalOpen(false);
      setFormData({ customerName: "", liters: "", timeOfDay: "Morning" });
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Milk Dairy Management</h1>
      <h2 className="text-lg font-semibold mb-4">Week: {currentWeek}</h2>

      {/* Add Entry Button */}
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setModalOpen(true)}
      >
        + Add Entry
      </button>
{/* 
      <button data-modal-target="crud-modal" data-modal-toggle="crud-modal" className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
        Toggle modal
        </button>

<div id="crud-modal" tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div className="relative p-4 w-full max-w-md max-h-full">
     
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Create New Product
                </h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
           
            <form className="p-4 md:p-5">
                <div className="grid gap-4 mb-4 grid-cols-2">
                    <div className="col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                        <input 
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type product name" required=""/>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Milk in Liters</label>
                        <input 
                         value={formData.liters}
                         onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                        type="number" name="price" id="price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="$2999" required=""/>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                        <select 
                        value={formData.timeOfDay}
                        onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                        id="category" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                            <option>Morning</option>
                            <option>Evening</option>
                        </select>
                    </div>
                </div>
                <button onClick={handleAddEntry} type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                    Add new product
                </button>
            </form>
        </div>
    </div>
</div>  */}

      {/* Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add Milk Entry</h2>

            <label className="block mb-2">Customer Name</label>
            <input
              type="text"
              className="w-full border p-2 rounded mb-4"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />

            <label className="block mb-2">Milk in Liters</label>
            <input
              type="number"
              className="w-full border p-2 rounded mb-4"
              value={formData.liters}
              onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
            />

            <label className="block mb-2">Time of Day</label>
            <select
              className="w-full border p-2 rounded mb-4"
              value={formData.timeOfDay}
              onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
            >
              <option>Morning</option>
              <option>Evening</option>
            </select>

            <div className="flex justify-end gap-2">
              <button className="bg-gray-400 px-4 py-2 rounded" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleAddEntry}>
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Customer Name</th>
            {[...Array(7)].map((_, index) => (
              <th key={index} colSpan={2} className="border border-gray-300 px-4 py-2">
                Day {index + 1}
              </th>
            ))}
          </tr>
          <tr className="bg-gray-100">
            <th></th>
            {[...Array(7)].map((_, index) => (
              <>
                <th key={`m${index}`} className="border border-gray-300 px-4 py-2">Morning</th>
                <th key={`e${index}`} className="border border-gray-300 px-4 py-2">Evening</th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {weekData.map((entry, index) => (
            <tr key={index} className="text-center">
              <td className="border border-gray-300 px-4 py-2">{entry.customerName}</td>
              {[...Array(7)].map((_, i) => {
                const dayDate = new Date();
                dayDate.setDate(dayDate.getDate() - dayDate.getDay() + i);
                const dateStr = dayDate.toISOString().split("T")[0];

                return (
                  <>
                    <td key={`m${i}`} className="border border-gray-300 px-4 py-2">
                      {entry.date === dateStr ? entry.morning : "-"}
                    </td>
                    <td key={`e${i}`} className="border border-gray-300 px-4 py-2">
                      {entry.date === dateStr ? entry.evening : "-"}
                    </td>
                  </>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
