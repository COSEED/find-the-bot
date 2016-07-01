var TIME_WINDOW = 30;
var DESCEND_LIMIT = 100;
var EGG_URL = '/static/img/egg-blue.jpg';
var TIMEOUT = 10 * 1000;
var INTERVAL_REFRESH_GUESSES = 10 * 1000;
var TICK_INTERVAL = 500;
var MAX_LENGTH = 50;

var GuessesPanel = React.createClass({
    getInitialState: function() {   
        return {
            guesses: [],
            interval: null
        };
    },

    componentDidMount: function() {
        var iv = window.setInterval(this._tick, INTERVAL_REFRESH_GUESSES);
        this.setState({
            interval: iv
        });
    },

    _tick: function() {
        var ajaxXHR = $.ajax({
            url: '/guesses',
            success: this._handleGuesses.bind(this),
            timeout: TIMEOUT
        });
    },

    _handleGuesses: function(result, textStatus, jqXHR) {
        this.setState({
            guesses: result.guesses
        });
    },

    componentWillUnmount: function() {
        window.clearInterval(this.state.interval);
    },

    render: function() {
        var guesses = [];

        for(var i = 0; i < this.state.guesses.length; i++) {
            guesses.push(<li><a onClick={this.props.handleUserClick.bind(this, this.state.guesses[i].screen_name)} href="#">@{this.state.guesses[i].screen_name}</a></li>);
        }

        return <div>
            <h1>You have guessed:</h1>
            <ul>{guesses}</ul>
        </div>;
    }
});

var Tweet = React.createClass({
    getInitialState: function() {
        return {
            imgError: false
        };
    },

    _trigger: function(cb, arg) {
        cb(arg);
    },

    _match: function(text, rx, callback) {
        var text_processed = [];

        for(var i = 0; i < text.length; i++) {
            var match, found = false;

            if(typeof text[i] === 'string') {
                var start_index = 0;

                while((match = rx.exec(text[i])) !== null) {
                    found = true;

                    var text_before = text[i].substring(start_index, match.index);

                    text_processed.push(text_before);
                    text_processed.push(<a onClick={this._trigger.bind(this, callback, match[1])}>{match[0]}</a>);

                    start_index = rx.lastIndex;
                }

                if(found) {
                    text_processed.push(text[i].substring(start_index));
                }
            }

            if(!found) {
                text_processed.push(text[i]);
            }
        }

        return text_processed;
    },

    handleErrorImg: function(e) {
        this.setState({
            imgError: true
        });
    },

    render: function() {
        var hashtagRegex = /#(\w+)/g,
            mentionRegex = /@(\w+)/g;

        var text = [this.props.tweet.text];

        text = this._match(text, hashtagRegex, this.props.handleClickedHashtagEvent);
        text = this._match(text, mentionRegex, this.props.handleClickedUsernameEvent);

        var handledClickTweeter = this._trigger.bind(this, this.props.handleClickedUsernameEvent, this.props.user.screen_name);

        var imgUrl = (this.state.imgError ? EGG_URL : this.props.user.profile_image_url);

        return <div className="tweet">
            <p className="profile-img"><img onError={this.handleErrorImg} src={imgUrl} /></p>
            <p className="userinfo" onClick={handledClickTweeter}>
                <span className="fullname">{this.props.user.full_name}</span>
                <span className="screenname">@{this.props.user.screen_name}</span>
                <span className="datetime" dangerouslySetInnerHTML={{__html: this.props.tweet.datetime}}></span>
            </p>
            {text}
        </div>;
    }
});

