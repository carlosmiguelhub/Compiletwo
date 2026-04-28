FROM eclipse-temurin:21-jdk-jammy

RUN apt-get update -o Acquire::Retries=5 -o Acquire::ForceIPv4=true && \
    apt-get install -y --no-install-recommends \
    xvfb \
    x11vnc \
    novnc \
    websockify \
    procps \
    net-tools \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY run-gui.sh /app/run-gui.sh
RUN chmod +x /app/run-gui.sh

EXPOSE 6080

CMD ["/app/run-gui.sh"]