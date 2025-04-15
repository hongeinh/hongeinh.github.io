---
layout: default
date: 2025-04-14
title: "Best practice  for server setup"
---


# 1. Log rotation for oraid service
Cosmovisor writes to journalctl by default. To check the log size `journalctl --disk-usage`. To edit journalctl settings, run `sudo vim /etc/systemd/journald.conf` and set the following limits:
```conf
SystemMaxUse=500M         # Max total space journal logs can use
SystemKeepFree=100M       # Leave this much space free on disk
SystemMaxFileSize=100M    # Max size per journal file
SystemMaxFiles=5          # Number of rotated files to keep
```  
Then, run `sudo systemctl restart systemd-journald` to apply the changes.

We can manually rotate the logs by running:
```bash
sudo journalctl --vacuum-time=7d     # keep only 7 days of logs
sudo journalctl --vacuum-size=500M   # keep only 500MB max
```

# 2. Node Monitoring
Add node monitoring to the current node to constantly checkk the node's health, as well as the attached volume.
# 2.1. Deploying a Node Metrics Exporter
1. Go to the [Node Exporter GitHub Releases](https://github.com/prometheus/node_exporter/releases) page and download the latest binary for your architecture.
```bash
wget https://github.com/prometheus/node_exporter/releases/download/v1.9.1/node_exporter-1.9.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.9.1.linux-amd64.tar.gz
sudo cp node_exporter-1.9.1.linux-amd64/node_exporter /usr/local/bin/
```  

2. Set up the node exporter service with systemd `/etc/systemd/system/node_exporter.service`:
```conf
[Unit]
Description=Prometheus Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=nobody
Group=nogroup
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=default.target
```
Then reload systemd, enable the service and start it:
```bash
sudo systemctl daemon-reload
sudo systemctl start node_exporter
sudo systemctl enable node_exporter
```

3. Visit metrics at `curl http://localhost:9100/metrics`

## 2.2. Deploying a Prometheus Server
1. Download the latest Prometheus release from the [Prometheus GitHub Releases](https://github.com/prometheus/prometheus/releases) page.
```bash
wget https://github.com/prometheus/prometheus/releases/download/v3.2.1/prometheus-3.2.1.linux-386.tar.gz
tar xvfz prometheus-3.2.1.linux-386.tar.gz
mv prometheus-3.2.1.linux-386/ prometheus_home
cd prometheus_home

```  
2. Edit the `prometheus.yml` file to add the node exporter as a target:
```conf
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']
```  
3. Start the Prometheus server: `./prometheus --config.file=prometheus.yml --web.listen-address=":9091"` use a different port because orai is already using port 9090.  ==> for testing purpose only. For production, create a systemd service.

4. Create a systemd service for Prometheus with `sudo vim /etc/systemd/system/prometheus.service`:
```bash
[Unit]
Description=Prometheus Monitoring
After=network.target

[Service]
User=nobody
ExecStart=/home/hongeinh/prometheus_home/prometheus \
  --config.file=/home/hongeinh/prometheus_home/prometheus.yml \
  --web.listen-address=:9091 \
  --storage.tsdb.path=/home/hongeinh/prometheus_home/data

Restart=on-failure

[Install]
WantedBy=multi-user.target
```

5. Reload systemd, enable the service and start it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus

# check logs and status
sudo systemctl status prometheus
journalctl -u prometheus -f

```
## 2.3. Deploying Grafana
1. Install Grafana:
```bash
sudo apt-get install -y apt-transport-https
sudo apt-get install -y software-properties-common wget
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get install grafana
```  
2. Start the Grafana service:
```bash
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
sudo systemctl status grafana-server
sudo ufw allow 3000
```

Open 26656 for p2p connection

# 3. Add swap memory
Swap space is like backup RAM on your disk. When your system runs out of physical RAM, it starts moving inactive memory pages (background processes, unused app data, etc.) to swap space so it can free up RAM for more active tasks.  
1. Check if you already have swap `swapon --show`. To see total swap space use `free -h`.
2. Add swap space:
```bash
# 1. Create a 2GB swap file
sudo fallocate -l 2G /swapfile
# 2. Secure it (only root should access)
sudo chmod 600 /swapfile
# 3. Format it as swap
sudo mkswap /swapfile
# 4. Enable the swap
sudo swapon /swapfile
# 5. Verify it's active
swapon --show
```  
3. Tune swap behavior:
```bash
# Show current value
cat /proc/sys/vm/swappiness
# Set to 10 (good for performance systems)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
# Apply it immediately
sudo sysctl -p
```
