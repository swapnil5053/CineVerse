import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Seat {
  id: string;
  row: string;
  number: number;
  isBooked: boolean;
  isSelected: boolean;
  type: 'standard' | 'premium' | 'vip';
}

interface SeatMapProps {
  totalSeats: number;
  bookedSeats: string[];
  onSeatSelect: (selectedSeats: string[]) => void;
  maxSeats?: number;
}

const SeatMap = ({ totalSeats, bookedSeats, onSeatSelect, maxSeats = 10 }: SeatMapProps) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Generate realistic cinema seating layout
  useEffect(() => {
    const generateSeats = () => {
      const seatLayout: Seat[] = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      let seatCount = 0;
      
      for (let rowIndex = 0; rowIndex < rows.length && seatCount < totalSeats; rowIndex++) {
        const row = rows[rowIndex];
        let seatsInRow = 12; // Standard 12 seats per row
        
        // Standard rows (front rows) - closest to screen, affordable
        if (rowIndex < 3) {
          seatsInRow = 14;
        }
        // Premium rows (middle rows) - best viewing/sound
        else if (rowIndex < 7) {
          seatsInRow = 12;
        }
        // VIP/Recliner rows (back rows) - highest price, most comfortable
        else {
          seatsInRow = 8;
        }
        
        for (let seatNum = 1; seatNum <= seatsInRow && seatCount < totalSeats; seatNum++) {
          const seatId = `${row}${seatNum}`;
          const seatType = rowIndex < 3 ? 'standard' : rowIndex < 7 ? 'premium' : 'vip';
          
          seatLayout.push({
            id: seatId,
            row,
            number: seatNum,
            isBooked: bookedSeats.includes(seatId),
            isSelected: false,
            type: seatType
          });
          seatCount++;
        }
      }
      
      return seatLayout;
    };

    setSeats(generateSeats());
  }, [totalSeats, bookedSeats]);

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.isBooked) return;

    setSeats(prevSeats => {
      const newSeats = prevSeats.map(s => {
        if (s.id === seatId) {
          return { ...s, isSelected: !s.isSelected };
        }
        return s;
      });

      const newSelectedSeats = newSeats
        .filter(s => s.isSelected)
        .map(s => s.id);

      // Limit selection to maxSeats
      if (newSelectedSeats.length > maxSeats) {
        return prevSeats; // Don't allow more than maxSeats
      }

      setSelectedSeats(newSelectedSeats);
      onSeatSelect(newSelectedSeats);
      return newSeats;
    });
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.isBooked) {
      return 'bg-red-500/20 border-red-500 text-red-400 cursor-not-allowed';
    }
    if (seat.isSelected) {
      return 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/50 scale-105';
    }
    
    switch (seat.type) {
      case 'standard':
        return 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 hover:scale-105';
      case 'premium':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105';
      case 'vip':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 hover:scale-105';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20 hover:border-gray-500/50 hover:scale-105';
    }
  };

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="flex justify-center mb-8">
        <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-lg shadow-primary/50">
          <div className="text-center mt-4 text-sm text-muted-foreground">SCREEN</div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="space-y-3 max-w-4xl mx-auto">
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <div key={row} className="flex items-center justify-center gap-2">
            {/* Row Label */}
            <div className="w-8 text-center font-bold text-primary">
              {row}
            </div>
            
            {/* Left Section */}
            <div className="flex gap-1">
              {rowSeats.slice(0, Math.ceil(rowSeats.length / 2)).map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id)}
                  disabled={seat.isBooked}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 text-xs font-medium transition-all duration-200 flex items-center justify-center',
                    getSeatColor(seat)
                  )}
                  title={`${seat.id} - ${seat.type.toUpperCase()}${seat.isBooked ? ' (Booked)' : ''}`}
                >
                  {seat.number}
                </button>
              ))}
            </div>

            {/* Aisle */}
            <div className="w-8"></div>

            {/* Right Section */}
            <div className="flex gap-1">
              {rowSeats.slice(Math.ceil(rowSeats.length / 2)).map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id)}
                  disabled={seat.isBooked}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 text-xs font-medium transition-all duration-200 flex items-center justify-center',
                    getSeatColor(seat)
                  )}
                  title={`${seat.id} - ${seat.type.toUpperCase()}${seat.isBooked ? ' (Booked)' : ''}`}
                >
                  {seat.number}
                </button>
              ))}
            </div>

            {/* Row Label (Right) */}
            <div className="w-8 text-center font-bold text-primary">
              {row}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-green-500/10 border-green-500/30"></div>
          <span className="text-muted-foreground">Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-blue-500/10 border-blue-500/30"></div>
          <span className="text-muted-foreground">Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-purple-500/10 border-purple-500/30"></div>
          <span className="text-muted-foreground">VIP Recliner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-red-500/20 border-red-500"></div>
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-primary border-primary"></div>
          <span className="text-muted-foreground">Selected</span>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-primary font-medium">
            Selected Seats: {selectedSeats.join(', ')} ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
          </p>
          {selectedSeats.length >= maxSeats && (
            <p className="text-sm text-muted-foreground mt-1">
              Maximum {maxSeats} seats can be selected
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SeatMap;