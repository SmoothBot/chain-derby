# 📊 Chain Derby Grafana Setup

This directory contains a containerized Grafana setup specifically configured for Chain Derby analytics with pre-provisioned dashboards and datasources.

## 🏗️ Architecture

### Dockerfile-based Configuration
- **Base Image**: `grafana/grafana:10.2.3`
- **Auto-provisioned datasource**: PostgreSQL connection
- **Pre-built dashboards**: Chain Derby analytics dashboards
- **Environment substitution**: Dynamic configuration based on environment variables

### Directory Structure
```
packages/grafana/
├── Dockerfile                           # Grafana container definition
├── entrypoint.sh                       # Custom entrypoint for env substitution
├── provisioning/
│   ├── datasources/
│   │   └── postgres.yaml               # PostgreSQL datasource config
│   └── dashboards/
│       └── dashboards.yaml             # Dashboard provider config
└── dashboards/
    └── chain_derby_overview.json       # Main analytics dashboard
```

## 🚀 Usage

### Build and Run Standalone
```bash
cd packages/grafana

# Build the image
docker build -t chain-derby-grafana .

# Run with environment variables
docker run -p 3002:3000 \
  -e DATABASE_HOST=postgres \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=postgres \
  -e DATABASE_NAME=chain_derby \
  chain-derby-grafana
```

### Integration with Docker Compose
Update your `docker-compose.yml` to use the custom Grafana:

```yaml
grafana:
  build:
    context: ./packages/grafana
    dockerfile: Dockerfile
  container_name: chain_derby_grafana
  restart: unless-stopped
  environment:
    DATABASE_HOST: postgres
    DATABASE_PORT: 5432
    DATABASE_USER: postgres
    DATABASE_PASSWORD: postgres
    DATABASE_NAME: chain_derby
    DATABASE_SSL_MODE: disable
  ports:
    - "3002:3000"
  depends_on:
    - postgres
  networks:
    - chain_derby_network
```

## 📈 Dashboard

### Chain Derby Overview (`chain_derby_overview.json`)
**Main analytics dashboard with:**
- **Key Metrics**: Races, average latency, countries, transactions (7d)
- **Chain Usage Pie Chart**: Distribution of races across blockchains
- **Latency Timeline**: Performance trends over time
- **Performance Leaderboard**: Chain comparison with win rates
- **Geographic Analysis**: Top locations by race volume

## 🔧 Configuration

### Environment Variables
The entrypoint script substitutes these placeholders:
- `DATABASE_HOST_PLACEHOLDER` → `DATABASE_HOST` (default: postgres)
- `DATABASE_PORT_PLACEHOLDER` → `DATABASE_PORT` (default: 5432)
- `DATABASE_USER_PLACEHOLDER` → `DATABASE_USER` (default: postgres)
- `DATABASE_PASSWORD_PLACEHOLDER` → `DATABASE_PASSWORD` (default: postgres)
- `DATABASE_NAME_PLACEHOLDER` → `DATABASE_NAME` (default: chain_derby)
- `DATABASE_SSL_MODE_PLACEHOLDER` → `DATABASE_SSL_MODE` (default: disable)

### Datasource Configuration
- **UID**: `CHAIN_DERBY_POSTGRES` (used by all dashboards)
- **Type**: PostgreSQL
- **Connection**: Configured via environment variables
- **Features**: Auto-provisioned, read-only, default datasource

### Dashboard Features
- **Auto-refresh**: 30-second intervals
- **Time ranges**: Optimized for 7-day analysis
- **Dark theme**: Consistent with Chain Derby UI
- **Responsive**: Works on desktop and mobile

## 🛠️ Development

### Adding New Dashboards
1. Create dashboard in Grafana UI
2. Export as JSON
3. Replace datasource UIDs with `CHAIN_DERBY_POSTGRES`
4. Save to `dashboards/` directory
5. Rebuild container

### Modifying Queries
All queries use:
- **Datasource UID**: `CHAIN_DERBY_POSTGRES`
- **Time macros**: `$__timeFrom()`, `$__timeTo()` for compatibility
- **Chain Derby schema**: `race_sessions`, `chain_results`, `transaction_details`

### Custom Plugins
Currently includes:
- `grafana-piechart-panel`
- `grafana-worldmap-panel` 
- `grafana-clock-panel`

Add more in Dockerfile: `ENV GF_INSTALL_PLUGINS=plugin1,plugin2,plugin3`

## 🎯 Key Features

### Auto-Configuration
- ✅ Datasource automatically configured on startup
- ✅ Dashboards pre-loaded and ready to use
- ✅ Environment-based configuration
- ✅ No manual setup required

### Production Ready
- ✅ Pinned base image version
- ✅ Non-root user execution
- ✅ Health checks compatible
- ✅ Volume persistence support

### Chain Derby Optimized
- ✅ Schema-aware queries
- ✅ Performance-focused visualizations
- ✅ Geographic analysis capabilities
- ✅ Real-time race monitoring

## 🔍 Sample Queries

### Top Performing Chains
```sql
SELECT 
  chain_name,
  COUNT(*) as total_races,
  AVG(average_latency) as avg_latency,
  COUNT(CASE WHEN position = 1 THEN 1 END) as wins
FROM chain_results 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY chain_name
ORDER BY avg_latency ASC;
```

### Geographic Performance
```sql
SELECT 
  country,
  city,
  COUNT(*) as races,
  AVG(average_latency) as avg_latency
FROM race_sessions rs
JOIN chain_results cr ON rs.session_id = cr.session_id
WHERE rs.created_at >= NOW() - INTERVAL '7 days'
GROUP BY country, city
ORDER BY races DESC;
```


## 📊 Access

Once running:
- **URL**: http://localhost:3002
- **Username**: admin
- **Password**: riseup
- **Dashboard**: "Chain Derby - Overview Dashboard" in "Chain Derby" folder

Perfect for monitoring Chain Derby performance and gaining insights into blockchain racing across different networks! 🚀
