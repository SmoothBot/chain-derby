FROM grafana/grafana:latest

# Switch to root to modify files
USER root

# Copy provisioning configuration
COPY grafana/provisioning/ /etc/grafana/provisioning/

# Copy dashboards
COPY grafana/dashboards/ /var/lib/grafana/dashboards/

# Copy entrypoint script
COPY --chmod=755 entrypoint.sh /entrypoint.sh

# Set environment variables
ENV GF_SECURITY_ADMIN_PASSWORD=riseup
ENV GF_USERS_ALLOW_SIGN_UP=false
ENV GF_SERVER_ROOT_URL=%(protocol)s://%(domain)s/

# Use custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Expose port
EXPOSE 3000