import axios from "axios";
import { useEffect, useState } from "react";

interface User {
  name: string;
  id: number;
  username: string;
  email: string;
}

interface Withdrawhistory {
  history_id: number;
  user_id: number;
  price: number;
  coins: number;
  status: string;
  create_at: string;
}

export default function Orderhistory() {
  const [users, setUsers] = useState<User[]>([]);

  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState<Withdrawhistory[]>([]);
  const [showOrderHistoryModal, setShowOrderHistoryModal] =
    useState<boolean>(false);

  const handleShowOrderHistory = (user_id: number, username: string) => {
    setSelectedUserName(username);
    fetchOrderHistory(user_id);
  };

  const fetchOrderHistory = async (user_id: number) => {
    try {
      const response = await axios.get<Withdrawhistory[]>(
        "/api/withdraw/history",
        {
          params: { user_id },
        }
      );
      setOrderHistory(response.data);
      setShowOrderHistoryModal(true);
      console.log("user_id", user_id);
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>("/api/allusers");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h4 className=" flex items-center text-white text-2xl text-center font-light letter-spacing-0-7px mb-4">
        ◆ Withdraw History
      </h4>
      <div className="overflow-hidden  border shadow-md bg-white bg-opacity-10 border-black">
        <table className="table-auto mx-auto w-[1100px] border-collapse border-black">
          <thead>
            <tr className="text-center">
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-[#ff8833] w-[183px] whitespace-nowrap">
                ID
              </th>
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-[#ff8833] w-[183px] whitespace-nowrap ">
                Username
              </th>
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-[#ff8833] w-[183px] whitespace-nowrap">
                Email
              </th>
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-[#ff8833] w-[183px] whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="border-black px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-white w-[275px]  whitespace-nowrap rounded-tl-lg">
                  {user.id}
                </td>
                <td className="border-black px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-white w-[275px]  whitespace-nowrap">
                  {user.username}
                </td>
                <td className="border-black px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-white w-[275px]  whitespace-nowrap">
                  {user.email}
                </td>
                <td className="border-black px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-white w-[275px]  whitespace-nowrap rounded-tr-lg">
                  <button
                    className="p-2 px-3 bg-[#ff8833] text-white w-[fit-content] h-[fit-content] rounded-md hover:bg-orange-500"
                    onClick={() =>
                      handleShowOrderHistory(user.id, user.username)
                    }
                  >
                    View Orders
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showOrderHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-full">
          <div className="bg-white p-4 w-[700px] rounded-md shadow-md border max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-black text-[24px] font-normal ml-2">
                Withdraw History for{" "}
                <span style={{ color: "orange" }}>{selectedUserName}</span>
              </h2>
              <button
                onClick={() => setShowOrderHistoryModal(false)}
                className="p-2 px-3 bg-red-700 text-white rounded-md letter-spacing-0-7px"
              >
                Close
              </button>
            </div>
            <div className="overflow-hidden border shadow-md bg-white mt-4">
              <table className="table-auto mx-auto w-full h-full border-collapse">
                <thead>
                  <tr className="text-center">
                    <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px] whitespace-nowrap rounded-tl-[8px]">
                      Order ID
                    </th>
                    <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px] whitespace-nowrap">
                      Price
                    </th>
                    <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px] whitespace-nowrap">
                      Coins
                    </th>
                    <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px] whitespace-nowrap">
                      Status
                    </th>
                    <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px] whitespace-nowrap rounded-tr-[8px]">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.map((order) => (
                    <tr key={order.history_id} className="text-center">
                      <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px] whitespace-nowrap rounded-tl-lg">
                        {order.history_id}
                      </td>
                      <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px] whitespace-nowrap">
                        +{order.price}
                      </td>
                      <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px] whitespace-nowrap">
                        -{order.coins}
                      </td>
                      <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px] whitespace-nowrap">
                        {order.status}
                      </td>
                      <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px] whitespace-nowrap rounded-tr-lg">
                        {new Date(order.create_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
