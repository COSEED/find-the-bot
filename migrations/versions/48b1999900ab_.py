"""Fix bothuman mapping; fix duplicate user ID for theman

Revision ID: 48b1999900ab
Revises: b69838df1800
Create Date: 2016-06-29 07:29:05.604311

"""

# revision identifiers, used by Alembic.
revision = '48b1999900ab'
down_revision = 'b69838df1800'

from alembic import op
import sqlalchemy as sa


ids = [1000000003, #justforfun
       1000000001, #gzf
       1000000002, #laps
       1000000004, #beefy
       1000000005, #buddude
       1000000006, #jiffy_2
       1000000007, #jbjbjb
       1000000008, #bballin
       1000000009] #theman

def upgrade():
    #oops
    op.execute("update tuser set user_id=1000000009 where id=5591045")

    for bot_id in ids:
        op.execute("insert into team_bot (team_id, twitter_id, screen_name, type, kill_date) VALUES (3, %(bot_id)s, '', 0, 0)" % {'bot_id': bot_id})

def downgrade():
    for bot_id in ids:
        op.execute("delete from team_bot where twitter_id = '%(bot_id)s'" % {'bot_id': bot_id})
    #oops
    op.execute("update tuser set user_id=1000000003 where id=5591045")

