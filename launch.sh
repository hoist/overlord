fleetctl unload overlord-web@{1..3}.service && \
fleetctl destroy overlord-web@{1..3}.service && \
fleetctl destroy overlord-web@.service && \
fleetctl submit ./overlord-web\@.service && \
fleetctl start overlord-web@{1..3}.service
