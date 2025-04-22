---
layout: default
date: 2025-04-14
title: "Best practice for validator monitoring"
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
On the node that is running oraid, install node exporter

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
0. Create a new server to install Prometheus and monitor the validator node.

On the validator node, add firewall rules to allow Prometheus to scrape the node exporter:
```bash
sudo ufw allow from 65.109.164.94 to any port 9100
sudo ufw reload
```

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
      - targets: ['<validator-node>:9100']
```  

3. Create a systemd service for Prometheus with `sudo vim /etc/systemd/system/prometheus.service`:
```bash
[Unit]
Description=Prometheus Monitoring
After=network.target

[Service]
User=hongeinh
Group=hongeinh
ExecStart=/home/hongeinh/prometheus_home/prometheus \
  --config.file=/home/hongeinh/prometheus_home/prometheus.yml \
  --storage.tsdb.path=/home/hongeinh/prometheus_home/data

Restart=on-failure

[Install]
WantedBy=multi-user.target
```

4. Reload systemd, enable the service and start it:
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

3. Access Grafana at `http://<server_ip>:3000` with username `admin` and password `admin`.

4. Create a Prometheus data source:
- On the left panel, go to `Connections` > `Data Sources` > `Add data source` > `Prometheus` > `Save & Test`.

5. Create a dashboard: On the left bar,  click  `Dashboard` > `New` > `Import` > 1860 and  import the dashboard.

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

# 4. Add validator watcher on the monitoring node
1. Edit the .oraid config file:
```toml
#######################################################
###       RPC Server Configuration Options          ###
#######################################################
[rpc]

# TCP or UNIX socket address for the RPC server to listen on
laddr = "tcp://0.0.0.0:26657" # this was changed from 127.0.0.1:26657 to 0.0.0.0:26657

# A list of origins a cross-domain request can be executed from
# Default value '[]' disables cors support
# Use '["*"]' to allow any origin
cors_allowed_origins = [<monitoring node ip>] # this was changed from []
```  

Add firewall rules to allow the monitoring node to access the validator node:
```bash
sudo ufw allow from 65.109.164.94 to any port 26657
sudo ufw deny 26657
sudo ufw reload
```  

2. Install the watcher on the monitoring node:
```bash
git clone https://github.com/kilnfi/cosmos-validator-watcher.git
cd cosmos-validator-watcher

./cosmos-validator-watcher \
  --node http://<validator IP>:26657 \
  --validator <validator-address>:<alias>

sudo ufw allow from 65.109.164.94 to any port 26657
sudo ufw reload
```
3. Create a systemd service for cosmos-validator-watcher with `sudo vim /etc/systemd/system/validator-watcher.service`:
```bash
[Unit]
Description=cosmos-validator-watcher Monitoring

[Service]
User=hongeinh
Group=hongeinh
ExecStart=/home/hongeinh/watcher/cosmos-validator-watcher \
  --node http://<validator IP>>:26657 \
  --validator <validator-address>:<alias>

Restart=on-failure

[Install]
WantedBy=multi-user.target
```

3. Reload systemd, enable the service and start it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable validator-watcher
sudo systemctl start validator-watcher

# check logs and status
sudo systemctl status validator-watcher
journalctl -u hongeinh -f
``` 


4. On the monitoring node, add the endpoint `<validator-node>:8080/metrics` to the `prometheus.yml` file to scrape the validator watcher:


# 5. Investigate the validator node high RAM usage
1. Check the RAM usage with `htop` command, sort by `%MEM`
2. Identify the process using the most resources:
```bash
ps -eo pid,ppid,%mem,%cpu,cmd --sort=-%mem | head -n 10
```

3. Free disk space:
```bash
sudo du -h /var/log | sort -rh | head -n 10
sudo truncate -s 0 /var/log/syslog
sudo truncate -s 0 /var/log/kern.log  # If large
sudo rm -f /var/log/*.gz /var/log/*.1
sudo apt clean
sudo rm -rf /tmp/*
```

4. Edit maximum inbound and outbound peer connections by edit `$ORAI_HOME/.oraid/config/config.toml`
```toml
max_num_inbound_peers = 10
max_num_outbound_peers = 20
```"

