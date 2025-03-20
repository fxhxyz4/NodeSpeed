#!/bin/bash

##########################################
#            mysql_runner.sh             #
#           only for developers          #
##########################################

if ! command -v mysql &> /dev/null; then
    echo -e "\033[41mMySQL not installed\033[m"
    echo ""

    echo ""
    exit 1
fi

sudo service mysql status > /dev/null 2>&1
if [ $? != 0 ]; then
    echo -e "\033[41mMySQL not started\033[m"
    sudo service mysql start > /dev/null 2>&1

    if [ $? != 0 ]; then
        echo -e "\033[41mMySQL not working, restarted\033[m"
        sudo service mysql restart
    fi
else
    echo -e "\033[45mMySQL worked\033[m"
fi

# get local ip
LOCAL_IP=$(hostname -I | awk '{print $1}')

if [ -z "$LOCAL_IP" ]; then
    echo -e "\033[41mFailed to get the local IP address\033[m"
    exit 1
fi

# update mysql configuration with local ip
sudo sed -i "s/^bind-address\s*=.*/bind-address = $LOCAL_IP/" /etc/mysql/mysql.conf.d/mysqld.cnf
sudo systemctl restart mysql


echo -e "\033[45mMySQL is configured to bind to the IP: $LOCAL_IP\033[m"
