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
- SSH key: (Pending, not set up yet)
- Volume: 100GB SSD ($5/month)



## 3. Install necessary packages
### 3.1. Install Go 
Required version: >= 1.22.3

1. Download the latest Go release from https://golang.org/dl/ with Kind = Linux. Choose relevent chip architecture to your Ubuntu machine. For example, I will download this tarball: `go1.24.1.linux-386.tar.gz`

2. Extract the tarball and move it to `/usr/local`. This location is recommended as it is the default location for Go installations and will make version control easier. Use the following commands to extract the tarball and move it to `/usr/local`. Remember to change the file name in the below example to your downloaded file name:
```
sudo tar -C /usr/local -xzf go1.24.1.linux-386.tar.gz
rm go1.22.6.linux-amd64.tar.gz
```

3. Set up Go environment variables. Add the following lines to your `~/.profile` file or `~/.bashrc` file:
```
echo "export GOPATH=$HOME/go" >> ~/.profile
echo "export PATH=$PATH:/usr/local/go/bin" >> ~/.profile
source ~/.profile
```
