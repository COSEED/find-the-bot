"""Update profile image URLs to local URLs

Revision ID: a16f69a1cfdd
Revises: 3af6c5dc4ac
Create Date: 2016-04-25 08:33:42.367846

"""

# revision identifiers, used by Alembic.
revision = 'a16f69a1cfdd'
down_revision = '3af6c5dc4ac'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ids = [5591048, 5591049, 5591050, 
            5588759, 5582774, 5586448, 
            5586871, 5582960, 5591042, 
            5591043, 5591044, 5584555, 
            4823361, 4817289, 4822353, 
            5582689, 5591045, 5591046, 
            5591047, 5590373, 5589464, 
            5579275, 5585284, 5589488];
    ids_strs = [str(x) for x in ids]
    op.execute("update tuser set profile_image_url='/static/img/' || regexp_replace(profile_image_url, '^.+[/\\\\]', '') where id in (" + ", ".join(ids_strs) + ")")


def downgrade():
    op.execute("update tuser set profile_image_url='http://pbs.twimg.com/profile_images/542645614492659713/QNdLVsFF_normal.jpeg' where id=4817289;")
    op.execute("update tuser set profile_image_url='http://pbs.twimg.com/profile_images/546419354451976192/fWyTOYNg_normal.jpeg' where id=4822353;")
    op.execute("update tuser set profile_image_url='http://pbs.twimg.com/profile_images/542647493712814080/CmV4JBku_normal.jpeg' where id=4823361;")
    op.execute("update tuser set profile_image_url='http://pbs.twimg.com/profile_images/543322652736106498/gOjg4bx__normal.jpeg' where id=5579275;")
    op.execute("update tuser set profile_image_url='https://pbs.twimg.com/profile_images/694587770812104704/2fOI9t5R.jpg' where id=5582689;")
    op.execute("update tuser set profile_image_url='http://pbs.twimg.com/profile_images/536314655883280384/sidzwlFQ_normal.jpeg' where id=5582774;")
    op.execute("update tuser set profile_image_url='http://pbs.twimg.com/profile_images/3176533447/9751993fafd4ceca6525c0b1d4cd9329_normal.jpeg' where id=5582960;")
    op.execute("update tuser set profile_image_url='http://abs.twimg.com/sticky/default_profile_images/default_profile_2_normal.png' where id=5584555;")
    op.execute("update tuser set profile_image_url='http://pbs.twimg.com/profile_images/540727097228918784/qDT-Nc5S_normal.jpeg' where id=5585284;")
    op.execute("update tuser set profile_image_url='http://pbs.twimg.com/profile_images/543324076597473281/uqaM64QE_normal.jpeg' where id=5586448;")
    op.execute("update tuser set profile_image_url='https://pbs.twimg.com/profile_images/615781505051176961/VwrrWf6r.jpg' where id=5586871;")
    op.execute("update tuser set profile_image_url='http://pbs.twimg.com/profile_images/2931812896/2ddf3846a6377b7f48706273ecff6707_normal.jpeg' where id=5588759;")
    op.execute("update tuser set profile_image_url='https://pbs.twimg.com/profile_images/717111227936153600/8ytGbQxp.jpg' where id=5589464;")
    op.execute("update tuser set profile_image_url='https://pbs.twimg.com/profile_images/709747238906564608/5HWv0Ni3.jpg' where id=5589488;")
    op.execute("update tuser set profile_image_url='http://pbs.twimg.com/profile_images/541040233970540545/0xOTWwf1_normal.jpeg' where id=5590373;")
