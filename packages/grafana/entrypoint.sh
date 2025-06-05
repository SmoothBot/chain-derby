#!/bin/bash

echo "Starting Chain Derby Grafana..."
echo "DATABASE_HOST: ${DATABASE_HOST:-postgres}"
echo "DATABASE_PORT: ${DATABASE_PORT:-5432}"
echo "DATABASE_USER: ${DATABASE_USER:-postgres}"
echo "DATABASE_NAME: ${DATABASE_NAME:-chain_derby}"

# Check what files exist
echo "Checking datasource files:"
ls -la /etc/grafana/provisioning/datasources/

# Substitute environment variables in datasource config
if [ -f "/etc/grafana/provisioning/datasources/postgres.yml" ]; then
    echo "Found postgres.yml, applying substitutions..."
    sed -i "s/DATABASE_HOST_PLACEHOLDER/${DATABASE_HOST:-postgres}/g" /etc/grafana/provisioning/datasources/postgres.yml
    sed -i "s/DATABASE_PORT_PLACEHOLDER/${DATABASE_PORT:-5432}/g" /etc/grafana/provisioning/datasources/postgres.yml
    sed -i "s/DATABASE_USER_PLACEHOLDER/${DATABASE_USER:-postgres}/g" /etc/grafana/provisioning/datasources/postgres.yml
    sed -i "s/DATABASE_PASSWORD_PLACEHOLDER/${DATABASE_PASSWORD:-postgres}/g" /etc/grafana/provisioning/datasources/postgres.yml
    sed -i "s/DATABASE_NAME_PLACEHOLDER/${DATABASE_NAME:-chain_derby}/g" /etc/grafana/provisioning/datasources/postgres.yml
    sed -i "s/DATABASE_SSL_MODE_PLACEHOLDER/${DATABASE_SSL_MODE:-disable}/g" /etc/grafana/provisioning/datasources/postgres.yml
    
    echo "Substitutions complete. Final config:"
    cat /etc/grafana/provisioning/datasources/postgres.yml
else
    echo "ERROR: postgres.yml not found!"
fi

# Start Grafana
echo "Starting Grafana..."
exec /run.sh "$@"