---
layout: default
title: "Setup Oraichain Validator Node"
date: 2025-03-30
---

# Setup Oraichain Validator Node
## 1. Prerequisites
* OS: Ubuntu LTS >= 18.04
    * CPU: 4 cores
    * RAM: 8GB

## 2. Set up Cloud server
I choose Hetzner Cloud as my cloud service provider due to its low price and security. 
Go to https://www.hetzner.com/cloud and register an account.  
### 2.1. Register an account
Fill in the form and register an account. 
![Register a Hetzner account](../images/posts/oraichain-validator/hetzner-register-acc.png)

After setting up all information, you will receive an email from Hetzner to confirm your account. Remember to setup 2FA and save your recovery code in a secured place.  

### 2.2. Set up budget alert
Before spinning up a new server, I suggest creating a budget alert to make sure the cost doesn't exceed your budget.  
Go to Hetzner Cloud > Choose the Usage tab > You will see a tickbox under E-mail Warning. Check that and enter a reasonable amount for your budget..

![Budget alert](../images/posts/oraichain-validator/hetzner-budget-setup.png)

### 2.3. Add a server
1. Go to tab project > Under Default > Click Create Server.
2. Choose the server's configuration:
- Location
- Image: Ubuntu. I choose the latest LTS version 24.04.
- Type: Shared vCPU (because the workload is not constant and not heavy, this is a cost-efficient option). 
    - Architecture: x86 (Intel/AMD)
    - Name: CX22
    - CPU: 2 vCPU
    - RAM: 4GB
    - SSD: 40GB
    - Price/h: 0.002$/h
    - Price/month: 3.99$/month (Tax not included)
- Networking:
    - IPv4: Primary IP costs $0.001/h, regardless of being attached to a server or not.
- SSH key: Set up a SSH key to connect to the server. The file will be saved in "~/.ssh/" directory.
`ssh-keygen -t ed25519  -C "your_email@example.com"`
- Volume: 100GB SSD ($5/month)
- cloud-init:
```yml
#cloud-config
users:
  - name: hongeinh
    groups: users, admin
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    ssh_authorized_keys:
      - <public ssh key>

packages:
  - fail2ban
  - ufw
  - make
  - gcc
package_update: true
package_upgrade: true
runcmd:
  - printf "[sshd]\nenabled = true\nbanaction = iptables-multiport" > /etc/fail2ban/jail.local
  - systemctl enable fail2ban
  - ufw allow 2222
  - ufw enable
  - sed -i -e '/^\(#\|\)PermitRootLogin/s/^.*$/PermitRootLogin no/' /etc/ssh/sshd_config
  - sed -i -e '/^\(#\|\)PasswordAuthentication/s/^.*$/PasswordAuthentication no/' /etc/ssh/sshd_config
  - sed -i -e '/^\(#\|\)Port/s/^.*$/Port 2222/' /etc/ssh/sshd_config
  - sed -i -e '/^\(#\|\)KbdInteractiveAuthentication/s/^.*$/KbdInteractiveAuthentication no/' /etc/ssh/sshd_config
  - sed -i -e '/^\(#\|\)ChallengeResponseAuthentication/s/^.*$/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config
  - sed -i -e '/^\(#\|\)MaxAuthTries/s/^.*$/MaxAuthTries 2/' /etc/ssh/sshd_config
  - sed -i -e '/^\(#\|\)AllowTcpForwarding/s/^.*$/AllowTcpForwarding no/' /etc/ssh/sshd_config
  - sed -i -e '/^\(#\|\)X11Forwarding/s/^.*$/X11Forwarding no/' /etc/ssh/sshd_config
  - sed -i -e '/^\(#\|\)AllowAgentForwarding/s/^.*$/AllowAgentForwarding no/' /etc/ssh/sshd_config
  - sed -i -e '/^\(#\|\)AuthorizedKeysFile/s/^.*$/AuthorizedKeysFile .ssh\/authorized_keys/' /etc/ssh/sshd_config
  - sed -i '$a AllowUsers hongeinh' /etc/ssh/sshd_config
  - reboot
```

## 3. Install necessary packages
### 3.0. Login to the server
- `ssh hongeinh@<server ip>`. Add passphrase when prompted, if any. 
- Login as root user: `sudo su -`


### 3.1. Install Go 
Required version: >= 1.22.3

1. Download the latest Go release from https://golang.org/dl/ with Kind = Linux. Choose relevent chip architecture to your Ubuntu machine. For example, I will download this tarball: `go1.24.2.linux-amd64.tar.gz` 
or `wget https://go.dev/dl/go1.24.2.linux-amd64.tar.gz`


2. Extract the tarball and move it to `/usr/local`. This location is recommended as it is the default location for Go installations and will make version control easier. Use the following commands to extract the tarball and move it to `/usr/local`. Remember to change the file name in the below example to your downloaded file name:
```
sudo tar -C /usr/local -xzf go1.24.1.linux-386.tar.gz
rm go1.22.6.linux-amd64.tar.gz
```

3. Set up Go environment variables. Add the following lines to your `~/.bashrc` file:
```
export GOPATH="$HOME/go"
export GOROOT="/usr/local/go"
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
```

Then save the changes with `source ~/.bashrc`

### 3.2 Set up Oraid
1. Create orai_home
```
mkdir $HOME/orai_home
echo "export ORAI_HOME=$HOME/orai_home" >> $HOME/.bashrc
source $HOME/.bashrc
```

2. Clone the Orai repository and build
```
cd $ORAI_HOME
git clone https://github.com/oraichain/wasmd
cd wasmd
git switch --detach v0.50.9
make build
```
3. Confirm that the build was successful by running the following command: `oraid version`

### 3.3. Initialize the node
```
oraid init peinhguin_validator1 --home $ORAI_HOME/.oraid --chain-id Oraichain  
wget -O $ORAI_HOME/.oraid/config/genesis.json https://raw.githubusercontent.com/oraichain/oraichain-static-files/master/genesis.json
```

```

echo "# Cosmovisor Setup" >> ~/.bashrc
echo "export ORAI_HOME=/root" >> ~/.bashrc
echo "export DAEMON_NAME=oraid" >> ~/.bashrc
echo "export DAEMON_HOME=$ORAI_HOME/.oraid" >> ~/.bashrc
echo "export DAEMON_ALLOW_DOWNLOAD_BINARIES=false" >> ~/.bashrc
echo "export DAEMON_LOG_BUFFER_SIZE=512" >> ~/.bashrc
echo "export DAEMON_RESTART_AFTER_UPGRADE=true" >> ~/.bashrc
echo "export UNSAFE_SKIP_BACKUP=true" >> ~/.bashrc
source ~/.bashrc
```

3.5. Sync chain data
```
sudo apt install wget liblz4-tool aria2 -y
cd $ORAI_HOME/.oraid
wget -O oraichain_latest.tar.lz4 [SNAPSHOT_URL]
lz4 -c -d oraichain_latest.tar.lz4 | tar -x -C $ORAI_HOME/.oraid
```