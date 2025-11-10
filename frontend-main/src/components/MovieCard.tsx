import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MovieCardProps {
  title: string;
  image: string;
  rating?: number;
  genre?: string;
}

const MovieCard = ({ title, image, rating = 4.5, genre = 'Action' }: MovieCardProps) => {
  return (
    <Card className="glass-card overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="text-xs text-accent font-semibold">{genre}</span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span>{rating}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
