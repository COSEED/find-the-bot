"""empty message

Revision ID: d8989efb42ab
Revises: 7ecb89c09c14
Create Date: 2016-07-25 00:39:05.299465

"""

# revision identifiers, used by Alembic.
revision = 'd8989efb42ab'
down_revision = '7ecb89c09c14'

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('tweet', sa.Column('userblob', sa.Text(), nullable=True))

def downgrade():
    op.drop_column('tweet', 'userblob')

