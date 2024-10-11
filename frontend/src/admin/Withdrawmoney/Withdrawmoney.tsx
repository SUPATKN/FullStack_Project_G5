// import { Hexagon } from "lucide-react";
import { useEffect, useState } from "react";
import { Image, Modal } from "react-bootstrap";
import axios from "axios";

interface WithdrawSlips {
  slip_id: number;
  user_id: number;
  username: string; // เพิ่ม username
  withdraw_id: number;
  amount: number;
  coins: number;
  status: string;
  slip_path: string;
  admin_note: string | null;
}

export default function WithdrawMoney() {
  const [slips, setSlips] = useState<WithdrawSlips[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<WithdrawSlips | null>(null);
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlips = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const response = await axios.get<WithdrawSlips[]>(
        "/api/wirhdrawslips/get"
      );
      setSlips(response.data);
      console.log("object", response);
    } catch (error) {
      console.error("Error fetching slips:", error);
      setError("Failed to fetch slips.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSlip = async (slip_id: number) => {
    try {
      console.log("Approving slip with ID:", slip_id);
      const response = await axios.post(
        `/api/withdrawslips/approve/${slip_id}`
      );
      console.log("Approve response:", response.data); // Log response for debugging
      await fetchSlips(); // Re-fetch slips after operation
    } catch (error) {
      console.error("Error approving slip:", error);
      setError("Failed to approve slip.");
    }
  };

  const handleRejectSlip = async (slip_id: number) => {
    try {
      await axios.post(`/api/withdrawslips/reject/${slip_id}`);
      await fetchSlips(); // Re-fetch slips after operation
    } catch (error) {
      console.error("Error rejecting slip:", error);
      setError("Failed to reject slip.");
    }
  };

  const handleShowSlip = (slip: WithdrawSlips) => {
    setSelectedSlip(slip);
    setShowSlipModal(true);
  };

  const handleCloseSlipModal = () => setShowSlipModal(false);

  useEffect(() => {
    fetchSlips();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <h4 className="flex items-center text-white text-2xl text-center font-light letter-spacing-0-7px mb-4">
            ◆ Withdraw Money
          </h4>

          <div className="overflow-hidden w-[1100px] shadow-md bg-white bg-opacity-10 border-black">
            <table className="table-auto mx-auto w-[1100px] h-full ">
              <thead>
                <tr className="text-center">
                  <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-[#ff8833] w-[183px] whitespace-nowrap">
                    Slip ID
                  </th>
                  <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-[#ff8833] w-[183px] whitespace-nowrap">
                    Amount
                  </th>
                  <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-[#ff8833] w-[183px] whitespace-nowrap">
                    Coins
                  </th>
                  <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-[#ff8833] w-[183px] whitespace-nowrap">
                    Status
                  </th>
                  <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-[#ff8833] w-[185px] whitespace-nowrap">
                    Slip Image
                  </th>
                  <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-[#ff8833] w-[183px] whitespace-nowrap rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {slips.map((slip) => (
                  <tr key={slip.slip_id} className="text-center">
                    <td className="border-black px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-white w-[183px] whitespace-nowrap rounded-tl-lg">
                      {slip.slip_id}
                    </td>
                    <td className="border-black px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-white w-[183px] whitespace-nowrap">
                      {slip.amount}
                    </td>
                    <td className="border-black px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-white w-[183px] whitespace-nowrap">
                      {slip.coins}
                    </td>
                    <td className="border-black px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-white w-[183px] whitespace-nowrap">
                      {slip.status}
                    </td>
                    <td className="border-black px-2 py-3 text-[16px] font-normal letter-spacing-0-7px text-white w-[185px] flex items-center justify-center whitespace-nowrap">
                      <Image
                        crossOrigin="anonymous"
                        src={`/api/slip/${slip.slip_path}`}
                        alt={`Slip ${slip.slip_id}`}
                        width={100}
                        onClick={() => handleShowSlip(slip)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className=" border-black px-2 py-3 text-[16px] font-medium text-white w-[183px] gap-2 whitespace-nowrap rounded-tr-lg">
                      <button
                        className="p-2 bg-[#ff8833] hover:bg-orange-500 text-white w-[fit-content] h-[fit-content] rounded-md"
                        onClick={() => handleApproveSlip(slip.slip_id)}
                      >
                        Approve
                      </button>
                      <button
                        className="p-2 bg-red-600 ml-2 hover:bg-red-700 text-white w-[fit-content] h-[fit-content] rounded-md"
                        onClick={() => handleRejectSlip(slip.slip_id)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedSlip && (
            <Modal show={showSlipModal} onHide={handleCloseSlipModal}>
              <Modal.Header closeButton>
                <Modal.Title>Slip {selectedSlip.slip_id}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Image
                  crossOrigin="anonymous"
                  src={`/api/slip/${selectedSlip.slip_path}`}
                  alt={`Slip ${selectedSlip.slip_id}`}
                  fluid
                />
              </Modal.Body>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
