# Encoding: UTF-8
#
# Cookbook Name:: findthebot
# Recipe:: template_file
#

template '/tmp/demo.dynamic' do
  source 'demo.erb'
  action :create
  variables({
      :color => node[:findthebot][:color]
  })
end
