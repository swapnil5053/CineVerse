import { Calendar, Clock, MapPin, IndianRupee, Users, Star } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Show } from '@/services/api';

interface ShowCardProps extends Show {
  onBook: () => void;
}

const ShowCard = ({ 
  movie_title, 
  theatre_name, 
  city,
  screen_name, 
  screen_type,
  show_date, 
  show_time, 
  base_price, 
  available_seats,
  genre,
  language,
  rating,
  price_type,
  onBook 
}: ShowCardProps) => {
  return (
    <Card className="glass-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 animate-fade-in">
      <CardContent className="pt-6 space-y-3">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-primary">{movie_title}</h3>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-primary/20 px-2 py-1 rounded text-primary">{genre}</span>
            <span className="bg-accent/20 px-2 py-1 rounded text-accent">{language}</span>
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm">{rating}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-accent" />
            <span>{theatre_name}, {city}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-accent" />
            <span>{screen_name} ({screen_type})</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-accent" />
            <span>{show_date} at {show_time}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 font-semibold text-lg">
              <IndianRupee className="h-5 w-5 text-primary" />
              <span>{base_price}</span>
              <span className="text-xs text-muted-foreground ml-1">({price_type})</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">{available_seats} seats left</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pb-6 px-6">
        <Button 
          onClick={onBook}
          disabled={available_seats === 0}
          className={`w-full transition-all duration-300 ${
            available_seats === 0 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90 glow-primary'
          }`}
        >
          {available_seats === 0 ? 'Sold Out' : 'Book Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShowCard;
