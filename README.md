findthebot
===========

Installation / Development
--------------------------

Requirements: 
    
* Ruby + Bundler
* Vagrant

Set up:

    $ bundle install --with=development     # Install Kitchen, Berkshelf, ...

Use Kitchen to provision and start a VM. 

    $ bundle exec kitchen test              # Full end-to-end test

`test` runs all the steps, but you can run partial steps during development since it's faster. 

    $ bundle exec kitchen create            # Bring up a VM
    $ bundle exec kitchen converge          # Make a chef-client run
    $ bundle exec kitchen login             # SSH in to the VM

