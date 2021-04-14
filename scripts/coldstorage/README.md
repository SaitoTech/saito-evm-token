
# Purpose:

To support the management of Saito's swappable ERC20 token, we decided on a cold-storage solution with custom scripts for managing the token.

As an aside to this, we also needed the cold storage to be able to handle not only minting our token, but also transferring ETH and the token.

The project grew in scope to the point where it is nearly a decent general solution for handling ETH or ERC20s. Looking around the ETH ecosystem, we could not find a single project which handled this type of setup very well.

Although we don't have the bandwidth the generalize this project for use with any ERC20, we are forking it and giving it to the community in hopes that perhaps someone else will take it the last mile or we will make time to do this in the future after the Saito IDO has passed and we have more time and resources for projects like this.

This folder serves as a starting point for the potential to fork this code-base, add a few more scripts, and publish it as a general purpose cold storage solution for the EVM space.

# How it works:

The setup we made was done with Ubuntu Server on a Raspberry Pi. The cold storage box only needs nodejs, so any other distribution should work fairly easily, but the tutorial below will help if you're running Ubuntu Server.

Before this can be used for general purposes, some of the scripts will need to be rewritten. The Saito ERC20 uses 3 owners and newly minted coins are sent to owner 1. Owner 1 is online, so the mint script can be run directly from there. However, in earlier designs of our key-storage scheme, all 3 owners were meant to be kept in cold storage, so we also crated the mintRaw and sendRaw scripts. mintRaw creates a raw transaction which can then be copied over to an online wallet and played via the sendRaw script. In general, any transaction that needs to be created offline and played online could follow this same pattern. A comparison of mint.js vs mintRaw.js will demonstrate the technique. A few tweaks to sendRaw.js may also be need to make it more generalizable.

# TODO

1) Create copies of each script so they'll all work in both raw and "hot" mode. e.g. we need something like transferEth.js called transferEthRaw.js which works like mintRaw that can then be sent to ETH network via sendRaw.
2) Move the truffle-based scripts and node-based scripts to new folders, perhaps scripts/cold and script/hot to make it clear where things can be run. Obviously cold script can be run anywhere, but hot scripts will not work on the cold storage box because they need truffle.
3) generalize transferSaito.js to any ERC20. Rename to transferERC20.js(and transferERC20Raw.js).
4) Get ABIs via contract address. This should be possible.
5) Create scripts or use a QR lib to transfer signatures, raw transactions, and ABIs to/from the cold storage machine. Update the documentation to include that in the debian repos.
6) Allow address switches as 0xXXX rather than just XXX. i.e. dd {string: ["to"]}, {string: ["tokenaddr"]}, and {string: ["addr"]} in minimist to all the places those are used and remove '0x' from the scripts.

# Setup

### 1) Install nodejs and it's dependencies onto a clone of your cold storage box. In the case of Raspberry Pi, it was running on an ARM processor, so it was necessary to have a 2nd Raspberry Pi or at least a 2nd SD card to store the system on.

Boot the "hot" clone and run the following script:

```
PACKAGE=nodejs
apt-get download $(apt-cache depends \
                             --recurse \
                             --no-recommends \
                             --no-suggests \
                             --no-conflicts \
                             --no-breaks \
                             --no-replaces \
                             --no-enhances \
                             --no-pre-depends \
                             ${PACKAGE} | grep "^\w" | sort -u)
```

Install dpkg-dev tools for dpkg-scanpackages:

```
apt-get install dpkg-dev
```

Create the Packages.gz list and store it and the .deb packages into a tar file

```
cd /var/cache/apt/archives
dpkg-scanpackages . | gzip -9c > Packages.gz
tar -cf ~/repo.tar .
```

Grab this project from github, npm install everything, and tar that up as well:

```
git clone https://github.com/SaitoTech/saito-evm-token.git
cd saito-evm-token
npm install
tar -cf ~/saito-evm-token.tar .
```

Move repo.tar and saito-evm-token.tar to the cold storage machine... In the case of the Raspberry Pi this means copying the file directly to the SD card, but in general you can move it in any way that keeps your cold storage machine cold.


Untar the repo in a reasonable place, e.g. /opt/repository

```
cd /opt/repository
tar -xf repo.tar .
```

Add the local repo to your repo sources

```
echo "deb file:///opt/repository ./" >> /etc/apt/sources.list
```

Comment out all the other repos from sources.list, otherwise apt-get install will simply halt after failing to reach ports.ubuntu.com.

```
vim /etc/apt/sources.list 
or 
emacs /etc/apt/sources.list 
or
nano /etc/apt/sources.list 
# add "#" before each remote repo
```
Run aptitude update. You'll need to add the Acquire:AllowInsecureRepoitories switch since your local repo is not "secure".

```
apt-get -o Acquire:AllowInsecureRepoitories=true update 
```

Install node

```
apt-get install nodejs
```

Create an encrypted disk using a tool like encfs and mount it:

```
# create mountpoint directories, perhaps on a usb stick. Something like this:

fdisk -l
sudo mount /dev/sda1 /media/usb

Mount encfs something like this:
encfs ~/media/usb/encrypted /media/decryptedMountPoint
```

# Use

extract saito-evm-token.tar to somewhere reasonable and use it. Any of the node-based scripts will run, however the truffle scripts can only be run on a "hot" machine.

See the README.md at the root of this project for some clues.

For example:

```
cd /opt/saito-evm-token
node script/generateKeypair.js --dest=/media/decryptedMountPoint/
```
