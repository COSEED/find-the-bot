"""empty message

Revision ID: 687f6d810c83
Revises: e58250f062a5
Create Date: 2016-06-29 13:52:13.665301

"""

# revision identifiers, used by Alembic.
revision = '687f6d810c83'
down_revision = 'e58250f062a5'

from alembic import op
import sqlalchemy as sa

# 5,591,050
ids = [
    {
        'old_user_id': 1000000003,
        'new_user_id': 624252755,
        'id': 5591044
    },

    {
        'old_user_id': 1000000004,
        'new_user_id': 40173650,
        'id': 5591046
    },

    {
        'old_user_id': 1000000005,
        'new_user_id': 855402486,
        'id': 5591047
    },

    {
        'old_user_id': 1000000006,
        'new_user_id': 90804267,
        'id': 5591048
    },

    {
        'old_user_id': 1000000007,
        'new_user_id': 938657858,
        'id': 5591049
    },

    {
        'old_user_id': 1000000008,
        'new_user_id': 360304674,
        'id': 5591050
    },

    {
        'old_user_id': 1000000009,
        'new_user_id': 199937748,
        'id': 5591045
    },
]

def upgrade():
    for mp in ids:
        op.execute("update tuser set user_id=%(new_user_id)s where id=%(id)s" % (mp))
        op.execute("insert into team_bot (team_id, twitter_id, screen_name, type, kill_date) VALUES (3, %(bot_id)s, '', 0, 0)" % {'bot_id': mp['new_user_id']})


def downgrade():
    for mp in ids:
        op.execute("update tuser set user_id=%(old_user_id)s where id=%(id)s" % (mp))
        op.execute("delete from team_bot where twitter_id = %(bot_id)s" % {'bot_id': mp['new_user_id']})
