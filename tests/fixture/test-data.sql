INSERT INTO tuser (id, user_id, screen_name, full_name) VALUES
     (1, "1", "timhwang",           "Tim Hwang")
    ,(2, "2", "justinbeiber",       "Justin Beiber")
    ,(3, "3", "realDonaldTrump",    "Donald J. Trump")
    ;

INSERT INTO test (id) VALUES 
     (1)
    ,(2)
    ,(3)
    ;

INSERT INTO test_selection (test_id, tuser_id, order) VALUES
     (1, "1", 1)
    ,(1, "2", 2)
    ,(1, "3", 3)

    ,(2, "1", 1)

    ;
