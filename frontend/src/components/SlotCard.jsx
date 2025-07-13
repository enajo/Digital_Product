import React from "react";
import { format } from "date-fns";
import api from "../services/api";

const SlotCard = ({ slot, userRole, onBook, isBooked }) => {
  const {
    id,
    date,
    start_time,
    end_time,
    language,
    status,
    clinic_id,
    clinic_name,
    doctor_name,
  } = slot;

  const handleBook = async () => {
    try {
      const response = await axios.post(`/patient/book/${id}`);
      if (onBook) onBook(response.data.booking);
    } catch (error) {
      alert(error?.response?.data?.error || "Booking failed.");
    }
  };

  const isAvailable = status === "open" && !isBooked;

  return (
    <div className="bg-white shadow-md rounded-xl p-4 mb-4 border hover:shadow-lg transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-blue-800">
            {format(new Date(date), "eeee, MMM d")}{" "}
            <span className="text-sm text-gray-500 ml-1">
              ({start_time} - {end_time})
            </span>
          </h3>
          <p className="text-sm text-gray-700 mt-1">
            Language: <strong>{language}</strong>
          </p>
          {clinic_name && (
            <p className="text-sm text-gray-600">
              Clinic: {clinic_name} {doctor_name && `| Dr. ${doctor_name}`}
            </p>
          )}
        </div>

        {userRole === "patient" && (
          <div className="mt-1">
            {isAvailable ? (
              <button
                onClick={handleBook}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded-md transition"
              >
                Book Now
              </button>
            ) : (
              <span className="text-red-500 text-sm font-medium">Booked</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotCard;
