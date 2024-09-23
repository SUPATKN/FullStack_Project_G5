import axios from 'axios';
import { Hexagon } from 'lucide-react'
import { useEffect, useState } from 'react';

interface User {
  name: string;
  id: number;
  username: string;
  email: string;
}

interface Transactions {
  user_id: number;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}


export default function Transactionhistory() {
  const [users, setUsers] = useState<User[]>([]);
  // const [error, setError] = useState<string | null>(null);
  const [showTransactionsModal, setShowTransactionsModal] = useState<boolean>(false);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [Transactions, setTransactions] = useState<Transactions[]>([]);

  const handleShowTransactions = (user_id: number, username: string) => {
    setSelectedUserName(username);
    fetchTransactions(user_id);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>("/api/allusers");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      // setError("Failed to fetch users.");
    }
  };

  const fetchTransactions = async (user_id: number) => {
    try {
      const response = await axios.get<Transactions[]>("/api/transactions", {
        params: { user_id },
      });
      console.log("Fetching transactions for user_id:", user_id);

      setTransactions(response.data);
      setShowTransactionsModal(true);
    } catch (error) {
      console.error("Error fetching transactions history:", error);
      // setError("Failed to fetch transactions history.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <div>
      <h4 className="flex items-center text-white text-2xl">
              <Hexagon className="text-white w-10 h-10 mr-2" />
              Transactions History
            </h4>
            <div className="overflow-hidden rounded-lg border shadow-md bg-white bg-opacity-10 border-black">
              <table className="table-auto mx-auto w-[1100px] border-collapse border-black">
                <thead>
                  <tr className="text-center">
                    <th className="border-2 border-[#ff8833] px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[275px]  whitespace-nowrap rounded-tl-[8px]">
                      ID
                    </th>
                    <th className="border-2 border-[#ff8833] px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[275px] whitespace-nowrap ">
                      Username
                    </th>
                    <th className="border-2 border-[#ff8833] px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[275px] whitespace-nowrap ">
                      Email
                    </th>
                    <th className="border-2 border-[#ff8833] px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[275px] whitespace-nowrap rounded-tr-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="text-center">
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[275px]  whitespace-nowrap rounded-tl-lg">
                        {user.id}
                      </td>
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[275px]  whitespace-nowrap">
                        {user.username}
                      </td>
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[275px]  whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[275px]  whitespace-nowrap rounded-tr-lg">
                        <button
                          className="bg-[#ff8833] text-white w-[200px] h-[30px] rounded-md"
                          onClick={() =>
                            handleShowTransactions(user.id, user.username)
                          }
                        >
                          View Transactions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Transactions Modal */}
            {showTransactionsModal && (
              <div className="fixed inset-0 bg-black h-full bg-opacity-50 flex items-center justify-center z-50 ">
                <div className="bg-white p-5 w-[700px] rounded-md shadow-md border max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h2 className="text-black text-[24px] font-medium ml-5">
                      Transactions History for{" "}
                      <span style={{ color: "green" }}>{selectedUserName}</span>
                    </h2>
                    <button
                      onClick={() => setShowTransactionsModal(false)}
                      className="p-2 bg-red-700 text-white rounded-md"
                    >
                      Close
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-lg border shadow-md bg-white mt-4">
                    <table className="table-auto mx-auto w-[600px] border-collapse">
                      <thead>
                        <tr className="text-center">
                          <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px]  whitespace-nowrap rounded-tl-[8px]">
                            USER ID
                          </th>
                          <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px]  whitespace-nowrap">
                            Price
                          </th>
                          <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px]  whitespace-nowrap">
                            Type
                          </th>
                          <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px]  whitespace-nowrap">
                            Descriptions
                          </th>
                          <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px]  whitespace-nowrap rounded-tr-[8px]">
                            Created At
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Transactions.map((trans) => (
                          <tr key={trans.user_id} className="text-center">
                            <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px]  whitespace-nowrap rounded-tl-lg">
                              {trans.user_id}
                            </td>
                            <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px]  whitespace-nowrap">
                              {trans.amount}
                            </td>
                            <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px]  whitespace-nowrap">
                              {trans.transaction_type}
                            </td>
                            <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px]  whitespace-nowrap">
                              {trans.description}
                            </td>
                            <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px]  whitespace-nowrap rounded-tr-lg">
                              {new Date(trans.created_at).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit"
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
  )
}
