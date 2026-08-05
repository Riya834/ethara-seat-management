import React, { useEffect, useState } from 'react';
import { seatService } from '../services/api';
import FloorPlanVisualizer from '../components/seats/FloorPlanVisualizer';
import SeatModal from '../components/seats/SeatModal';

const SeatMapPage = () => {
  const [seats, setSeats] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeats();
  }, [selectedFloor]);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const res = await seatService.getSeats({ floor: selectedFloor, limit: 600 });
      if (res.success) {
        setSeats(res.data);
      }
    } catch (err) {
      console.error('Failed to load floor seats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <FloorPlanVisualizer
        seats={seats}
        selectedFloor={selectedFloor}
        onFloorChange={(flr) => setSelectedFloor(flr)}
        onSelectSeat={handleSeatClick}
      />

      <SeatModal
        seat={selectedSeat}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchSeats}
      />
    </div>
  );
};

export default SeatMapPage;
