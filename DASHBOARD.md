# 📊 Trading Pairs Dashboard

A beautiful, real-time web dashboard to visualize your trading pairs data from Binance and Kucoin.

## Features

✨ **Beautiful UI**
- Dark mode theme optimized for trading
- Responsive design (works on desktop, tablet, mobile)
- Smooth animations and transitions

📈 **Data Visualization**
- Interactive charts with Chart.js
- Cards view for favorite pairs
- Sortable tables with top 10 pairs
- Real-time price and volume data

🔄 **Auto Refresh**
- Automatically refresh every 30 seconds
- Toggle auto-refresh on/off
- Manual refresh button
- Last update timestamp

🎯 **Four View Modes**
- **Favorites**: Your configured favorite pairs
- **Top Gainers**: Top 50 price gainers
- **Top Losers**: Top 50 price losers
- **Most Active**: Top 50 by 24h volume

## Getting Started

### 1. Start the Dashboard Server

```bash
npm run dashboard
```

Or use both fetcher and dashboard:
```bash
npm run dev
```

### 2. Open in Browser

```
http://localhost:3000
```

## Dashboard Views

### Favorites Tab ⭐
Shows your configured favorite trading pairs from both exchanges side-by-side:
- Pair name and symbol
- Current price
- 24h price change %
- Color-coded gains (green) and losses (red)

### Top Gainers Tab 📈
Displays the top 50 price gainers:
- **Bar chart** showing top 10 gainers
- **Table** with top 10 pairs (name, price, change %)
- Separate sections for Binance and Kucoin
- Green color for positive changes

### Top Losers Tab 📉
Displays the top 50 price losers:
- **Bar chart** showing top 10 losers
- **Table** with top 10 pairs (name, price, change %)
- Separate sections for Binance and Kucoin
- Red color for negative changes

### Most Active Tab 🔥
Displays the top 50 most active pairs by volume:
- **Bar chart** showing top 10 by volume (in billions)
- **Table** with top 10 pairs (name, price, volume)
- Separate sections for Binance and Kucoin
- Blue color for volume visualization

## Features Explained

### Auto Refresh
- **Default**: ON (refreshes every 30 seconds)
- **Button**: Toggle auto-refresh on/off
- **Status**: Shows in header (green = ON, gray = OFF)
- Data updates: Syncs with your scheduled pair fetcher

### Manual Refresh
- Click **🔄 Refresh Now** button to manually fetch latest data
- Updates all tabs and charts instantly
- Shows loading state during fetch

### Exchange Comparison
- Side-by-side view of Binance and Kucoin data
- Same metrics for easy comparison
- Separate price and volume data per exchange

### Data Update Timestamp
- Shows exact time of last data refresh
- Updates on every refresh
- Based on server time

## API Endpoints

The dashboard uses these REST APIs:

```
GET /api/pairs
  Returns all data (favorites, gainers, losers, active)
  Response: JSON with all four categories

GET /api/pairs/:category/:exchange
  Returns specific category for specific exchange
  Parameters:
    - category: favorites, gainers, losers, active
    - exchange: binance, kucoin
  Response: JSON with pairs array
```

Example:
```bash
# Get Binance top gainers
curl http://localhost:3000/api/pairs/gainers/binance

# Get all data
curl http://localhost:3000/api/pairs
```

## Customization

### Change Refresh Interval

Edit `public/app.js` line:
```javascript
const AUTO_REFRESH_INTERVAL = 30000; // milliseconds
```

### Change Port

Edit `.env`:
```env
PORT=3000
```

Or set environment variable:
```bash
set PORT=8080
npm run dashboard
```

### Customize Colors

Edit `public/style.css` root variables:
```css
:root {
    --primary-color: #1e40af;    /* Blue */
    --success-color: #10b981;    /* Green */
    --danger-color: #ef4444;     /* Red */
    --green: #22c55e;            /* Gain color */
    --red: #ef4444;              /* Loss color */
}
```

### Customize Chart Data

Edit `public/app.js` functions:
```javascript
// Show top 20 instead of top 10
topPairs.slice(0, 20)

// Change chart type
type: 'line'  // instead of 'bar'
```

## Troubleshooting

### Dashboard shows "No data available"
- Ensure the pairs fetcher has run at least once
- Check that data files exist in `results/` folder
- Verify file timestamps are recent

### Charts not displaying
- Open browser console (F12) to check for errors
- Ensure Chart.js CDN is accessible
- Try refreshing the page (Ctrl+R)

### Auto-refresh not working
- Click "Auto Refresh: ON" button to restart it
- Check browser console for network errors
- Verify API endpoint returns data: `http://localhost:3000/api/pairs`

### Slow performance
- Reduce refresh interval (currently 30s)
- Close other browser tabs
- Check system resources

### Port already in use
- Change PORT in `.env`
- Or find process using port 3000:
  ```bash
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

## Usage Tips

### Monitor Trading Activity
- Keep dashboard open while trading
- Watch "Most Active" tab for trading opportunities
- Compare gainers across exchanges

### Set Up on Second Monitor
- Great for having trading data visible while working
- Lightweight and responsive
- Auto-refreshes without interaction

### Export Data
- Right-click tables and export to CSV
- Use browser DevTools to inspect network responses
- API returns JSON for integration with other tools

### Schedule Dashboard
Keep the dashboard running 24/7:

**Windows**
1. Create batch file `dashboard.bat`:
   ```batch
   @echo off
   cd C:\Users\Chaiy\op-server\grap-pairs
   npm run dashboard
   pause
   ```
2. Schedule it in Task Scheduler to run at startup

**Linux/Mac**
```bash
nohup npm run dashboard > dashboard.log 2>&1 &
```

## File Structure

```
public/
├── index.html      # Dashboard HTML
├── style.css       # Dashboard styling
├── app.js          # Dashboard logic & charts
server.js          # Express API server
.env               # Configuration (includes PORT)
```

## Performance Notes

- **Data refresh**: 30 seconds (configurable)
- **Chart rendering**: Uses Chart.js (lightweight)
- **File size**: ~50KB (HTML + CSS + JS)
- **Memory usage**: ~30-50MB (Node.js + browser)
- **CPU**: Minimal when idle

## Future Enhancements

Potential improvements:
- [ ] Historical data tracking and charts
- [ ] Pair favorites management in UI
- [ ] Price alerts and notifications
- [ ] Export to CSV/JSON
- [ ] Dark/Light mode toggle
- [ ] Real-time WebSocket updates
- [ ] Portfolio tracking
- [ ] Trading signals

## Support

For issues:
1. Check browser console (F12)
2. Verify data files in folders
3. Restart the server
4. Check `.env` configuration
