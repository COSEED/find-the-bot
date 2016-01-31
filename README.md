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

# Stock Data Alterations

Note for Jacob from Jacob: Below is a transformation to apply to the Tweet table from the built-in
dataset to make the Tweets table unique; there are some duplicates. I chose the newer one. Hopefully
I can remove this note after the dataset is cleaned up / post-processed.

    delete from tweet where id in (7799482, 7799483, 7799492, 7799493, 7799494, 7799503, 7799504)