var Profile = React.createClass({
    getInitialState: function() {
        return {
            marked: false,
            profileImgError: false,
            marking: false
        };
    },

    componentDidUpdate: function(prevProps, prevState) {
        if(this.props.profile && (!prevProps.profile || (prevProps.profile.marked !== this.props.profile.marked))) {
            this.setState({
                marked: this.props.profile.marked
            });
        }
    },

    _handleMarkBot: function(marked) {
        this.setState({
            marked: marked
        });
    },

    handleClickMarkAsBot: function() {
        var tuser_id = this.props.profile.user.id;

        this.setState({
            marking: true
        });

        $.ajax({
            url: '/tracker/guess',
            method: 'POST',
            data: {
                tuser_id: tuser_id
            },
            success: this._handleMarkBot.bind(this, true),
            complete: function() {
                this.setState({
                    marking: false
                });
            }.bind(this)
        });
    },

    handleClickUnmarkAsBot: function() {
        var tuser_id = this.props.profile.user.id;

        this.setState({
            marking: true
        });

        $.ajax({
            url: '/tracker/unguess',
            method: 'POST',
            data: {
                tuser_id: tuser_id
            },
            success: this._handleMarkBot.bind(this, false),
            complete: function() {
                this.setState({
                    marking: false
                });
            }.bind(this)
        });
    },

    handleProfileImgError: function(e) {
        this.setState({
            profileImgError: true
        });
    },

    render: function() {
        if(this.props.profile === null) {
            return <div className="loading" />;
        }
        
        var markBtn;
        
        var marking = (this.state.marking ? 'disabled' : '');

        if(!this.state.marked) {
            markBtn = <button disabled={marking} onClick={this.handleClickMarkAsBot} className="mark-as-bot">Mark user as bot</button>;
        } else {
            markBtn = <button disabled={marking} onClick={this.handleClickUnmarkAsBot} className="mark-as-bot unmark">Unmark user as bot</button>;
        }

        var imgUrl = (this.state.profileImgError ? EGG_URL : this.props.profile.user.profile_image_url);

        var locationCls = "glyphicon glyphicon-map-marker";
        if(!this.props.profile.user.location) {
            locationCls += " no-data";
        }

        var websiteCls = "glyphicon glyphicon-link";
        if(!this.props.profile.user.website) {
            websiteCls += " no-data";
        }

        return <div>
            <div className="top">
                <span className="profile-photo"><img onError={this.handleProfileImgError} src={imgUrl} /></span>
                <div className="profile-info">
                    <h1>{this.props.profile.user.full_name}</h1>
                    <h2>@{this.props.profile.user.screen_name}</h2>
                    <p className="bio">{this.props.profile.user.bio}</p>
                    {markBtn}
                </div>
            </div>
            <div className="info">
                <ul className="short">
                    <li>
                        <span className={locationCls} aria-hidden="true"></span>
                        {this.props.profile.user.location}
                    </li>
                    <li>
                        <span className={websiteCls} aria-hidden="true"></span>
                        {this.props.profile.user.website}
                    </li>
                </ul>

                <ul className="statistics">
                    <li>
                        <label>Tweets</label>
                        {this.props.profile.user.total_tweets}
                    </li>
                    <li>
                        <label>Following</label>
                        {this.props.profile.user.following}
                    </li>
                    <li>
                        <label>Followers</label>
                        {this.props.profile.user.followers}
                    </li>
                </ul>
            </div>
        </div>;
    }
});

