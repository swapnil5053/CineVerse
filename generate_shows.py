#!/usr/bin/env python3
import mysql.connector
from datetime import datetime, timedelta
import random

# Database connection
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='swapnil7',
    database='theatre_db'
)
cursor = conn.cursor()

# Get existing data
cursor.execute("SELECT screen_id, capacity FROM screen")
screens = cursor.fetchall()

cursor.execute("SELECT movie_id FROM movie")
movies = [row[0] for row in cursor.fetchall()]

# Time slots for shows
time_slots = ['10:00:00', '13:30:00', '17:00:00', '20:30:00']
price_types = ['standard', 'premium', 'vip']
base_prices = {'standard': 220, 'premium': 300, 'vip': 400}

# Generate shows from Nov 15, 2025 to May 31, 2026
start_date = datetime(2025, 11, 15)
end_date = datetime(2026, 5, 31)

current_date = start_date
shows_added = 0

print("Generating shows...")

while current_date <= end_date:
    date_str = current_date.strftime('%Y-%m-%d')
    
    # Add 2-4 shows per screen per day
    for screen_id, capacity in screens:
        num_shows = random.randint(2, 4)
        selected_times = random.sample(time_slots, num_shows)
        
        for time_slot in selected_times:
            movie_id = random.choice(movies)
            price_type = random.choice(price_types)
            base_price = base_prices[price_type] + random.randint(-20, 50)
            
            try:
                cursor.execute("""
                    INSERT INTO showtime (screen_id, movie_id, show_date, show_time, price_type, base_price, available_seats)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (screen_id, movie_id, date_str, time_slot, price_type, base_price, capacity))
                shows_added += 1
            except mysql.connector.IntegrityError:
                # Skip if show already exists for this screen/date/time
                pass
    
    current_date += timedelta(days=1)
    
    if shows_added % 100 == 0:
        print(f"Added {shows_added} shows...")
        conn.commit()

conn.commit()
print(f"\nTotal shows added: {shows_added}")

# Verify
cursor.execute("SELECT COUNT(*) FROM showtime")
total = cursor.fetchone()[0]
print(f"Total shows in database: {total}")

cursor.execute("SELECT MIN(show_date), MAX(show_date) FROM showtime")
date_range = cursor.fetchone()
print(f"Date range: {date_range[0]} to {date_range[1]}")

cursor.close()
conn.close()
print("Done!")
