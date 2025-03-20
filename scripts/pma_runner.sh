#!/bin/bash

##########################################
#              dev.sh only               #
#            for developers              #
##########################################


# run mysql runner
cd scripts || exit
./mysql_runner.sh

# get local ip address
LOCAL_IP=$(hostname -I | awk '{print $1}')

# check phpmyadmin install?
# work on linux only
if ! dpkg -l | grep -q phpmyadmin; then
    echo -e "\033[41mphpMyAdmin is not installed\033[m"

    echo ""

    echo "Installing phpMyAdmin..."

    sudo apt update
    sudo apt install -y phpmyadmin
else
    echo ""
    echo ""

    echo -e "\033[45mphpMyAdmin is already installed\033[m"
fi

#
if ! sudo service apache2 status > /dev/null 2>&1; then
    echo -e "\033[41mApache disabled\033[m"
    echo ""
    echo ""

    echo -e "\033[45mApache started...\033[m"
    sudo service apache2 start
else
    echo -e "\033[45mApache already started\033[m"
fi

echo ""
echo -e "\033[45mphpMyAdmin should now be accessible at http://$LOCAL_IP/phpmyadmin\033[m"
