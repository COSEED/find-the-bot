var Tweet = React.createClass({
    handleClick: function(e) {
        this.props.handleClickedUsernameEvent(e);
    },

    render: function() {
        return <div className="tweet">
            <p className="profile-img"><img src={this.props.user.profile_image_url} /></p>
            <p className="userinfo" onClick={this.handleClick}>
                <span className="fullname">{this.props.user.full_name}</span>
                <span className="screenname">@{this.props.user.screen_name}</span>
            </p>
            <p dangerouslySetInnerHTML={{__html: this.props.tweet.text}} />
        </div>;
    }
});

var Profile = React.createClass({
    getInitialState: function() {
        return {
            loading: true,
            marked: false,
            user: null
        };
    },

    handleProfile: function(response) {
        this.setState({
            loading: false,
            user: response.tuser,
            marked: response.marked
        });
    },

    _handleMarkBot: function(marked) {
        this.setState({
            marked: marked
        });
    },

    handleClickMarkAsBot: function() {
        var tuser_id = this.state.user.id;

        $.ajax({
            url: '/tracker/guess',
            method: 'POST',
            data: {
                tuser_id: tuser_id
            },
            success: this._handleMarkBot.bind(this, true)
        });
    },

    handleClickUnmarkAsBot: function() {
        var tuser_id = this.state.user.id;

        $.ajax({
            url: '/tracker/unguess',
            method: 'POST',
            data: {
                tuser_id: tuser_id
            },
            success: this._handleMarkBot.bind(this, false)
        });
    },

    componentDidMount: function() {
        $.ajax({
            url: '/profile',
            method: 'GET',
            data: {
                screen_name: this.props.screen_name
            },
            success: this.handleProfile
        });
    },

    render: function() {
        if(this.state.loading) {
            return <div />;
        }
        
        var markBtn;
        
        if(!this.state.marked) {
            markBtn = <button onClick={this.handleClickMarkAsBot} className="mark-as-bot">Mark user as bot</button>;
        } else {
            markBtn = <button onClick={this.handleClickUnmarkAsBot} className="mark-as-bot unmark">Unmark user as bot</button>;
        }

        return <div>
            <div className="top">
                <span className="profile-photo"><img src={this.state.user.profile_image_url} /></span>
                <h1>{this.state.user.full_name}</h1>
                <h2>@{this.state.user.screen_name}</h2>
                <p className="bio">{this.state.user.bio}</p>
                {markBtn}
            </div>
            <div className="info">
                <ul className="short">
                    <li>
                        <span className="glyphicon glyphicon-map-marker" aria-hidden="true"></span>
                        {this.state.user.location}
                    </li>
                    <li>
                        <span className="glyphicon glyphicon-link" aria-hidden="true"></span>
                        {this.state.user.website}
                    </li>
                </ul>

                <ul className="statistics">
                    <li>
                        <label>Tweets</label>
                        {this.state.user.total_tweets}
                    </li>
                    <li>
                        <label>Following</label>
                        {this.state.user.following}
                    </li>
                    <li>
                        <label>Followers</label>
                        {this.state.user.followers}
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
                    activeUser: userResult[1]
                });
            } else if(tagResult) {
                this.setState({
                    activeTag: tagResult[1]
                });
            }
        }

        window.setInterval(this._tick, 250);
        this._tick();
    },

    componentDidUpdate: function() {
        window.localStorage['tags'] = JSON.stringify(this.state.tags);
        window.localStorage['users'] = JSON.stringify(this.state.users);
    },

    getInitialState: function() {
        return {
            tweets: [],
            ajaxXHR: null,
            activeTag: null,
            activeUser: null,
            loading: true,
            tags: [],
            users: [],
            pendingTag: '',
            pendingUser: '',
            editingTag: false,
            editingUser: false,
            playing: true
        };
    },
    
    _tick: function() {
        if(this.state.ajaxXHR !== null) {
            return;
        }

        if(!this.state.playing) {
            return;
        }

        var ajaxXHR = $.ajax({
            url: '/stream',
            data: {
                tag: this.state.activeTag,
                user: this.state.activeUser
            },
            success: this._updateStream,
            error: function() {
                this.setState({ 
                    ajaxXHR: null
                });
            }.bind(this),
            timeout: 1000
        });

        this.setState({
            ajaxXHR: ajaxXHR
        });
    },

    _updateStream: function(result, textStatus, jqXHR) {
        this.setState({
            tweets: result.tweets,
            ajaxXHR: null,
            loading: false
        });
    },
        
    handleFirehoseClick: function(e) {
        this.setState({
            activeTag: null,
            activeUser: null
        });

        window.location.hash = "";
    },

    handleTagClick: function(e) {
        var hashtag = $(e.target).closest('li').attr('data-tag');

        this.setState({
            activeTag: hashtag,
            activeUser: null
        });

        window.location.hash = "hash"+hashtag;
    },

    handleClickedUsername: function(tweetdata, e) {
        e.preventDefault();
        this.setState({
            activeTag: null,
            activeUser: tweetdata.user.screen_name
        });
        var users = [tweetdata.user.screen_name];
        for(var i = 0; i < this.state.users.length; i++) {
            if(this.state.users[i] == tweetdata.user.screen_name) {
                return;
            }

            users.push(this.state.users[i]);
        }
        this.setState({
            users: users
        });
        window.location.hash = "user"+tweetdata.user.screen_name;
    },

    handleUserClick: function(e) {
        var user = $(e.target).closest('li').attr('data-user');

        this.setState({
            activeTag: null,
            activeUser: user
        });

        window.location.hash = "user"+user;
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
                activeUser: null
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
                activeTag: null
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

    render: function() {
        var tweets = [];

        for(var i = 0; i < this.state.tweets.length; i++) {
            var tweetdata = this.state.tweets[i];
            var handleClickedUsername = this.handleClickedUsername.bind(this, tweetdata);
            tweets.push(<Tweet handleClickedUsernameEvent={handleClickedUsername} key={tweetdata.tweet.id} user={tweetdata.user} tweet={tweetdata.tweet} />);
        }

        if(tweets.length == 0 && this.state.loading) {
            tweets.push(<p key={'loading'}>Loading tweets...</p>);
        } else if(tweets.length == 0) {
            tweets.push(<p key={'loading'}>There are no tweets yet.</p>);
        }

        var tags = [], users = [];

        for(var i = 0; i < this.state.tags.length; i++) {
            var cls = "";
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
            var cls = "", playpause;
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

        var playpause_firehose = '';

        if(this.state.activeUser === null && this.state.activeTag === null) {
            firehose_cls += " nav-active";
            if(this.state.playing) {
                playpause_firehose = <span onClick={this.handlePauseClick} className="glyphicon glyphicon-pause"></span>;
            } else {
                playpause_firehose = <span onClick={this.handlePauseClick} className="glyphicon glyphicon-play"></span>;
            }
        }

        var profile_panel = '';

        if(this.state.activeUser !== null) {
            profile_panel = <Profile screen_name={this.state.activeUser} />;
        }

        return <div>
            <div id="leftpanel">
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
                <div id="profilepanel">
                    {profile_panel}
                </div>
                <div id="tweets">
                    {tweets}
                </div>
            </div>
        </div>;
    }
});

ReactDOM.render(
    <Tracker />, 
    document.getElementById('container')
);