var Tracker = React.createClass({
    componentDidMount: function() {
        if('localStorage' in window && window.localStorage['tags']) {
            this.setState({
                tags: JSON.parse(window.localStorage['tags'])
            });
        }

        if('localStorage' in window && window.localStorage['users']) {
            this.setState({
                users: JSON.parse(window.localStorage['users'])
            });
        }

        if(window.location.hash) {
            var userRegex = /user(.+)/;
            var tagRegex = /hash(.+)/;

            var userResult = userRegex.exec(window.location.hash),
                tagResult = tagRegex.exec(window.location.hash);

            if(userResult) {
                this.setState({
                    activeUser: userResult[1],
                    loading: true,
                    tweets: [],
                    playing: true
                });
            } else if(tagResult) {
                this.setState({
                    activeTag: tagResult[1],
                    loading: true,
                    tweets: [],
                    playing: true
                });
            }
        }

        window.setInterval(this._tick, TICK_INTERVAL);
    },

    componentDidUpdate: function(prevProps, prevState) {
        window.localStorage['tags'] = JSON.stringify(this.state.tags);
        window.localStorage['users'] = JSON.stringify(this.state.users);

        if(this.state.activeUser !== prevState.activeUser && this.state.activeUser) {
            if(this.state.activeUserProfile === null || this.state.activeUserProfile.user.screen_name !== this.state.activeUser) {
                this._fetchProfile(this.state.activeUser);
            }
        }
    },

    getInitialState: function() {
        return {
            tweets: [],
            ajaxXHR: null,
            activeTag: null,
            activeUser: null,
            guessesActive: false,
            loading: true,
            tags: [],
            users: [],
            pendingTag: '',
            pendingUser: '',
            editingTag: false,
            editingUser: false,
            playing: true,
            activeUserProfile: null,
            activeUser404: false,
            loadingMore: false,
            maxId: null,
            sinceId: null
        };
    },
    
    _descend: function(query) {
        if(this.state.tweets.length > DESCEND_LIMIT) {
            return;
        }

        if(!this.compareQuery(query)) {
            return;
        }

        if(this.state.activeUser && (!this.state.activeUserProfile || !this.state.activeUserProfile.user)) {
            window.setInterval(this._descend.bind(this, query), 1000);
            return;
        }

        var user;
        if(this.state.activeUser) {
            user = this.state.activeUserProfile.user.user_id;
        }

        var data = {
            tag: this.state.activeTag,
            user: user,
            max_id: this.state.maxId
        };

        this.setState({
            loadingMore: true
        });

        var ajaxXHR = $.ajax({
            url: '/stream',
            data: data,
            success: function(response) {
                if(!this.compareQuery(query)) {
                    return;
                }

                if(response.tweets.length === 0) {
                    return;
                }

                var tweets = this.state.tweets.concat(response.tweets);

                this.setState({
                    tweets: tweets,
                });

                if(response.tweets.length) {
                    this.setState({
                        maxId: response.min_tweet_id
                    }, this._descend.bind(this, query));
                }

            }.bind(this),
            complete: function() {
                this.setState({
                    loadingMore: false
                });
            }.bind(this),
            timeout: TIMEOUT
        });
    },

    getQuery: function() {
        return {
            activeUser: this.state.activeUser,
            activeTag: this.state.activeTag,
        };
    },

    compareQuery: function(q) {
        return (this.state.activeUser === q.activeUser && this.state.activeTag === q.activeTag);
    },

    _tick: function() {
        if(this.state.ajaxXHR !== null) {
            return;
        }

        if(!this.state.playing) {
            return;
        }

        if(this.state.activeUser !== null && (this.state.activeUserProfile == null || this.state.activeUserProfile.user.screen_name != this.state.activeUser)) {
            return;
        }

        var user;

        if(this.state.activeUser) {
            user = Number(this.state.activeUserProfile.user.user_id);
        }

        var ajaxXHR = $.ajax({
            url: '/stream',
            data: {
                tag: this.state.activeTag,
                user: user,
                since_id: this.state.sinceId
            },
            success: this._updateStream.bind(this, this.getQuery()),
            complete: function() {
                this.setState({ 
                    ajaxXHR: null
                });
            }.bind(this),
            timeout: TIMEOUT
        });

        this.setState({
            ajaxXHR: ajaxXHR
        });
    },

    _updateStream: function(query, result, textStatus, jqXHR) {
        if(!this.compareQuery(query)) {
            return;
        }

        if(this.state.loading) {
            this.setState({
                loading: false
            });
        }

        if(result.tweets.length === 0) {
            return;
        }

        this.setState({
            tweets: result.tweets.concat(this.state.tweets).slice(0, MAX_LENGTH)
        });

        if(result.tweets.length > 0) {
            this.setState({
                sinceId: result.max_tweet_id
            });

            if(!this.state.maxId) {
                this.setState({
                    maxId: result.min_tweet_id
                });

                this._descend(query);
            }
        }
    },
        
    handleFirehoseClick: function(e) {
        if($(e.target).is('.glyphicon')) {
            return;
        }

        this.setState({
            activeTag: null,
            activeUser: null,
            guessesActive: false,
            loading: true,
            tweets: [],
            playing: true,
            sinceId: null,
            maxId: null
        });

        window.location.hash = "";
    },

    handleTagClick: function(e) {
        if($(e.target).is('.glyphicon')) {
            return;
        }

        var hashtag = $(e.target).closest('li').attr('data-tag');

        this.setState({
            activeTag: hashtag,
            activeUser: null,
            guessesActive: false,
            loading: true,
            tweets: [],
            playing: true,
            sinceId: null,
            maxId: null
        });

        window.location.hash = "hash"+hashtag;
    },

    handleClickedUsername: function(screenname, e) {
        this.setState({
            activeTag: null,
            activeUser: screenname,
            guessesActive: false,
            loading: true,
            tweets: [],
            playing: true,
            sinceId: null,
            maxId: null
        });
        var users = [screenname];
        for(var i = 0; i < this.state.users.length; i++) {
            if(this.state.users[i] == screenname) {
                return;
            }

            users.push(this.state.users[i]);
        }
        this.setState({
            users: users
        });
        window.location.hash = "user"+screenname;
    },

    handleClickedHashtag: function(hashtag, e) {
        this.setState({
            activeTag: hashtag,
            activeUser: null,
            guessesActive: false,
            loading: true,
            tweets: [],
            playing: true,
            sinceId: null,
            maxId: null
        });
        var tags = [hashtag];
        for(var i = 0; i < this.state.tags.length; i++) {
            if(this.state.tags[i] == hashtag) {
                return;
            }

            tags.push(this.state.tags[i]);
        }
        this.setState({
            tags: tags
        });
        window.location.hash = "user"+hashtag;
    },

    handleUserClick: function(e) {
        if($(e.target).is('.glyphicon')) {
            return;
        }

        var user = $(e.target).closest('li').attr('data-user');

        this.setState({
            activeTag: null,
            activeUser: user,
            guessesActive: false,
            loading: true,
            tweets: [],
            playing: true,
            activeUserProfile: null,
            activeUser404: false,
            sinceId: null,
            maxId: null
        });

        window.location.hash = "user"+user;
    },

    _fetchProfile: function(user) {
        $.ajax({
            url: '/profile',
            method: 'GET',
            data: {
                screen_name: user
            },
            success: this.handleProfile,
            error: function(e) {
                if(e.status == 404) {
                    this.setState({
                        activeUser404: true
                    });
                    return;
                }

                window.setTimeout(this._fetchProfile.bind(this), TIMEOUT);
            }.bind(this)
        });
    },

    handleProfile: function(response, textStatus, jqXHR) {
        this.setState({
            activeUserProfile: {
                user: response.tuser,
                marked: response.marked
            }
        });
    },

    handleUserRemoveClick: function(i, e) {
        e.stopPropagation();
        var users = [];
        for(var j = 0; j < this.state.users.length; j++) {
            if(i == j) continue;
            users.push(this.state.users[j]);
        }
        this.setState({
            users: users
        });

        if(this.state.activeUser == this.state.users[i]) {
            this.setState({
                activeUser: null,
                guessesActive: false,
                loading: true,
                tweets: [],
                sinceId: null,
                maxId: null
            });
        }
    },

    handleTagRemoveClick: function(i, e) {
        e.stopPropagation();
        var tags = [];
        for(var j = 0; j < this.state.tags.length; j++) {
            if(i == j) continue;
            tags.push(this.state.tags[j]);
        }
        this.setState({
            tags: tags
        });

        if(this.state.activeTag == this.state.tags[i]) {
            this.setState({
                activeTag: null,
                loading: true,
                tweets: [],
                sinceId: null,
                maxId: null
            });
        }
    },

    handlePlusTagClick: function(e) {
        this.setState({
            editingTag: true,
            pendingTag: '',
            editingUser: false,
            pendingUser: ''
        }, function() {
            this.refs['pendingTagInput'].focus();
        }.bind(this));
    },

    handlePlusUserClick: function(e) {
        this.setState({
            editingUser: true,
            pendingUser: '',
            editingTag: false,
            pendingTag: ''
        }, function() {
            this.refs['pendingUserInput'].focus();
        }.bind(this));
    },

    handleEditingUserBlur: function(e) {
        this.setState({
            editingUser: false,
            pendingUser: ''
        });
    },

    handleEditingUserChange: function(e) {
        this.setState({
            pendingUser: e.target.value
        });
    },

    handleEditingTagBlur: function(e) {
        this.setState({
            editingTag: false,
            pendingTag: ''
        });
    },

    handleEditingTagChange: function(e) {
        this.setState({
            pendingTag: e.target.value
        });
    },

    handleEditingUserSubmit: function(e) {
        e.preventDefault();
        var users = this.state.users;

        users = users.concat([this.state.pendingUser]);

        this.setState({
            users: users,
            editingUser: false,
            pendingUser: ''
        });
    },

    handleEditingTagSubmit: function(e) {
        e.preventDefault();
        var tags = this.state.tags;

        tags = tags.concat([this.state.pendingTag]);

        this.setState({
            tags: tags,
            editingTag: false,
            pendingTag: ''
        });
    },

    handlePauseClick: function(e) {
        this.setState({
            playing: !this.state.playing
        });
    },

    handleMarkAsBotClicked: function(user_id, e) {
        e.preventDefault();
    },

    handleGuessesClick: function(e) {
        this.setState({
            guessesActive: true,
            activeTag: null,
            activeUser: null,
            loading: true,
            playing: true,
            activeUserProfile: null,
            activeUser404: false,
            sinceId: null,
            maxId: null
        });
    },

    render: function() {
        var tweets = [];

        for(var i = 0; i < this.state.tweets.length; i++) {
            var tweetdata = this.state.tweets[i];
            tweets.push(<Tweet handleClickedHashtagEvent={this.handleClickedHashtag} handleClickedUsernameEvent={this.handleClickedUsername} key={tweetdata.tweet.id} user={tweetdata.user} tweet={tweetdata.tweet} />);
        }

        if(tweets.length == 0 && this.state.loading) {
            tweets.push(<p className="loading" key={'loading'}>Loading tweets...</p>);
        } else if(tweets.length == 0) {
            tweets.push(<p className="loading" key={'loading'}>There are no tweets yet.</p>);
        }

        var tags = [], users = [];

        for(var i = 0; i < this.state.tags.length; i++) {
            var cls = "", playpause = "";
            if(this.state.activeTag === this.state.tags[i]) {
                cls += "nav-active";
                if(this.state.playing) {
                    playpause = <span onClick={this.handlePauseClick} className="glyphicon glyphicon-pause"></span>;
                } else {
                    playpause = <span onClick={this.handlePauseClick} className="glyphicon glyphicon-play"></span>;
                }
            }

            tags.push(<li key={'tag-'+i} data-tag={this.state.tags[i]} onClick={this.handleTagClick} className={cls}>
                {playpause}
                #{this.state.tags[i]}
                <span onClick={this.handleTagRemoveClick.bind(this, i)} className="glyphicon glyphicon-remove"></span>
            </li>);
        }

        var tags_banner = '';
        if(this.state.tags.length == 0 && !this.state.editingTag) {
            tags_banner = <p className="banner">Click the + to add a new tag to the tracker, or hover over a tag in the feed to add.</p>;
        }

        for(var i = 0; i < this.state.users.length; i++) {
            var cls = "", playpause = "";
            if(this.state.activeUser === this.state.users[i]) {
                cls += "nav-active";
                if(this.state.playing) {
                    playpause = <span onClick={this.handlePauseClick} className="glyphicon glyphicon-pause"></span>;
                } else {
                    playpause = <span onClick={this.handlePauseClick} className="glyphicon glyphicon-play"></span>;
                }
            }

            users.push(<li key={'user-'+i} data-user={this.state.users[i]} onClick={this.handleUserClick} className={cls}>
                {playpause}
                @{this.state.users[i]}
                <span onClick={this.handleUserRemoveClick.bind(this, i)} className="glyphicon glyphicon-remove"></span>
            </li>);
        }

        var users_banner = '';
        if(this.state.users.length == 0 && !this.state.editingUser) {
            users_banner = <p className="banner">Click the + to add a new profile to the tracker, or hover over a user's avatar in the feed to add.</p>;
        }

        if(this.state.editingUser) {
            users.push(<li key={'editing'}>@<form onSubmit={this.handleEditingUserSubmit}><input type="text" ref="pendingUserInput" placeholder="TheRealDonaldTrump" value={this.state.pendingUser} onBlur={this.handleEditingUserBlur} onChange={this.handleEditingUserChange} /></form></li>);
        }
        if(this.state.editingTag) {
            tags.push(<li key={'editing'}>#<form onSubmit={this.handleEditingTagSubmit}><input type="text" ref="pendingTagInput" placeholder="usa" value={this.state.pendingTag} onBlur={this.handleEditingTagBlur} onChange={this.handleEditingTagChange} /></form></li>);
        }

        var firehose_cls = "nav  nav-loading firehose";
        var guesses_cls = "nav guesses";
        var guess_hide = "nohide";
        var guess_panel = "";

        if(this.state.guessesActive) {
            guesses_cls += " nav-active";
            guess_hide = "hide";

            guess_panel = <GuessesPanel handleUserClick={this.handleClickedUsername}/>;
        }

        var playpause_firehose = '';

        if(this.state.activeUser === null && this.state.activeTag === null && this.state.guessesActive == false) {
            firehose_cls += " nav-active";
            if(this.state.playing) {
                playpause_firehose = <span onClick={this.handlePauseClick} className="glyphicon glyphicon-pause"></span>;
            } else {
                playpause_firehose = <span onClick={this.handlePauseClick} className="glyphicon glyphicon-play"></span>;
            }
        }

        var profile_panel = '';

        if(this.state.activeUser !== null) {
            if(this.state.activeUser404 == true) {
                profile_panel = "This user doesn't exist in the network.";
                tweets = "";
            } else {
                profile_panel = <Profile profile={this.state.activeUserProfile} key={this.state.activeUser} screen_name={this.state.activeUser} />;
            }
        }

        return <div>
            <div id="leftpanel">
                <div onClick={this.handleGuessesClick} className={guesses_cls}>
                    <span className="header">Guesses</span>
                </div>

                <div onClick={this.handleFirehoseClick} className={firehose_cls}>
                    {playpause_firehose}
                    <span className="header">Firehose</span>
                </div>

                <div className="nav tag">
                    <span className="header">Track Tags <span onClick={this.handlePlusTagClick} className="glyphicon glyphicon-plus-sign"></span></span>
                    <div className="entries">
                        <ul>
                            {tags}
                        </ul>
                    </div>
                    {tags_banner}
                </div>

                <div className="nav profile">
                    <span className="header">Track Profiles <span onClick={this.handlePlusUserClick} className="glyphicon glyphicon-plus-sign"></span></span>
                    <div className="entries">
                        <ul>
                            {users}
                        </ul>
                    </div>
                    {users_banner}
                </div>
            </div>
            <div id="mainpanel">
                <div className={guess_hide} id="profilepanel">
                    {profile_panel}
                </div>
                <div className={guess_hide} id="tweets">
                    {tweets}
                </div>
                <div id="guesspanel">
                    {guess_panel}
                </div>
            </div>
        </div>;
    }
});

ReactDOM.render(
    <Tracker />, 
    document.getElementById('container')
);
