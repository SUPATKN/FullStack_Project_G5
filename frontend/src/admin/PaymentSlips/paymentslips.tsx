import { Hexagon } from 'lucide-react';
import { useState } from 'react';
import { Image, Modal } from 'react-bootstrap';
import axios from "axios";

interface Slip {
  slip_id: number;
  user_id: number;
  order_id: number;
  amount: number;
  coins: number;
  status: string;
  slip_path: string;
  admin_note: string | null;
}

export default function PaymentSlips() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<Slip | null>(null);
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);

  const fetchSlips = async () => {
    try {
      const response = await axios.get<Slip[]>("/api/slips/get");
      setSlips(response.data);
    } catch (error) {
      console.error("Error fetching slips:", error);
    }
  };

  const handleApproveSlip = async (slip_id: number) => {
    try {
      await axios.post(`/api/slips/approve/${slip_id}`);
      await fetchSlips();
    } catch (error) {
      console.error("Error approving slip:", error);
    }
  };

  const handleRejectSlip = async (slip_id: number) => {
    try {
      await axios.post(`/api/slips/reject/${slip_id}`);
      await fetchSlips();
    } catch (error) {
      console.error("Error rejecting slip:", error);
    }
  };

  const handleShowSlip = (slip: Slip) => {
    setSelectedSlip(slip);
    setShowSlipModal(true);
  };

  const handleCloseSlipModal = () => setShowSlipModal(false);


  return (
    <div>
      <h4 className="flex items-center text-white text-2xl">
        <Hexagon className="text-white w-10 h-10 mr-2" />
        Payment Slips
      </h4>
      <div className="overflow-hidden rounded-lg border w-[1100px] shadow-md bg-white bg-opacity-10 border-black">
        <table className="table-auto mx-auto w-[1100px] h-full border-collapse border-black">
          <thead>
            <tr className="text-center">
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[157px]  whitespace-nowrap rounded-tl-lg">
                Slip ID
              </th>
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[157px] whitespace-nowrap ">
                User ID
              </th>
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[157px] whitespace-nowrap ">
                Amount
              </th>
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[157px] whitespace-nowrap ">
                Coins
              </th>
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[157px] whitespace-nowrap ">
                Status
              </th>
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[158px] whitespace-nowrap ">
                Slip Image
              </th>
              <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] w-[157px] whitespace-nowrap rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
              <tbody>
                {slips.map((slip) => (
                  <tr key={slip.slip_id} className="text-center">
                    <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[157px]  whitespace-nowrap rounded-tl-lg">
                      {slip.slip_id}
                    </td>
                    <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[157px]  whitespace-nowrap">
                      {slip.user_id}
                    </td>
                    <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[157px]  whitespace-nowrap">
                      {slip.amount}
                    </td>
                    <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[157px]  whitespace-nowrap">
                        {slip.coins}
                    </td>
                    <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[157px]  whitespace-nowrap">
                        {slip.status}
                    </td>
                    <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[158px]  whitespace-nowrap">
                      <Image
                          crossOrigin="anonymous"
                          src={`/api/slip/${slip.slip_path}`}
                          alt={`Slip ${slip.slip_id}`}
                          // thumbnail
                          width={100}
                          height={100}
                          onClick={() => handleShowSlip(slip)}
                          className="cursor-pointer"
                        />
                    </td>
                    <td className="border-black px-2 py-3 text-[16px] font-medium text-white w-[157px]  whitespace-nowrap rounded-tr-lg">
                      <button className="bg-[#ff8833] text-white w-[100px] h-[30px] rounded-md" onClick={() => handleApproveSlip(slip.slip_id)}>
                        Approve
                      </button>
                      <button className="bg-[#ff8833] text-white w-[100px] h-[30px] rounded-md" onClick={() => handleRejectSlip(slip.slip_id)}>
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
          <Modal.Header closeButton onClick={handleCloseSlipModal}>
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
    </div>
  );
}
