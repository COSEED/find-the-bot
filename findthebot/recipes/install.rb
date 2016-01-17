# Encoding: UTF-8
#
# Cookbook Name:: findthebot
# Recipe:: install
#

apt_package 'libpq-dev' do
    action :install
end

python_runtime '2'
pip_requirements '/findthebot/requirements.txt'

