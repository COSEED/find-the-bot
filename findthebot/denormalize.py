import psycopg2
import json
import os
import sys

conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

for line in sys.stdin:
	tweet_id = int(line)
	cursor.execute("SELECT user_id FROM tweet WHERE tweet_id = %s", (tweet_id,))
	(user_id,) = cursor.fetchone()
	cursor.execute("SELECT * FROM tuser WHERE user_id = %s LIMIT 1", (user_id,))
	result = cursor.fetchone()
	row = {
		'id': result[0],
		'timestamp': result[1],
		'user_id': result[2],
		'screen_name': result[3],
		'full_name': result[4],
		'bio': result[5],
		'followers': result[6],
		'following': result[7],
		'total_tweets': result[8],
		'interesting': result[9],
		'location': result[10],
		'website': result[11],
		'profile_image_url': result[12],
		'profile_banner_url': result[13],
		'protected': result[14],
	}
	cursor.execute("UPDATE tweet SET userblob=%s WHERE tweet_id = %s", (json.dumps(row), tweet_id))
	conn.commit()

